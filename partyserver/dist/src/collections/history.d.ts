import { TimeOperation, IncrementOperation, TokenAmount, AddressType, DocumentOperation } from '../db-client';
/**
 * Playback history entry. Owner-scoped by userId; immutable once created.
 */
export interface HistoryRequest {
    userId: AddressType;
    songId: string;
    playedAt: number | TimeOperation | IncrementOperation | TokenAmount;
}
export interface HistoryResponse {
    userId: string;
    songId: string;
    playedAt: number;
    id: string;
    tarobase_created_at: number;
}
/**
 * Build a History operation for use with setMany.
 * @returns A DocumentOperation that can be passed to setMany.
 */
export declare function buildHistory(historyId: string, data: HistoryRequest): DocumentOperation;
/**
 * Authenticated users only. userId must equal @user.address. playedAt is Unix seconds. (Create/Update Single Item)
 * @returns A boolean indicating whether the operation succeeded (true) or failed (false). Always check this value to confirm the write worked.
 */
export declare function setHistory(historyId: string, data: HistoryRequest): Promise<boolean>;
/**
 *
  Read Operation Details: Owner only (userId == @user.address).
   (Get Single Item)
 */
export declare function getHistory(historyId: string): Promise<HistoryResponse | null>;
/**
 * Subscribes to changes in a single History document. (
  Read Operation Details: Owner only (userId == @user.address).
  )
 */
export declare function subscribeHistory(callback: (data: HistoryResponse | null) => void, historyId: string): Promise<() => Promise<void>>;
/**
 * Get many History items from collection history
 
  Read Operation Details: Owner only (userId == @user.address).
  
 */
export declare function getManyHistory(filter?: string): Promise<HistoryResponse[]>;
/**
 * Subscribe to changes in History collection at history
 
  Read Operation Details: Owner only (userId == @user.address).
  
 */
export declare function subscribeManyHistory(callback: (data: HistoryResponse[]) => void, filter?: string): Promise<() => Promise<void>>;
/**
 * Get all History items from collection history
 
  Read Operation Details: Owner only (userId == @user.address).
  
 */
export declare function getAllHistory(filter?: string): Promise<HistoryResponse[]>;
/**
 * Subscribe to changes in History collection at history
 
  Read Operation Details: Owner only (userId == @user.address).
  
 */
export declare function subscribeAllHistory(callback: (data: HistoryResponse[]) => void, filter?: string): Promise<() => Promise<void>>;
/**
 *
  Delete Operation Details: Owner only (userId == @user.address) can remove their own history entries.
   (Delete Single Item)
 * @returns A boolean indicating whether the operation succeeded (true) or failed (false). Always check this value to confirm the delete worked.
 */
export declare function deleteHistory(historyId: string): Promise<boolean>;
/**
 * Build a delete operation for History for use with setMany.
 * @returns A DocumentOperation that can be passed to setMany.
 */
export declare function buildDeleteHistory(historyId: string): DocumentOperation;
