import type { ContentAnalysis } from './contentUnderstanding.js';
export interface LyricsSettings {
    genre: string;
    mood?: string;
    language?: string;
    durationSec: number;
    vocalStyle: string;
}
export interface GeneratedLyrics {
    title: string;
    verse: string;
    chorus: string;
    bridge: string;
    outro: string;
    fullLyrics: string;
}
export declare function generateLyrics(env: unknown, analysis: ContentAnalysis, settings: LyricsSettings): Promise<GeneratedLyrics>;
