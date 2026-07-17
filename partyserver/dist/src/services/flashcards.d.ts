export interface Flashcard {
    question: string;
    answer: string;
}
export declare function generateFlashcards(env: unknown, text: string): Promise<Flashcard[]>;
