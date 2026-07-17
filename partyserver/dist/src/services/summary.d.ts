export interface StudySummary {
    shortSummary: string;
    detailedSummary: string;
}
export declare function generateSummary(env: unknown, text: string): Promise<StudySummary>;
