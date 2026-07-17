import AppShell from '@/components/AppShell';
import GenerationProgress, { type StepStatusMap } from '@/components/GenerationProgress';
import GenerationSettingsForm, { GenerationSettings } from '@/components/GenerationSettingsForm';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppAuth } from '@/contexts/AppAuthContext';
import { useGuestDB } from '@/hooks/use-guest-db';
import { useRealtimeData } from '@/hooks/use-realtime-data';
import { getMaterials, subscribeManyMaterials, type MaterialsResponse } from '@/lib/collections/materials';
import { PIPELINE_STEPS, runGenerationPipeline, type PipelineStepId } from '@/services/pipeline';
import { coverGradientForSeed, genId } from '@/utils/studybeats';
import { FileText, Sparkles, UploadCloud } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

function initialSteps(): StepStatusMap {
  return PIPELINE_STEPS.reduce((acc, s) => {
    acc[s.id] = 'pending';
    return acc;
  }, {} as StepStatusMap);
}

export const GeneratePage: React.FC = () => {
  const { address, isGuest } = useAppAuth();
  const { db } = useGuestDB();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const materialIdParam = params.get('materialId') ?? undefined;

  const { data: realMaterials } = useRealtimeData<MaterialsResponse[]>(
    subscribeManyMaterials,
    !!address && !isGuest,
    ''
  );
  const materials = isGuest ? db.materials : realMaterials ?? [];

  const [selectedMaterialId, setSelectedMaterialId] = useState<string | undefined>(materialIdParam);
  const [material, setMaterial] = useState<MaterialsResponse | null>(null);

  useEffect(() => {
    if (!selectedMaterialId) {
      setMaterial(null);
      return;
    }
    const local = materials.find((m) => m.id === selectedMaterialId) ?? null;
    if (local) {
      setMaterial(local);
    } else if (!isGuest) {
      getMaterials(selectedMaterialId).then(setMaterial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMaterialId, isGuest, materials.length]);

  const [settings, setSettings] = useState<GenerationSettings>({
    title: material?.title ? `${material.title} — Song` : '',
    genre: 'lofi',
    vocalStyle: 'Warm Female',
    mood: 'Focused',
    lengthSec: 150,
  });

  useEffect(() => {
    if (material?.title && !settings.title) {
      setSettings((s) => ({ ...s, title: `${material.title} — Song` }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [material?.title]);

  const [generating, setGenerating] = useState(false);
  const [steps, setSteps] = useState<StepStatusMap>(initialSteps());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attemptIds, setAttemptIds] = useState<{ songId: string; sessionId: string } | null>(null);

  const canGenerate = !!address && !!material && settings.title.trim().length > 0;

  const runAttempt = async (ids: { songId: string; sessionId: string }) => {
    if (!address || !material) return;
    setGenerating(true);
    setErrorMessage(null);
    setSteps(initialSteps());

    try {
      const result = await runGenerationPipeline({
        address,
        isGuest,
        material: {
          id: material.id,
          title: material.title,
          fileType: material.fileType,
          textContent: material.textContent,
          fileUrl: material.fileUrl,
        },
        settings: { ...settings, language: 'English' },
        songId: ids.songId,
        sessionId: ids.sessionId,
        onStep: (stepId: PipelineStepId, status, error) => {
          setSteps((prev) => ({ ...prev, [stepId]: status }));
          if (status === 'error' && error) setErrorMessage(error);
        },
      });

      toast.success('Your song is ready!');
      navigate(`/songs/${result.songId}`);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Generation failed. Please try again.';
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerate = async () => {
    if (!canGenerate) {
      toast.error(material ? 'Give your song a title first.' : 'Pick a source material to generate from.');
      return;
    }
    const ids = { songId: genId('song'), sessionId: genId('sess') };
    setAttemptIds(ids);
    await runAttempt(ids);
  };

  const handleRetry = async () => {
    if (!attemptIds) return;
    await runAttempt(attemptIds);
  };

  const hasError = useMemo(() => Object.values(steps).some((s) => s === 'error'), [steps]);
  const showProgress = generating || hasError;

  return (
    <AppShell
      title="Generate a Song"
      description="Pick a vibe. We'll turn your notes into something you'd actually replay."
    >
      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-2xl border border-border/60 bg-card/60 p-6 sm:p-8">
          <GenerationSettingsForm value={settings} onChange={setSettings} disabled={generating} />
        </div>

        <div className="space-y-4">
          {materialIdParam ? (
            material && (
              <div className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Generating from</p>
                  <p className="truncate text-sm font-medium">{material.title}</p>
                </div>
              </div>
            )
          ) : (
            <div className="space-y-2 rounded-2xl border border-border/60 bg-card/60 p-4">
              <p className="text-sm font-semibold">Source material</p>
              {materials.length === 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Upload your notes first — songs are grounded in real study material.
                  </p>
                  <Button size="sm" variant="outline" className="gap-2" onClick={() => navigate('/upload')}>
                    <UploadCloud className="h-4 w-4" />
                    Upload Notes
                  </Button>
                </div>
              ) : (
                <Select
                  value={selectedMaterialId}
                  onValueChange={setSelectedMaterialId}
                  disabled={generating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a material to vibe to..." />
                  </SelectTrigger>
                  <SelectContent>
                    {materials.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {showProgress ? (
            <GenerationProgress steps={steps} errorMessage={errorMessage} onRetry={handleRetry} retrying={generating} />
          ) : (
            <>
              <div className="rounded-2xl border border-border/60 bg-card/60 p-6">
                <p className="text-sm font-semibold">Preview</p>
                <div
                  className="mt-3 h-32 w-full rounded-xl"
                  style={{ background: coverGradientForSeed(settings.title || 'studybeats') }}
                />
                <p className="mt-3 truncate font-semibold">{settings.title || 'Untitled Song'}</p>
                <p className="text-xs text-muted-foreground">
                  {settings.vocalStyle} · {settings.genre} · {settings.mood}
                </p>
              </div>

              <Button size="lg" className="w-full gap-2" disabled={!canGenerate} onClick={handleGenerate}>
                <Sparkles className="h-4 w-4" />
                Generate Song
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                We'll analyze your notes, write lyrics, and produce a track — grounded in what you actually uploaded.
              </p>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default GeneratePage;
