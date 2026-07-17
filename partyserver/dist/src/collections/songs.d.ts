import { TimeOperation, IncrementOperation, TokenAmount, AddressType, DocumentOperation } from '../db-client';
/**
 * An AI-generated educational song (placeholder data for MVP; generation engine deferred). Owner-scoped by createdBy.
 */
export interface SongsRequest {
    title: string;
    materialId?: string;
    genre: string;
    vocalStyle: string;
    durationSec: number | TimeOperation | IncrementOperation | TokenAmount;
    audioUrl?: string;
    lyrics?: string;
    coverUrl?: string;
    status: string;
    createdBy: AddressType;
    createdAt: number | TimeOperation | IncrementOperation | TokenAmount;
    lyricsTimestamps?: string;
    generationError?: string;
}
export interface SongsResponse {
    title: string;
    materialId?: string;
    genre: string;
    vocalStyle: string;
    durationSec: number;
    audioUrl?: string;
    lyrics?: string;
    coverUrl?: string;
    status: string;
    createdBy: string;
    createdAt: number;
    lyricsTimestamps?: string;
    generationError?: string;
    id: string;
    tarobase_created_at: number;
}
/**
 * Build a Songs operation for use with setMany.
 * @returns A DocumentOperation that can be passed to setMany.
 */
export declare function buildSongs(songId: string, data: SongsRequest): DocumentOperation;
/**
 * Authenticated users only. createdBy must equal @user.address. durationSec is required (pass 0 for placeholders). audioUrl/lyrics/coverUrl are optional placeholders. createdAt is Unix seconds. Optional: lyricsTimestamps (JSON array of {line,tSec} for synced lyrics), generationError (human-readable error message for retry UX). (Create/Update Single Item)
 * @returns A boolean indicating whether the operation succeeded (true) or failed (false). Always check this value to confirm the write worked.
 */
export declare function setSongs(songId: string, data: SongsRequest): Promise<boolean>;
export type SongsRequestUpdate = Partial<SongsRequest>;
/**
 * Build a Songs update operation for use with setMany.
 * @returns A DocumentOperation that can be passed to setMany.
 */
export declare function buildUpdateSongs(songId: string, data: SongsRequestUpdate): DocumentOperation;
/**
 * Owner only. createdBy cannot be reassigned to another wallet. lyricsTimestamps and generationError are optional and updatable by the owner. (Update Single Item)
 * @returns A boolean indicating whether the operation succeeded (true) or failed (false). Always check this value to confirm the update worked.
 */
export declare function updateSongs(songId: string, data: SongsRequestUpdate): Promise<boolean>;
/**
 *
  Read Operation Details: Owner only (createdBy == @user.address).
   (Get Single Item)
 */
export declare function getSongs(songId: string): Promise<SongsResponse | null>;
/**
 * Subscribes to changes in a single Songs document. (
  Read Operation Details: Owner only (createdBy == @user.address).
  )
 */
export declare function subscribeSongs(callback: (data: SongsResponse | null) => void, songId: string): Promise<() => Promise<void>>;
/**
 * Get many Songs items from collection songs
 
  Read Operation Details: Owner only (createdBy == @user.address).
  
 */
export declare function getManySongs(filter?: string): Promise<SongsResponse[]>;
/**
 * Subscribe to changes in Songs collection at songs
 
  Read Operation Details: Owner only (createdBy == @user.address).
  
 */
export declare function subscribeManySongs(callback: (data: SongsResponse[]) => void, filter?: string): Promise<() => Promise<void>>;
/**
 * Get all Songs items from collection songs
 
  Read Operation Details: Owner only (createdBy == @user.address).
  
 */
export declare function getAllSongs(filter?: string): Promise<SongsResponse[]>;
/**
 * Subscribe to changes in Songs collection at songs
 
  Read Operation Details: Owner only (createdBy == @user.address).
  
 */
export declare function subscribeAllSongs(callback: (data: SongsResponse[]) => void, filter?: string): Promise<() => Promise<void>>;
/**
 *
  Delete Operation Details: Owner only (createdBy == @user.address).
   (Delete Single Item)
 * @returns A boolean indicating whether the operation succeeded (true) or failed (false). Always check this value to confirm the delete worked.
 */
export declare function deleteSongs(songId: string): Promise<boolean>;
/**
 * Build a delete operation for Songs for use with setMany.
 * @returns A DocumentOperation that can be passed to setMany.
 */
export declare function buildDeleteSongs(songId: string): DocumentOperation;
