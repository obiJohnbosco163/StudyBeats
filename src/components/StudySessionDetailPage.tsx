import AppShell from '@/components/AppShell';
import LearningPackage from '@/components/LearningPackage';
import SongCard from '@/components/SongCard';
import { EmptyState } from '@/components/poof-ui';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppAuth } from '@/contexts/AppAuthContext';
import { useGuestDB } from '@/hooks/use-guest-db';
import { useRealtimeData } from '@/hooks/use-realtime-data';
import { Time } from '@/lib/db-client';
import {
  deleteStudySessionsSessionSongs,
  setStudySessionsSessionSongs,
  subscribeManyStudySessionsSessionSongs,
  subscribeStudySessions,
  type StudySessionsResponse,
  type StudySessionsSessionSongsResponse,
} from '@/lib/collections/studySessions';
import { subscribeManySongs, type SongsResponse } from '@/lib/collections/songs';
import { formatDuration, nowSeconds } from '@/utils/studybeats';
import { ListMusic, Pause, Play, Plus, RotateCcw, X } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

function useCountdown(totalSec: number) {
  const [remaining, setRemaining] = useState(totalSec);
  const [running, setRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => setRemaining(totalSec), [totalSec]);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setRemaining(r => (r <= 1 ? 0 : r - 1));
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running]);

  useEffect(() => {
    if (remaining === 0) setRunning(false);
  }, [remaining]);

  return {
    remaining,
    running,
    toggle: () => setRunning(r => !r),
    reset: () => {
      setRemaining(totalSec);
      setRunning(false);
    },
  };
}

export const StudySessionDetailPage: React.FC = () => {
  const { sessionId = '' } = useParams();
  const { address, isGuest } = useAppAuth();
  const { db, mutate } = useGuestDB();
  const navigate = useNavigate();

  const { data: realSession } = useRealtimeData<StudySessionsResponse | null>(
    subscribeStudySessions,
    !!address && !isGuest,
    sessionId
  );
  const { data: realEntries } = useRealtimeData<StudySessionsSessionSongsResponse[]>(
    subscribeManyStudySessionsSessionSongs,
    !!address && !isGuest,
    sessionId,
    ''
  );
  const { data: realSongs } = useRealtimeData<SongsResponse[]>(subscribeManySongs, !!address && !isGuest, '');

  const session = isGuest ? db.sessions.find(s => s.id === sessionId) ?? null : realSession;
  const entries = isGuest ? db.sessionSongs[sessionId] ?? [] : realEntries ?? [];
  const allSongs = isGuest ? db.songs : realSongs ?? [];

  const sessionSongs = useMemo(() => {
    const bySongId = new Map(allSongs.map(s => [s.id, s]));
    return [...entries]
      .sort((a, b) => a.position - b.position)
      .map(e => bySongId.get(e.songId))
      .filter((s): s is SongsResponse => !!s);
  }, [entries, allSongs]);

  const availableToAdd = allSongs.filter(s => !entries.some(e => e.songId === s.id));
  const countdown = useCountdown(session?.durationSec || 1500);

  const addSong = (songId: string) => {
    if (isGuest) {
      mutate(dbState => ({
        ...dbState,
        sessionSongs: {
          ...dbState.sessionSongs,
          [sessionId]: [
            ...(dbState.sessionSongs[sessionId] ?? []),
            {
              id: songId,
              songId,
              position: (dbState.sessionSongs[sessionId] ?? []).length,
              addedAt: nowSeconds(),
              tarobase_created_at: nowSeconds(),
            },
          ],
        },
      }));
    } else {
      void setStudySessionsSessionSongs(sessionId, songId, {
        songId,
        position: entries.length,
        addedAt: Time.Now,
      });
    }
    toast.success('Added to session');
  };

  const removeSong = (songId: string) => {
    if (isGuest) {
      mutate(dbState => ({
        ...dbState,
        sessionSongs: {
          ...dbState.sessionSongs,
          [sessionId]: (dbState.sessionSongs[sessionId] ?? []).filter(e => e.songId !== songId),
        },
      }));
    } else {
      void deleteStudySessionsSessionSongs(sessionId, songId);
    }
  };

  if (!session) {
    return (
      <AppShell title="Session not found" description="This study session may have been removed.">
        <Button onClick={() => navigate('/sessions')}>Back to Study Sessions</Button>
      </AppShell>
    );
  }

  const pct = ((session.durationSec || 1500) - countdown.remaining) / (session.durationSec || 1500);

  return (
    <AppShell
      title={session.name}
      description="Stay in the zone — timer on the left, soundtrack on the right."
      breadcrumbs={[{ label: 'Study Sessions', href: '/sessions' }, { label: session.name }]}
      actions={
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Song
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {availableToAdd.length === 0 ? (
              <DropdownMenuItem disabled>All songs already added</DropdownMenuItem>
            ) : (
              availableToAdd.map(s => (
                <DropdownMenuItem key={s.id} onClick={() => addSong(s.id)}>
                  {s.title}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      }
    >
      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <div className="flex flex-col items-center rounded-2xl border border-border/60 bg-card/60 p-8">
          <div
            className="relative flex h-48 w-48 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(hsl(var(--primary)) ${pct * 360}deg, hsl(var(--secondary)) 0deg)`,
            }}
          >
            <div className="flex h-40 w-40 items-center justify-center rounded-full bg-card">
              <span className="text-3xl font-bold tabular-nums">{formatDuration(countdown.remaining)}</span>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <Button size="icon" className="h-11 w-11 rounded-full" onClick={countdown.toggle}>
              {countdown.running ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
            </Button>
            <Button variant="outline" size="icon" className="h-11 w-11 rounded-full" onClick={countdown.reset}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            {countdown.running ? 'Focusing... you got this.' : 'Ready when you are.'}
          </p>
        </div>

        <div>
          {sessionSongs.length === 0 ? (
            <EmptyState
              icon={<ListMusic />}
              title="No songs in this session"
              description="Add a few tracks to soundtrack this focus block."
            />
          ) : (
            <div className="space-y-2">
              {sessionSongs.map(song => (
                <div key={song.id} className="flex items-center gap-2">
                  <div className="flex-1">
                    <SongCard song={song} layout="row" />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeSong(song.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <LearningPackage session={session} />
      </div>
    </AppShell>
  );
};

export default StudySessionDetailPage;
