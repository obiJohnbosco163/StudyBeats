import AppShell from '@/components/AppShell';
import { EmptyState } from '@/components/poof-ui';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppAuth } from '@/contexts/AppAuthContext';
import { useGuestDB } from '@/hooks/use-guest-db';
import { useRealtimeData } from '@/hooks/use-realtime-data';
import { subscribeManySongs, type SongsResponse } from '@/lib/collections/songs';
import { formatDuration } from '@/utils/studybeats';
import { CloudDownload, HardDriveDownload, WifiOff } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const DownloadsPage: React.FC = () => {
  const { address, isGuest } = useAppAuth();
  const { db } = useGuestDB();
  const navigate = useNavigate();

  const { data: realSongs } = useRealtimeData<SongsResponse[]>(subscribeManySongs, !!address && !isGuest, '');
  const songs = isGuest ? db.songs : realSongs ?? [];

  return (
    <AppShell
      title="Downloads"
      description="Take your soundtrack offline — coming with the audio engine."
    >
      <div className="mb-8 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent">
            <WifiOff className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <p className="font-semibold">Offline playback is on the roadmap</p>
            <p className="text-sm text-muted-foreground">
              Once real audio generation is wired in, downloads will cache songs for offline study sessions.
            </p>
          </div>
        </div>
      </div>

      {songs.length === 0 ? (
        <EmptyState
          icon={<CloudDownload />}
          title="Nothing to download yet"
          description="Generate a song first, then queue it up for offline listening."
          action={<Button onClick={() => navigate('/generate')}>Generate a Song</Button>}
        />
      ) : (
        <div className="space-y-2">
          {songs.map(song => (
            <div key={song.id} className="flex items-center gap-4 rounded-xl border border-border/60 bg-card/60 p-3">
              <div
                className="h-11 w-11 shrink-0 rounded-lg"
                style={{ background: song.coverUrl || 'linear-gradient(135deg,#10e0a1,#7c3aed)' }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{song.title}</p>
                <p className="text-xs text-muted-foreground">{formatDuration(song.durationSec)}</p>
              </div>
              <Badge variant="outline" className="shrink-0 text-xs">
                Not downloaded
              </Badge>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => toast.info('Downloads unlock once real audio files are generated.')}
              >
                <HardDriveDownload className="h-4 w-4" />
                Download
              </Button>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
};

export default DownloadsPage;
