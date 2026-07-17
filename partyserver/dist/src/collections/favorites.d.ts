import { TimeOperation, IncrementOperation, TokenAmount, AddressType, DocumentOperation } from '../db-client';
/**
 * A favorited song for a user. Owner-scoped by userId.
 */
export interface FavoritesRequest {
    userId: AddressType;
    songId: string;
    createdAt: number | TimeOperation | IncrementOperation | TokenAmount;
}
export interface FavoritesResponse {
    userId: string;
    songId: string;
    createdAt: number;
    id: string;
    tarobase_created_at: number;
}
/**
 * Build a Favorites operation for use with setMany.
 * @returns A DocumentOperation that can be passed to setMany.
 */
export declare function buildFavorites(favoriteId: string, data: FavoritesRequest): DocumentOperation;
/**
 * Authenticated users only. userId must equal @user.address. songId references a song document. createdAt is Unix seconds. (Create/Update Single Item)
 * @returns A boolean indicating whether the operation succeeded (true) or failed (false). Always check this value to confirm the write worked.
 */
export declare function setFavorites(favoriteId: string, data: FavoritesRequest): Promise<boolean>;
export type FavoritesRequestUpdate = Partial<FavoritesRequest>;
/**
 * Build a Favorites update operation for use with setMany.
 * @returns A DocumentOperation that can be passed to setMany.
 */
export declare function buildUpdateFavorites(favoriteId: string, data: FavoritesRequestUpdate): DocumentOperation;
/**
 * Owner only. userId cannot be reassigned to another wallet. (Update Single Item)
 * @returns A boolean indicating whether the operation succeeded (true) or failed (false). Always check this value to confirm the update worked.
 */
export declare function updateFavorites(favoriteId: string, data: FavoritesRequestUpdate): Promise<boolean>;
/**
 *
  Read Operation Details: Owner only (userId == @user.address).
   (Get Single Item)
 */
export declare function getFavorites(favoriteId: string): Promise<FavoritesResponse | null>;
/**
 * Subscribes to changes in a single Favorites document. (
  Read Operation Details: Owner only (userId == @user.address).
  )
 */
export declare function subscribeFavorites(callback: (data: FavoritesResponse | null) => void, favoriteId: string): Promise<() => Promise<void>>;
/**
 * Get many Favorites items from collection favorites
 
  Read Operation Details: Owner only (userId == @user.address).
  
 */
export declare function getManyFavorites(filter?: string): Promise<FavoritesResponse[]>;
/**
 * Subscribe to changes in Favorites collection at favorites
 
  Read Operation Details: Owner only (userId == @user.address).
  
 */
export declare function subscribeManyFavorites(callback: (data: FavoritesResponse[]) => void, filter?: string): Promise<() => Promise<void>>;
/**
 * Get all Favorites items from collection favorites
 
  Read Operation Details: Owner only (userId == @user.address).
  
 */
export declare function getAllFavorites(filter?: string): Promise<FavoritesResponse[]>;
/**
 * Subscribe to changes in Favorites collection at favorites
 
  Read Operation Details: Owner only (userId == @user.address).
  
 */
export declare function subscribeAllFavorites(callback: (data: FavoritesResponse[]) => void, filter?: string): Promise<() => Promise<void>>;
/**
 *
  Delete Operation Details: Owner only (userId == @user.address).
   (Delete Single Item)
 * @returns A boolean indicating whether the operation succeeded (true) or failed (false). Always check this value to confirm the delete worked.
 */
export declare function deleteFavorites(favoriteId: string): Promise<boolean>;
/**
 * Build a delete operation for Favorites for use with setMany.
 * @returns A DocumentOperation that can be passed to setMany.
 */
export declare function buildDeleteFavorites(favoriteId: string): DocumentOperation;
