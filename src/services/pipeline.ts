/**
 * Generation pipeline orchestrator — pure module, no React/JSX.
 *
 * Runs the full notes -> song + learning-package flow, calling the
 * stateless backend AI endpoints (`/api/pipeline/*`) and persisting results
 * incrementally so uploaded work is never lost:
 *   reading -> understanding -> concepts -> lyrics -> music -> session -> finalizing
 *
 * Persistence routes through the real Poof collection functions for
 * authenticated users, or through the guest local store (utils/guestData)
 * for Guest mode — mirroring the exact pattern already used by
 * UploadPage/GeneratePage/SongDetailPage.
 *
 * Retry-safe: call again with the SAME `songId`/`sessionId` from a failed
 * attempt and already-completed fields (lyrics, audioUrl, summary,
 * flashcards, quiz, etc.) are detected and skipped instead of re-run.
 */
import { api } from '@/lib/api-client';
import { Address, Time } from '@/lib/db-client';
import { getMaterials, updateMaterials } from '@/lib/collections/materials';
import { getSongs, setSongs, updateSongs, type SongsResponse } from '@/lib/collections/songs';
import {
  getStudySessions,
  setStudySessions,
  setStudySessionsSessionSongs,
  updateStudySessions,
  type StudySessionsResponse,
} from '@/lib/collections/studySessions';
import { getGuestDB, setGuestDB } from '@/utils/guestData';
import { coverGradientForSeed, nowSeconds } from '@/utils/studybeats';
import type { StudyAnalysis } from '@/utils/learningPackage';
import { extractTextFromUrl } from './documentProcessing';

export type PipelineStepId =
  | 'reading'
  | 'understanding'
  | 'concepts'
  | 'lyrics'
  | 'music'
  | 'session'
  | 'finalizing';

export type PipelineStepStatus = 'pending' | 'active' | 'done' | 'error';

export type OnPipelineStep = (stepId: PipelineStepId, status: PipelineStepStatus, error?: string) => void;

export const PIPELINE_STEPS: { id: PipelineStepId; label: string }[] = [
  { id: 'reading', label: 'Reading your notes' },
  { id: 'understanding', label: 'Understanding the material' },
  { id: 'concepts', label: 'Building flashcards & quiz' },
  { id: 'lyrics', label: 'Writing lyrics' },
  { id: 'music', label: 'Producing the track' },
  { id: 'session', label: 'Assembling study session' },
  { id: 'finalizing', label: 'Finalizing' },
];

export interface PipelineMaterialInput {
  id: string;
  title: string;
  fileType: string;
  textContent?: string;
  fileUrl?: string;
}

export interface PipelineSettings {
  title: string;
  genre: string;
  vocalStyle: string;
  mood: string;
  lengthSec: number;
  language?: string;
}

export interface RunGenerationPipelineParams {
  address: string;
  isGuest: boolean;
  material: PipelineMaterialInput;
  settings: PipelineSettings;
  onStep: OnPipelineStep;
  /**
   * Stable ids for the song/study-session this generation will produce.
   * Callers generate these once (e.g. via `genId`) and pass the SAME ids
   * back in on a Retry — the pipeline looks up whatever is already
   * persisted under these ids and skips any step whose output already
   * exists, instead of re-running it.
   */
  songId: string;
  sessionId: string;
}

export interface RunGenerationPipelineResult {
  materialId: string;
  songId: string;
  sessionId: string;
}

interface SongPatch {
  title?: string;
  materialId?: string;
  genre?: string;
  vocalStyle?: string;
  durationSec?: number;
  audioUrl?: string;
  lyrics?: string;
  coverUrl?: string;
  status?: string;
  lyricsTimestamps?: string;
  generationError?: string;
}

interface SessionPatch {
  name?: string;
  durationSec?: number;
  materialId?: string;
  status?: string;
  shortSummary?: string;
  detailedSummary?: string;
  keyConcepts?: string;
  flashcards?: string;
  quiz?: string;
}

function loadGuestSong(songId: string): SongsResponse | undefined {
  return getGuestDB().songs.find((s) => s.id === songId);
}

