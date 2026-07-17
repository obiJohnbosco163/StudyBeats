import { TimeOperation, IncrementOperation, TokenAmount, AddressType, DocumentOperation } from '../db-client';
/**
 * A user-created playlist. Owner-scoped by createdBy. Song membership is stored in the playlistSongs subcollection.
 */
export interface PlaylistsRequest {
    name: string;
    description?: string;
    coverUrl?: string;
    createdBy: AddressType;
    createdAt: number | TimeOperation | IncrementOperation | TokenAmount;
}
export interface PlaylistsResponse {
    name: string;
    description?: string;
    coverUrl?: string;
    createdBy: string;
    createdAt: number;
    id: string;
    tarobase_created_at: number;
}
/**
 * Build a Playlists operation for use with setMany.
 * @returns A DocumentOperation that can be passed to setMany.
 */
export declare function buildPlaylists(playlistId: string, data: PlaylistsRequest): DocumentOperation;
/**
 * Authenticated users only. createdBy must equal @user.address. Add songs via the playlistSongs subcollection. createdAt is Unix seconds. (Create/Update Single Item)
 * @returns A boolean indicating whether the operation succeeded (true) or failed (false). Always check this value to confirm the write worked.
 */
export declare function setPlaylists(playlistId: string, data: PlaylistsRequest): Promise<boolean>;
export type PlaylistsRequestUpdate = Partial<PlaylistsRequest>;
/**
 * Build a Playlists update operation for use with setMany.
 * @returns A DocumentOperation that can be passed to setMany.
 */
export declare function buildUpdatePlaylists(playlistId: string, data: PlaylistsRequestUpdate): DocumentOperation;
/**
 * Owner only. createdBy cannot be reassigned to another wallet. (Update Single Item)
 * @returns A boolean indicating whether the operation succeeded (true) or failed (false). Always check this value to confirm the update worked.
 */
export declare function updatePlaylists(playlistId: string, data: PlaylistsRequestUpdate): Promise<boolean>;
/**
 *
  Read Operation Details: Owner only (createdBy == @user.address).
   (Get Single Item)
 */
export declare function getPlaylists(playlistId: string): Promise<PlaylistsResponse | null>;
/**
 * Subscribes to changes in a single Playlists document. (
  Read Operation Details: Owner only (createdBy == @user.address).
  )
 */
export declare function subscribePlaylists(callback: (data: PlaylistsResponse | null) => void, playlistId: string): Promise<() => Promise<void>>;
/**
 * Get many Playlists items from collection playlists
 
  Read Operation Details: Owner only (createdBy == @user.address).
  
 */
export declare function getManyPlaylists(filter?: string): Promise<PlaylistsResponse[]>;
/**
 * Subscribe to changes in Playlists collection at playlists
 
  Read Operation Details: Owner only (createdBy == @user.address).
  
 */
export declare function subscribeManyPlaylists(callback: (data: PlaylistsResponse[]) => void, filter?: string): Promise<() => Promise<void>>;
/**
 * Get all Playlists items from collection playlists
 
  Read Operation Details: Owner only (createdBy == @user.address).
  
 */
export declare function getAllPlaylists(filter?: string): Promise<PlaylistsResponse[]>;
/**
 * Subscribe to changes in Playlists collection at playlists
 
  Read Operation Details: Owner only (createdBy == @user.address).
  
 */
export declare function subscribeAllPlaylists(callback: (data: PlaylistsResponse[]) => void, filter?: string): Promise<() => Promise<void>>;
/**
 *
  Delete Operation Details: Owner only (createdBy == @user.address).
   (Delete Single Item)
 * @returns A boolean indicating whether the operation succeeded (true) or failed (false). Always check this value to confirm the delete worked.
 */
export declare function deletePlaylists(playlistId: string): Promise<boolean>;
/**
 * Build a delete operation for Playlists for use with setMany.
 * @returns A DocumentOperation that can be passed to setMany.
 */
export declare function buildDeletePlaylists(playlistId: string): DocumentOperation;
/**
 * A song entry within a playlist. Owner is inherited from the parent playlist (createdBy == @user.address). Use $entryId = songId to keep one entry per song.
 */
export interface PlaylistsPlaylistSongsRequest {
    songId: string;
    position: number | TimeOperation | IncrementOperation | TokenAmount;
    addedAt: number | TimeOperation | IncrementOperation | TokenAmount;
}
export interface PlaylistsPlaylistSongsResponse {
    songId: string;
    position: number;
    addedAt: number;
    id: string;
    tarobase_created_at: number;
}
/**
 * Build a PlaylistsPlaylistSongs operation for use with setMany.
 * @returns A DocumentOperation that can be passed to setMany.
 */
