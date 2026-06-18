import { GoogleGenAI } from '@google/genai';

/**
 * Shared GoogleGenAI client.
 *
 * IMPORTANT — context isolation:
 * This singleton is ONLY a stateless transport client (API key + HTTP layer).
 * It holds NO conversation state, NO history and NO cached prompts/responses.
 * Reusing it across requests is therefore safe and does NOT leak context.
 *
 * Conversation/session state must NEVER be attached to this singleton. Every
 * new Schadensmeldung must start a fresh, independent Gemini session:
 *   - Dialog (TU-02): create a NEW chat per request via `ai.chats.create(...)`
 *     and pass ONLY the current claim's history (see avery/message route).
 *   - Video analysis (TU-04): use the stateless `ai.models.generateContent(...)`
 *     with only the current claim's video + prompt (see walk/analyze route).
 */
let _genai: GoogleGenAI | null = null;

export function getAI(): GoogleGenAI {
  if (!_genai) {
    _genai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY! });
  }
  return _genai;
}

export const CHAT_MODEL = 'gemini-2.5-flash';
export const VISION_MODEL = 'gemini-2.5-flash';
