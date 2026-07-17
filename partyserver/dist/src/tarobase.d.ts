import type { GetManyResult } from '@pooflabs/server';
import { PublicKey } from '@solana/web3.js';
/**
 * Time utility for server-time values
 *
 * Use this when you want to store the current server time in a numeric field
 *
 * Example:
 * // For a schema with { createdAt: "UInt" }
 * await setPost("123", {
 *   title: "My Post",
 *   createdAt: Time.Now  // Will be stored as the server's current timestamp
 * });
 *
 * Note: Time.Now requires a UInt field. Int (signed) is rejected both offchain
 * and onchain (utils.rs InvalidTypeForTimestamp).
 */
export interface TimeOperation {
    operation: string;
    value: string;
}
/**
 * Increment utility for incrementing/decrementing numeric fields
 *
 * Use this when you want to increment or decrement a numeric field by a specific amount
 *
 * Example:
 * // For a schema with { viewCount: "UInt" } or { balance: "Int" }
 * await updatePost("123", {
 *   viewCount: Increment.by(1)  // Increments viewCount by 1
 * });
 * await updateAccount("456", {
 *   balance: Increment.by(-50)  // Decrements balance by 50
 * });
 */
export interface IncrementOperation {
    operation: string;
    value: number;
}
export type TokenName = 'USDC' | 'SOL' | 'pSOL' | 'other';
export interface TokenAmount {
    type: 'token';
    name: TokenName;
    amount: number;
}
/**
 * AddressType represents a Solana public key for use in request data.
 */
export interface AddressType {
    type: 'address';
    publicKey: PublicKey | string;
}
export declare const Token: {
    /**
     * Creates a TokenAmount object representing a specific amount of a token.
     * @param name The name of the token (e.g., 'USDC', 'SOL', 'pSOL').
     * @param amount The user-friendly amount (e.g., 10.5 for 10.5 USDC).
     */
    amount: (name: TokenName, amount: number) => TokenAmount;
    /**
     * Converts a TokenAmount object back to its integer representation based on decimals.
     * Useful if you need the raw integer value on the client side.
     */
    convert: (amount: TokenAmount) => number;
};
export declare const Time: {
    /**
     * Represents the server's current time. Use this value for 'UInt' fields only
     * in request data where you want the server to insert the timestamp.
     * (Onchain and offchain both require UInt — Int is rejected with InvalidTypeForTimestamp.)
     */
    Now: TimeOperation;
};
export declare const Increment: {
    /**
     * Creates an increment/decrement operation for numeric fields.
     * Use positive values to increment, negative values to decrement.
     * @param value The amount to increment (positive) or decrement (negative)
     *
     * Example:
     * // Increment a counter by 1
     * await updatePost("123", { viewCount: Increment.by(1) });
     *
     * // Decrement a balance by 50
     * await updateAccount("456", { balance: Increment.by(-50) });
     */
    by: (value: number) => IncrementOperation;
};
export declare const Address: {
    /**
     * Creates an AddressType object from a PublicKey instance or a base58 string.
     * Validates the input and throws an error if invalid.
     * Special case: 'solana' is allowed as a reserved string representing native SOL.
     * @param key A PublicKey instance, a base58 encoded public key string, or 'solana' for native SOL.
     */
    publicKey: (key: PublicKey | string) => AddressType;
};
/**
 * Common metadata fields added by TaroBase to document responses.
 */
export interface TarobaseMetadata {
    id: string;
    tarobase_created_at: number;
}
/**
 * Represents a file stored in TaroBase Storage.
 */
export interface FileItem {
    path: string;
    url: string;
}
/**
 * Represents a document operation for use with setMany.
 * Used by build functions to create properly typed operations.
 */
export interface DocumentOperation {
    path: string;
    document: any;
}
/**
 * Execute multiple document operations in a single batch.
 * @param operations Array of DocumentOperation objects created by build functions
 * @returns Promise resolving to the result of the batch operation
 */
