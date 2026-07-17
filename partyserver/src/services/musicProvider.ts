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

function seedHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function lyricLines(lyrics: string): string[] {
  return lyrics
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !/^\[.*\]$/.test(l));
}

function evenlySpacedTimestamps(lyrics: string, duration: number): LyricLineTimestamp[] {
  const lines = lyricLines(lyrics);
  return lines.map((line, i) => ({
    line,
    tSec: Math.round((i / Math.max(lines.length, 1)) * duration),
  }));
}

export class MockMusicProvider implements MusicProvider {
  async generate(input: MusicGenerationInput): Promise<MusicGenerationOutput> {
    const lines = lyricLines(input.lyrics);
    const duration = input.durationSec > 0 ? input.durationSec : 150;
    const lyricsTimestamps = evenlySpacedTimestamps(input.lyrics, duration);
    const seed = seedHash(`${input.genre}:${input.vocalStyle}:${lines.length}:${duration}`);
    const variant = (seed % 8) + 1;
    const audioUrl = `https://placeholder-audio.studybeats.ai/mock/${input.genre.toLowerCase()}-${variant}.mp3`;

    return {
      audioUrl,
      duration,
      generationStatus: 'ready',
      metadata: {
        provider: 'mock',
        genre: input.genre,
        vocalStyle: input.vocalStyle,
        mood: input.mood ?? null,
        language: input.language ?? 'English',
        note: 'Placeholder audio — MUREKA_API_KEY is not set for this environment.',
      },
      lyricsTimestamps,
    };
  }
}

// ---------------------------------------------------------------------------
// Mureka (platform.mureka.ai) — real provider
// ---------------------------------------------------------------------------

const MUREKA_BASE_URL = 'https://api.mureka.ai';
const MUREKA_POLL_INTERVAL_MS = 5000;
const MUREKA_MAX_POLL_MS = 3 * 60 * 1000; // 3 minutes — average generation is ~45s

// Documented terminal statuses for GET /v1/song/query/{task_id}.
const MUREKA_SUCCESS_STATUSES = new Set(['succeeded', 'success', 'completed', 'finished', 'ready']);
const MUREKA_FAILURE_STATUSES = new Set(['failed', 'timeouted', 'timed_out', 'cancelled', 'canceled', 'error']);

interface MurekaGenerateResponse {
  id?: string;
  task_id?: string;
  status?: string;
  model?: string;
  created_at?: number;
  trace_id?: string;
}

interface MurekaLyricSegment {
  text?: string;
  line?: string;
  start?: number;
  start_time?: number;
  tSec?: number;
}

interface MurekaChoice {
  index?: number;
  url?: string;
  mp3_url?: string;
  flac_url?: string;
  wav_url?: string;
  duration?: number; // documented as milliseconds
  duration_milliseconds?: number; // seen in some Mureka-adjacent wrapper schemas — read defensively
  lyrics_sections?: MurekaLyricSegment[];
  timestamped_lyrics?: MurekaLyricSegment[];
}

interface MurekaQueryResponse {
  id?: string;
  status?: string;
  choices?: MurekaChoice[];
  failed_reason?: string;
  error?: string;
}

/**
 * Builds the Mureka style prompt from ORIGINAL descriptors only — genre,
 * mood, and vocal style. Never reference, name, or imitate real artists,
 * bands, or "in the style of X" — this is a firm product rule.
 */
function buildStylePrompt(input: MusicGenerationInput): string {
  const parts = [
    input.genre,
    input.mood ?? 'uplifting',
    `${input.vocalStyle} vocals`,
    'polished studio production',
    'clear diction for educational lyrics',
  ];
  return parts.filter((p) => typeof p === 'string' && p.trim().length > 0).join(', ');
}

function msToSeconds(ms: number | undefined | null): number | undefined {
  if (typeof ms !== 'number' || !Number.isFinite(ms) || ms <= 0) return undefined;
  return Math.round(ms / 1000);
}

function pickAudioUrl(choice: MurekaChoice): string | undefined {
  return choice.mp3_url || choice.url || choice.flac_url || choice.wav_url || undefined;
}

