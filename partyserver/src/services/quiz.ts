/**
 * Quiz — 5-8 multiple-choice questions grounded strictly in the material.
 */
import { chatJson, truncateText } from './shared.js';

export interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

const MAX_INPUT_CHARS = 24000;

export async function generateQuiz(env: unknown, text: string): Promise<QuizQuestion[]> {
  const trimmed = truncateText(text, MAX_INPUT_CHARS);
  const system = 'You are a study-quiz writer. Respond with ONLY valid JSON — no markdown fences, no commentary.';
  const user = `Create 5-8 multiple-choice questions strictly grounded in the study material below.

Return JSON with this exact shape:
{ "quiz": [{ "question": string, "options": [string, string, string, string], "answerIndex": number, "explanation": string }] }

Rules:
- Exactly 4 options per question; answerIndex is the 0-based index of the correct option.
- Never invent facts not present in the material.
- "explanation" should briefly justify the correct answer using the material.

STUDY MATERIAL:
"""
${trimmed}
"""`;

  const raw = (await chatJson(env, system, user, 2600)) as Record<string, unknown>;
  const list = Array.isArray(raw?.quiz) ? raw.quiz : [];
  return list
    .filter((q): q is Record<string, unknown> => !!q && typeof q === 'object')
    .map((q) => {
      const options = Array.isArray(q.options)
        ? q.options.filter((o): o is string => typeof o === 'string').slice(0, 4)
        : [];
      const rawIndex = typeof q.answerIndex === 'number' ? q.answerIndex : 0;
      return {
        question: typeof q.question === 'string' ? q.question.trim() : '',
        options,
        answerIndex: rawIndex >= 0 && rawIndex < options.length ? rawIndex : 0,
        explanation: typeof q.explanation === 'string' ? q.explanation.trim() : '',
      };
    })
    .filter((q) => q.question.length > 0 && q.options.length === 4)
    .slice(0, 8);
}
