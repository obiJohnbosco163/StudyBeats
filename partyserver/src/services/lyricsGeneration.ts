/**
 * Lyrics Generation — turns the structured content analysis into
 * educational song lyrics for the requested style. Lyrics must teach the
 * material accurately (grounded in the analysis, never invented) while
 * staying memorable and rhythmic.
 */
import { chatJson } from './shared.js';
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

export async function generateLyrics(
  env: unknown,
  analysis: ContentAnalysis,
  settings: LyricsSettings
): Promise<GeneratedLyrics> {
  const system =
    'You are an educational songwriter for StudyBeats AI. You write lyrics that teach real material accurately — every fact must come from the provided analysis, never invented. Lyrics should be memorable and rhythmic while staying factually correct. Respond with ONLY valid JSON — no markdown fences, no commentary.';

  const user = `Write song lyrics that teach this material, in the requested style.

STYLE:
- Genre: ${settings.genre}
- Mood: ${settings.mood ?? 'Focused'}
- Language: ${settings.language ?? 'English'}
- Vocal style: ${settings.vocalStyle}
- Target length: ~${settings.durationSec} seconds

MATERIAL ANALYSIS (ground every lyric in this — do not invent facts):
${JSON.stringify(analysis, null, 2)}

Return JSON with this exact shape:
{
  "title": string,
  "verse": string,
  "chorus": string,
  "bridge": string,
  "outro": string,
  "fullLyrics": string
}

"fullLyrics" is the complete song with sections labeled [Verse], [Chorus], [Bridge], [Outro], separated by blank lines.`;

  const raw = (await chatJson(env, system, user, 2400)) as Record<string, unknown>;
  const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

  const verse = str(raw?.verse);
  const chorus = str(raw?.chorus);
  const bridge = str(raw?.bridge);
  const outro = str(raw?.outro);
  const fullLyrics =
    str(raw?.fullLyrics) ||
    [verse && `[Verse]\n${verse}`, chorus && `[Chorus]\n${chorus}`, bridge && `[Bridge]\n${bridge}`, outro && `[Outro]\n${outro}`]
      .filter(Boolean)
      .join('\n\n');

  return {
    title: str(raw?.title),
    verse,
    chorus,
    bridge,
    outro,
    fullLyrics,
  };
}
