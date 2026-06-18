/**
 * Valuation configuration — TU-05 (Pauschalmethode)
 *
 * Default room sizes and per-m² damage rates come from the product concept
 * (Konzept_MST02.md §TU-05) and are confirmed by the prototype's data.js.
 *
 * Rates: leicht 200 €/m² · mittel 450 €/m² · schwer 800 €/m²
 * Totalschaden uses the same rate as schwer (800 €/m²) per data.js.
 *
 * Example (acceptance criterion):
 *   Küche 9 m² × 450 €/m² = 4.050 €
 */

/** Default room areas in m² used when the AI does not return a specific area. */
export const ROOM_SIZES: Record<string, number> = {
  Küche: 9,
  Bad: 6,
  Badezimmer: 6, // alias for the room picker label
  Wohnzimmer: 24,
  Schlafzimmer: 14,
  Flur: 6,
  Kinderzimmer: 12,
  Arbeitszimmer: 10,
  'Arbeitszimmer / Büro': 10, // alias for the room picker label
  Keller: 14,
  Esszimmer: 12,
};

/**
 * Damage rate in €/m² per damage grade.
 *
 * 'nicht einschätzbar' is intentionally NOT listed: getRateForGrade returns
 * null for it, which flags the room for manual review and excludes it from the
 * automatic total. This is also the grade used when the AI analysis is
 * unavailable (fallback) — no automatic flat-rate validation is possible then.
 */
export const RATES: Record<string, number> = {
  leicht: 200,
  mittel: 450,
  schwer: 800,
  total: 800, // same as schwer per concept and data.js
};

/**
 * Returns the default area in m² for a given room type.
 * Falls back to 10 m² for unknown room types.
 */
export function getDefaultArea(roomType: string): number {
  return ROOM_SIZES[roomType] ?? 10;
}

/**
 * Returns the rate in €/m² for a given damage grade.
 * Returns null for unknown grades — callers should treat these rooms as
 * requiring manual review and exclude them from the automatic total.
 */
export function getRateForGrade(grade: string): number | null {
  return RATES[grade] ?? null;
}
