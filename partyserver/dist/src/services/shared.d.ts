export declare const PIPELINE_MODEL = "anthropic/claude-sonnet-4-6";
/**
 * Call the chat model with a strict "respond with JSON only" instruction and
 * defensively parse the result (strips markdown fences, tolerates leading/
 * trailing commentary the model may still add).
 */
export declare function chatJson(env: unknown, systemPrompt: string, userPrompt: string, maxTokens?: number): Promise<unknown>;
export declare function extractJson(raw: string): unknown;
export declare function asStringArray(value: unknown, max?: number): string[];
export declare function truncateText(text: string, maxChars: number): string;
