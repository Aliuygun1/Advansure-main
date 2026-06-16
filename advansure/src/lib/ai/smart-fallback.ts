/**
 * Smart heuristic fallback for room analysis (TU-04).
 *
 * Used when the Gemini Vision call fails or returns an unparseable response,
 * so a walk never dead-ends: we derive a plausible room estimate from the
 * damage context the user already gave in the chat (type + cause).
 *
 * The output matches RoomAnalysisSchema so it can be used interchangeably with
 * a real Gemini response downstream (same grade vocabulary, incl.
 * 'nicht einschätzbar').
 */

import type { RoomAnalysis } from './schemas';

type Grade = RoomAnalysis['damage_grade'];

/** Conservative default grade per damage type. */
const GRADE_BY_TYPE: Record<string, Grade> = {
  wasser: 'mittel',
  feuer: 'schwer',
  sturm: 'mittel',
  einbruch: 'leicht',
};

/** Room keywords we can detect in the free-text type / cause description. */
const ROOM_KEYWORDS: Array<{ room: string; re: RegExp }> = [
  { room: 'Küche', re: /küche|herd|spülmaschine|waschmaschine/i },
  { room: 'Bad', re: /bad|dusche|badezimmer|toilette|\bwc\b/i },
  { room: 'Wohnzimmer', re: /wohnzimmer|sofa|couch/i },
  { room: 'Schlafzimmer', re: /schlafzimmer|\bbett\b/i },
  { room: 'Kinderzimmer', re: /kinderzimmer/i },
  { room: 'Arbeitszimmer', re: /arbeitszimmer|büro/i },
  { room: 'Keller', re: /keller/i },
  { room: 'Flur', re: /flur|diele/i },
  { room: 'Esszimmer', re: /esszimmer/i },
];

/** Fallback order when no keyword matches — first one not yet recorded wins. */
const ROOM_FALLBACK_ORDER = [
  'Wohnzimmer', 'Küche', 'Bad', 'Schlafzimmer', 'Flur',
  'Kinderzimmer', 'Arbeitszimmer', 'Keller', 'Esszimmer',
];

const TYPE_LABELS: Record<string, string> = {
  wasser: 'Wasserschaden',
  feuer: 'Brandschaden',
  sturm: 'Sturmschaden',
  einbruch: 'Einbruchsschaden',
};

function inferRoomType(type: string, cause: string, existing: string[]): string {
  const haystack = `${type} ${cause}`;
  for (const { room, re } of ROOM_KEYWORDS) {
    if (re.test(haystack) && !existing.includes(room)) return room;
  }
  const unused = ROOM_FALLBACK_ORDER.find((r) => !existing.includes(r));
  return unused ?? 'Wohnzimmer';
}

function inferGrade(type: string): Grade {
  return GRADE_BY_TYPE[type.toLowerCase()] ?? 'mittel';
}

function typeLabel(type: string): string {
  return TYPE_LABELS[type.toLowerCase()] ?? 'Schaden';
}

function buildDamageKind(type: string, cause: string, roomType: string): string {
  const label = typeLabel(type);
  const hasCause = cause && cause.trim() && cause !== 'unbekannte Ursache';
  return hasCause ? `${label} im ${roomType} (${cause})` : `${label} im ${roomType}`;
}

function buildUserMessage(roomType: string): string {
  return `Danke für das Video! Ich konnte die Aufnahme nicht automatisch im Detail auswerten, habe den Raum aber als ${roomType} mit dem Schaden erfasst. Ein:e Sachbearbeiter:in prüft die Aufnahme noch einmal genau.`;
}

/**
 * Build a RoomAnalysis from the known damage context without a Gemini call.
 *
 * Always returns `satisfied: true` so the walk loop can advance — the fallback
 * is a degraded mode and should never ask the user to re-record.
 */
export function buildSmartRoomAnalysis(
  damageContext: { type: string; cause: string },
  existingRoomTypes: string[],
  iteration: number,
  hintRoomType?: string,
): RoomAnalysis {
  const room_type =
    hintRoomType ?? inferRoomType(damageContext.type, damageContext.cause, existingRoomTypes);
  const damage_grade = inferGrade(damageContext.type);

  return {
    room_type,
    damage_grade,
    damage_kind: buildDamageKind(damageContext.type, damageContext.cause, room_type),
    satisfied: true,
    user_message: buildUserMessage(room_type),
    next_request: undefined,
    ai_reasoning: `Heuristische Einschätzung (Fallback) basierend auf Schadenstyp "${damageContext.type}", Ursache "${damageContext.cause}", Iteration ${iteration}.`,
  };
}
