/**
 * Shared types + defensive JSON parsers for the AI-generated Learning
 * Package (summary/concepts/flashcards/quiz) and synced-lyrics timestamps.
 * These fields are stored as JSON-encoded strings on studySessions/songs —
 * parse/stringify at the boundary using these helpers everywhere.
 */

export interface StudyAnalysis {
  mainTopics: string[];
  definitions: string[];
  keyConcepts: string[];
  formulas: string[];
  dates: string[];
  examples: string[];
  examPoints: string[];
  keywords: string[];
}

export interface Flashcard {
  question: string;
  answer: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface LyricLineTimestamp {
  line: string;
  tSec: number;
}

function safeParseArray<T>(json?: string | null): T[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export function parseFlashcards(json?: string | null): Flashcard[] {
  return safeParseArray<Flashcard>(json).filter((c) => c && typeof c.question === 'string');
}

export function parseQuiz(json?: string | null): QuizQuestion[] {
  return safeParseArray<QuizQuestion>(json).filter((q) => q && typeof q.question === 'string');
}

export function parseAnalysis(json?: string | null): StudyAnalysis | null {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      mainTopics: Array.isArray(parsed.mainTopics) ? parsed.mainTopics : [],
      definitions: Array.isArray(parsed.definitions) ? parsed.definitions : [],
      keyConcepts: Array.isArray(parsed.keyConcepts) ? parsed.keyConcepts : [],
      formulas: Array.isArray(parsed.formulas) ? parsed.formulas : [],
      dates: Array.isArray(parsed.dates) ? parsed.dates : [],
      examples: Array.isArray(parsed.examples) ? parsed.examples : [],
      examPoints: Array.isArray(parsed.examPoints) ? parsed.examPoints : [],
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
    };
  } catch {
    return null;
  }
}

export function parseLyricsTimestamps(json?: string | null): LyricLineTimestamp[] {
  return safeParseArray<LyricLineTimestamp>(json).filter(
    (t) => t && typeof t.line === 'string' && typeof t.tSec === 'number'
  );
}
