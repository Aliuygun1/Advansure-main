/**
 * Valuation service — TU-05 (Pauschalmethode, pure function, no I/O)
 *
 * Calculates the flat-rate damage amount for each room and the overall total.
 * Rooms with an unknown damage grade are flagged for manual review and excluded
 * from the automatic total so a claims handler can assess them separately.
 *
 * Acceptance criterion (from concept §2.7):
 *   Küche 9 m² × 450 €/m² = 4.050 €
 */

import { getDefaultArea, getRateForGrade } from './config';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RoomInput {
  /** Room identifier — used in manualReviewRooms output */
  id?: string;
  /** e.g. 'Küche', 'Bad', 'Wohnzimmer' */
  room_type: string;
  /** 'leicht' | 'mittel' | 'schwer' | 'total' — or unknown string */
  damage_grade: string;
  /**
   * Optional explicit area in m².
   * Falls back to ROOM_SIZES[room_type] ?? 10 when not provided.
   */
  area_m2?: number;
}

export interface RoomValuation {
  room_type: string;
  damage_grade: string;
  area_m2: number;
  rate_per_m2: number;
  amount: number;
  /** True when the damage grade was not recognised — excluded from totalAmount */
  manualReview: boolean;
}

export interface ValuationResult {
  rooms: RoomValuation[];
  /** Sum of all auto-valued rooms (manualReview === false) */
  totalAmount: number;
  /** room_type labels of rooms that require manual review */
  manualReviewRooms: string[];
}

// ---------------------------------------------------------------------------
// Core function
// ---------------------------------------------------------------------------

/**
 * TU-05: Calculate the flat-rate valuation for a list of damaged rooms.
 *
 * @param rooms  Array of room inputs from the AI walk analysis
 * @returns      Per-room breakdown, automatic total, and manual-review flags
 */
export function calcValuation(rooms: RoomInput[]): ValuationResult {
  const valuedRooms: RoomValuation[] = [];
  const manualReviewRooms: string[] = [];
  let totalAmount = 0;

  for (const room of rooms) {
    const area_m2 =
      typeof room.area_m2 === 'number' && room.area_m2 > 0
        ? room.area_m2
        : getDefaultArea(room.room_type);

    const rate = getRateForGrade(room.damage_grade);
    const manualReview = rate === null;

    if (manualReview) {
      // Unknown grade → flag for manual review, exclude from total
      valuedRooms.push({
        room_type: room.room_type,
        damage_grade: room.damage_grade,
        area_m2,
        rate_per_m2: 0,
        amount: 0,
        manualReview: true,
      });
      manualReviewRooms.push(room.room_type);
    } else {
      const amount = area_m2 * rate;
      valuedRooms.push({
        room_type: room.room_type,
        damage_grade: room.damage_grade,
        area_m2,
        rate_per_m2: rate,
        amount,
        manualReview: false,
      });
      totalAmount += amount;
    }
  }

  return { rooms: valuedRooms, totalAmount, manualReviewRooms };
}
