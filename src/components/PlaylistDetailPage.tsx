import AppShell from '@/components/AppShell';
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
  deletePlaylistsPlaylistSongs,
  setPlaylistsPlaylistSongs,
  subscribeManyPlaylistsPlaylistSongs,
  subscribePlaylists,
  type PlaylistsPlaylistSongsResponse,
  type PlaylistsResponse,
} from '@/lib/collections/playlists';
import { subscribeManySongs, type SongsResponse } from '@/lib/collections/songs';
import { nowSeconds } from '@/utils/studybeats';
import { ListMusic, Plus, X } from 'lucide-react';
import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

export const PlaylistDetailPage: React.FC = () => {
  const { playlistId = '' } = useParams();
  const { address, isGuest } = useAppAuth();
  const { db, mutate } = useGuestDB();
  const navigate = useNavigate();

  const { data: realPlaylist } = useRealtimeData<PlaylistsResponse | null>(
    subscribePlaylists,
    !!address && !isGuest,
    playlistId
  );
  const { data: realEntries } = useRealtimeData<PlaylistsPlaylistSongsResponse[]>(
    subscribeManyPlaylistsPlaylistSongs,
    !!address && !isGuest,
    playlistId,
    ''
  );
  const { data: realSongs } = useRealtimeData<SongsResponse[]>(subscribeManySongs, !!address && !isGuest, '');

  const playlist = isGuest ? db.playlists.find(p => p.id === playlistId) ?? null : realPlaylist;
  const entries = isGuest ? db.playlistSongs[playlistId] ?? [] : realEntries ?? [];
  const allSongs = isGuest ? db.songs : realSongs ?? [];

  const playlistSongs = useMemo(() => {
    const bySongId = new Map(allSongs.map(s => [s.id, s]));
    return [...entries]
      .sort((a, b) => a.position - b.position)
      .map(e => bySongId.get(e.songId))
      .filter((s): s is SongsResponse => !!s);
  }, [entries, allSongs]);

  const availableToAdd = allSongs.filter(s => !entries.some(e => e.songId === s.id));

  const addSong = (songId: string) => {
    if (isGuest) {
      mutate(dbState => ({
        ...dbState,
        playlistSongs: {
          ...dbState.playlistSongs,
          [playlistId]: [
            ...(dbState.playlistSongs[playlistId] ?? []),
            {
              id: songId,
              songId,
              position: (dbState.playlistSongs[playlistId] ?? []).length,
              addedAt: nowSeconds(),
              tarobase_created_at: nowSeconds(),
            },
          ],
        },
      }));
    } else {
      void setPlaylistsPlaylistSongs(playlistId, songId, {
        songId,
        position: entries.length,
        addedAt: Time.Now,
      });
    }
    toast.success('Added to playlist');
  };

  const removeSong = (songId: string) => {
    if (isGuest) {
      mutate(dbState => ({
        ...dbState,
        playlistSongs: {
          ...dbState.playlistSongs,
          [playlistId]: (dbState.playlistSongs[playlistId] ?? []).filter(e => e.songId !== songId),
        },
      }));
    } else {
      void deletePlaylistsPlaylistSongs(playlistId, songId);
    }
  };

  if (!playlist) {
    return (
      <AppShell title="Playlist not found" description="This playlist may have been removed.">
        <Button onClick={() => navigate('/playlists')}>Back to Playlists</Button>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={playlist.name}
      description={playlist.description || 'A soundtrack, built from your own notes.'}
      breadcrumbs={[{ label: 'Playlists', href: '/playlists' }, { label: playlist.name }]}
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
      {playlistSongs.length === 0 ? (
        <EmptyState
          icon={<ListMusic />}
          title="This playlist is empty"
          description="Add songs from your library to build the soundtrack."
        />
      ) : (
        <div className="space-y-2">
          {playlistSongs.map(song => (
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
    </AppShell>
  );
};

export default PlaylistDetailPage;
