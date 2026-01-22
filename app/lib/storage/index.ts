/**
 * Storage exports - single source of truth for storage implementation
 */

import { AutomergeStorageAdapter } from "./automergeStorage";
import type { IStorage } from "./interface";

// Singleton instance - using CRDT storage for conflict-free merging
let storageInstance: IStorage = new AutomergeStorageAdapter();

export const storage = storageInstance;

/**
 * Set a custom storage implementation (useful for testing or swapping backends)
 */
export function setStorageImplementation(impl: IStorage): void {
  storageInstance = impl;
}

// Re-export types
export type { IStorage } from "./interface";
