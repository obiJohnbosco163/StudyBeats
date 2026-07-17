export interface ContentAnalysis {
    mainTopics: string[];
    definitions: string[];
    keyConcepts: string[];
    formulas: string[];
    dates: string[];
    examples: string[];
    examPoints: string[];
    keywords: string[];
}
export declare function analyzeContent(env: unknown, text: string): Promise<ContentAnalysis>;
