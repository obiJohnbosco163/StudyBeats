import AppShell from '@/components/AppShell';
import { EmptyState } from '@/components/poof-ui';
import { Button } from '@/components/ui/button';
import { usePlayer } from '@/contexts/PlayerContext';
import { useAppAuth } from '@/contexts/AppAuthContext';
import { useGuestDB } from '@/hooks/use-guest-db';
import { useRealtimeData } from '@/hooks/use-realtime-data';
import { subscribeManyHistory, type HistoryResponse } from '@/lib/collections/history';
import { subscribeManySongs, type SongsResponse } from '@/lib/collections/songs';
import { formatDuration, formatRelativeTime } from '@/utils/studybeats';
import { History as HistoryIcon, Play } from 'lucide-react';
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export const HistoryPage: React.FC = () => {
  const { address, isGuest } = useAppAuth();
  const { db } = useGuestDB();
  const { play } = usePlayer();
  const navigate = useNavigate();

  const { data: realHistory } = useRealtimeData<HistoryResponse[]>(subscribeManyHistory, !!address && !isGuest, '');
  const { data: realSongs } = useRealtimeData<SongsResponse[]>(subscribeManySongs, !!address && !isGuest, '');

  const history = isGuest ? db.history : realHistory ?? [];
  const allSongs = isGuest ? db.songs : realSongs ?? [];

  const entries = useMemo(() => {
    const bySongId = new Map(allSongs.map(s => [s.id, s]));
    return [...history]
      .sort((a, b) => (b.playedAt ?? 0) - (a.playedAt ?? 0))
      .map(h => ({ h, song: bySongId.get(h.songId) }))
      .filter((x): x is { h: HistoryResponse; song: SongsResponse } => !!x.song);
  }, [history, allSongs]);

  return (
    <AppShell title="History" description="Everything you've played, most recent first.">
      {entries.length === 0 ? (
        <EmptyState
          icon={<HistoryIcon />}
          title="No plays yet"
          description="Play a song and it'll show up here."
          action={<Button onClick={() => navigate('/songs')}>Browse My Songs</Button>}
        />
      ) : (
        <div className="space-y-2">
          {entries.map(({ h, song }) => (
            <div
              key={h.id}
              className="flex items-center gap-4 rounded-xl border border-border/60 bg-card/60 p-3"
            >
              <div
                className="h-11 w-11 shrink-0 rounded-lg"
                style={{ background: song.coverUrl || 'linear-gradient(135deg,#10e0a1,#7c3aed)' }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{song.title}</p>
                <p className="text-xs text-muted-foreground">
                  {song.vocalStyle} · {formatDuration(song.durationSec)}
                </p>
              </div>
              <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                {formatRelativeTime(h.playedAt)}
              </span>
              <Button variant="ghost" size="icon" onClick={() => play(song)}>
                <Play className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
};

export default HistoryPage;