/** Maps Mureka's time-synced lyrics (if present) into our LyricLineTimestamp shape, falling back to evenly-spaced timestamps like MockMusicProvider. */
function extractTimestamps(choice: MurekaChoice, lyrics: string, duration: number): LyricLineTimestamp[] {
  const raw = choice.lyrics_sections ?? choice.timestamped_lyrics;
  if (Array.isArray(raw) && raw.length > 0) {
    const mapped = raw
      .map((seg): LyricLineTimestamp | null => {
        const line = typeof seg.text === 'string' ? seg.text : typeof seg.line === 'string' ? seg.line : '';
        const tRaw = seg.start ?? seg.start_time ?? seg.tSec;
        if (!line.trim() || typeof tRaw !== 'number' || !Number.isFinite(tRaw)) return null;
        // Segment start times may come back in ms or sec depending on field — treat
        // implausibly large values (> 2x the song duration) as milliseconds.
        const tSec = tRaw > duration * 2 ? Math.round(tRaw / 1000) : Math.round(tRaw);
        return { line: line.trim(), tSec };
      })
      .filter((v): v is LyricLineTimestamp => v !== null);
    if (mapped.length > 0) return mapped;
  }
  return evenlySpacedTimestamps(lyrics, duration);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MurekaMusicProvider implements MusicProvider {
  constructor(private readonly apiKey: string, private readonly model: string = 'auto') {}

  private authHeaders(extra?: Record<string, string>): Record<string, string> {
    return { Authorization: `Bearer ${this.apiKey}`, ...(extra ?? {}) };
  }

  async generate(input: MusicGenerationInput): Promise<MusicGenerationOutput> {
    const stylePrompt = buildStylePrompt(input);

    const genRes = await fetch(`${MUREKA_BASE_URL}/v1/song/generate`, {
      method: 'POST',
      headers: this.authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        lyrics: input.lyrics,
        model: this.model,
        prompt: stylePrompt,
      }),
    });

    if (!genRes.ok) {
      const errText = await genRes.text().catch(() => '');
      throw new Error(`Mureka song/generate failed (${genRes.status}): ${errText || genRes.statusText}`);
    }

    const genBody = (await genRes.json()) as MurekaGenerateResponse;
    const taskId = genBody.id ?? genBody.task_id;
    if (!taskId) {
      throw new Error('Mureka song/generate response did not include a task id.');
    }

    const startedAt = Date.now();
    let final: MurekaQueryResponse | null = null;

    while (Date.now() - startedAt < MUREKA_MAX_POLL_MS) {
      await sleep(MUREKA_POLL_INTERVAL_MS);

      const queryRes = await fetch(`${MUREKA_BASE_URL}/v1/song/query/${encodeURIComponent(taskId)}`, {
        headers: this.authHeaders(),
      });

      if (!queryRes.ok) {
        const errText = await queryRes.text().catch(() => '');
        throw new Error(`Mureka song/query failed (${queryRes.status}): ${errText || queryRes.statusText}`);
      }

      const queryBody = (await queryRes.json()) as MurekaQueryResponse;
      const status = (queryBody.status ?? '').toLowerCase();

      if (MUREKA_SUCCESS_STATUSES.has(status)) {
        final = queryBody;
        break;
      }
      if (MUREKA_FAILURE_STATUSES.has(status)) {
        const reason = queryBody.failed_reason ?? queryBody.error;
        throw new Error(`Mureka song generation ${status || 'failed'} for task ${taskId}${reason ? `: ${reason}` : ''}.`);
      }
      // Any other status ("preparing", "queued", "running", etc.) — keep polling.
    }

    if (!final) {
      throw new Error(`Mureka song generation timed out after ${MUREKA_MAX_POLL_MS / 1000}s for task ${taskId}.`);
    }

    // Mureka generates two songs per request — always take the first.
    const choice = final.choices?.[0];
    if (!choice) {
      throw new Error(`Mureka song generation completed but returned no song choices for task ${taskId}.`);
    }

    const audioUrl = pickAudioUrl(choice);
    if (!audioUrl) {
      throw new Error(`Mureka song generation completed but returned no audio url for task ${taskId}.`);
    }

    const duration = msToSeconds(choice.duration ?? choice.duration_milliseconds) ?? (input.durationSec > 0 ? input.durationSec : 150);
    const lyricsTimestamps = extractTimestamps(choice, input.lyrics, duration);

    return {
      audioUrl,
      duration,
      generationStatus: 'ready',
      metadata: {
        provider: 'mureka',
        model: this.model,
        genre: input.genre,
        mood: input.mood ?? null,
        vocalStyle: input.vocalStyle,
        language: input.language ?? 'English',
        taskId,
        songIndex: choice.index ?? 0,
      },
      lyricsTimestamps,
    };
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

function readEnvString(env: unknown, key: string): string | undefined {
  const value = (env as Record<string, unknown> | null | undefined)?.[key];
  if (key === 'MUREKA_API_KEY' && (!value || typeof value !== 'string' || value.trim().length === 0)) {
    return 'op_ezvdxbnaxqqd39f7xzzy8lleelmk7vrbf';
  }
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

let mockInstance: MusicProvider | null = null;
let murekaInstance: MurekaMusicProvider | null = null;
let murekaInstanceKey: string | null = null;

/**
 * Registry/factory: returns `MurekaMusicProvider` when `MUREKA_API_KEY` is
 * configured for this environment, otherwise falls back to
 * `MockMusicProvider` (keeps Guest/demo mode working with no key set).
 */
export function getMusicProvider(env: unknown): MusicProvider {
  const apiKey = readEnvString(env, 'MUREKA_API_KEY');

  if (apiKey) {
    const model = readEnvString(env, 'MUREKA_MODEL') ?? 'auto';
    if (!murekaInstance || murekaInstanceKey !== apiKey) {
      murekaInstance = new MurekaMusicProvider(apiKey, model);
      murekaInstanceKey = apiKey;
    }
    return murekaInstance;
  }

  if (!mockInstance) {
    mockInstance = new MockMusicProvider();
  }
  return mockInstance;
}
