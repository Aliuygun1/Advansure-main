import { GoogleGenAI } from '@google/genai';

let _genai: GoogleGenAI | null = null;

export function getAI(): GoogleGenAI {
  if (!_genai) {
    _genai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY! });
  }
  return _genai;
}

export const CHAT_MODEL = 'gemini-2.5-flash';
export const VISION_MODEL = 'gemini-2.5-flash';