function loadGuestSession(sessionId: string): StudySessionsResponse | undefined {
  return getGuestDB().sessions.find((s) => s.id === sessionId);
}

async function persistMaterialText(isGuest: boolean, materialId: string, textContent: string): Promise<void> {
  if (isGuest) {
    setGuestDB((db) => ({
      ...db,
      materials: db.materials.map((m) => (m.id === materialId ? { ...m, textContent } : m)),
    }));
    return;
  }
  await updateMaterials(materialId, { textContent });
}

async function createOrUpdateSong(
  isGuest: boolean,
  address: string,
  songId: string,
  patch: SongPatch,
  isCreate: boolean
): Promise<void> {
  if (isGuest) {
    setGuestDB((db) => {
      const exists = db.songs.some((s) => s.id === songId);
      if (exists) {
        return { ...db, songs: db.songs.map((s) => (s.id === songId ? { ...s, ...patch } : s)) };
      }
      const now = nowSeconds();
      const created: SongsResponse = {
        id: songId,
        title: patch.title ?? '',
        materialId: patch.materialId,
        genre: patch.genre ?? '',
        vocalStyle: patch.vocalStyle ?? '',
        durationSec: patch.durationSec ?? 0,
        audioUrl: patch.audioUrl,
        lyrics: patch.lyrics,
        coverUrl: patch.coverUrl,
        status: patch.status ?? 'generating',
        createdBy: address,
        createdAt: now,
        lyricsTimestamps: patch.lyricsTimestamps,
        generationError: patch.generationError,
        tarobase_created_at: now,
      };
      return { ...db, songs: [created, ...db.songs] };
    });
    return;
  }

  if (isCreate) {
    await setSongs(songId, {
      title: patch.title ?? '',
      materialId: patch.materialId,
      genre: patch.genre ?? '',
      vocalStyle: patch.vocalStyle ?? '',
      durationSec: patch.durationSec ?? 0,
      audioUrl: patch.audioUrl,
      lyrics: patch.lyrics,
      coverUrl: patch.coverUrl,
      status: patch.status ?? 'generating',
      createdBy: Address.publicKey(address),
      createdAt: Time.Now,
      lyricsTimestamps: patch.lyricsTimestamps,
      generationError: patch.generationError,
    });
  } else {
    await updateSongs(songId, patch);
  }
}

async function createOrUpdateSession(
  isGuest: boolean,
  address: string,
  sessionId: string,
  patch: SessionPatch,
  isCreate: boolean
): Promise<void> {
  if (isGuest) {
    setGuestDB((db) => {
      const exists = db.sessions.some((s) => s.id === sessionId);
      if (exists) {
        return { ...db, sessions: db.sessions.map((s) => (s.id === sessionId ? { ...s, ...patch } : s)) };
      }
      const now = nowSeconds();
      const created: StudySessionsResponse = {
        id: sessionId,
        name: patch.name ?? 'Study Session',
        durationSec: patch.durationSec,
        createdBy: address,
        createdAt: now,
        materialId: patch.materialId,
        status: patch.status ?? 'generating',
        shortSummary: patch.shortSummary,
        detailedSummary: patch.detailedSummary,
        keyConcepts: patch.keyConcepts,
        flashcards: patch.flashcards,
        quiz: patch.quiz,
        tarobase_created_at: now,
      };
      return { ...db, sessions: [created, ...db.sessions] };
    });
    return;
  }

  if (isCreate) {
    await setStudySessions(sessionId, {
      name: patch.name ?? 'Study Session',
      durationSec: patch.durationSec,
      createdBy: Address.publicKey(address),
      createdAt: Time.Now,
      materialId: patch.materialId,
      status: patch.status ?? 'generating',
      shortSummary: patch.shortSummary,
      detailedSummary: patch.detailedSummary,
      keyConcepts: patch.keyConcepts,
      flashcards: patch.flashcards,
      quiz: patch.quiz,
    });
  } else {
    await updateStudySessions(sessionId, patch);
  }
}

