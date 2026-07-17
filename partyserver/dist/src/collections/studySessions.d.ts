import { TimeOperation, IncrementOperation, TokenAmount, AddressType, DocumentOperation } from '../db-client';
/**
 * A focus/study session grouping songs. Owner-scoped by createdBy. Song membership is stored in the sessionSongs subcollection.
 */
export interface StudySessionsRequest {
    name: string;
    durationSec?: number | TimeOperation | IncrementOperation | TokenAmount;
    createdBy: AddressType;
    createdAt: number | TimeOperation | IncrementOperation | TokenAmount;
    materialId?: string;
    status?: string;
    shortSummary?: string;
    detailedSummary?: string;
    keyConcepts?: string;
    flashcards?: string;
    quiz?: string;
}
export interface StudySessionsResponse {
    name: string;
    durationSec?: number;
    createdBy: string;
    createdAt: number;
    materialId?: string;
    status?: string;
    shortSummary?: string;
    detailedSummary?: string;
    keyConcepts?: string;
    flashcards?: string;
    quiz?: string;
    id: string;
    tarobase_created_at: number;
}
/**
 * Build a StudySessions operation for use with setMany.
 * @returns A DocumentOperation that can be passed to setMany.
 */
export declare function buildStudySessions(sessionId: string, data: StudySessionsRequest): DocumentOperation;
/**
 * Authenticated users only. createdBy must equal @user.address. Add songs via the sessionSongs subcollection. createdAt is Unix seconds. Optional Learning Package fields: materialId (source material), status ('generating'|'ready'|'failed'), shortSummary, detailedSummary, keyConcepts (JSON array), flashcards (JSON array of {question,answer}), quiz (JSON array of {question,options,answerIndex,explanation}). (Create/Update Single Item)
 * @returns A boolean indicating whether the operation succeeded (true) or failed (false). Always check this value to confirm the write worked.
 */
export declare function setStudySessions(sessionId: string, data: StudySessionsRequest): Promise<boolean>;
export type StudySessionsRequestUpdate = Partial<StudySessionsRequest>;
/**
 * Build a StudySessions update operation for use with setMany.
 * @returns A DocumentOperation that can be passed to setMany.
 */
export declare function buildUpdateStudySessions(sessionId: string, data: StudySessionsRequestUpdate): DocumentOperation;
/**
 * Owner only. createdBy cannot be reassigned to another wallet. Optional Learning Package fields can be updated by the owner. (Update Single Item)
 * @returns A boolean indicating whether the operation succeeded (true) or failed (false). Always check this value to confirm the update worked.
 */
export declare function updateStudySessions(sessionId: string, data: StudySessionsRequestUpdate): Promise<boolean>;
/**
 *
  Read Operation Details: Owner only (createdBy == @user.address).
   (Get Single Item)
 */
export declare function getStudySessions(sessionId: string): Promise<StudySessionsResponse | null>;
/**
 * Subscribes to changes in a single StudySessions document. (
  Read Operation Details: Owner only (createdBy == @user.address).
  )
 */
export declare function subscribeStudySessions(callback: (data: StudySessionsResponse | null) => void, sessionId: string): Promise<() => Promise<void>>;
/**
 * Get many StudySessions items from collection studySessions
 
  Read Operation Details: Owner only (createdBy == @user.address).
  
 */
export declare function getManyStudySessions(filter?: string): Promise<StudySessionsResponse[]>;
/**
 * Subscribe to changes in StudySessions collection at studySessions
 
  Read Operation Details: Owner only (createdBy == @user.address).
  
 */
export declare function subscribeManyStudySessions(callback: (data: StudySessionsResponse[]) => void, filter?: string): Promise<() => Promise<void>>;
/**
 * Get all StudySessions items from collection studySessions
 
  Read Operation Details: Owner only (createdBy == @user.address).
  
 */
export declare function getAllStudySessions(filter?: string): Promise<StudySessionsResponse[]>;
/**
 * Subscribe to changes in StudySessions collection at studySessions
 
  Read Operation Details: Owner only (createdBy == @user.address).
  
 */
export declare function subscribeAllStudySessions(callback: (data: StudySessionsResponse[]) => void, filter?: string): Promise<() => Promise<void>>;
/**
 *
  Delete Operation Details: Owner only (createdBy == @user.address).
   (Delete Single Item)
 * @returns A boolean indicating whether the operation succeeded (true) or failed (false). Always check this value to confirm the delete worked.
 */
export declare function deleteStudySessions(sessionId: string): Promise<boolean>;
/**
 * Build a delete operation for StudySessions for use with setMany.
 * @returns A DocumentOperation that can be passed to setMany.
 */
