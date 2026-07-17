import { TimeOperation, IncrementOperation, TokenAmount, AddressType, DocumentOperation } from '../db-client';
/**
 * An uploaded study document (pdf/docx/txt/text). Owner-scoped: only uploadedBy == @user.address can read/create/update/delete.
 */
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
