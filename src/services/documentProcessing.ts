/**
 * Document text extraction — pure, framework-free module (no React/JSX).
 *
 * Turns an uploaded study document (PDF, DOCX, TXT, or Markdown) or pasted
 * text into clean plain text for the AI pipeline. Strips page numbers and
 * running headers/footers (lines that repeat across many pages) so the
 * extracted text reads like continuous prose.
 */
import * as pdfjsLib from 'pdfjs-dist';
import * as mammoth from 'mammoth';

// This app's build uses Bun's bundler (not Vite's dev-server transform), so the
// `?url` asset-import suffix isn't available. Load the matching-version worker
// from a CDN instead — pdfjsLib.version guarantees an exact API/worker match.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export type DocumentErrorCode = 'unreadable' | 'encrypted' | 'unsupported' | 'network' | 'empty';

export class DocumentProcessingError extends Error {
  code: DocumentErrorCode;
  constructor(message: string, code: DocumentErrorCode) {
    super(message);
    this.name = 'DocumentProcessingError';
    this.code = code;
  }
}

const PAGE_NUMBER_LINE = /^[\s\-–—.]*(page\s*)?\d{1,4}(\s*(of|\/)\s*\d{1,4})?[\s\-–—.]*$/i;

function isPageNumberLine(line: string): boolean {
  const t = line.trim();
  return t.length > 0 && t.length <= 24 && PAGE_NUMBER_LINE.test(t);
}

/** Detect lines that repeat across many pages (running headers/footers) and drop them. */
function stripRepeatedHeadersFooters(pages: string[][]): string[][] {
  if (pages.length < 3) return pages;
  const counts = new Map<string, number>();
  for (const page of pages) {
    const seenOnPage = new Set<string>();
    for (const line of page) {
      const key = line.trim();
      if (!key || seenOnPage.has(key)) continue;
      seenOnPage.add(key);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  const threshold = Math.max(3, Math.ceil(pages.length * 0.5));
  const repeated = new Set(
    [...counts.entries()]
      .filter(([key, count]) => count >= threshold && key.length > 0 && key.length < 120)
      .map(([key]) => key)
  );
  return pages.map((page) => page.filter((line) => !repeated.has(line.trim())));
}

function cleanLines(lines: string[]): string {
  return lines
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter((l) => l.length > 0 && !isPageNumberLine(l))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function extractPdfText(file: File): Promise<string> {
  let buffer: ArrayBuffer;
  try {
    buffer = await file.arrayBuffer();
  } catch {
    throw new DocumentProcessingError('Could not read the PDF file.', 'unreadable');
  }

  let pdf;
  try {
    pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  } catch (err: unknown) {
    const message = String((err as { message?: string })?.message || err || '');
    if (/password|encrypted/i.test(message)) {
      throw new DocumentProcessingError(
        'This PDF is password-protected. Remove the password and try again.',
        'encrypted'
      );
    }
    throw new DocumentProcessingError(
      'This PDF could not be read. It may be corrupted or an unsupported format.',
      'unreadable'
    );
  }

  const pages: string[][] = [];
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const lines: string[] = [];
    let currentLine = '';
    let lastY: number | null = null;
    for (const item of content.items as Array<{ str?: string; transform?: number[] }>) {
      const str = typeof item.str === 'string' ? item.str : '';
      const y = item.transform?.[5] ?? null;
      if (lastY !== null && y !== null && Math.abs(y - lastY) > 2) {
        if (currentLine.trim()) lines.push(currentLine);
        currentLine = str;
      } else {
        currentLine += (currentLine && str ? ' ' : '') + str;
      }
      lastY = y;
    }
    if (currentLine.trim()) lines.push(currentLine);
    pages.push(lines);
  }

  const cleanedPages = stripRepeatedHeadersFooters(pages);
  const text = cleanLines(cleanedPages.flat());
  if (!text) {
    throw new DocumentProcessingError(
      'No readable text was found in this PDF (it may be a scanned image without OCR).',
      'empty'
    );
  }
  return text;
}

async function extractDocxText(file: File): Promise<string> {
  let buffer: ArrayBuffer;
  try {
    buffer = await file.arrayBuffer();
  } catch {
    throw new DocumentProcessingError('Could not read the DOCX file.', 'unreadable');
  }
  try {
    const { value } = await mammoth.extractRawText({ arrayBuffer: buffer });
    const text = cleanLines(value.split('\n'));
    if (!text) throw new DocumentProcessingError('No readable text was found in this document.', 'empty');
    return text;
  } catch (err) {
    if (err instanceof DocumentProcessingError) throw err;
    throw new DocumentProcessingError(
      'This DOCX file could not be read. It may be corrupted or in an unsupported format.',
      'unreadable'
    );
  }
}

async function extractPlainText(file: File): Promise<string> {
  try {
    const raw = await file.text();
    const text = cleanLines(raw.split('\n'));
    if (!text) throw new DocumentProcessingError('This file appears to be empty.', 'empty');
    return text;
  } catch (err) {
    if (err instanceof DocumentProcessingError) throw err;
    throw new DocumentProcessingError('Could not read this text file.', 'unreadable');
  }
}

export function detectFileKind(file: File): 'pdf' | 'docx' | 'text' {
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf') || file.type === 'application/pdf') return 'pdf';
  if (name.endsWith('.docx') || file.type.includes('wordprocessingml')) return 'docx';
  return 'text';
}

/** Extract clean, readable plain text from a File (PDF, DOCX, TXT, or Markdown). */
export async function extractTextFromFile(file: File): Promise<string> {
  const kind = detectFileKind(file);
  if (kind === 'pdf') return extractPdfText(file);
  if (kind === 'docx') return extractDocxText(file);
  return extractPlainText(file);
}

/** Fetch a hosted file URL and extract its text, inferring format from fileType. */
export async function extractTextFromUrl(url: string, fileType: string): Promise<string> {
  let blob: Blob;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    blob = await res.blob();
  } catch {
    throw new DocumentProcessingError('Could not download the uploaded file for processing.', 'network');
  }
  const name = fileType === 'pdf' ? 'material.pdf' : fileType === 'docx' ? 'material.docx' : 'material.txt';
  const file = new File([blob], name, { type: blob.type });
  return extractTextFromFile(file);
}
