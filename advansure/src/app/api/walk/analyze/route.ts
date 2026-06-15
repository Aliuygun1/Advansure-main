import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { asc, eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { walks, rooms, audit_logs } from '@/lib/db/schema';
import { getAI, VISION_MODEL } from '@/lib/ai/gemini';
import { ROOM_ANALYSIS_SYSTEM_PROMPT } from '@/lib/ai/prompt-builder';
import { parseRoomAnalysis } from '@/lib/ai/schemas';
import { getDefaultArea, getRateForGrade } from '@/lib/valuation/config';

// TU-04: POST /api/walk/analyze — Gemini Vision multimodal room analysis
export const maxDuration = 120; // allow up to 120 s for file upload + Gemini processing

const AnalyzeSchema = z.object({
  walkId: z.string().uuid('walkId must be a valid UUID'),
  videoUrl: z.string().url('videoUrl must be a valid URL'),
  iteration: z.number().int().min(1).max(3),
  damageContext: z.object({
    type: z.string().min(1),
    cause: z.string().min(1),
  }),
});

type AnalyzeInput = z.infer<typeof AnalyzeSchema>;

/** Sleep utility for retry backoff */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Build the inline vision prompt with context injected.
 */
function buildVisionPrompt(
  input: AnalyzeInput,
  existingRoomTypes: string[],
): string {
  const existingList =
    existingRoomTypes.length > 0
      ? existingRoomTypes.join(', ')
      : 'Noch keine Räume erfasst';

  return `${ROOM_ANALYSIS_SYSTEM_PROMPT}

Du analysierst ein Video von einem beschädigten Raum in einer Wohnung.

Schadenstyp: ${input.damageContext.type} | Ursache: ${input.damageContext.cause}
Bisher erfasste Räume: ${existingList}
Iteration ${input.iteration} von maximal 3.

Antworte NUR mit folgendem JSON (kein Markdown, kein Kommentar):
{
  "room_type": "Küche" | "Bad" | "Wohnzimmer" | "Schlafzimmer" | "Flur" | "Kinderzimmer" | "Arbeitszimmer" | "Keller" | "Esszimmer",
  "damage_grade": "leicht" | "mittel" | "schwer" | "total" | "nicht einschätzbar",
  "damage_kind": "kurze Beschreibung des Schadens",
  "satisfied": true | false,
  "user_message": "Empathische Rückmeldung auf Deutsch für den Versicherungsnehmer",
  "next_request": "Nur wenn satisfied=false: konkrete Aufforderung was zu filmen ist",
  "ai_reasoning": "Kurze Begründung"
}`;
}

/**
 * Call Gemini Vision with up to 2 retries and 30 s timeout per attempt.
 *
 * Videos must be uploaded to the Gemini Files API first — Gemini cannot
 * fetch arbitrary external URLs (e.g. Supabase Storage) via fileData.fileUri.
 */
async function callGeminiWithRetry(
  input: AnalyzeInput,
  existingRoomTypes: string[],
): Promise<string> {
  let lastError: Error | null = null;
  const ai = getAI();
  const prompt = buildVisionPrompt(input, existingRoomTypes);
  let geminiFileName: string | undefined;

  try {
    // Download the video from Supabase Storage
    const videoRes = await fetch(input.videoUrl);
    if (!videoRes.ok) {
      throw new Error(`Video-Download fehlgeschlagen: HTTP ${videoRes.status}`);
    }
    const videoBlob = new Blob([await videoRes.arrayBuffer()], { type: 'video/webm' });

    // Upload to Gemini Files API — only these URIs are accepted by fileData.fileUri
    const uploadedFile = await ai.files.upload({
      file: videoBlob,
      config: { mimeType: 'video/webm' },
    });
    geminiFileName = uploadedFile.name;

    // Wait until Gemini has processed the file (usually a few seconds)
    let geminiFile = uploadedFile;
    const waitStart = Date.now();
    while (geminiFile.state === 'PROCESSING') {
      if (Date.now() - waitStart > 60_000) {
        throw new Error('Gemini-Dateiverarbeitung Timeout (60 s)');
      }
      await sleep(2000);
      geminiFile = await ai.files.get({ name: geminiFileName! });
    }

    if (geminiFile.state !== 'ACTIVE') {
      throw new Error(`Gemini-Datei in unerwartetem Zustand: ${geminiFile.state}`);
    }

    const fileUri = geminiFile.uri!;

    // Call Gemini Vision with up to 2 retries
    for (let attempt = 0; attempt <= 2; attempt++) {
      if (attempt > 0) {
        await sleep(1000 * attempt);
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30_000);

      try {
        const response = await ai.models.generateContent({
          model: VISION_MODEL,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  fileData: {
                    mimeType: 'video/webm',
                    fileUri,
                  },
                },
                { text: prompt },
              ],
            },
          ],
        });

        clearTimeout(timeout);
        return response.text ?? '';
      } catch (err) {
        clearTimeout(timeout);
        lastError = err instanceof Error ? err : new Error(String(err));

        if (controller.signal.aborted) {
          lastError = new Error('Gemini-Anfrage Timeout (30 s)');
        }
      }
    }
  } finally {
    // Always clean up the uploaded file from Gemini Files API
    if (geminiFileName) {
      try {
        await ai.files.delete({ name: geminiFileName });
      } catch {
        // Non-fatal
      }
    }
  }

  throw lastError ?? new Error('Gemini-Aufruf nach Wiederholungen fehlgeschlagen');
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let walkId = '';

  try {
    const body: unknown = await req.json();

    // Validate request schema
    const parsed = AnalyzeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation error', issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const input = parsed.data;
    walkId = input.walkId;

    // Load walk from DB — only process active walks
    const [walk] = await db
      .select()
      .from(walks)
      .where(eq(walks.id, walkId))
      .limit(1);

    if (!walk) {
      return NextResponse.json({ error: 'Walk nicht gefunden' }, { status: 404 });
    }

    // Allow retrying after a transient external API error (user records another video)
    if (walk.status !== 'active' && walk.status !== 'error_external_api') {
      return NextResponse.json(
        { error: `Walk hat ungültigen Status: ${walk.status}` },
        { status: 409 },
      );
    }

    if (walk.status === 'error_external_api') {
      await db.update(walks).set({ status: 'active' }).where(eq(walks.id, walkId));
    }

    // Load existing rooms for context
    const existingRooms = await db
      .select({ room_type: rooms.room_type })
      .from(rooms)
      .where(eq(rooms.walk_id, walkId));

    const existingRoomTypes = existingRooms.map((r) => r.room_type);

    // Call Gemini Vision
    let rawResponse: string;
    try {
      rawResponse = await callGeminiWithRetry(input, existingRoomTypes);
    } catch (err) {
      // Mark walk as errored
      await db
        .update(walks)
        .set({ status: 'error_external_api' })
        .where(eq(walks.id, walkId));

      const detail = err instanceof Error ? err.message : 'Gemini error';
      console.error('[analyze] Gemini error for walk', walkId, ':', detail);
      return NextResponse.json(
        { error: 'KI-Analyse fehlgeschlagen', detail },
        { status: 502 },
      );
    }

    // Parse and validate Gemini response
    console.log('[analyze] Raw Gemini response for walk', walkId, ':', rawResponse);
    const analysisResult = parseRoomAnalysis(rawResponse);

    if (!analysisResult.ok) {
      // Mark walk as errored
      await db
        .update(walks)
        .set({ status: 'error_external_api' })
        .where(eq(walks.id, walkId));

      console.error('[analyze] Parse error for walk', walkId, ':', analysisResult.error);
      return NextResponse.json(
        { error: 'KI-Antwort konnte nicht verarbeitet werden', detail: analysisResult.error },
        { status: 502 },
      );
    }

    const analysis = analysisResult.data;

    // Calculate valuation
    const area_m2 = getDefaultArea(analysis.room_type);
    const rate_per_m2 = getRateForGrade(analysis.damage_grade) ?? 0;
    const amount = area_m2 * rate_per_m2;

    // Upsert room in DB
    // For the given walk + iteration, check if a room row already exists
    const allRooms = await db
      .select()
      .from(rooms)
      .where(eq(rooms.walk_id, walkId))
      .orderBy(asc(rooms.created_at));

    const existingRoomRow = allRooms[input.iteration - 1];

    let roomRow: typeof rooms.$inferSelect;

    if (existingRoomRow) {
      // Update existing room row
      const [updated] = await db
        .update(rooms)
        .set({
          room_type: analysis.room_type,
          damage_grade: analysis.damage_grade,
          damage_kind: analysis.damage_kind,
          satisfied: analysis.satisfied,
          area_m2,
          rate_per_m2,
          amount,
          ai_reasoning: analysis.ai_reasoning ?? null,
        })
        .where(eq(rooms.id, existingRoomRow.id))
        .returning();
      roomRow = updated;
    } else {
      // Insert new room row
      const [inserted] = await db
        .insert(rooms)
        .values({
          walk_id: walkId,
          room_type: analysis.room_type,
          damage_grade: analysis.damage_grade,
          damage_kind: analysis.damage_kind,
          satisfied: analysis.satisfied,
          area_m2,
          rate_per_m2,
          amount,
          ai_reasoning: analysis.ai_reasoning ?? null,
        })
        .returning();
      roomRow = inserted;
    }

    // Increment walk iteration_count
    await db
      .update(walks)
      .set({ iteration_count: walk.iteration_count + 1 })
      .where(eq(walks.id, walkId));

    // Audit log
    await db.insert(audit_logs).values({
      endpoint: '/api/walk/analyze',
      request_hash: null,
      response_hash: null,
      persona_id: walk.persona_id,
    });

    return NextResponse.json(
      {
        room: roomRow,
        satisfied: analysis.satisfied,
        nextRequest: analysis.next_request ?? null,
        userMessage: analysis.user_message,
      },
      { status: 200 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Analyse fehlgeschlagen';
    console.error('[analyze] Unhandled error for walk', walkId, ':', message);

    // Attempt to mark walk as errored
    if (walkId) {
      try {
        await db
          .update(walks)
          .set({ status: 'error_external_api' })
          .where(eq(walks.id, walkId));
      } catch {
        // Non-fatal
      }
    }

    return NextResponse.json({ error: 'Analyse fehlgeschlagen', detail: message }, { status: 500 });
  }
}
