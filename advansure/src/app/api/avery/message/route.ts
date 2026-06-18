import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createHash } from 'crypto';
import { and, eq, asc, gte } from 'drizzle-orm';

import { db } from '@/lib/db/client';
import { conversations, audit_logs } from '@/lib/db/schema';
import { getAI, CHAT_MODEL } from '@/lib/ai/gemini';
import {
  AVERY_SYSTEM_PROMPT,
  buildGeminiHistory,
} from '@/lib/ai/prompt-builder';
import { parseAveryResponse } from '@/lib/ai/schemas';

// ---------------------------------------------------------------------------
// Request validation
// ---------------------------------------------------------------------------

const RequestSchema = z.object({
  personaId: z.string().min(1),
  message: z.string().min(1),
  conversationId: z.string().uuid().optional(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const FALLBACK_MESSAGE =
  'Entschuldige, meine KI-Analyse ist derzeit vorübergehend nicht verfügbar. Bitte filme den Schaden trotzdem – die Schadensmeldung wird wie gewohnt weiterbearbeitet.';

/** Sleep for `ms` milliseconds */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** SHA-256 hash of a string, hex-encoded */
function sha256(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

/**
 * Call Gemini with up to 2 retries (exponential back-off: 500 ms, 1 000 ms).
 * Returns the raw text from the model or throws after all retries are exhausted.
 */
async function callGeminiWithRetry(
  history: Array<{ role: string; content: string }>,
  userMessage: string
): Promise<string> {
  const ai = getAI();
  const geminiHistory = buildGeminiHistory(history);

  const delays = [2000, 5000];

  for (let attempt = 0; attempt <= delays.length; attempt++) {
    try {
      // Always create a BRAND-NEW chat session per request. `history` only ever
      // contains the current claim's turns (see step 2) — never another claim's.
      // No chat instance is cached or reused across Schadensmeldungen.
      const chat = ai.chats.create({
        model: CHAT_MODEL,
        config: {
          responseMimeType: 'application/json',
          systemInstruction: AVERY_SYSTEM_PROMPT,
        },
        history: geminiHistory,
      });

      const response = await chat.sendMessage({ message: userMessage });
      return response.text ?? '';
    } catch (err) {
      const is429 = err instanceof Error && err.message.includes('429');
      if (attempt < delays.length) {
        // Wait longer on rate-limit errors
        await sleep(is429 ? 8000 : delays[attempt]);
      } else {
        throw err;
      }
    }
  }

  // TypeScript requires a return — unreachable in practice
  throw new Error('All Gemini retries exhausted');
}

// ---------------------------------------------------------------------------
// POST /api/avery/message
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // 1. Validate request body
  let parsed: z.infer<typeof RequestSchema>;
  try {
    parsed = RequestSchema.parse(JSON.parse(rawBody));
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { personaId, message, conversationId } = parsed;
  const requestHash = sha256(rawBody);

  // 2. Load conversation history — STRICTLY scoped to the CURRENT conversation
  //    session.
  //
  //    ISOLATION REQUIREMENT: every new Schadensmeldung MUST be processed in a
  //    brand-new, independent Gemini session. No messages, context or results
  //    from earlier claims of the same persona may leak into this analysis.
  //
  //    How isolation is guaranteed here:
  //    - A new claim clears the stored conversationId on the client
  //      (see start/page.tsx → startClaim), so the FIRST message of a new claim
  //      arrives WITHOUT a conversationId. In that case history stays empty and
  //      the Gemini chat below is created fresh with zero prior turns.
  //    - Follow-up messages of the SAME claim send the conversationId, which
  //      anchors the session's start timestamp; only messages from that anchor
  //      onward are replayed — never anything from a previous claim.
  //
  //    We therefore deliberately do NOT load history by persona_id alone (that
  //    would replay the persona's entire cross-claim history into every chat).
  let history: Array<{ role: string; content: string }> = [];
  let activeConvId = conversationId;

  if (conversationId) {
    try {
      // Anchor = the first message row of this conversation session.
      const [anchor] = await db
        .select({ createdAt: conversations.created_at })
        .from(conversations)
        .where(eq(conversations.id, conversationId))
        .limit(1);

      if (anchor?.createdAt) {
        const rows = await db
          .select({ role: conversations.role, content: conversations.content })
          .from(conversations)
          .where(
            and(
              eq(conversations.persona_id, personaId),
              gte(conversations.created_at, anchor.createdAt),
            ),
          )
          .orderBy(asc(conversations.created_at))
          .limit(20);

        // Gemini requires strictly alternating user/model turns.
        // Deduplicate consecutive same-role messages before passing to Gemini.
        const alternating: typeof rows = [];
        for (const row of rows) {
          const last = alternating[alternating.length - 1];
          if (!last || last.role !== row.role) alternating.push(row);
        }
        history = alternating.slice(-10);
      }
    } catch {
      history = [];
    }
  }
  // No conversationId → brand-new session → history stays [] (full isolation).

  // 3. Persist user message to DB
  let userRowId: string | undefined;
  try {
    const [userRow] = await db
      .insert(conversations)
      .values({
        persona_id: personaId,
        claim_id: null,
        role: 'user',
        content: message,
        intent: null,
      })
      .returning({ id: conversations.id });

    userRowId = userRow?.id;
    if (!activeConvId) {
      activeConvId = userRowId;
    }
  } catch {
    // DB write failure is non-fatal for the API response
  }

  // 4. Call Gemini
  let averyText = FALLBACK_MESSAGE;
  let intent: {
    damage_type?: string;
    cause?: string;
    confidence: number;
  } | null = null;

  try {
    const rawResponse = await callGeminiWithRetry(history, message);

    // Robustly extract the JSON object — Gemini sometimes adds preamble text
    // or wraps the response in ```json ... ``` blocks despite instructions.
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    const cleaned = jsonMatch
      ? jsonMatch[0]
      : rawResponse.replace(/```(?:json)?/gi, '').trim();

    const parseResult = parseAveryResponse(cleaned);

    if (parseResult.ok) {
      averyText = parseResult.data.avery_message;
      intent = parseResult.data.intent ?? null;
    } else {
      console.error('[avery/message] parse error:', parseResult.error);
      averyText = FALLBACK_MESSAGE;
    }
  } catch (err) {
    console.error('[avery/message] Gemini error:', err instanceof Error ? err.message : String(err));
    averyText = FALLBACK_MESSAGE;
  }

  // 5. Persist Avery response to DB
  let averyRowId: string | undefined;
  try {
    const [averyRow] = await db
      .insert(conversations)
      .values({
        persona_id: personaId,
        claim_id: null,
        role: 'avery',
        content: averyText,
        intent: intent ?? undefined,
      })
      .returning({ id: conversations.id });

    averyRowId = averyRow?.id;
    if (!activeConvId) {
      activeConvId = averyRowId;
    }
  } catch {
    // DB write failure is non-fatal
  }

  // 6. Audit log
  const responsePayload = {
    message: averyText,
    intent,
    conversationId: activeConvId ?? '',
  };
  const responseHash = sha256(JSON.stringify(responsePayload));

  try {
    await db.insert(audit_logs).values({
      endpoint: '/api/avery/message',
      request_hash: requestHash,
      response_hash: responseHash,
      persona_id: personaId,
    });
  } catch {
    // Audit log failure is non-fatal
  }

  // 7. Return response
  return NextResponse.json(responsePayload);
}
