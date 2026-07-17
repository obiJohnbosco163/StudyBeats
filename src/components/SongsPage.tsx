import AppShell from '@/components/AppShell';
import SongCard from '@/components/SongCard';
import { EmptyState } from '@/components/poof-ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppAuth } from '@/contexts/AppAuthContext';
import { useGuestDB } from '@/hooks/use-guest-db';
import { useRealtimeData } from '@/hooks/use-realtime-data';
import { Address, Time } from '@/lib/db-client';
import { setFavorites, deleteFavorites, subscribeManyFavorites, type FavoritesResponse } from '@/lib/collections/favorites';
import { subscribeManySongs, type SongsResponse } from '@/lib/collections/songs';
import { genId, nowSeconds } from '@/utils/studybeats';
import { LayoutGrid, List, Music2, Search, Sparkles } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const SongsPage: React.FC = () => {
  const { address, isGuest } = useAppAuth();
  const { db, mutate } = useGuestDB();
  const navigate = useNavigate();
  const [layout, setLayout] = useState<'grid' | 'row'>('grid');
  const [query, setQuery] = useState('');

  const { data: realSongs } = useRealtimeData<SongsResponse[]>(subscribeManySongs, !!address && !isGuest, '');
  const { data: realFavorites } = useRealtimeData<FavoritesResponse[]>(
    subscribeManyFavorites,
    !!address && !isGuest,
    ''
  );

  const songs = isGuest ? db.songs : realSongs ?? [];
  const favorites = isGuest ? db.favorites : realFavorites ?? [];
  const favoriteSongIds = useMemo(() => new Set(favorites.map(f => f.songId)), [favorites]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = !q
      ? songs
      : songs.filter(s => s.title.toLowerCase().includes(q) || s.genre.toLowerCase().includes(q));
    return [...list].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }, [songs, query]);

  const toggleFavorite = (song: SongsResponse) => {
    if (!address) return;
    const existing = favorites.find(f => f.songId === song.id);
    if (isGuest) {
      mutate(dbState => ({
        ...dbState,
        favorites: existing
          ? dbState.favorites.filter(f => f.id !== existing.id)
          : [
              {
                id: genId('fav'),
                userId: address,
                songId: song.id,
                createdAt: nowSeconds(),
                tarobase_created_at: nowSeconds(),
              },
              ...dbState.favorites,
            ],
      }));
    } else if (existing) {
      void deleteFavorites(existing.id);
    } else {
      void setFavorites(`${address}__${song.id}`, {
        userId: Address.publicKey(address),
        songId: song.id,
        createdAt: Time.Now,
      });
    }
  };

  return (
    <AppShell
      title="My Songs"
      description="Every study anthem you've generated, in one place."
      actions={
        <Button onClick={() => navigate('/generate')} className="gap-2">
          <Sparkles className="h-4 w-4" />
          Generate
        </Button>
      }
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search your songs..."
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-secondary/30 p-1">
          <Button
            variant={layout === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setLayout('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={layout === 'row' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setLayout('row')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Music2 />}
          title={songs.length === 0 ? 'No songs yet' : 'No matches'}
          description={
            songs.length === 0
              ? 'Upload your notes and generate your first study soundtrack.'
              : 'Try a different search term.'
          }
          action={songs.length === 0 ? <Button onClick={() => navigate('/generate')}>Generate a Song</Button> : undefined}
        />
      ) : layout === 'grid' ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {filtered.map(song => (
            <SongCard
              key={song.id}
              song={song}
              isFavorite={favoriteSongIds.has(song.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(song => (
            <SongCard
              key={song.id}
              song={song}
              layout="row"
              isFavorite={favoriteSongIds.has(song.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}
    </AppShell>
  );
};

export default SongsPage;