export declare function buildPlaylistsPlaylistSongs(playlistId: string, entryId: string, data: PlaylistsPlaylistSongsRequest): DocumentOperation;
/**
 * Owner of the parent playlist only (playlist.createdBy == @user.address). songId references a song; position orders the entry; addedAt is Unix seconds. (Create/Update Single Item)
 * @returns A boolean indicating whether the operation succeeded (true) or failed (false). Always check this value to confirm the write worked.
 */
export declare function setPlaylistsPlaylistSongs(playlistId: string, entryId: string, data: PlaylistsPlaylistSongsRequest): Promise<boolean>;
export type PlaylistsPlaylistSongsRequestUpdate = Partial<PlaylistsPlaylistSongsRequest>;
/**
 * Build a PlaylistsPlaylistSongs update operation for use with setMany.
 * @returns A DocumentOperation that can be passed to setMany.
 */
export declare function buildUpdatePlaylistsPlaylistSongs(playlistId: string, entryId: string, data: PlaylistsPlaylistSongsRequestUpdate): DocumentOperation;
/**
 * Owner of the parent playlist only (e.g. to reorder position). (Update Single Item)
 * @returns A boolean indicating whether the operation succeeded (true) or failed (false). Always check this value to confirm the update worked.
 */
export declare function updatePlaylistsPlaylistSongs(playlistId: string, entryId: string, data: PlaylistsPlaylistSongsRequestUpdate): Promise<boolean>;
/**
 *
  Read Operation Details: Owner of the parent playlist only.
   (Get Single Item)
 */
export declare function getPlaylistsPlaylistSongs(playlistId: string, entryId: string): Promise<PlaylistsPlaylistSongsResponse | null>;
/**
 * Subscribes to changes in a single PlaylistsPlaylistSongs document. (
  Read Operation Details: Owner of the parent playlist only.
  )
 */
export declare function subscribePlaylistsPlaylistSongs(callback: (data: PlaylistsPlaylistSongsResponse | null) => void, playlistId: string, entryId: string): Promise<() => Promise<void>>;
/**
 * Get many PlaylistsPlaylistSongs items from collection playlists/${playlistId}/playlistSongs
 
  Read Operation Details: Owner of the parent playlist only.
  
 */
export declare function getManyPlaylistsPlaylistSongs(playlistId: string, filter?: string): Promise<PlaylistsPlaylistSongsResponse[]>;
/**
 * Subscribe to changes in PlaylistsPlaylistSongs collection at playlists/${playlistId}/playlistSongs
 
  Read Operation Details: Owner of the parent playlist only.
  
 */
export declare function subscribeManyPlaylistsPlaylistSongs(callback: (data: PlaylistsPlaylistSongsResponse[]) => void, playlistId: string, filter?: string): Promise<() => Promise<void>>;
/**
 * Get all PlaylistsPlaylistSongs items from collection playlists/${playlistId}/playlistSongs
 
  Read Operation Details: Owner of the parent playlist only.
  
 */
export declare function getAllPlaylistsPlaylistSongs(playlistId: string, filter?: string): Promise<PlaylistsPlaylistSongsResponse[]>;
/**
 * Subscribe to changes in PlaylistsPlaylistSongs collection at playlists/${playlistId}/playlistSongs
 
  Read Operation Details: Owner of the parent playlist only.
  
 */
export declare function subscribeAllPlaylistsPlaylistSongs(callback: (data: PlaylistsPlaylistSongsResponse[]) => void, playlistId: string, filter?: string): Promise<() => Promise<void>>;
/**
 *
  Delete Operation Details: Owner of the parent playlist only (removes the song from the playlist).
   (Delete Single Item)
 * @returns A boolean indicating whether the operation succeeded (true) or failed (false). Always check this value to confirm the delete worked.
 */
export declare function deletePlaylistsPlaylistSongs(playlistId: string, entryId: string): Promise<boolean>;
/**
 * Build a delete operation for PlaylistsPlaylistSongs for use with setMany.
 * @returns A DocumentOperation that can be passed to setMany.
 */
export declare function buildDeletePlaylistsPlaylistSongs(playlistId: string, entryId: string): DocumentOperation;
