import AppShell from '@/components/AppShell';
import SongCard from '@/components/SongCard';
import { EmptyState } from '@/components/poof-ui';
import { Input } from '@/components/ui/input';
import { useAppAuth } from '@/contexts/AppAuthContext';
import { useGuestDB } from '@/hooks/use-guest-db';
import { useRealtimeData } from '@/hooks/use-realtime-data';
import { subscribeManyMaterials, type MaterialsResponse } from '@/lib/collections/materials';
import { subscribeManyPlaylists, type PlaylistsResponse } from '@/lib/collections/playlists';
import { subscribeManySongs, type SongsResponse } from '@/lib/collections/songs';
import { FileText, ListMusic, Search as SearchIcon } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const SearchPage: React.FC = () => {
  const { address, isGuest } = useAppAuth();
  const { db } = useGuestDB();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

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

  const q = query.trim().toLowerCase();
  const matchedSongs = useMemo(
    () => (q ? songs.filter(s => s.title.toLowerCase().includes(q) || s.genre.toLowerCase().includes(q)) : []),
    [songs, q]
  );
  const matchedMaterials = useMemo(
    () => (q ? materials.filter(m => m.title.toLowerCase().includes(q)) : []),
    [materials, q]
  );
  const matchedPlaylists = useMemo(
    () => (q ? playlists.filter(p => p.name.toLowerCase().includes(q)) : []),
    [playlists, q]
  );

  const hasResults = matchedSongs.length + matchedMaterials.length + matchedPlaylists.length > 0;

  return (
    <AppShell title="Search" description="Find any song, material, or playlist in your library.">
      <div className="relative mb-8 max-w-lg">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search songs, materials, playlists..."
          className="pl-9"
        />
      </div>

      {!q ? (
        <EmptyState icon={<SearchIcon />} title="Start typing" description="Search across everything you've created." />
      ) : !hasResults ? (
        <EmptyState icon={<SearchIcon />} title="No results" description={`Nothing matches "${query}".`} />
      ) : (
        <div className="space-y-10">
          {matchedSongs.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold">Songs</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
                {matchedSongs.map(s => (
                  <SongCard key={s.id} song={s} />
                ))}
              </div>
            </div>
          )}

          {matchedMaterials.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold">Materials</h2>
              <div className="space-y-2">
                {matchedMaterials.map(m => (
                  <div key={m.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/60 p-3">
                    <FileText className="h-4 w-4 text-primary" />
                    <p className="truncate text-sm font-medium">{m.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {matchedPlaylists.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold">Playlists</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {matchedPlaylists.map(p => (
                  <button
                    key={p.id}
                    onClick={() => navigate(`/playlists/${p.id}`)}
                    className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/60 p-3 text-left hover:border-primary/40"
                  >
                    <ListMusic className="h-4 w-4 text-primary" />
                    <p className="truncate text-sm font-medium">{p.name}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
};

export default SearchPage;
