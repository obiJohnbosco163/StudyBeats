import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from '@/components/ui/button';
import { formatDuration } from '@/utils/studybeats';
import { ListMusic, Pause, Play, Repeat, Shuffle, SkipBack, SkipForward, X } from 'lucide-react';
import React from 'react';

/**
 * Sticky bottom "now playing" bar. Purely decorative transport controls
 * (skip/shuffle/repeat) — only play/pause and the progress ticker are wired
 * to real state. Swap `song.audioUrl` in for a real <audio> element once the
 * generation engine produces real files.
 */
export const PlayerBar: React.FC = () => {
  const { currentSong, isPlaying, progress, togglePlay, closePlayer } = usePlayer();

  if (!currentSong) return null;

  const elapsed = ((progress / 100) * (currentSong.durationSec || 0)) || 0;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-popover/95 backdrop-blur-xl">
      <div className="h-0.5 w-full bg-secondary">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent transition-all"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <div className="container flex items-center gap-3 py-2.5">
        <div
          className="h-10 w-10 shrink-0 rounded-lg"
          style={{ background: currentSong.coverUrl || 'linear-gradient(135deg,#10e0a1,#7c3aed)' }}
        />
        <div className="min-w-0 flex-1 sm:flex-none sm:w-48">
          <p className="truncate text-sm font-semibold leading-tight">{currentSong.title}</p>
          <p className="truncate text-xs text-muted-foreground">{currentSong.vocalStyle}</p>
        </div>

        <div className="hidden items-center gap-1 sm:flex">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" disabled>
            <Shuffle className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
            <SkipBack className="h-4 w-4" />
          </Button>
        </div>

        <Button
          size="icon"
          className="h-9 w-9 shrink-0 rounded-full"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
        </Button>

        <div className="hidden items-center gap-1 sm:flex">
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
            <SkipForward className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" disabled>
            <Repeat className="h-4 w-4" />
          </Button>
        </div>

        <span className="hidden shrink-0 text-xs tabular-nums text-muted-foreground sm:block">
          {formatDuration(elapsed)} / {formatDuration(currentSong.durationSec)}
        </span>

        <Button variant="ghost" size="icon" className="hidden h-8 w-8 text-muted-foreground sm:flex" disabled>
          <ListMusic className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={closePlayer}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PlayerBar;
