/**
 * Guest-mode local data store for StudyBeats AI.
 *
 * When a judge/user clicks "Continue as Guest" there is no real wallet, so
 * writes to the real Poof collections would be denied by the owner-scoped
 * policy. Instead we keep an in-browser (localStorage) mirror of the same
 * shapes as the real collections, so every screen is fully navigable and
 * functional without a wallet. Nothing here ever touches the network.
 */
import type {
  MaterialsResponse,
} from '@/lib/collections/materials';
import type { SongsResponse } from '@/lib/collections/songs';
import type {
  PlaylistsPlaylistSongsResponse,
  PlaylistsResponse,
} from '@/lib/collections/playlists';
import type {
  StudySessionsResponse,
  StudySessionsSessionSongsResponse,
} from '@/lib/collections/studySessions';
import type { FavoritesResponse } from '@/lib/collections/favorites';
import type { HistoryResponse } from '@/lib/collections/history';
import type { ProfilesResponse } from '@/lib/collections/profiles';
import { coverGradientForSeed, nowSeconds, placeholderLyrics } from './studybeats';

export const GUEST_ADDRESS_KEY = 'studybeats_guest_address';
export const GUEST_FLAG_KEY = 'studybeats_guest_active';
const GUEST_DB_KEY = 'studybeats_guest_db_v1';

export interface GuestDB {
  profile: ProfilesResponse | null;
  materials: MaterialsResponse[];
  songs: SongsResponse[];
  playlists: PlaylistsResponse[];
  playlistSongs: Record<string, PlaylistsPlaylistSongsResponse[]>;
  sessions: StudySessionsResponse[];
  sessionSongs: Record<string, StudySessionsSessionSongsResponse[]>;
  favorites: FavoritesResponse[];
  history: HistoryResponse[];
}

function emptyDB(): GuestDB {
  return {
    profile: null,
    materials: [],
    songs: [],
    playlists: [],
    playlistSongs: {},
    sessions: [],
    sessionSongs: {},
    favorites: [],
    history: [],
  };
}

export function getGuestAddress(): string {
  let addr = localStorage.getItem(GUEST_ADDRESS_KEY);
  if (!addr) {
    addr = `Guest${Math.random().toString(36).slice(2, 8).toUpperCase()}${Math.random()
      .toString(36)
      .slice(2, 6)
      .toUpperCase()}`;
    localStorage.setItem(GUEST_ADDRESS_KEY, addr);
  }
  return addr;
}

export function isGuestActive(): boolean {
  return localStorage.getItem(GUEST_FLAG_KEY) === 'true';
}