export declare function setMany(operations: DocumentOperation[]): Promise<any>;
/**
 * Batch read multiple documents by their full paths in a single request.
 * Much faster than multiple individual get() calls — single network round trip.
 * Returns results in the same order as input paths. Max 30 paths per request.
 * Each result has { path, data, error? } — one failure doesn't break the batch.
 *
 * ALWAYS use this instead of multiple get() calls when reading 2+ documents by path.
 *
 * @param paths Array of full document paths (e.g., ["players/abc", "settings/abc"])
 * @example
 * const [profile, settings, stats] = await getMany([
 *   "profiles/" + walletAddress,
 *   "settings/" + walletAddress,
 *   "stats/" + walletAddress,
 * ]);
 * if (profile.data) { // use profile data }
 */
export declare function getMany(paths: string[]): Promise<GetManyResult[]>;
/**
 * Safely format an error for logging (avoids [object Object] in logs)
 * Handles circular references, empty messages, and non-Error objects
 * Always includes the full error object for comprehensive debugging
 */
export declare function formatError(error: unknown): string;
/**
 * Handles AdminFiles files (Get Single File based on its ID, null if not found)
 */
export declare function getAdminFiles(fileId: string): Promise<FileItem | null>;
/**
 * Handles AdminFiles files (Upload/Replace a File and persist it keyed by its ID) To get the file URL use the getAdminFiles function right after this one.
 * @returns A boolean indicating whether the upload succeeded (true) or failed (false). Always check this value to confirm the upload worked.
 */
export declare function uploadAdminFiles(fileId: string, file: File): Promise<boolean>;
/**
 * Handles AdminFiles files (Delete File based on its ID)
 * @returns A boolean indicating whether the delete succeeded (true) or failed (false). Always check this value to confirm the delete worked.
 */
export declare function deleteAdminFiles(fileId: string): Promise<boolean>;
/**
 * Handles AppFiles files (Get Single File based on its ID, null if not found)
 */
export declare function getAppFiles(fileId: string): Promise<FileItem | null>;
/**
 * Handles AppFiles files (Upload/Replace a File and persist it keyed by its ID) To get the file URL use the getAppFiles function right after this one.
 * @returns A boolean indicating whether the upload succeeded (true) or failed (false). Always check this value to confirm the upload worked.
 */
export declare function uploadAppFiles(fileId: string, file: File): Promise<boolean>;
/**
 * Handles AppFiles files (Delete File based on its ID)
 * @returns A boolean indicating whether the delete succeeded (true) or failed (false). Always check this value to confirm the delete worked.
 */
export declare function deleteAppFiles(fileId: string): Promise<boolean>;
export interface CommonQueriesRequest {
}
export interface CommonQueriesResponse {
    id: string;
    tarobase_created_at: number;
}
/**
 *
  Read Operation Details: Anyone can use these queries: (1) Balance queries - check SOL, USDC, or any SPL token balance for any wallet address. (2) Jupiter swap quotes - get expected output amounts for token swaps via Jupiter aggregator. (3) Meteora swap quotes - get expected output amounts for Meteora dynamic bonding curve pools.
   (Get Single Item)
 */
export declare function getCommonQueries(queryId: string): Promise<CommonQueriesResponse | null>;
/**
 * Subscribes to changes in a single CommonQueries document. (
  Read Operation Details: Anyone can use these queries: (1) Balance queries - check SOL, USDC, or any SPL token balance for any wallet address. (2) Jupiter swap quotes - get expected output amounts for token swaps via Jupiter aggregator. (3) Meteora swap quotes - get expected output amounts for Meteora dynamic bonding curve pools.
  )
 */
export declare function subscribeCommonQueries(callback: (data: CommonQueriesResponse | null) => void, queryId: string): Promise<() => Promise<void>>;
/**
 * Get many CommonQueries items from collection commonQueries
 
  Read Operation Details: Anyone can use these queries: (1) Balance queries - check SOL, USDC, or any SPL token balance for any wallet address. (2) Jupiter swap quotes - get expected output amounts for token swaps via Jupiter aggregator. (3) Meteora swap quotes - get expected output amounts for Meteora dynamic bonding curve pools.
  
 */
export declare function getManyCommonQueries(filter?: string): Promise<CommonQueriesResponse[]>;
/**
 * Subscribe to changes in CommonQueries collection at commonQueries
 
  Read Operation Details: Anyone can use these queries: (1) Balance queries - check SOL, USDC, or any SPL token balance for any wallet address. (2) Jupiter swap quotes - get expected output amounts for token swaps via Jupiter aggregator. (3) Meteora swap quotes - get expected output amounts for Meteora dynamic bonding curve pools.
  
 */
