import AppShell from '@/components/AppShell';
import UploadDropzone from '@/components/UploadDropzone';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppAuth } from '@/contexts/AppAuthContext';
import { useGuestDB } from '@/hooks/use-guest-db';
import { Address, Time } from '@/lib/db-client';
import { setMaterials } from '@/lib/collections/materials';
import { uploadAppFiles, getAppFiles } from '@/lib/collections/appFiles';
import { extractTextFromFile, DocumentProcessingError } from '@/services/documentProcessing';
import { genId, nowSeconds } from '@/utils/studybeats';
import { CheckCircle2, FileText, Loader2, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

function extToFileType(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'pdf';
  if (ext === 'docx') return 'docx';
  return 'txt';
}

export const UploadPage: React.FC = () => {
  const { address, isGuest } = useAppAuth();
  const { mutate } = useGuestDB();
  const navigate = useNavigate();

  const [tab, setTab] = useState<'file' | 'text'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [textTitle, setTextTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdMaterialId, setCreatedMaterialId] = useState<string | null>(null);

  const canSubmit = tab === 'file' ? !!file : textTitle.trim().length > 0 && textContent.trim().length > 0;

  const handleSubmit = async () => {
    if (!address || !canSubmit) return;
    setSubmitting(true);
    const materialId = genId('mat');

    try {
      if (tab === 'file' && file) {
        const title = file.name.replace(/\.[^.]+$/, '');
        const fileType = extToFileType(file.name);

        let extractedText: string;
        try {
          extractedText = await extractTextFromFile(file);
        } catch (err) {
          if (err instanceof DocumentProcessingError) {
            toast.error(err.message);
            setSubmitting(false);
            return;
          }
          throw err;
        }

        if (isGuest) {
          mutate(db => ({
            ...db,
            materials: [
              {
                id: materialId,
                title,
                fileType,
                textContent: extractedText,
                sizeBytes: file.size,
                uploadedBy: address,
                status: 'ready',
                createdAt: nowSeconds(),
                tarobase_created_at: nowSeconds(),
              },
              ...db.materials,
            ],
          }));
        } else {
          const uploaded = await uploadAppFiles(materialId, file);
          if (!uploaded) {
            toast.error('File upload failed.');
            setSubmitting(false);
            return;
          }
          const fileItem = await getAppFiles(materialId);
          const ok = await setMaterials(materialId, {
            title,
            fileType,
            textContent: extractedText,
            fileUrl: fileItem?.url,
            sizeBytes: file.size,
            uploadedBy: Address.publicKey(address),
            status: 'ready',
            createdAt: Time.Now,
          });
          if (!ok) {
            toast.error('Could not save material. Please try again.');
            setSubmitting(false);
            return;
          }
        }
      } else {
        if (isGuest) {
          mutate(db => ({
            ...db,
            materials: [
              {
                id: materialId,
                title: textTitle,
                fileType: 'text',
                textContent,
                sizeBytes: textContent.length,
                uploadedBy: address,
                status: 'ready',
                createdAt: nowSeconds(),
                tarobase_created_at: nowSeconds(),
              },
              ...db.materials,
            ],
          }));
        } else {
          const ok = await setMaterials(materialId, {
            title: textTitle,
            fileType: 'text',
            textContent,
            sizeBytes: textContent.length,
            uploadedBy: Address.publicKey(address),
            status: 'ready',
            createdAt: Time.Now,
          });
          if (!ok) {
            toast.error('Could not save material. Please try again.');
            setSubmitting(false);
            return;
          }
        }
      }

      setCreatedMaterialId(materialId);
      toast.success('Material saved!');
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong uploading your material.');
    } finally {
      setSubmitting(false);
    }
  };

  if (createdMaterialId) {
    return (
      <AppShell title="Upload Notes" description="Turn your notes into a study soundtrack.">
        <div className="mx-auto max-w-md rounded-2xl border border-primary/30 bg-primary/5 p-8 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-4 text-lg font-semibold">Material saved</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Ready to turn this into a song? Pick a genre, vocal style, and mood next.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button className="gap-2" onClick={() => navigate(`/generate?materialId=${createdMaterialId}`)}>
              <Sparkles className="h-4 w-4" />
              Generate a Song from This
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setCreatedMaterialId(null);
                setFile(null);
                setTextTitle('');
                setTextContent('');
              }}
            >
              Upload Another
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Upload Notes" description="PDF, DOCX, plain text, or paste it directly.">
      <div className="mx-auto max-w-2xl">
        <Tabs value={tab} onValueChange={v => setTab(v as 'file' | 'text')}>
          <TabsList className="mb-6 grid w-full grid-cols-2">
            <TabsTrigger value="file" className="gap-2">
              <FileText className="h-4 w-4" /> Upload File
            </TabsTrigger>
            <TabsTrigger value="text" className="gap-2">
              Paste Text
            </TabsTrigger>
          </TabsList>

          <TabsContent value="file">
            <UploadDropzone file={file} onFileSelected={setFile} onClear={() => setFile(null)} />
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="text-title">Title</Label>
              <Input
                id="text-title"
                value={textTitle}
                onChange={e => setTextTitle(e.target.value)}
                placeholder="e.g. Cell Biology — Chapter 4"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="text-content">Notes</Label>
              <Textarea
                id="text-content"
                value={textContent}
                onChange={e => setTextContent(e.target.value)}
                placeholder="Paste your notes here..."
                className="min-h-[220px]"
              />
            </div>
          </TabsContent>
        </Tabs>

        <Button className="mt-6 w-full gap-2" disabled={!canSubmit || submitting} onClick={handleSubmit}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
          Save Material
        </Button>
      </div>
    </AppShell>
  );
};

export default UploadPage;
