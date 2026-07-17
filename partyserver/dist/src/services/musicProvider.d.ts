/**
 * Music Provider — abstraction over "turn lyrics + style into audio".
 *
 * `MockMusicProvider` returns a deterministic placeholder (audioUrl +
 * duration + status:'ready' + metadata + evenly-spaced lyric timestamps) and
 * is used whenever no `MUREKA_API_KEY` secret is configured — this keeps
 * Guest/demo mode working with zero external dependencies.
 *
 * `MurekaMusicProvider` calls the real Mureka music-generation API
 * (platform.mureka.ai) when a `MUREKA_API_KEY` secret is present. It is an
 * async job+poll API: POST /v1/song/generate kicks off a task, then
 * GET /v1/song/query/{task_id} is polled until the task reaches a terminal
 * status.
 *
 * `getMusicProvider(env)` is the single factory both providers are obtained
 * from — routes and the rest of the app only depend on the `MusicProvider`
 * interface, never on which concrete implementation is active.
 */
export interface MusicGenerationInput {
    lyrics: string;
    genre: string;
    mood?: string;
    language?: string;
    durationSec: number;
    vocalStyle: string;
}
export interface LyricLineTimestamp {
    line: string;
    tSec: number;
}
export interface MusicGenerationOutput {
    audioUrl: string;
    duration: number;
    generationStatus: string;
    metadata: Record<string, unknown>;
    lyricsTimestamps?: LyricLineTimestamp[];
}
export interface MusicProvider {
    generate(input: MusicGenerationInput): Promise<MusicGenerationOutput>;
}
export declare class MockMusicProvider implements MusicProvider {
    generate(input: MusicGenerationInput): Promise<MusicGenerationOutput>;
}
export declare class MurekaMusicProvider implements MusicProvider {
    private readonly apiKey;
    private readonly model;
    constructor(apiKey: string, model?: string);
    private authHeaders;
    generate(input: MusicGenerationInput): Promise<MusicGenerationOutput>;
}
/**
 * Registry/factory: returns `MurekaMusicProvider` when `MUREKA_API_KEY` is
 * configured for this environment, otherwise falls back to
 * `MockMusicProvider` (keeps Guest/demo mode working with no key set).
 */
export declare function getMusicProvider(env: unknown): MusicProvider;
