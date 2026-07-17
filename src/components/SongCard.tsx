import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { SongsResponse } from '@/lib/collections/songs';
import { formatDuration, formatRelativeTime } from '@/utils/studybeats';
import { Heart, Loader2, Pause, Play } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface SongCardProps {
  song: SongsResponse;
  isFavorite?: boolean;
  onToggleFavorite?: (song: SongsResponse) => void;
  layout?: 'grid' | 'row';
}

export const SongCard: React.FC<SongCardProps> = ({
  song,
  isFavorite,
  onToggleFavorite,
  layout = 'grid',
}) => {
  const { currentSong, isPlaying, play, togglePlay } = usePlayer();
  const navigate = useNavigate();
  const isCurrent = currentSong?.id === song.id;
  const isGenerating = song.status === 'generating';

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGenerating) return;
    if (isCurrent) togglePlay();
    else play(song);
  };

  const cover = (
    <div
      className="relative shrink-0 overflow-hidden rounded-xl"
      style={{
        background: song.coverUrl || 'linear-gradient(135deg,#10e0a1,#7c3aed)',
        width: layout === 'grid' ? '100%' : 56,
        height: layout === 'grid' ? undefined : 56,
        aspectRatio: layout === 'grid' ? '1 / 1' : undefined,
      }}
    >
      <div className="absolute inset-0 bg-black/10" />
      <button
        onClick={handlePlay}
        className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity hover:opacity-100 focus:opacity-100"
        style={{ background: 'rgba(0,0,0,0.35)' }}
        aria-label={isCurrent && isPlaying ? 'Pause' : 'Play'}
      >
        {isGenerating ? (
          <Loader2 className="h-6 w-6 animate-spin text-white" />
        ) : isCurrent && isPlaying ? (
          <Pause className="h-6 w-6 fill-white text-white" />
        ) : (
          <Play className="h-6 w-6 fill-white text-white" />
        )}
      </button>
      {isCurrent && isPlaying && (
        <div className="absolute bottom-1.5 right-1.5 flex items-end gap-0.5 rounded bg-black/40 px-1.5 py-1">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-0.5 rounded-full bg-white animate-pulse"
              style={{ height: 6 + i * 3, animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      )}
    </div>
  );

  if (layout === 'row') {
    return (
      <div
        onClick={() => navigate(`/songs/${song.id}`)}
        className="group flex cursor-pointer items-center gap-4 rounded-xl border border-border/60 bg-card/60 p-3 transition-colors hover:border-primary/40 hover:bg-card"
      >
        {cover}
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold leading-tight">{song.title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <Badge variant="secondary" className="capitalize">
              {song.genre}
            </Badge>
            <span>{song.vocalStyle}</span>
            <span>·</span>
            <span>{formatDuration(song.durationSec)}</span>
          </div>
        </div>
        {onToggleFavorite && (
          <Button
            variant="ghost"
            size="icon"
            onClick={e => {
              e.stopPropagation();
              onToggleFavorite(song);
            }}
          >
            <Heart className={isFavorite ? 'h-4 w-4 fill-primary text-primary' : 'h-4 w-4'} />
          </Button>
        )}
        <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
          {formatRelativeTime(song.createdAt)}
        </span>
      </div>
    );
  }

  return (
    <div
      onClick={() => navigate(`/songs/${song.id}`)}
      className="group cursor-pointer rounded-2xl border border-border/60 bg-card/60 p-3 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
    >
      {cover}
      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold leading-tight">{song.title}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {song.vocalStyle} · {formatDuration(song.durationSec)}
          </p>
        </div>
        {onToggleFavorite && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={e => {
              e.stopPropagation();
              onToggleFavorite(song);
            }}
          >
            <Heart className={isFavorite ? 'h-4 w-4 fill-primary text-primary' : 'h-4 w-4'} />
          </Button>
        )}
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <Badge variant="secondary" className="capitalize text-[10px]">
          {song.genre}
        </Badge>
        {isGenerating && (
          <Badge className="text-[10px]" variant="outline">
            Generating...
          </Badge>
        )}
      </div>
    </div>
  );
};

export default SongCard;
