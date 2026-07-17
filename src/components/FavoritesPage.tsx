import AppShell from '@/components/AppShell';
import SongCard from '@/components/SongCard';
import { EmptyState } from '@/components/poof-ui';
import { Button } from '@/components/ui/button';
import { useAppAuth } from '@/contexts/AppAuthContext';
import { useGuestDB } from '@/hooks/use-guest-db';
import { useRealtimeData } from '@/hooks/use-realtime-data';
import { deleteFavorites, subscribeManyFavorites, type FavoritesResponse } from '@/lib/collections/favorites';
import { subscribeManySongs, type SongsResponse } from '@/lib/collections/songs';
import { Heart } from 'lucide-react';
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export const FavoritesPage: React.FC = () => {
  const { address, isGuest } = useAppAuth();
  const { db, mutate } = useGuestDB();
  const navigate = useNavigate();

  const { data: realFavorites } = useRealtimeData<FavoritesResponse[]>(
    subscribeManyFavorites,
    !!address && !isGuest,
    ''
  );
  const { data: realSongs } = useRealtimeData<SongsResponse[]>(subscribeManySongs, !!address && !isGuest, '');

  const favorites = isGuest ? db.favorites : realFavorites ?? [];
  const allSongs = isGuest ? db.songs : realSongs ?? [];

  const favoriteSongs = useMemo(() => {
    const bySongId = new Map(allSongs.map(s => [s.id, s]));
    return favorites.map(f => ({ fav: f, song: bySongId.get(f.songId) })).filter(x => !!x.song) as {
      fav: FavoritesResponse;
      song: SongsResponse;
    }[];
  }, [favorites, allSongs]);

  const removeFavorite = (fav: FavoritesResponse) => {
    if (isGuest) {
      mutate(dbState => ({ ...dbState, favorites: dbState.favorites.filter(f => f.id !== fav.id) }));
    } else {
      void deleteFavorites(fav.id);
    }
  };

  return (
    <AppShell title="Favorites" description="The hooks that actually stuck.">
      {favoriteSongs.length === 0 ? (
        <EmptyState
          icon={<Heart />}
          title="No favorites yet"
          description="Tap the heart on any song to save it here."
          action={<Button onClick={() => navigate('/songs')}>Browse My Songs</Button>}
        />
      ) : (
        <div className="space-y-2">
          {favoriteSongs.map(({ fav, song }) => (
            <SongCard key={fav.id} song={song} layout="row" isFavorite onToggleFavorite={() => removeFavorite(fav)} />
          ))}
        </div>
      )}
    </AppShell>
  );
};

export default FavoritesPage;
