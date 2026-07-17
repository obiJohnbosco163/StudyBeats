import AppShell from '@/components/AppShell';
import SongCard from '@/components/SongCard';
import { EmptyState, MetricGrid } from '@/components/poof-ui';
import { Button } from '@/components/ui/button';
import { useAppAuth } from '@/contexts/AppAuthContext';
import { useGuestDB } from '@/hooks/use-guest-db';
import { useRealtimeData } from '@/hooks/use-realtime-data';
import { subscribeManyMaterials, type MaterialsResponse } from '@/lib/collections/materials';
import { subscribeManySongs, type SongsResponse } from '@/lib/collections/songs';
import { subscribeManyPlaylists, type PlaylistsResponse } from '@/lib/collections/playlists';
import { formatRelativeTime } from '@/utils/studybeats';
import { FileText, ListMusic, Music2, Sparkles, UploadCloud } from 'lucide-react';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { address, isGuest } = useAppAuth();
  const navigate = useNavigate();
  const { db } = useGuestDB();

  const { data: realSongs } = useRealtimeData<SongsResponse[]>(subscribeManySongs, !!address && !isGuest, '');
  const { data: realMaterials } = useRealtimeData<MaterialsResponse[]>(
    subscribeManyMaterials,
    !!address && !isGuest,
    ''
  );
  const { data: realPlaylists } = useRealtimeData<PlaylistsResponse[]>(
    subscribeManyPlaylists,
    !!address && !isGuest,
    ''
  );

  const songs = isGuest ? db.songs : realSongs ?? [];
  const materials = isGuest ? db.materials : realMaterials ?? [];
  const playlists = isGuest ? db.playlists : realPlaylists ?? [];

  const recentSongs = [...songs].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)).slice(0, 6);
  const recentMaterials = [...materials].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)).slice(0, 5);

  return (
    <AppShell
      title="Welcome back"
      description="Here's what's playing in your study world."
      actions={
        <Button onClick={() => navigate('/generate')} className="gap-2">
          <Sparkles className="h-4 w-4" />
          Generate a Song
        </Button>
      }
    >
      <div className="space-y-10">
        <MetricGrid
          columns={3}
          metrics={[
            { label: 'Materials Uploaded', value: materials.length },
            { label: 'Songs Created', value: songs.length },
            { label: 'Playlists', value: playlists.length },
          ]}
        />

        <div>
          <h2 className="mb-4 text-lg font-semibold">Quick actions</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <QuickAction
              icon={UploadCloud}
              title="Upload Notes"
              desc="PDF, DOCX, or paste text"
              onClick={() => navigate('/upload')}
            />
            <QuickAction
              icon={Sparkles}
              title="Generate a Song"
              desc="Pick genre, mood & vocals"
              onClick={() => navigate('/generate')}
            />
            <QuickAction
              icon={ListMusic}
              title="New Playlist"
              desc="Group songs for revision"
              onClick={() => navigate('/playlists')}
            />
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent songs</h2>
            <Link to="/songs" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          {recentSongs.length === 0 ? (
            <EmptyState
              icon={<Music2 />}
              title="No songs yet"
              description="Generate your first study anthem to see it here."
              action={<Button onClick={() => navigate('/generate')}>Generate a Song</Button>}
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {recentSongs.map(song => (
                <SongCard key={song.id} song={song} />
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent uploads</h2>
            <Link to="/upload" className="text-sm text-primary hover:underline">
              Upload more
            </Link>
          </div>
          {recentMaterials.length === 0 ? (
            <EmptyState
              icon={<FileText />}
              title="No materials yet"
              description="Upload lecture notes to start generating songs from them."
              action={<Button onClick={() => navigate('/upload')}>Upload Notes</Button>}
            />
          ) : (
            <div className="space-y-2">
              {recentMaterials.map(m => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/60 p-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{m.title}</p>
                    <p className="text-xs uppercase text-muted-foreground">{m.fileType}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatRelativeTime(m.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
};

function QuickAction({
  icon: Icon,
  title,
  desc,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-4 rounded-2xl border border-border/60 bg-card/60 p-5 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-md shadow-primary/20">
        <Icon className="h-5 w-5 text-primary-foreground" />
      </div>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </button>
  );
}

export default DashboardPage;
