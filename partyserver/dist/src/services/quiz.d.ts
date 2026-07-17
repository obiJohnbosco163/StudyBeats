export interface QuizQuestion {
    question: string;
    options: string[];
    answerIndex: number;
    explanation: string;
}
export declare function generateQuiz(env: unknown, text: string): Promise<QuizQuestion[]>;
