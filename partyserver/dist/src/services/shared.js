/**
 * Shared helpers for the StudyBeats AI generation pipeline services.
 * All AI calls go through `aiRun` (metered, Poof-proxied) — never call
 * provider SDKs or endpoints directly.
 */
import { aiRun } from '../lib/poof-ai.js';
export const PIPELINE_MODEL = 'anthropic/claude-sonnet-4-6';
/**
 * Call the chat model with a strict "respond with JSON only" instruction and
 * defensively parse the result (strips markdown fences, tolerates leading/
 * trailing commentary the model may still add).
 */
export async function chatJson(env, systemPrompt, userPrompt, maxTokens = 2000) {
    const result = await aiRun(env, PIPELINE_MODEL, {
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ],
    }, { max_completion_tokens: maxTokens, temperature: 0.4 });
    const content = result?.choices?.[0]?.message?.content ?? '';
    return extractJson(content);
}
export function extractJson(raw) {
    if (!raw)
        throw new Error('Empty AI response');
    let text = raw.trim();
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenceMatch)
        text = fenceMatch[1].trim();
    try {
        return JSON.parse(text);
    }
    catch {
        const candidates = ['{', '['].map((c) => text.indexOf(c)).filter((idx) => idx !== -1);
        const firstBrace = candidates.length > 0 ? Math.min(...candidates) : -1;
        const lastBrace = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'));
        if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
            throw new Error('AI response did not contain valid JSON');
        }
        const sliced = text.slice(firstBrace, lastBrace + 1);
        return JSON.parse(sliced);
    }
}
export function asStringArray(value, max = 20) {
    if (!Array.isArray(value))
        return [];
    return value
        .filter((v) => typeof v === 'string' && v.trim().length > 0)
        .map((v) => v.trim())
        .slice(0, max);
}
export function truncateText(text, maxChars) {
    return text.length > maxChars ? text.slice(0, maxChars) : text;
}