export declare function subscribeManyCommonQueries(callback: (data: CommonQueriesResponse[]) => void, filter?: string): Promise<() => Promise<void>>;
/**
 * Get all CommonQueries items from collection commonQueries
 
  Read Operation Details: Anyone can use these queries: (1) Balance queries - check SOL, USDC, or any SPL token balance for any wallet address. (2) Jupiter swap quotes - get expected output amounts for token swaps via Jupiter aggregator. (3) Meteora swap quotes - get expected output amounts for Meteora dynamic bonding curve pools.
  
 */
export declare function getAllCommonQueries(filter?: string): Promise<CommonQueriesResponse[]>;
/**
 * Subscribe to changes in CommonQueries collection at commonQueries
 
  Read Operation Details: Anyone can use these queries: (1) Balance queries - check SOL, USDC, or any SPL token balance for any wallet address. (2) Jupiter swap quotes - get expected output amounts for token swaps via Jupiter aggregator. (3) Meteora swap quotes - get expected output amounts for Meteora dynamic bonding curve pools.
  
 */
export declare function subscribeAllCommonQueries(callback: (data: CommonQueriesResponse[]) => void, filter?: string): Promise<() => Promise<void>>;
/** Arguments accepted by the "solBalance" query on CommonQueries. */
interface CommonQueriesSolBalanceArgs {
    walletAddress: string;
}
/**
 * Runs the "solBalance" query on CommonQueries.
 * Description: Get SOL balance for a wallet address in lamports (1 SOL = 1,000,000,000 lamports). Pass walletAddress as parameter.
 * Query Logic: @TokenPlugin.getBalance(@newData.walletAddress, @constants.SOL)
 */
export declare function runSolBalanceQueryForCommonQueries(queryId: string, args: CommonQueriesSolBalanceArgs): Promise<number>;
/** Arguments accepted by the "usdcBalance" query on CommonQueries. */
interface CommonQueriesUsdcBalanceArgs {
    walletAddress: string;
}
/**
 * Runs the "usdcBalance" query on CommonQueries.
 * Description: Get USDC balance for a wallet address in base units (1 USDC = 1,000,000 base units with 6 decimals). Pass walletAddress as parameter.
 * Query Logic: @TokenPlugin.getBalance(@newData.walletAddress, @constants.USDC)
 */
export declare function runUsdcBalanceQueryForCommonQueries(queryId: string, args: CommonQueriesUsdcBalanceArgs): Promise<number>;
/** Arguments accepted by the "tokenBalance" query on CommonQueries. */
interface CommonQueriesTokenBalanceArgs {
    walletAddress: string;
    tokenMint: string;
}
/**
 * Runs the "tokenBalance" query on CommonQueries.
 * Description: Get balance for any SPL token mint for a wallet address. Pass walletAddress and tokenMint as parameters. Returns balance in the token's smallest units based on its decimals.
 * Query Logic: @TokenPlugin.getBalance(@newData.walletAddress, @newData.tokenMint)
 */
export declare function runTokenBalanceQueryForCommonQueries(queryId: string, args: CommonQueriesTokenBalanceArgs): Promise<number>;
/** Arguments accepted by the "jupiterSwapQuote" query on CommonQueries. */
interface CommonQueriesJupiterSwapQuoteArgs {
    inputMint: string;
    outputMint: string;
    amount: string;
}
/**
 * Runs the "jupiterSwapQuote" query on CommonQueries.
 * Description: Get a Jupiter swap quote for exchanging tokens. Pass inputMint (token to sell, use @constants.SOL for native SOL), outputMint (token to buy), and amount (in smallest units like lamports). Returns the expected output amount.
 * Query Logic: @DeFiPlugin.getSwapQuote(@newData.inputMint, @newData.outputMint, @newData.amount)
 */
