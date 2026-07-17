import { cn } from '@/lib/utils';
import { parseLyricsTimestamps } from '@/utils/learningPackage';
import React, { useMemo } from 'react';

interface LyricsViewProps {
  lyrics?: string;
  lyricsTimestamps?: string;
  /** Current playback position in seconds (from PlayerContext), used to highlight the active line. */
  currentTimeSec?: number;
  isActiveSong?: boolean;
}

/**
 * Renders song lyrics. When `lyricsTimestamps` are available and this song
 * is the one currently playing, the line matching `currentTimeSec` is
 * highlighted (synced lyrics). Otherwise falls back to plain scrolling text.
 */
export const LyricsView: React.FC<LyricsViewProps> = ({ lyrics, lyricsTimestamps, currentTimeSec, isActiveSong }) => {
  const timestamps = useMemo(() => parseLyricsTimestamps(lyricsTimestamps), [lyricsTimestamps]);

  const activeIndex = useMemo(() => {
    if (!isActiveSong || timestamps.length === 0 || currentTimeSec == null) return -1;
    let idx = -1;
    for (let i = 0; i < timestamps.length; i++) {
      if (timestamps[i].tSec <= currentTimeSec) idx = i;
      else break;
    }
    return idx;
  }, [timestamps, currentTimeSec, isActiveSong]);

  if (!lyrics) {
    return (
      <p className="rounded-2xl border border-border/60 bg-card/60 p-6 text-sm text-muted-foreground">
        Lyrics will appear here once generated.
      </p>
    );
  }

  if (timestamps.length === 0) {
    return (
      <pre className="whitespace-pre-wrap rounded-2xl border border-border/60 bg-card/60 p-6 font-sans text-sm leading-relaxed text-foreground/90">
        {lyrics}
      </pre>
    );
  }

  return (
    <div className="space-y-2 rounded-2xl border border-border/60 bg-card/60 p-6">
      {timestamps.map((t, i) => (
        <p
          key={`${i}-${t.tSec}`}
          className={cn(
            'rounded-lg px-2 py-1 text-sm leading-relaxed transition-all duration-300',
            i === activeIndex
              ? 'scale-[1.02] bg-gradient-to-r from-primary/20 to-accent/10 font-semibold text-foreground'
              : i < activeIndex
                ? 'text-muted-foreground/60'
                : 'text-foreground/90'
          )}
        >
          {t.line}
        </p>
      ))}
    </div>
  );
};

export default LyricsView;
