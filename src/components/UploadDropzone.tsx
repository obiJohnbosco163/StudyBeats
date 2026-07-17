import { cn } from '@/lib/utils';
import { FileText, UploadCloud, X } from 'lucide-react';
import React, { useRef, useState } from 'react';

interface UploadDropzoneProps {
  onFileSelected: (file: File) => void;
  file: File | null;
  onClear: () => void;
  accept?: string;
  disabled?: boolean;
}

const ACCEPTED_TYPES = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  onFileSelected,
  file,
  onClear,
  accept = '.pdf,.docx,.txt',
  disabled,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    const f = files?.[0];
    if (f) onFileSelected(f);
  };

  if (file) {
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
          <FileText className="h-6 w-6 text-primary-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{file.name}</p>
          <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Remove file"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={e => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={e => {
        e.preventDefault();
        setIsDragging(false);
        if (!disabled) handleFiles(e.dataTransfer.files);
      }}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center transition-all',
        isDragging
          ? 'border-primary bg-primary/10 scale-[1.01]'
          : 'border-border/70 bg-secondary/30 hover:border-primary/50 hover:bg-secondary/50',
        disabled && 'pointer-events-none opacity-50'
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 ring-1 ring-primary/30">
        <UploadCloud className="h-7 w-7 text-primary" />
      </div>
      <div>
        <p className="font-semibold">Drop your notes here, or click to browse</p>
        <p className="mt-1 text-sm text-muted-foreground">PDF, DOCX, or TXT — up to 20MB</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled}
        onChange={e => handleFiles(e.target.files)}
      />
    </div>
  );
};

export default UploadDropzone;