export declare function runJupiterSwapQuoteQueryForCommonQueries(queryId: string, args: CommonQueriesJupiterSwapQuoteArgs): Promise<number>;
/** Arguments accepted by the "meteoraSwapQuote" query on CommonQueries. */
interface CommonQueriesMeteoraSwapQuoteArgs {
    tokenMintAddress: string;
    tokenToSwapInMintAddress: string;
    tokenAmount: string;
}
/**
 * Runs the "meteoraSwapQuote" query on CommonQueries.
 * Description: Get a Meteora dynamic bonding curve swap quote. Pass tokenMintAddress (the pool's base token), tokenToSwapInMintAddress (token to swap in, use @constants.SOL for native SOL), and tokenAmount (in smallest units). Returns the expected output amount.
 * Query Logic: @DeFiPlugin.getMeteoraSwapQuote(@newData.tokenMintAddress, @newData.tokenToSwapInMintAddress, @newData.tokenAmount)
 */
export declare function runMeteoraSwapQuoteQueryForCommonQueries(queryId: string, args: CommonQueriesMeteoraSwapQuoteArgs): Promise<number>;
export interface ProfilesRequest {
    address: AddressType;
    displayName: string;
    avatarUrl?: string;
    bio?: string;
    plan: string;
    createdAt: number | TimeOperation | IncrementOperation | TokenAmount;
}
export interface ProfilesResponse {
    address: string;
    displayName: string;
    avatarUrl?: string;
    bio?: string;
    plan: string;
    createdAt: number;
    id: string;
    tarobase_created_at: number;
}
/**
 * Build a Profiles operation for use with setMany.
 * @returns A DocumentOperation that can be passed to setMany.
 */
export declare function buildProfiles(profileId: string, data: ProfilesRequest): DocumentOperation;
/**
 * Authenticated users only. The address field must equal @user.address (users create only their own profile). createdAt is Unix seconds. (Create/Update Single Item)
 * @returns A boolean indicating whether the operation succeeded (true) or failed (false). Always check this value to confirm the write worked.
 */
export declare function setProfiles(profileId: string, data: ProfilesRequest): Promise<boolean>;
export type ProfilesRequestUpdate = Partial<ProfilesRequest>;
/**
 * Build a Profiles update operation for use with setMany.
 * @returns A DocumentOperation that can be passed to setMany.
 */
export declare function buildUpdateProfiles(profileId: string, data: ProfilesRequestUpdate): DocumentOperation;
/**
 * Owner only (existing address must equal @user.address). The address field cannot be changed to another wallet. (Update Single Item)
 * @returns A boolean indicating whether the operation succeeded (true) or failed (false). Always check this value to confirm the update worked.
 */
export declare function updateProfiles(profileId: string, data: ProfilesRequestUpdate): Promise<boolean>;
/**
 *
  Read Operation Details: Any authenticated user (wallet connected) can read profiles. Shows all fields.
   (Get Single Item)
 */
export declare function getProfiles(profileId: string): Promise<ProfilesResponse | null>;
/**
 * Subscribes to changes in a single Profiles document. (
  Read Operation Details: Any authenticated user (wallet connected) can read profiles. Shows all fields.
  )
 */
export declare function subscribeProfiles(callback: (data: ProfilesResponse | null) => void, profileId: string): Promise<() => Promise<void>>;
/**
 * Get many Profiles items from collection profiles
 
  Read Operation Details: Any authenticated user (wallet connected) can read profiles. Shows all fields.
  
 */
export declare function getManyProfiles(filter?: string): Promise<ProfilesResponse[]>;
/**
 * Subscribe to changes in Profiles collection at profiles
 
  Read Operation Details: Any authenticated user (wallet connected) can read profiles. Shows all fields.
  
 */
export declare function subscribeManyProfiles(callback: (data: ProfilesResponse[]) => void, filter?: string): Promise<() => Promise<void>>;
/**
 * Get all Profiles items from collection profiles
 
  Read Operation Details: Any authenticated user (wallet connected) can read profiles. Shows all fields.
  
 */
export declare function getAllProfiles(filter?: string): Promise<ProfilesResponse[]>;
/**
 * Subscribe to changes in Profiles collection at profiles
 
  Read Operation Details: Any authenticated user (wallet connected) can read profiles. Shows all fields.
  
 */
export declare function subscribeAllProfiles(callback: (data: ProfilesResponse[]) => void, filter?: string): Promise<() => Promise<void>>;
/**
 *
  Delete Operation Details: Owner only (address == @user.address).
   (Delete Single Item)
 * @returns A boolean indicating whether the operation succeeded (true) or failed (false). Always check this value to confirm the delete worked.
 */
