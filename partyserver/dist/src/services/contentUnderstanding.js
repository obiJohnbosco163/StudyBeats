/**
 * Content Understanding — given raw study text, return a structured
 * breakdown grounded strictly in the material (no invented facts).
 */
import { asStringArray, chatJson, truncateText } from './shared.js';
const MAX_INPUT_CHARS = 24000;
export async function analyzeContent(env, text) {
    const trimmed = truncateText(text, MAX_INPUT_CHARS);
    const system = 'You are a meticulous study-notes analyst. Respond with ONLY valid JSON matching the requested schema — no markdown fences, no commentary, no extra keys.';
    const user = `Analyze the following study material and extract a structured breakdown.

Return JSON with this exact shape:
{
  "mainTopics": string[],
  "definitions": string[],
  "keyConcepts": string[],
  "formulas": string[],
  "dates": string[],
  "examples": string[],
  "examPoints": string[],
  "keywords": string[]
}

Rules:
- Every item must be grounded strictly in the text below — never invent facts.
- "definitions" entries should read like "Term: definition".
- Leave an array empty ([]) if the material has none of that category (e.g. formulas for a history text).
- Keep each string concise (under 200 characters).

STUDY MATERIAL:
"""
${trimmed}
"""`;
    const raw = (await chatJson(env, system, user, 2200));
    return {
        mainTopics: asStringArray(raw?.mainTopics),
        definitions: asStringArray(raw?.definitions),
        keyConcepts: asStringArray(raw?.keyConcepts),
        formulas: asStringArray(raw?.formulas),
        dates: asStringArray(raw?.dates),
        examples: asStringArray(raw?.examples),
        examPoints: asStringArray(raw?.examPoints),
        keywords: asStringArray(raw?.keywords),
    };
}