async function linkSongToSession(isGuest: boolean, sessionId: string, songId: string, position: number): Promise<void> {
  if (isGuest) {
    setGuestDB((db) => ({
      ...db,
      sessionSongs: {
        ...db.sessionSongs,
        [sessionId]: [
          ...(db.sessionSongs[sessionId] ?? []).filter((e) => e.songId !== songId),
          { id: songId, songId, position, addedAt: nowSeconds(), tarobase_created_at: nowSeconds() },
        ],
      },
    }));
    return;
  }
  await setStudySessionsSessionSongs(sessionId, songId, { songId, position, addedAt: Time.Now });
}

interface AnalyzeResponse {
  shortSummary: string;
  detailedSummary: string;
  keyConcepts: StudyAnalysis;
}

interface LearningPackageResponse {
  flashcards: unknown;
  quiz: unknown;
}

interface LyricsResponse {
  title: string;
  fullLyrics: string;
}

interface MusicResponse {
  audioUrl: string;
  duration: number;
  generationStatus: string;
  lyricsTimestamps?: { line: string; tSec: number }[];
}

/**
 * Run the full study-material -> song + learning-package pipeline.
 * Safe to call again with the SAME `songId`/`sessionId` after a failure —
 * whatever is already persisted under those ids is looked up, and any step
 * whose output already exists is skipped instead of re-run.
 */
