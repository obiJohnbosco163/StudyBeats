import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PIPELINE_STEPS, type PipelineStepId, type PipelineStepStatus } from '@/services/pipeline';
import { AlertTriangle, Check, Loader2, RotateCcw } from 'lucide-react';
import React from 'react';

export type StepStatusMap = Record<PipelineStepId, PipelineStepStatus>;

interface GenerationProgressProps {
  steps: StepStatusMap;
  errorMessage?: string | null;
  onRetry?: () => void;
  retrying?: boolean;
}

/**
 * Multi-step progress indicator for the notes -> song + learning-package
 * pipeline. Each step transitions pending -> active -> done (or error),
 * driven by pipeline.ts's onStep callback.
 */
export const GenerationProgress: React.FC<GenerationProgressProps> = ({
  steps,
  errorMessage,
  onRetry,
  retrying,
}) => {
  const hasError = Object.values(steps).some((s) => s === 'error');

  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
          {hasError ? (
            <AlertTriangle className="h-5 w-5 text-primary-foreground" />
          ) : (
            <Loader2 className="h-5 w-5 animate-spin text-primary-foreground" />
          )}
        </div>
        <div>
          <p className="font-semibold">{hasError ? 'Generation hit a snag' : 'Vibing your notes into a song...'}</p>
          <p className="text-xs text-muted-foreground">
            {hasError ? 'Your progress is saved — pick up right where it stopped.' : 'This usually takes under a minute.'}
          </p>
        </div>
      </div>

      <ol className="space-y-1">
        {PIPELINE_STEPS.map((step, idx) => {
          const status = steps[step.id] ?? 'pending';
          const isLast = idx === PIPELINE_STEPS.length - 1;
          return (
            <li key={step.id} className="relative flex gap-4 pb-6 last:pb-0">
              {!isLast && (
                <span
                  className={cn(
                    'absolute left-[15px] top-8 h-full w-px',
                    status === 'done' ? 'bg-primary/50' : 'bg-border/60'
                  )}
                  aria-hidden
                />
              )}
              <div
                className={cn(
                  'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all',
                  status === 'done' && 'border-transparent bg-gradient-to-br from-primary to-accent',
                  status === 'active' && 'border-primary/60 bg-primary/10 ring-2 ring-primary/30',
                  status === 'error' && 'border-destructive/60 bg-destructive/10',
                  status === 'pending' && 'border-border/70 bg-secondary/40'
                )}
              >
                {status === 'done' && <Check className="h-4 w-4 text-primary-foreground" />}
                {status === 'active' && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                {status === 'error' && <AlertTriangle className="h-4 w-4 text-destructive" />}
                {status === 'pending' && <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />}
              </div>
              <div className="min-w-0 flex-1 pt-1">
                <p
                  className={cn(
                    'text-sm font-medium transition-colors',
                    status === 'pending' ? 'text-muted-foreground' : 'text-foreground'
                  )}
                >
                  {step.label}
                </p>
                {status === 'active' && (
                  <p className="mt-0.5 text-xs text-primary/80">In progress...</p>
                )}
                {status === 'error' && errorMessage && (
                  <p className="mt-0.5 text-xs text-destructive">{errorMessage}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {hasError && onRetry && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-xs text-muted-foreground">
            Nothing was lost — your notes and any completed steps are saved.
          </p>
          <Button size="sm" variant="outline" className="gap-2 shrink-0" disabled={retrying} onClick={onRetry}>
            {retrying ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
            Retry
          </Button>
        </div>
      )}
    </div>
  );
};

export default GenerationProgress;
