/**
 * Flashcards — 8-12 question/answer pairs grounded strictly in the material.
 */
import { chatJson, truncateText } from './shared.js';

export interface Flashcard {
  question: string;
  answer: string;
}

const MAX_INPUT_CHARS = 24000;

export async function generateFlashcards(env: unknown, text: string): Promise<Flashcard[]> {
  const trimmed = truncateText(text, MAX_INPUT_CHARS);
  const system =
    'You are a study-flashcard writer. Respond with ONLY valid JSON — no markdown fences, no commentary.';
  const user = `Create 8-12 flashcards strictly grounded in the study material below. Each card should test one clear fact or concept.

Return JSON with this exact shape:
{ "flashcards": [{ "question": string, "answer": string }] }

Rules:
- Never invent facts not present in the material.
- Questions must be answerable from the text alone.
- Keep answers concise (1-3 sentences).

STUDY MATERIAL:
"""
${trimmed}
"""`;

  const raw = (await chatJson(env, system, user, 2200)) as Record<string, unknown>;
  const list = Array.isArray(raw?.flashcards) ? raw.flashcards : [];
  return list
    .filter((c): c is Record<string, unknown> => !!c && typeof c === 'object')
    .map((c) => ({
      question: typeof c.question === 'string' ? c.question.trim() : '',
      answer: typeof c.answer === 'string' ? c.answer.trim() : '',
    }))
    .filter((c) => c.question.length > 0 && c.answer.length > 0)
    .slice(0, 12);
}
