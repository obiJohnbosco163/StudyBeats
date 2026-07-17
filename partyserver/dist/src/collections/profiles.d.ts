import { TimeOperation, IncrementOperation, TokenAmount, AddressType, DocumentOperation } from '../db-client';
/**
 * User profile for StudyBeats AI. One per wallet. Readable by any authenticated user; only the owner (address == @user.address) can create/update/delete.
 */
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
