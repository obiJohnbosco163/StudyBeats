import AppShell from '@/components/AppShell';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useAppAuth } from '@/contexts/AppAuthContext';
import { resetGuestDB } from '@/utils/guestData';
import { shortAddress } from '@/utils/studybeats';
import { LogOut, Moon, Trash2, Wallet } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const SETTINGS_KEY = 'studybeats_settings_v1';

interface LocalSettings {
  autoplayNext: boolean;
  emailUpdates: boolean;
  explicitLyrics: boolean;
}

function loadSettings(): LocalSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { autoplayNext: true, emailUpdates: false, explicitLyrics: false };
}

export const SettingsPage: React.FC = () => {
  const { isGuest, address, logout, login } = useAppAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<LocalSettings>(loadSettings);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const toggle = (key: keyof LocalSettings) => setSettings(s => ({ ...s, [key]: !s[key] }));

  return (
    <AppShell title="Settings" description="Preferences, account, and appearance.">
      <div className="mx-auto max-w-xl space-y-6">
        <section className="rounded-2xl border border-border/60 bg-card/60 p-6">
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <Moon className="h-4 w-4 text-primary" /> Appearance
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <Label>Dark theme</Label>
              <p className="text-xs text-muted-foreground">StudyBeats is designed dark-first.</p>
            </div>
            <Switch checked disabled />
          </div>
        </section>

        <section className="rounded-2xl border border-border/60 bg-card/60 p-6">
          <h2 className="mb-4 font-semibold">Playback preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Autoplay next song</Label>
                <p className="text-xs text-muted-foreground">Keep the vibe going between tracks.</p>
              </div>
              <Switch checked={settings.autoplayNext} onCheckedChange={() => toggle('autoplayNext')} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Email updates</Label>
                <p className="text-xs text-muted-foreground">Get notified when new features ship.</p>
              </div>
              <Switch checked={settings.emailUpdates} onCheckedChange={() => toggle('emailUpdates')} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Allow explicit lyrics</Label>
                <p className="text-xs text-muted-foreground">Affects future AI-generated lyrics.</p>
              </div>
              <Switch checked={settings.explicitLyrics} onCheckedChange={() => toggle('explicitLyrics')} />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border/60 bg-card/60 p-6">
          <h2 className="mb-4 font-semibold">Account</h2>
          <div className="flex items-center gap-3 rounded-xl bg-secondary/40 p-3">
            <Wallet className="h-4 w-4 text-primary" />
            <span className="text-sm">{isGuest ? 'Guest session (not saved to a wallet)' : shortAddress(address)}</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {isGuest && (
              <Button variant="outline" className="gap-2" onClick={() => login()}>
                <Wallet className="h-4 w-4" />
                Connect Wallet
              </Button>
            )}
            <Button
              variant="outline"
              className="gap-2"
              onClick={async () => {
                await logout();
                navigate('/');
              }}
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </Button>
          </div>
        </section>

        {isGuest && (
          <section className="rounded-2xl border border-destructive/40 bg-destructive/5 p-6">
            <h2 className="mb-2 flex items-center gap-2 font-semibold text-destructive">
              <Trash2 className="h-4 w-4" /> Reset guest data
            </h2>
            <p className="text-sm text-muted-foreground">
              Clears all locally-stored demo materials, songs, and playlists in this browser.
            </p>
            <Button
              variant="destructive"
              className="mt-4"
              onClick={() => {
                resetGuestDB();
                toast.success('Guest data reset');
              }}
            >
              Reset Demo Data
            </Button>
          </section>
        )}
      </div>
    </AppShell>
  );
};

export default SettingsPage;
