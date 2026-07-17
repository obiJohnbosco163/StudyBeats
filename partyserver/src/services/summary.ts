/**
 * Summary — produce a short and detailed summary of study material.
 */
import { chatJson, truncateText } from './shared.js';

export interface StudySummary {
  shortSummary: string;
  detailedSummary: string;
}

const MAX_INPUT_CHARS = 24000;

export async function generateSummary(env: unknown, text: string): Promise<StudySummary> {
  const trimmed = truncateText(text, MAX_INPUT_CHARS);
  const system =
    'You are a precise academic summarizer. Respond with ONLY valid JSON — no markdown fences, no commentary.';
  const user = `Summarize the study material below.

Return JSON with this exact shape:
{
  "shortSummary": string,
  "detailedSummary": string
}

Rules:
- "shortSummary" is 1-2 sentences capturing the core idea.
- "detailedSummary" is 4-8 sentences covering the material's substance.
- Ground everything strictly in the text — do not invent facts.

STUDY MATERIAL:
"""
${trimmed}
"""`;

  const raw = (await chatJson(env, system, user, 1200)) as Record<string, unknown>;
  return {
    shortSummary: typeof raw?.shortSummary === 'string' ? raw.shortSummary.trim() : '',
    detailedSummary: typeof raw?.detailedSummary === 'string' ? raw.detailedSummary.trim() : '',
  };
}
