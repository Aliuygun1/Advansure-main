import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { claims, rooms, policies, audit_logs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

// TU-06: POST /api/claims — atomare Transaktion, Vorgangsnummer
// Vollständigkeit prüfen (≥1 Raum, gültige Police) → Vorgangsnummer → commit

const RoomInputSchema = z.object({
  room_type: z.string().min(1),
  damage_grade: z.enum(["leicht", "mittel", "schwer", "total", "nicht einschätzbar"]),
  area_m2: z.number().int().positive(),
  rate_per_m2: z.number().int().nonnegative(),
  amount: z.number().int().nonnegative(),
  video_url: z.string().url().optional(),
  damage_kind: z.string().optional(),
  ai_reasoning: z.string().optional(),
});

const RequestSchema = z.object({
  personaId: z.string().min(1),
  damageType: z.enum(["wasser", "feuer", "einbruch", "sturm"]),
  cause: z.string().min(1),
  walkId: z.string().uuid().optional().nullable(),
  rooms: z.array(RoomInputSchema).min(1, "Mindestens ein Raum erforderlich"),
  totalAmount: z.number().int().nonnegative(),
});

function hashBody(body: unknown): string {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(body))
    .digest("hex")
    .slice(0, 16);
}

/** Generate Vorgangsnummer: ADV-YYYY-XXXX (4-digit sequential padded) */
async function generateVorgangsnummer(): Promise<string> {
  const year = new Date().getFullYear();
  // Count existing claims for this year to generate sequential number
  const existing = await db
    .select({ id: claims.id })
    .from(claims)
    .where(
      // Use a simple like-based count since we don't have a sequence in SQLite-compatible mode
      // In production Supabase we'd use a Postgres sequence
      eq(claims.status, claims.status) // get all — we filter client-side
    );

  const seq = (existing.length + 1).toString().padStart(4, "0");
  return `ADV-${year}-${seq}`;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 });
  }

  const parse = RequestSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json(
      { error: parse.error.issues.map((i) => i.message).join("; ") },
      { status: 422 }
    );
  }

  const { personaId, damageType, cause, walkId, rooms: roomInputs, totalAmount } = parse.data;

  try {
    // Load active policy for persona
    const policy = await db.query.policies.findFirst({
      where: eq(policies.persona_id, personaId),
    });

    if (!policy) {
      return NextResponse.json(
        { error: "Keine aktive Police gefunden" },
        { status: 422 }
      );
    }

    // Generate Vorgangsnummer (ADV-YYYY-XXXX)
    const vorgangsnummer = await generateVorgangsnummer();

    // Atomic transaction: create claim + rooms
    const result = await db.transaction(async (tx) => {
      // Insert claim
      const [claim] = await tx
        .insert(claims)
        .values({
          persona_id: personaId,
          policy_id: policy.id,
          damage_type: damageType,
          cause,
          status: "eingegangen",
          vorgangsnummer,
          total_amount: totalAmount,
        })
        .returning();

      if (!claim) throw new Error("Claim konnte nicht erstellt werden");

      // Insert rooms
      if (roomInputs.length > 0) {
        await tx.insert(rooms).values(
          roomInputs.map((r) => ({
            walk_id: walkId ?? claim.id, // use claim id as walk_id if no walk
            room_type: r.room_type,
            damage_grade: r.damage_grade,
            damage_kind: r.damage_kind ?? r.room_type + " beschädigt",
            video_url: r.video_url ?? null,
            satisfied: true,
            area_m2: r.area_m2,
            rate_per_m2: r.rate_per_m2,
            amount: r.amount,
          }))
        );
      }

      return claim;
    });

    const responseData = {
      claimId: result.id,
      vorgangsnummer: result.vorgangsnummer,
      totalAmount: result.total_amount,
      status: result.status,
    };

    // Audit log
    await db.insert(audit_logs).values({
      endpoint: "/api/claims",
      request_hash: hashBody(body),
      response_hash: hashBody(responseData),
      persona_id: personaId,
    }).catch(() => {/* non-fatal */});

    return NextResponse.json(responseData, { status: 201 });
  } catch (err) {
    console.error("[/api/claims]", err);
    // Idempotency: check if duplicate vorgangsnummer
    if (err instanceof Error && err.message.includes("unique")) {
      return NextResponse.json(
        { error: "Dieser Vorgang wurde bereits eingereicht" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}
