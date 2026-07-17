import { useAppAuth } from '@/contexts/AppAuthContext';
import { useGuestDB } from '@/hooks/use-guest-db';
import { Address, Time } from '@/lib/db-client';
import { setHistory } from '@/lib/collections/history';
import type { SongsResponse } from '@/lib/collections/songs';
import { genId, nowSeconds } from '@/utils/studybeats';
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

interface PlayerContextValue {
  currentSong: SongsResponse | null;
  isPlaying: boolean;
  progress: number; // 0-100, simulated
  play: (song: SongsResponse) => void;
  togglePlay: () => void;
  pause: () => void;
  closePlayer: () => void;
}

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

/**
 * Global "now playing" state for the placeholder audio player. No real audio
 * plays — progress is a simulated ticker so the PlayerBar UI feels alive.
 * Starting playback logs a `history` entry (real or guest-local).
 */
export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address, isGuest } = useAppAuth();
  const { mutate: mutateGuest } = useGuestDB();
  const [currentSong, setCurrentSong] = useState<SongsResponse | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress(p => (p >= 100 ? 0 : p + 100 / (currentSong?.durationSec || 150)));
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, currentSong?.id]);

  const recordHistory = (song: SongsResponse) => {
    if (!address) return;
    if (isGuest) {
      mutateGuest(db => ({
        ...db,
        history: [
          {
            id: genId('hist'),
            userId: address,
            songId: song.id,
            playedAt: nowSeconds(),
            tarobase_created_at: nowSeconds(),
          },
          ...db.history,
        ],
      }));
    } else {
      void setHistory(genId('hist'), {
        userId: Address.publicKey(address),
        songId: song.id,
        playedAt: Time.Now,
      });
    }
  };

  const play = (song: SongsResponse) => {
    if (currentSong?.id !== song.id) {
      setCurrentSong(song);
      setProgress(0);
      recordHistory(song);
    }
    setIsPlaying(true);
  };

  const pause = () => setIsPlaying(false);
  const togglePlay = () => setIsPlaying(p => !p);
  const closePlayer = () => {
    setIsPlaying(false);
    setCurrentSong(null);
    setProgress(0);
  };

  const value = useMemo(
    () => ({ currentSong, isPlaying, progress, play, togglePlay, pause, closePlayer }),
    [currentSong, isPlaying, progress]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
