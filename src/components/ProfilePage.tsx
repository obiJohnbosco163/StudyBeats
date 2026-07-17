import AppShell from '@/components/AppShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAppAuth } from '@/contexts/AppAuthContext';
import { useGuestDB } from '@/hooks/use-guest-db';
import { useRealtimeData } from '@/hooks/use-realtime-data';
import { Address, Time } from '@/lib/db-client';
import { setProfiles, subscribeProfiles, updateProfiles } from '@/lib/collections/profiles';
import { nowSeconds, shortAddress } from '@/utils/studybeats';
import { Loader2, Save, User, Wallet } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

export const ProfilePage: React.FC = () => {
  const { address, isGuest, user } = useAppAuth();
  const { db, mutate } = useGuestDB();

  const { data: realProfile } = useRealtimeData(subscribeProfiles, !!address && !isGuest, address ?? '');
  const profile = isGuest ? db.profile : realProfile;

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDisplayName(profile?.displayName ?? '');
    setBio(profile?.bio ?? '');
    setAvatarUrl(profile?.avatarUrl ?? '');
  }, [profile?.displayName, profile?.bio, profile?.avatarUrl]);

  const handleSave = async () => {
    if (!address || !displayName.trim()) {
      toast.error('Display name is required.');
      return;
    }
    setSaving(true);

    if (isGuest) {
      mutate(dbState => ({
        ...dbState,
        profile: {
          id: address,
          address,
          displayName,
          bio: bio || undefined,
          avatarUrl: avatarUrl || undefined,
          plan: dbState.profile?.plan ?? 'free',
          createdAt: dbState.profile?.createdAt ?? nowSeconds(),
          tarobase_created_at: dbState.profile?.tarobase_created_at ?? nowSeconds(),
        },
      }));
      toast.success('Profile saved');
      setSaving(false);
      return;
    }

    const ok = profile
      ? await updateProfiles(address, { displayName, bio: bio || undefined, avatarUrl: avatarUrl || undefined })
      : await setProfiles(address, {
          address: Address.publicKey(address),
          displayName,
          bio: bio || undefined,
          avatarUrl: avatarUrl || undefined,
          plan: 'free',
          createdAt: Time.Now,
        });

    setSaving(false);
    toast[ok ? 'success' : 'error'](ok ? 'Profile saved' : 'Could not save profile.');
  };

  return (
    <AppShell title="Profile" description="How you show up across StudyBeats AI.">
      <div className="mx-auto max-w-xl space-y-6">
        <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card/60 p-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xl font-bold text-primary-foreground overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : isGuest ? (
              'G'
            ) : (
              <User className="h-7 w-7" />
            )}
          </div>
          <div>
            <p className="font-semibold">{displayName || 'Unnamed vibe-r'}</p>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Wallet className="h-3 w-3" />
              {isGuest ? 'Guest session' : user ? shortAddress(user.address) : ''}
            </div>
            <Badge variant="secondary" className="mt-2 capitalize">
              {profile?.plan ?? 'free'} plan
            </Badge>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-border/60 bg-card/60 p-6">
          <div className="space-y-1.5">
            <Label htmlFor="display-name">Display name</Label>
            <Input id="display-name" value={displayName} onChange={e => setDisplayName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="avatar-url">Avatar URL</Label>
            <Input
              id="avatar-url"
              value={avatarUrl}
              onChange={e => setAvatarUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} className="min-h-[100px]" />
          </div>
          <Button className="gap-2" disabled={saving} onClick={handleSave}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Profile
          </Button>
        </div>
      </div>
    </AppShell>
  );
};

export default ProfilePage;
