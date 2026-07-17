/**
 * Shared constants + helpers for StudyBeats AI.
 *
 * The real generation pipeline lives in `src/services/pipeline.ts` (calls
 * the `/api/pipeline/*` AI endpoints and persists lyrics/audioUrl/learning
 * package data). `placeholderLyrics` here is now only a thin fallback used
 * to seed the guest-mode demo library (`utils/guestData.ts`) with believable
 * sample songs — it is no longer used on the real generation path.
 * `coverGradientForSeed` remains the cover-art placeholder for all songs
 * (no real image-generation engine is wired in yet).
 */

export const GENRES = [
  { value: 'lofi', label: 'Lo-Fi', blurb: 'Chill beats, soft focus' },
  { value: 'pop', label: 'Pop', blurb: 'Catchy, upbeat, radio-ready' },
  { value: 'hiphop', label: 'Hip-Hop', blurb: 'Rhythmic, punchy bars' },
  { value: 'edm', label: 'EDM', blurb: 'High-energy electronic drops' },
  { value: 'acoustic', label: 'Acoustic', blurb: 'Warm, stripped-back strings' },
  { value: 'orchestral', label: 'Orchestral', blurb: 'Cinematic, sweeping score' },
  { value: 'rnb', label: 'R&B', blurb: 'Smooth grooves, soulful runs' },
  { value: 'synthwave', label: 'Synthwave', blurb: 'Retro-futuristic neon pulse' },
] as const;

export const VOCAL_STYLES = [
  { value: 'Warm Female', label: 'Warm Female' },
  { value: 'Smooth Male', label: 'Smooth Male' },
  { value: 'Choir', label: 'Choir' },
  { value: 'Rap', label: 'Rap' },
  { value: 'Airy Falsetto', label: 'Airy Falsetto' },
  { value: 'Deep Baritone', label: 'Deep Baritone' },
  { value: 'Instrumental Only', label: 'Instrumental Only' },
] as const;

export const MOODS = [
  'Focused',
  'Energetic',
  'Chill',
  'Dramatic',
  'Playful',
  'Melancholic',
  'Triumphant',
] as const;

export const LENGTH_OPTIONS = [
  { value: 60, label: 'Quick Recap · 1 min' },
  { value: 150, label: 'Standard · 2.5 min' },
  { value: 240, label: 'Deep Dive · 4 min' },
] as const;

/** Server-relative "now" in Unix seconds for optimistic local (guest) writes. */
export function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

export function genId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function formatDuration(sec?: number): string {
  if (!sec || sec <= 0) return '--:--';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatRelativeTime(unixSeconds?: number): string {
  if (!unixSeconds) return '';
  const diffMs = Date.now() - unixSeconds * 1000;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return new Date(unixSeconds * 1000).toLocaleDateString();
}

export function shortAddress(address?: string | null): string {
  if (!address) return '';
  if (address.length <= 10) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

const GRADIENT_PALETTE: [string, string][] = [
  ['#10e0a1', '#7c3aed'], // emerald -> purple
  ['#38bdf8', '#a855f7'], // electric blue -> purple
  ['#10e0a1', '#38bdf8'], // emerald -> electric blue
  ['#7c3aed', '#ec4899'], // purple -> pink
  ['#22d3ee', '#10e0a1'], // cyan -> emerald
  ['#8b5cf6', '#06b6d4'], // violet -> cyan
];

function seedToIndex(seed: string, mod: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % mod;
}

/**
 * Deterministic CSS gradient "cover art" placeholder, keyed by a seed string
 * (song id/title). Returned as a `linear-gradient(...)` CSS value — stored in
 * `coverUrl` and rendered directly as a `background` style. Swap this out for
 * a real generated image URL once the AI engine is wired in.
 */
export function coverGradientForSeed(seed: string): string {
  const idx = seedToIndex(seed, GRADIENT_PALETTE.length);
  const angle = 135 + seedToIndex(seed + 'a', 90);
  const [from, to] = GRADIENT_PALETTE[idx];
  return `linear-gradient(${angle}deg, ${from} 0%, ${to} 100%)`;
}

/** Placeholder lyric block — deferred to the real lyrics-generation engine. */
export function placeholderLyrics(title: string, genre: string): string {
  return [
    `[Verse 1 — ${genre.toUpperCase()} placeholder]`,
    `Open up my notes on "${title}",`,
    'turning every fact into a feeling I can hold.',
    'Highlighters and headphones, that\'s the study mode,',
    'vibe to it enough times and it sticks — I was told.',
    '',
    '[Chorus]',
    'Don\'t just read it, feel it,',
    'let the hook repeat it,',
    'one more spin before the test and I got this beat it.',
    '',
    '[Verse 2]',
    'Real lyrics land here once the engine\'s plugged in —',
    'for now this placeholder keeps the vibe convincing.',
  ].join('\n');
}
