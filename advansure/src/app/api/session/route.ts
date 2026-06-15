import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { personas, policies } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { audit_logs } from "@/lib/db/schema";
import crypto from "crypto";

// TU-01: POST /api/session
// Mock-User-ID → Persona + aktive Police laden
// 404 wenn keine Police vorhanden

const RequestSchema = z.object({
  personaId: z.string().min(1),
});

function hashBody(body: unknown): string {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(body))
    .digest("hex")
    .slice(0, 16);
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
      { error: "Fehlende oder ungültige personaId" },
      { status: 400 }
    );
  }

  const { personaId } = parse.data;

  try {
    // Load persona + active policy
    const persona = await db.query.personas.findFirst({
      where: eq(personas.id, personaId),
    });

    if (!persona) {
      return NextResponse.json(
        { error: `Persona '${personaId}' nicht gefunden` },
        { status: 404 }
      );
    }

    const policy = await db.query.policies.findFirst({
      where: eq(policies.persona_id, personaId),
    });

    if (!policy) {
      return NextResponse.json(
        { error: `Keine aktive Police für '${personaId}' gefunden` },
        { status: 404 }
      );
    }

    const responseData = { persona, policy };

    // Audit log (TU-01)
    await db.insert(audit_logs).values({
      endpoint: "/api/session",
      request_hash: hashBody(body),
      response_hash: hashBody(responseData),
      persona_id: personaId,
    }).catch(() => {/* non-fatal */});

    return NextResponse.json(responseData);
  } catch (err) {
    console.error("[/api/session]", err);
    return NextResponse.json(
      { error: "Interner Fehler" },
      { status: 500 }
    );
  }
}
