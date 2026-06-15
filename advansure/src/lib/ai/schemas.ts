/**
 * Zod schemas for AI (Gemini) responses — TU-02 and TU-04.
 *
 * All Gemini responses MUST be validated through these schemas before any
 * application logic runs.  Validation failures are handled gracefully:
 * - TU-02 (intent): fall back to generic Avery reply, no crash
 * - TU-04 (room analysis): set walk.status = 'error_external_api'
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// TU-02 — Intent extraction from free-text damage description
// ---------------------------------------------------------------------------

/** Valid damage types as recognised in the product concept */
const DamageTypeSchema = z.enum(['wasser', 'feuer', 'einbruch', 'sturm']);

/**
 * TU-02: Schema for the structured intent Gemini extracts from a user message.
 *
 * Both fields are optional because the model may express partial confidence
 * (e.g. damage type known but cause not yet determined).
 *
 * `confidence` is a 0–1 float.  Values below ~0.6 should trigger a follow-up
 * question rather than accepting the intent.
 */
const DAMAGE_TYPE_MAP: Record<string, 'wasser' | 'feuer' | 'einbruch' | 'sturm'> = {
  wasser: 'wasser', wasserschaden: 'wasser', water: 'wasser', überschwemmung: 'wasser',
  feuer: 'feuer', brand: 'feuer', brandschaden: 'feuer', fire: 'feuer',
  einbruch: 'einbruch', diebstahl: 'einbruch', theft: 'einbruch',
  sturm: 'sturm', hagel: 'sturm', storm: 'sturm',
};

export const AveryIntentSchema = z.object({
  // Normalize any Gemini variant (e.g. "Wasserschaden", "water") to the canonical enum value
  damage_type: z.string().optional().transform(val =>
    val ? (DAMAGE_TYPE_MAP[val.toLowerCase()] ?? undefined) : undefined
  ),
  cause: z.string().min(1).optional(),
  // z.coerce converts string "0.95" → number, clamp to 0-1
  confidence: z.coerce.number().min(0).max(1).catch(0),
});

export type AveryIntent = z.infer<typeof AveryIntentSchema>;

// ---------------------------------------------------------------------------
// TU-02 — Full structured response from Gemini during dialog
// ---------------------------------------------------------------------------

/**
 * The full JSON object Gemini returns for each dialog turn.
 *
 * `intent` is null when the model does not have enough information yet.
 * `avery_message` is the human-readable reply shown in the chat UI.
 */
export const AveryResponseSchema = z.object({
  avery_message: z.string().min(1),
  intent: AveryIntentSchema.nullable(),
});

export type AveryResponse = z.infer<typeof AveryResponseSchema>;

// ---------------------------------------------------------------------------
// TU-04 — Room analysis from multimodal Gemini vision call
// ---------------------------------------------------------------------------

/** Damage grades as defined in the concept and data.js */
const DamageGradeSchema = z.enum(['leicht', 'mittel', 'schwer', 'total', 'nicht einschätzbar']);

/**
 * TU-04: Schema for a single-room analysis returned by Gemini Vision.
 *
 * `satisfied` controls the walk loop:
 *   - true  → the model has enough information; loop may advance to next room
 *   - false → the model needs another video clip; `next_request` MUST be set
 *
 * `next_request` must be concrete ("Zeig mir den Boden näher") not generic
 * ("Zeig mir mehr").  The concept requires this specificity.
 *
 * `ai_reasoning` is stored in rooms.ai_reasoning for auditability.
 */
export const RoomAnalysisSchema = z.object({
  room_type: z.string().min(1),
  // Normalize casing so "Leicht" → "leicht", "Nicht Einschätzbar" → "nicht einschätzbar" etc.
  damage_grade: z.string().transform((v) => v.toLowerCase()).pipe(DamageGradeSchema),
  damage_kind: z.string().min(1),
  // Gemini sometimes returns "true"/"false" strings instead of booleans
  satisfied: z.union([
    z.boolean(),
    z.enum(['true', 'false']).transform((v) => v === 'true'),
  ]),
  user_message: z.string().min(1),
  /** Concrete instruction to the user for the next video clip (TU-04) */
  next_request: z.string().min(1).optional(),
  /** Optional chain-of-thought from the model; stored for audit */
  ai_reasoning: z.string().optional(),
});

export type RoomAnalysis = z.infer<typeof RoomAnalysisSchema>;

// ---------------------------------------------------------------------------
// Parsing helpers — never throw; return typed error instead
// ---------------------------------------------------------------------------

export type ParseSuccess<T> = { ok: true; data: T };
export type ParseError = { ok: false; error: string };
export type ParseResult<T> = ParseSuccess<T> | ParseError;

/**
 * Safely parse and validate a raw Gemini dialog response.
 *
 * @param raw  The string or object returned by Gemini
 */
export function parseAveryResponse(raw: unknown): ParseResult<AveryResponse> {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const result = AveryResponseSchema.safeParse(parsed);
    if (result.success) {
      return { ok: true, data: result.data };
    }
    return {
      ok: false,
      error: result.error.issues.map((i) => i.message).join('; '),
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'JSON parse error',
    };
  }
}

/** Strip ```json ... ``` or ``` ... ``` code fences that LLMs sometimes add */
function stripCodeFences(raw: string): string {
  const match = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  return match ? match[1].trim() : raw.trim();
}

/**
 * Safely parse and validate a raw Gemini room-analysis response (TU-04).
 *
 * @param raw  The string or object returned by Gemini Vision
 */
export function parseRoomAnalysis(raw: unknown): ParseResult<RoomAnalysis> {
  try {
    let parsed: unknown;
    if (typeof raw === 'string') {
      parsed = JSON.parse(stripCodeFences(raw));
    } else {
      parsed = raw;
    }
    const result = RoomAnalysisSchema.safeParse(parsed);
    if (result.success) {
      return { ok: true, data: result.data };
    }
    return {
      ok: false,
      error: result.error.issues.map((i) => i.message).join('; '),
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'JSON parse error',
    };
  }
}
