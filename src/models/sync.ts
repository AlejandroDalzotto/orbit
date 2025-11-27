import { Transaction } from "./transaction";

export interface SyncSession {
  pin: string;
  token?: string | null;
  createdAt: number;
  expiresAt: number;
  isActive: boolean;
  deviceName?: string | null;
}

export interface SyncAuthRequest {
  pin: string;
  deviceName: string;
}

export interface SyncAuthResponse {
  success: boolean;
  token?: string | null;
  expiresIn?: number | null; // seconds
  message: string;
}

export interface SyncDataPayload {
  transactions: Transaction[];
  deviceName: string;
  timestamp: number;
}

export interface SyncDataResponse {
  success: boolean;
  pendingApproval: boolean;
  conflicts: SyncConflict[];
  message: string;
}

export interface SyncConflict {
  conflictType: ConflictType;
  transactionId: string;
  description: string;
  suggestion?: string | null;
}

export type ConflictType =
  | {
      type: "insufficientBalance";
      accountId: string;
      accountName: string;
      currentBalance: number;
      required: number;
    }
  | {
      type: "unknownItem";
      itemName: string;
      suggestedMatches: ItemMatch[];
    }
  | {
      type: "duplicateTransaction";
    }
  | {
      type: "invalidAccount";
    };

export interface ItemMatch {
  itemId: string;
  name: string;
  brand?: string | null;
  similarityScore: number; // 0.0 - 1.0
}

export interface PendingSyncData {
  id: string;
  payload: SyncDataPayload;
  conflicts: SyncConflict[];
  receivedAt: number;
  deviceName: string;
}

export interface SyncApprovalRequest {
  syncId: string;
  approved: boolean;
  conflictResolutions: Record<string, ConflictResolution>;
}

export type ConflictResolution =
  | { type: "skipTransaction" }
  | { type: "adjustAmount"; newAmount: number }
  | { type: "mapItem"; itemId: string }
  | { type: "createNewItem" };
