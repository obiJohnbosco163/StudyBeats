import AppShell from '@/components/AppShell';
import { EmptyState } from '@/components/poof-ui';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAppAuth } from '@/contexts/AppAuthContext';
import { useGuestDB } from '@/hooks/use-guest-db';
import { useRealtimeData } from '@/hooks/use-realtime-data';
import { Address, Time } from '@/lib/db-client';
import { setPlaylists, subscribeManyPlaylists, type PlaylistsResponse } from '@/lib/collections/playlists';
import { coverGradientForSeed, genId, nowSeconds } from '@/utils/studybeats';
import { ListMusic, Plus } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const PlaylistsPage: React.FC = () => {
  const { address, isGuest } = useAppAuth();
  const { db, mutate } = useGuestDB();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const { data: realPlaylists } = useRealtimeData<PlaylistsResponse[]>(
    subscribeManyPlaylists,
    !!address && !isGuest,
    ''
  );
  const playlists = isGuest ? db.playlists : realPlaylists ?? [];

  const handleCreate = async () => {
    if (!address || !name.trim()) return;
    setCreating(true);
    const playlistId = genId('pl');
    const coverUrl = coverGradientForSeed(name);

    if (isGuest) {
      mutate(dbState => ({
        ...dbState,
        playlists: [
          {
            id: playlistId,
            name,
            description: description || undefined,
            coverUrl,
            createdBy: address,
            createdAt: nowSeconds(),
            tarobase_created_at: nowSeconds(),
          },
          ...dbState.playlists,
        ],
      }));
    } else {
      const ok = await setPlaylists(playlistId, {
        name,
        description: description || undefined,
        coverUrl,
        createdBy: Address.publicKey(address),
        createdAt: Time.Now,
      });
      if (!ok) {
        toast.error('Could not create playlist.');
        setCreating(false);
        return;
      }
    }

    setCreating(false);
    setOpen(false);
    setName('');
    setDescription('');
    toast.success('Playlist created');
    navigate(`/playlists/${playlistId}`);
  };

  return (
    <AppShell
      title="Playlists"
      description="Group songs into a soundtrack for finals week."
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Playlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a playlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="pl-name">Name</Label>
                <Input id="pl-name" value={name} onChange={e => setName(e.target.value)} placeholder="Finals Week Focus" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pl-desc">Description (optional)</Label>
                <Textarea id="pl-desc" value={description} onChange={e => setDescription(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button disabled={!name.trim() || creating} onClick={handleCreate}>
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      {playlists.length === 0 ? (
        <EmptyState
          icon={<ListMusic />}
          title="No playlists yet"
          description="Create your first playlist to group songs for a study session."
          action={<Button onClick={() => setOpen(true)}>New Playlist</Button>}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {playlists.map(p => (
            <button
              key={p.id}
              onClick={() => navigate(`/playlists/${p.id}`)}
              className="group rounded-2xl border border-border/60 bg-card/60 p-3 text-left transition-all hover:-translate-y-1 hover:border-primary/40"
            >
              <div
                className="aspect-square w-full rounded-xl"
                style={{ background: p.coverUrl || 'linear-gradient(135deg,#10e0a1,#7c3aed)' }}
              />
              <p className="mt-3 truncate font-semibold">{p.name}</p>
              {p.description && <p className="truncate text-xs text-muted-foreground">{p.description}</p>}
            </button>
          ))}
        </div>
      )}
    </AppShell>
  );
};

export default PlaylistsPage;