export function setGuestActive(active: boolean) {
  localStorage.setItem(GUEST_FLAG_KEY, active ? 'true' : 'false');
  if (active) seedGuestDBIfEmpty();
  emit();
}

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach(fn => fn());
}
export function subscribeGuestDB(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getGuestDB(): GuestDB {
  try {
    const raw = localStorage.getItem(GUEST_DB_KEY);
    if (!raw) return emptyDB();
    return { ...emptyDB(), ...JSON.parse(raw) } as GuestDB;
  } catch {
    return emptyDB();
  }
}

export function setGuestDB(updater: (db: GuestDB) => GuestDB) {
  const next = updater(getGuestDB());
  try {
    localStorage.setItem(GUEST_DB_KEY, JSON.stringify(next));
  } catch {
    // ignore storage errors (private mode, quota, etc.)
  }
  emit();
}

export function resetGuestDB() {
  localStorage.removeItem(GUEST_DB_KEY);
  emit();
}

/** Seed a believable demo library the first time someone enters guest mode. */
export function seedGuestDBIfEmpty() {
  const existing = getGuestDB();
  if (existing.materials.length || existing.songs.length) return;
  const address = getGuestAddress();
  const now = nowSeconds();

  const materials: MaterialsResponse[] = [
    {
      id: 'mat-demo-1',
      title: 'Organic Chemistry — Chapter 7: Alkenes',
      fileType: 'pdf',
      textContent: undefined,
      sizeBytes: 482_000,
      uploadedBy: address,
      status: 'ready',
      createdAt: now - 86400 * 3,
      tarobase_created_at: now - 86400 * 3,
    },
    {
      id: 'mat-demo-2',
      title: 'World History — The Cold War Notes',
      fileType: 'docx',
      textContent: undefined,
      sizeBytes: 210_500,
      uploadedBy: address,
      status: 'ready',
      createdAt: now - 86400 * 2,
      tarobase_created_at: now - 86400 * 2,
    },
    {
      id: 'mat-demo-3',
      title: 'Linear Algebra — Eigenvectors Cheat Sheet',
      fileType: 'text',
      textContent:
        'An eigenvector of a square matrix A is a nonzero vector v such that Av = λv for some scalar λ, called the eigenvalue...',
      sizeBytes: 3_200,
      uploadedBy: address,
      status: 'ready',
      createdAt: now - 86400,
      tarobase_created_at: now - 86400,
    },
  ];

  const songSeeds: { title: string; genre: string; vocalStyle: string; materialId: string }[] = [
    { title: 'Double Bond Boogie', genre: 'pop', vocalStyle: 'Warm Female', materialId: 'mat-demo-1' },
    { title: 'Cold War Lullaby', genre: 'lofi', vocalStyle: 'Smooth Male', materialId: 'mat-demo-2' },
    { title: 'Eigenvector Anthem', genre: 'hiphop', vocalStyle: 'Rap', materialId: 'mat-demo-3' },
    { title: 'Alkene Groove', genre: 'edm', vocalStyle: 'Choir', materialId: 'mat-demo-1' },
  ];

  const songs: SongsResponse[] = songSeeds.map((s, i) => ({
    id: `song-demo-${i + 1}`,
    title: s.title,
    materialId: s.materialId,
    genre: s.genre,
    vocalStyle: s.vocalStyle,
    durationSec: 138 + i * 12,
    audioUrl: undefined,
    lyrics: placeholderLyrics(s.title, s.genre),
    coverUrl: coverGradientForSeed(s.title + i),
    status: 'ready',
    createdBy: address,
    createdAt: now - 86400 * (3 - i * 0.5),
    tarobase_created_at: now - 86400 * (3 - i * 0.5),
  }));

  const playlists: PlaylistsResponse[] = [
    {
      id: 'pl-demo-1',
      name: 'Finals Week Focus',
      description: 'The songs that get me through exam season.',
      coverUrl: coverGradientForSeed('Finals Week Focus'),
      createdBy: address,
      createdAt: now - 86400 * 2,
      tarobase_created_at: now - 86400 * 2,
    },
  ];

  const playlistSongs: Record<string, PlaylistsPlaylistSongsResponse[]> = {
    'pl-demo-1': songs.slice(0, 2).map((s, i) => ({
      id: s.id,
      songId: s.id,
      position: i,
      addedAt: now - 86400,
      tarobase_created_at: now - 86400,
    })),
  };

  const sessions: StudySessionsResponse[] = [
    {
      id: 'sess-demo-1',
      name: 'Morning Deep Focus',
      durationSec: 1500,
      createdBy: address,
      createdAt: now - 86400,
      tarobase_created_at: now - 86400,
    },
  ];

  const sessionSongs: Record<string, StudySessionsSessionSongsResponse[]> = {
    'sess-demo-1': songs.slice(1, 3).map((s, i) => ({
      id: s.id,
      songId: s.id,
      position: i,
      addedAt: now - 86400,
      tarobase_created_at: now - 86400,
    })),
  };

  const favorites: FavoritesResponse[] = [
    {
      id: `${address}__${songs[0].id}`,
      userId: address,
      songId: songs[0].id,
      createdAt: now - 3600,
      tarobase_created_at: now - 3600,
    },
  ];

  const history: HistoryResponse[] = songs.slice(0, 3).map((s, i) => ({
    id: `hist-demo-${i + 1}`,
    userId: address,
    songId: s.id,
    playedAt: now - 3600 * (i + 1),
    tarobase_created_at: now - 3600 * (i + 1),
  }));

  const profile: ProfilesResponse = {
    id: address,
    address,
    displayName: 'Guest Vibe-r',
    bio: 'Browsing StudyBeats AI in guest mode.',
    plan: 'free',
    createdAt: now,
    tarobase_created_at: now,
  };

  setGuestDB(() => ({
    profile,
    materials,
    songs,
    playlists,
    playlistSongs,
    sessions,
    sessionSongs,
    favorites,
    history,
  }));
}
