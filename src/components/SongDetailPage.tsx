import AppShell from '@/components/AppShell';
import LyricsView from '@/components/LyricsView';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePlayer } from '@/contexts/PlayerContext';
import { useAppAuth } from '@/contexts/AppAuthContext';
import { useGuestDB } from '@/hooks/use-guest-db';
import { useRealtimeData } from '@/hooks/use-realtime-data';
import { Address, Time } from '@/lib/db-client';
import { setFavorites, deleteFavorites, subscribeManyFavorites, type FavoritesResponse } from '@/lib/collections/favorites';
import { subscribeSongs, type SongsResponse } from '@/lib/collections/songs';
import { subscribeManyPlaylists, type PlaylistsResponse } from '@/lib/collections/playlists';
import { setPlaylistsPlaylistSongs } from '@/lib/collections/playlists';
import { formatDuration, formatRelativeTime, genId, nowSeconds } from '@/utils/studybeats';
import { AlertTriangle, Download, Heart, ListPlus, Loader2, Pause, Play, Share2 } from 'lucide-react';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

export const SongDetailPage: React.FC = () => {
  const { songId = '' } = useParams();
  const { address, isGuest } = useAppAuth();
  const { db, mutate } = useGuestDB();
  const { currentSong, isPlaying, progress, play, togglePlay } = usePlayer();
  const navigate = useNavigate();

  const { data: realSong } = useRealtimeData<SongsResponse | null>(subscribeSongs, !!address && !isGuest, songId);
  const { data: realFavorites } = useRealtimeData<FavoritesResponse[]>(
    subscribeManyFavorites,
    !!address && !isGuest,
    ''
  );
  const { data: realPlaylists } = useRealtimeData<PlaylistsResponse[]>(
    subscribeManyPlaylists,
    !!address && !isGuest,
    ''
  );

  const song = isGuest ? db.songs.find(s => s.id === songId) ?? null : realSong;
  const favorites = isGuest ? db.favorites : realFavorites ?? [];
  const playlists = isGuest ? db.playlists : realPlaylists ?? [];
  const isFavorite = favorites.some(f => f.songId === songId);
  const isCurrent = currentSong?.id === songId;
  const elapsedSec = isCurrent ? (progress / 100) * (currentSong?.durationSec || 0) : 0;

  if (!song) {
    return (
      <AppShell title="Song not found" description="This song may have been removed.">
        <Button onClick={() => navigate('/songs')}>Back to My Songs</Button>
      </AppShell>
    );
  }

  const toggleFavorite = () => {
    if (!address) return;
    const existing = favorites.find(f => f.songId === songId);
    if (isGuest) {
      mutate(dbState => ({
        ...dbState,
        favorites: existing
          ? dbState.favorites.filter(f => f.id !== existing.id)
          : [
              {
                id: genId('fav'),
                userId: address,
                songId,
                createdAt: nowSeconds(),
                tarobase_created_at: nowSeconds(),
              },
              ...dbState.favorites,
            ],
      }));
    } else if (existing) {
      void deleteFavorites(existing.id);
    } else {
      void setFavorites(`${address}__${songId}`, {
        userId: Address.publicKey(address),
        songId,
        createdAt: Time.Now,
      });
    }
  };

  const addToPlaylist = async (playlistId: string) => {
    if (isGuest) {
      mutate(dbState => ({
        ...dbState,
        playlistSongs: {
          ...dbState.playlistSongs,
          [playlistId]: [
            ...(dbState.playlistSongs[playlistId] ?? []).filter(e => e.songId !== songId),
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
      toast.success('Added to playlist');
    } else {
      const ok = await setPlaylistsPlaylistSongs(playlistId, songId, {
        songId,
        position: 0,
        addedAt: Time.Now,
      });
      toast[ok ? 'success' : 'error'](ok ? 'Added to playlist' : 'Could not add to playlist');
    }
  };

  return (
    <AppShell title={song.title} description="Full song detail & placeholder player.">
      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        <div>
          <div
            className="aspect-square w-full rounded-3xl shadow-xl"
            style={{ background: song.coverUrl || 'linear-gradient(135deg,#10e0a1,#7c3aed)' }}
          />
          <div className="mt-5 flex items-center gap-3">
            <Button
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={() => (isCurrent ? togglePlay() : play(song))}
            >
              {isCurrent && isPlaying ? (
                <Pause className="h-5 w-5 fill-current" />
              ) : (
                <Play className="h-5 w-5 fill-current" />
              )}
            </Button>
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-full" onClick={toggleFavorite}>
              <Heart className={isFavorite ? 'h-5 w-5 fill-primary text-primary' : 'h-5 w-5'} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-full">
                  <ListPlus className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {playlists.length === 0 ? (
                  <DropdownMenuItem disabled>No playlists yet</DropdownMenuItem>
                ) : (
                  playlists.map(p => (
                    <DropdownMenuItem key={p.id} onClick={() => addToPlaylist(p.id)}>
                      {p.name}
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={() => navigate('/downloads')}
            >
              <Download className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={() => toast.info('Sharing is coming soon!')}
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          <div className="mt-6 space-y-1 text-sm text-muted-foreground">
            <p>Genre: <span className="text-foreground capitalize">{song.genre}</span></p>
            <p>Vocal style: <span className="text-foreground">{song.vocalStyle}</span></p>
            <p>Duration: <span className="text-foreground">{formatDuration(song.durationSec)}</span></p>
            <p>Created: <span className="text-foreground">{formatRelativeTime(song.createdAt)}</span></p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Lyrics</h2>
            {song.status === 'generating' && (
              <span className="flex items-center gap-1.5 text-xs text-primary">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating...
              </span>
            )}
            {song.status === 'failed' && (
              <span className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertTriangle className="h-3.5 w-3.5" /> Generation failed
              </span>
            )}
          </div>
          {song.status === 'failed' && song.generationError && (
            <p className="mt-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
              {song.generationError}
            </p>
          )}
          <div className="mt-4">
            <LyricsView
              lyrics={song.lyrics}
              lyricsTimestamps={song.lyricsTimestamps}
              currentTimeSec={elapsedSec}
              isActiveSong={isCurrent}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default SongDetailPage;
