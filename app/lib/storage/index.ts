/**
 * Storage exports - single source of truth for storage implementation
 */

import {
  AutomergeStorageAdapter,
  getRepo,
  getOrCreateDocumentUrl,
} from "./automergeStorage";
import type { IStorage } from "./interface";

// Singleton instance - using CRDT storage for conflict-free merging
// Lazy initialization to prevent module-level instantiation during build
let storageInstance: IStorage | null = null;

function getStorageInstance(): IStorage {
  if (typeof window === "undefined") {
    throw new Error("Storage can only be initialized in browser context");
  }
  if (!storageInstance) {
    storageInstance = new AutomergeStorageAdapter();
  }
  return storageInstance;
}

// Use a Proxy to lazily initialize storage on first access
export const storage = new Proxy({} as IStorage, {
  get(_, prop) {
    return getStorageInstance()[prop as keyof IStorage];
  },
});

// Export repo getter and document URL helper for React hooks
export { getRepo, getOrCreateDocumentUrl };

/**
 * Set a custom storage implementation (useful for testing or swapping backends)
 */
export function setStorageImplementation(impl: IStorage): void {
  storageInstance = impl;
}

// Re-export types
export type { IStorage } from "./interface";
