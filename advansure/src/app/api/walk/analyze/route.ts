import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { asc, eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { walks, rooms, audit_logs } from '@/lib/db/schema';
import { getAI, VISION_MODEL } from '@/lib/ai/gemini';
import { ROOM_ANALYSIS_SYSTEM_PROMPT } from '@/lib/ai/prompt-builder';
import { parseRoomAnalysis, type RoomAnalysis } from '@/lib/ai/schemas';
import { buildSmartRoomAnalysis } from '@/lib/ai/smart-fallback';
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
  // Optional: room type the user explicitly picked for this clip (e.g. when
  // adding a further room). When set, it is treated as authoritative.
  hintRoomType: z.string().min(1).optional(),
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
${input.hintRoomType ? `Der Nutzer hat diesen Raum ausdrücklich als "${input.hintRoomType}" angegeben — verwende exakt diesen Wert als room_type.\n` : ''}
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
 *
 * CONTEXT ISOLATION: this is a single, self-contained, stateless request.
 * It uses `ai.models.generateContent` (no chat/session memory) and sends ONLY
 * the current claim's data: this video + a prompt whose room context is scoped
 * to the current walkId (`existingRoomTypes`, see the analyze handler). No prior
 * Schadensmeldung's video, prompt or result can influence it. The uploaded
 * Gemini file is deleted again in the `finally` block, so nothing persists.
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
    // Use the stored MIME type (webm for live recordings, mp4/mov for uploads)
    const mimeType = (videoRes.headers.get('content-type') ?? 'video/webm')
      .split(';')[0]
      .trim();
    const videoBlob = new Blob([await videoRes.arrayBuffer()], { type: mimeType });

    // Upload to Gemini Files API — only these URIs are accepted by fileData.fileUri
    const uploadedFile = await ai.files.upload({
      file: videoBlob,
      config: { mimeType },
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
                    mimeType,
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

    // Call Gemini Vision — on a model failure or an unparseable response, fall
    // back to a heuristic estimate from the known damage context so the walk
    // never dead-ends with a 502.
    let analysis: RoomAnalysis;
    let usedFallback = false;
    try {
      const rawResponse = await callGeminiWithRetry(input, existingRoomTypes);
      console.log('[analyze] Raw Gemini response for walk', walkId, ':', rawResponse);

      const analysisResult = parseRoomAnalysis(rawResponse);
      if (analysisResult.ok) {
        analysis = analysisResult.data;
      } else {
        console.warn(
          '[analyze] Parse error for walk', walkId, '— using smart fallback:',
          analysisResult.error,
        );
        analysis = buildSmartRoomAnalysis(input.damageContext, existingRoomTypes, input.iteration, input.hintRoomType);
        usedFallback = true;
      }
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'Gemini error';
      console.warn(
        '[analyze] Gemini unavailable for walk', walkId, '— using smart fallback:', detail,
      );
      analysis = buildSmartRoomAnalysis(input.damageContext, existingRoomTypes, input.iteration, input.hintRoomType);
      usedFallback = true;
    }

    // The user's explicit room selection is authoritative — never let the model
    // override a room the user picked themselves.
    if (input.hintRoomType) {
      analysis.room_type = input.hintRoomType;
    }

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
        // True when the AI analysis was unavailable and a manual-review
        // fallback was used — the UI surfaces this transparently to the user.
        fallback: usedFallback,
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