export declare function deleteProfiles(profileId: string): Promise<boolean>;
/**
 * Build a delete operation for Profiles for use with setMany.
 * @returns A DocumentOperation that can be passed to setMany.
 */
export declare function buildDeleteProfiles(profileId: string): DocumentOperation;
export interface MaterialsRequest {
    title: string;
    fileType: string;
    fileUrl?: string;
    textContent?: string;
    sizeBytes?: number | TimeOperation | IncrementOperation | TokenAmount;
    uploadedBy: AddressType;
    status: string;
    createdAt: number | TimeOperation | IncrementOperation | TokenAmount;
}
export interface MaterialsResponse {
    title: string;
    fileType: string;
    fileUrl?: string;
    textContent?: string;
    sizeBytes?: number;
    uploadedBy: string;
    status: string;
    createdAt: number;
    id: string;
    tarobase_created_at: number;
}
/**
 * Build a Materials operation for use with setMany.
 * @returns A DocumentOperation that can be passed to setMany.
 */
export declare function buildMaterials(materialId: string, data: MaterialsRequest): DocumentOperation;
/**
 * Authenticated users only. uploadedBy must equal @user.address. createdAt is Unix seconds. (Create/Update Single Item)
 * @returns A boolean indicating whether the operation succeeded (true) or failed (false). Always check this value to confirm the write worked.
 */
export declare function setMaterials(materialId: string, data: MaterialsRequest): Promise<boolean>;
export type MaterialsRequestUpdate = Partial<MaterialsRequest>;
/**
 * Build a Materials update operation for use with setMany.
 * @returns A DocumentOperation that can be passed to setMany.
 */
export declare function buildUpdateMaterials(materialId: string, data: MaterialsRequestUpdate): DocumentOperation;
/**
 * Owner only. uploadedBy cannot be reassigned to another wallet. (Update Single Item)
 * @returns A boolean indicating whether the operation succeeded (true) or failed (false). Always check this value to confirm the update worked.
 */
export declare function updateMaterials(materialId: string, data: MaterialsRequestUpdate): Promise<boolean>;
/**
 *
  Read Operation Details: Owner only (uploadedBy == @user.address).
   (Get Single Item)
 */
export declare function getMaterials(materialId: string): Promise<MaterialsResponse | null>;
/**
 * Subscribes to changes in a single Materials document. (
  Read Operation Details: Owner only (uploadedBy == @user.address).
  )
 */
export declare function subscribeMaterials(callback: (data: MaterialsResponse | null) => void, materialId: string): Promise<() => Promise<void>>;
/**
 * Get many Materials items from collection materials
 
  Read Operation Details: Owner only (uploadedBy == @user.address).
  
 */
export declare function getManyMaterials(filter?: string): Promise<MaterialsResponse[]>;
/**
 * Subscribe to changes in Materials collection at materials
 
  Read Operation Details: Owner only (uploadedBy == @user.address).
  
 */
export declare function subscribeManyMaterials(callback: (data: MaterialsResponse[]) => void, filter?: string): Promise<() => Promise<void>>;
/**
 * Get all Materials items from collection materials
 
  Read Operation Details: Owner only (uploadedBy == @user.address).
  
 */
export declare function getAllMaterials(filter?: string): Promise<MaterialsResponse[]>;
/**
 * Subscribe to changes in Materials collection at materials
 
  Read Operation Details: Owner only (uploadedBy == @user.address).
  
 */
export declare function subscribeAllMaterials(callback: (data: MaterialsResponse[]) => void, filter?: string): Promise<() => Promise<void>>;
/**
 *
  Delete Operation Details: Owner only (uploadedBy == @user.address).
   (Delete Single Item)
 * @returns A boolean indicating whether the operation succeeded (true) or failed (false). Always check this value to confirm the delete worked.
 */
export declare function deleteMaterials(materialId: string): Promise<boolean>;
/**
 * Build a delete operation for Materials for use with setMany.
 * @returns A DocumentOperation that can be passed to setMany.
 */
export declare function buildDeleteMaterials(materialId: string): DocumentOperation;
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
export {};
