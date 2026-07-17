import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { GENRES, LENGTH_OPTIONS, MOODS, VOCAL_STYLES } from '@/utils/studybeats';
import React from 'react';

export interface GenerationSettings {
  title: string;
  genre: string;
  vocalStyle: string;
  mood: string;
  lengthSec: number;
}

interface GenerationSettingsFormProps {
  value: GenerationSettings;
  onChange: (value: GenerationSettings) => void;
  disabled?: boolean;
}

function OptionPill({
  active,
  onClick,
  children,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'rounded-full border px-4 py-2 text-sm font-medium transition-all',
        active
          ? 'border-transparent bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md shadow-primary/20'
          : 'border-border/70 bg-secondary/40 text-muted-foreground hover:border-primary/40 hover:text-foreground'
      )}
    >
      {children}
    </button>
  );
}

export const GenerationSettingsForm: React.FC<GenerationSettingsFormProps> = ({
  value,
  onChange,
  disabled,
}) => {
  const set = <K extends keyof GenerationSettings>(key: K, v: GenerationSettings[K]) =>
    onChange({ ...value, [key]: v });

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Label htmlFor="song-title">Song title</Label>
        <Input
          id="song-title"
          value={value.title}
          disabled={disabled}
          onChange={e => set('title', e.target.value)}
          placeholder="e.g. Mitosis Anthem"
        />
      </div>

      <div className="space-y-3">
        <Label>Genre</Label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {GENRES.map(g => (
            <button
              key={g.value}
              type="button"
              disabled={disabled}
              onClick={() => set('genre', g.value)}
              className={cn(
                'rounded-xl border p-3 text-left transition-all',
                value.genre === g.value
                  ? 'border-primary bg-primary/10 ring-1 ring-primary/40'
                  : 'border-border/70 bg-secondary/30 hover:border-primary/30'
              )}
            >
              <p className="text-sm font-semibold">{g.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{g.blurb}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label>Vocal style</Label>
        <div className="flex flex-wrap gap-2">
          {VOCAL_STYLES.map(v => (
            <OptionPill
              key={v.value}
              active={value.vocalStyle === v.value}
              disabled={disabled}
              onClick={() => set('vocalStyle', v.value)}
            >
              {v.label}
            </OptionPill>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label>Mood</Label>
        <div className="flex flex-wrap gap-2">
          {MOODS.map(m => (
            <OptionPill key={m} active={value.mood === m} disabled={disabled} onClick={() => set('mood', m)}>
              {m}
            </OptionPill>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label>Length</Label>
        <div className="grid gap-2 sm:grid-cols-3">
          {LENGTH_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              disabled={disabled}
              onClick={() => set('lengthSec', opt.value)}
              className={cn(
                'rounded-xl border p-3 text-sm font-medium transition-all',
                value.lengthSec === opt.value
                  ? 'border-primary bg-primary/10 ring-1 ring-primary/40'
                  : 'border-border/70 bg-secondary/30 hover:border-primary/30'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GenerationSettingsForm;
