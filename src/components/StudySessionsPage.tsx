import AppShell from '@/components/AppShell';
import { EmptyState } from '@/components/poof-ui';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppAuth } from '@/contexts/AppAuthContext';
import { useGuestDB } from '@/hooks/use-guest-db';
import { useRealtimeData } from '@/hooks/use-realtime-data';
import { Address, Time } from '@/lib/db-client';
import { setStudySessions, subscribeManyStudySessions, type StudySessionsResponse } from '@/lib/collections/studySessions';
import { formatRelativeTime, genId, nowSeconds } from '@/utils/studybeats';
import { Plus, Timer } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const StudySessionsPage: React.FC = () => {
  const { address, isGuest } = useAppAuth();
  const { db, mutate } = useGuestDB();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [minutes, setMinutes] = useState('25');
  const [creating, setCreating] = useState(false);

  const { data: realSessions } = useRealtimeData<StudySessionsResponse[]>(
    subscribeManyStudySessions,
    !!address && !isGuest,
    ''
  );
  const sessions = isGuest ? db.sessions : realSessions ?? [];

  const handleCreate = async () => {
    if (!address || !name.trim()) return;
    setCreating(true);
    const sessionId = genId('sess');
    const durationSec = Math.max(1, parseInt(minutes || '25', 10)) * 60;

    if (isGuest) {
      mutate(dbState => ({
        ...dbState,
        sessions: [
          {
            id: sessionId,
            name,
            durationSec,
            createdBy: address,
            createdAt: nowSeconds(),
            tarobase_created_at: nowSeconds(),
          },
          ...dbState.sessions,
        ],
      }));
    } else {
      const ok = await setStudySessions(sessionId, {
        name,
        durationSec,
        createdBy: Address.publicKey(address),
        createdAt: Time.Now,
      });
      if (!ok) {
        toast.error('Could not create study session.');
        setCreating(false);
        return;
      }
    }

    setCreating(false);
    setOpen(false);
    setName('');
    toast.success('Study session created');
    navigate(`/sessions/${sessionId}`);
  };

  return (
    <AppShell
      title="Study Sessions"
      description="Focus blocks with their own soundtrack, built from your syllabus."
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Session
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a study session</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="sess-name">Name</Label>
                <Input id="sess-name" value={name} onChange={e => setName(e.target.value)} placeholder="Morning Deep Focus" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sess-minutes">Focus length (minutes)</Label>
                <Input
                  id="sess-minutes"
                  type="number"
                  min={1}
                  value={minutes}
                  onChange={e => setMinutes(e.target.value)}
                />
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
      {sessions.length === 0 ? (
        <EmptyState
          icon={<Timer />}
          title="No study sessions yet"
          description="Create a focus block and add songs to soundtrack it."
          action={<Button onClick={() => setOpen(true)}>New Session</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map(s => (
            <button
              key={s.id}
              onClick={() => navigate(`/sessions/${s.id}`)}
              className="group rounded-2xl border border-border/60 bg-card/60 p-5 text-left transition-all hover:-translate-y-1 hover:border-primary/40"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
                <Timer className="h-5 w-5 text-primary-foreground" />
              </div>
              <p className="mt-4 font-semibold">{s.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {s.durationSec ? `${Math.round(s.durationSec / 60)} min focus` : 'No timer set'} ·{' '}
                {formatRelativeTime(s.createdAt)}
              </p>
            </button>
          ))}
        </div>
      )}
    </AppShell>
  );
};

export default StudySessionsPage;