export async function runGenerationPipeline(
  params: RunGenerationPipelineParams
): Promise<RunGenerationPipelineResult> {
  const { address, isGuest, material, settings, onStep, songId, sessionId } = params;

  const existingSong = isGuest ? loadGuestSong(songId) ?? null : await getSongs(songId);
  const existingSession = isGuest ? loadGuestSession(sessionId) ?? null : await getStudySessions(sessionId);
  const isNewSong = !existingSong;
  const isNewSession = !existingSession;
  let songCreated = !isNewSong;

  let currentStep: PipelineStepId = 'reading';

  try {
    // ---- 1. Reading ----
    currentStep = 'reading';
    onStep('reading', 'active');
    let text = material.textContent ?? '';
    if (!text && material.fileUrl) {
      text = await extractTextFromUrl(material.fileUrl, material.fileType);
      await persistMaterialText(isGuest, material.id, text);
    }
    if (!text.trim()) {
      throw new Error('No text content is available for this material.');
    }
    onStep('reading', 'done');

    if (isNewSong) {
      await createOrUpdateSong(
        isGuest,
        address,
        songId,
        {
          title: settings.title,
          materialId: material.id,
          genre: settings.genre,
          vocalStyle: settings.vocalStyle,
          durationSec: settings.lengthSec,
          coverUrl: coverGradientForSeed(settings.title + songId),
          status: 'generating',
        },
        true
      );
      songCreated = true;
    }

    // ---- 2. Understanding (analysis + summary) ----
    currentStep = 'understanding';
    let analysis: StudyAnalysis;
    let shortSummary = existingSession?.shortSummary ?? '';
    let detailedSummary = existingSession?.detailedSummary ?? '';
    let keyConceptsJson = existingSession?.keyConcepts ?? '';

    if (shortSummary && detailedSummary && keyConceptsJson) {
      onStep('understanding', 'done');
      analysis = JSON.parse(keyConceptsJson) as StudyAnalysis;
    } else {
      onStep('understanding', 'active');
      const result = await api.post<AnalyzeResponse>('/api/pipeline/analyze', {
        text,
        title: material.title,
      });
      shortSummary = result.shortSummary;
      detailedSummary = result.detailedSummary;
      analysis = result.keyConcepts;
      keyConceptsJson = JSON.stringify(analysis);

      await createOrUpdateSession(
        isGuest,
        address,
        sessionId,
        {
          name: settings.title || material.title,
          durationSec: settings.lengthSec,
          materialId: material.id,
          status: 'generating',
          shortSummary,
          detailedSummary,
          keyConcepts: keyConceptsJson,
        },
        isNewSession
      );
      onStep('understanding', 'done');
    }

    // ---- 3. Concepts (flashcards + quiz) ----
    currentStep = 'concepts';
    let flashcardsJson = existingSession?.flashcards ?? '';
    let quizJson = existingSession?.quiz ?? '';
    if (flashcardsJson && quizJson) {
      onStep('concepts', 'done');
    } else {
      onStep('concepts', 'active');
      const result = await api.post<LearningPackageResponse>('/api/pipeline/learning-package', { text });
      flashcardsJson = JSON.stringify(result.flashcards ?? []);
      quizJson = JSON.stringify(result.quiz ?? []);
      await createOrUpdateSession(
        isGuest,
        address,
        sessionId,
        { flashcards: flashcardsJson, quiz: quizJson },
        false
      );
      onStep('concepts', 'done');
    }

    // ---- 4. Lyrics ----
    currentStep = 'lyrics';
    let lyrics = existingSong?.lyrics ?? '';
    if (lyrics) {
      onStep('lyrics', 'done');
    } else {
      onStep('lyrics', 'active');
      const result = await api.post<LyricsResponse>('/api/pipeline/lyrics', {
        analysis,
        genre: settings.genre,
        mood: settings.mood,
        language: settings.language ?? 'English',
        durationSec: settings.lengthSec,
        vocalStyle: settings.vocalStyle,
      });
      lyrics = result.fullLyrics;
      await createOrUpdateSong(isGuest, address, songId, { lyrics }, false);
      onStep('lyrics', 'done');
    }

    // ---- 5. Music ----
    currentStep = 'music';
    let audioUrl = existingSong?.audioUrl ?? '';
    let finalDuration = existingSong?.durationSec ?? settings.lengthSec;
    if (audioUrl) {
      onStep('music', 'done');
    } else {
      onStep('music', 'active');
      const result = await api.post<MusicResponse>('/api/pipeline/music', {
        lyrics,
        genre: settings.genre,
        mood: settings.mood,
        language: settings.language ?? 'English',
        durationSec: settings.lengthSec,
        vocalStyle: settings.vocalStyle,
      });
      audioUrl = result.audioUrl;
      finalDuration = result.duration || settings.lengthSec;
      const lyricsTimestampsJson = result.lyricsTimestamps ? JSON.stringify(result.lyricsTimestamps) : undefined;
      await createOrUpdateSong(
        isGuest,
        address,
        songId,
        { audioUrl, durationSec: finalDuration, lyricsTimestamps: lyricsTimestampsJson },
        false
      );
      onStep('music', 'done');
    }

    // ---- 6. Session (link the song into the study session) ----
    currentStep = 'session';
    onStep('session', 'active');
    await linkSongToSession(isGuest, sessionId, songId, 0);
    onStep('session', 'done');

    // ---- 7. Finalizing ----
    currentStep = 'finalizing';
    onStep('finalizing', 'active');
    await createOrUpdateSong(isGuest, address, songId, { status: 'ready', generationError: '' }, false);
    await createOrUpdateSession(isGuest, address, sessionId, { status: 'ready' }, false);
    onStep('finalizing', 'done');

    return { materialId: material.id, songId, sessionId };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Generation failed. Please try again.';
    onStep(currentStep, 'error', message);
    if (songCreated) {
      await createOrUpdateSong(isGuest, address, songId, { status: 'failed', generationError: message }, false).catch(
        () => undefined
      );
    }
    throw err;
  }
}

/** Look up a material by id, branching between guest local store and real collections. */
export async function loadPipelineMaterial(
  isGuest: boolean,
  materialId: string
): Promise<PipelineMaterialInput | null> {
  if (isGuest) {
    const m = getGuestDB().materials.find((mat) => mat.id === materialId);
    return m ? { id: m.id, title: m.title, fileType: m.fileType, textContent: m.textContent, fileUrl: m.fileUrl } : null;
  }
  const m = await getMaterials(materialId);
  return m ? { id: m.id, title: m.title, fileType: m.fileType, textContent: m.textContent, fileUrl: m.fileUrl } : null;
}