export declare function buildDeleteStudySessions(sessionId: string): DocumentOperation;
/**
 * A song entry within a study session. Owner is inherited from the parent session (createdBy == @user.address). Use $entryId = songId to keep one entry per song.
 */
export interface StudySessionsSessionSongsRequest {
    songId: string;
    position: number | TimeOperation | IncrementOperation | TokenAmount;
    addedAt: number | TimeOperation | IncrementOperation | TokenAmount;
}
export interface StudySessionsSessionSongsResponse {
    songId: string;
    position: number;
    addedAt: number;
    id: string;
    tarobase_created_at: number;
}
/**
 * Build a StudySessionsSessionSongs operation for use with setMany.
 * @returns A DocumentOperation that can be passed to setMany.
 */
export declare function buildStudySessionsSessionSongs(sessionId: string, entryId: string, data: StudySessionsSessionSongsRequest): DocumentOperation;
/**
 * Owner of the parent session only (session.createdBy == @user.address). songId references a song; position orders the entry; addedAt is Unix seconds. (Create/Update Single Item)
 * @returns A boolean indicating whether the operation succeeded (true) or failed (false). Always check this value to confirm the write worked.
 */
export declare function setStudySessionsSessionSongs(sessionId: string, entryId: string, data: StudySessionsSessionSongsRequest): Promise<boolean>;
export type StudySessionsSessionSongsRequestUpdate = Partial<StudySessionsSessionSongsRequest>;
/**
 * Build a StudySessionsSessionSongs update operation for use with setMany.
 * @returns A DocumentOperation that can be passed to setMany.
 */
export declare function buildUpdateStudySessionsSessionSongs(sessionId: string, entryId: string, data: StudySessionsSessionSongsRequestUpdate): DocumentOperation;
/**
 * Owner of the parent session only (e.g. to reorder position). (Update Single Item)
 * @returns A boolean indicating whether the operation succeeded (true) or failed (false). Always check this value to confirm the update worked.
 */
export declare function updateStudySessionsSessionSongs(sessionId: string, entryId: string, data: StudySessionsSessionSongsRequestUpdate): Promise<boolean>;
/**
 *
  Read Operation Details: Owner of the parent session only.
   (Get Single Item)
 */
export declare function getStudySessionsSessionSongs(sessionId: string, entryId: string): Promise<StudySessionsSessionSongsResponse | null>;
/**
 * Subscribes to changes in a single StudySessionsSessionSongs document. (
  Read Operation Details: Owner of the parent session only.
  )
 */
export declare function subscribeStudySessionsSessionSongs(callback: (data: StudySessionsSessionSongsResponse | null) => void, sessionId: string, entryId: string): Promise<() => Promise<void>>;
/**
 * Get many StudySessionsSessionSongs items from collection studySessions/${sessionId}/sessionSongs
 
  Read Operation Details: Owner of the parent session only.
  
 */
export declare function getManyStudySessionsSessionSongs(sessionId: string, filter?: string): Promise<StudySessionsSessionSongsResponse[]>;
/**
 * Subscribe to changes in StudySessionsSessionSongs collection at studySessions/${sessionId}/sessionSongs
 
  Read Operation Details: Owner of the parent session only.
  
 */
export declare function subscribeManyStudySessionsSessionSongs(callback: (data: StudySessionsSessionSongsResponse[]) => void, sessionId: string, filter?: string): Promise<() => Promise<void>>;
/**
 * Get all StudySessionsSessionSongs items from collection studySessions/${sessionId}/sessionSongs
 
  Read Operation Details: Owner of the parent session only.
  
 */
export declare function getAllStudySessionsSessionSongs(sessionId: string, filter?: string): Promise<StudySessionsSessionSongsResponse[]>;
/**
 * Subscribe to changes in StudySessionsSessionSongs collection at studySessions/${sessionId}/sessionSongs
 
  Read Operation Details: Owner of the parent session only.
  
 */
export declare function subscribeAllStudySessionsSessionSongs(callback: (data: StudySessionsSessionSongsResponse[]) => void, sessionId: string, filter?: string): Promise<() => Promise<void>>;
/**
 *
  Delete Operation Details: Owner of the parent session only (removes the song from the session).
   (Delete Single Item)
 * @returns A boolean indicating whether the operation succeeded (true) or failed (false). Always check this value to confirm the delete worked.
 */
export declare function deleteStudySessionsSessionSongs(sessionId: string, entryId: string): Promise<boolean>;
/**
 * Build a delete operation for StudySessionsSessionSongs for use with setMany.
 * @returns A DocumentOperation that can be passed to setMany.
 */
export declare function buildDeleteStudySessionsSessionSongs(sessionId: string, entryId: string): DocumentOperation;
