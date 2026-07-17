import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { StudySessionsResponse } from '@/lib/collections/studySessions';
import { parseAnalysis, parseFlashcards, parseQuiz, type QuizQuestion } from '@/utils/learningPackage';
import { BookOpen, Brain, HelpCircle, Layers, Loader2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';

interface LearningPackageProps {
  session: StudySessionsResponse;
}

function ConceptGroup({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <Badge key={i} variant="outline" className="rounded-full border-primary/30 bg-primary/5 font-normal">
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function QuizItem({ index, q }: { index: number; q: QuizQuestion }) {
  const [selected, setSelected] = useState<number | null>(null);
  const revealed = selected !== null;

  return (
    <div className="rounded-xl border border-border/60 bg-secondary/20 p-4">
      <p className="text-sm font-medium">
        {index + 1}. {q.question}
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {q.options.map((opt, i) => {
          const isCorrect = i === q.answerIndex;
          const isSelected = i === selected;
          return (
            <button
              key={i}
              type="button"
              onClick={() => !revealed && setSelected(i)}
              disabled={revealed}
              className={cn(
                'rounded-lg border px-3 py-2 text-left text-sm transition-all',
                !revealed && 'border-border/70 bg-card/60 hover:border-primary/40',
                revealed && isCorrect && 'border-primary/60 bg-primary/10 text-foreground',
                revealed && isSelected && !isCorrect && 'border-destructive/50 bg-destructive/10 text-foreground',
                revealed && !isSelected && !isCorrect && 'border-border/50 bg-card/30 text-muted-foreground'
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {revealed && q.explanation && (
        <p className="mt-3 text-xs text-muted-foreground">{q.explanation}</p>
      )}
    </div>
  );
}

function FlashcardItem({ index, question, answer }: { index: number; question: string; answer: string }) {
  return (
    <AccordionItem value={`card-${index}`} className="border-border/60">
      <AccordionTrigger className="text-sm">{question}</AccordionTrigger>
      <AccordionContent className="text-sm text-muted-foreground">{answer}</AccordionContent>
    </AccordionItem>
  );
}

/**
 * Renders the AI-generated Learning Package (summary, key concepts,
 * flashcards, quiz) for a study session. Purely additive — renders nothing
 * if the session predates the pipeline (no learning-package fields yet).
 */
export const LearningPackage: React.FC<LearningPackageProps> = ({ session }) => {
  const analysis = useMemo(() => parseAnalysis(session.keyConcepts), [session.keyConcepts]);
  const flashcards = useMemo(() => parseFlashcards(session.flashcards), [session.flashcards]);
  const quiz = useMemo(() => parseQuiz(session.quiz), [session.quiz]);

  const hasSummary = !!(session.shortSummary || session.detailedSummary);
  const hasConcepts = !!analysis;
  const hasFlashcards = flashcards.length > 0;
  const hasQuiz = quiz.length > 0;
  const hasAnything = hasSummary || hasConcepts || hasFlashcards || hasQuiz;

  if (session.status === 'generating' && !hasAnything) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-card/60 p-6 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        Building your Learning Package...
      </div>
    );
  }

  if (!hasAnything) return null;

  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-6">
      <div className="mb-4 flex items-center gap-2">
        <Brain className="h-4 w-4 text-primary" />
        <h3 className="font-semibold">Learning Package</h3>
      </div>

      <Tabs defaultValue={hasSummary ? 'summary' : hasConcepts ? 'concepts' : hasFlashcards ? 'flashcards' : 'quiz'}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary" disabled={!hasSummary} className="gap-1.5">
            <BookOpen className="h-3.5 w-3.5" /> Summary
          </TabsTrigger>
          <TabsTrigger value="concepts" disabled={!hasConcepts} className="gap-1.5">
            <Layers className="h-3.5 w-3.5" /> Concepts
          </TabsTrigger>
          <TabsTrigger value="flashcards" disabled={!hasFlashcards} className="gap-1.5">
            <Brain className="h-3.5 w-3.5" /> Flashcards
          </TabsTrigger>
          <TabsTrigger value="quiz" disabled={!hasQuiz} className="gap-1.5">
            <HelpCircle className="h-3.5 w-3.5" /> Quiz
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-3 pt-4">
          {session.shortSummary && (
            <p className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm font-medium">
              {session.shortSummary}
            </p>
          )}
          {session.detailedSummary && (
            <p className="text-sm leading-relaxed text-muted-foreground">{session.detailedSummary}</p>
          )}
        </TabsContent>

        <TabsContent value="concepts" className="space-y-4 pt-4">
          {analysis && (
            <>
              <ConceptGroup title="Main Topics" items={analysis.mainTopics} />
              <ConceptGroup title="Key Concepts" items={analysis.keyConcepts} />
              <ConceptGroup title="Definitions" items={analysis.definitions} />
              <ConceptGroup title="Formulas" items={analysis.formulas} />
              <ConceptGroup title="Important Dates" items={analysis.dates} />
              <ConceptGroup title="Examples" items={analysis.examples} />
              <ConceptGroup title="Exam Points" items={analysis.examPoints} />
              <ConceptGroup title="Keywords" items={analysis.keywords} />
            </>
          )}
        </TabsContent>

        <TabsContent value="flashcards" className="pt-4">
          <Accordion type="single" collapsible>
            {flashcards.map((c, i) => (
              <FlashcardItem key={i} index={i} question={c.question} answer={c.answer} />
            ))}
          </Accordion>
        </TabsContent>

        <TabsContent value="quiz" className="space-y-3 pt-4">
          {quiz.map((q, i) => (
            <QuizItem key={i} index={i} q={q} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LearningPackage;
