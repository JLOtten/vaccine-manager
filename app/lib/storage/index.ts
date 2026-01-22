/**
 * Storage exports - single source of truth for storage implementation
 */

import { LocalStorageAdapter } from "./localStorage";
import type { IStorage } from "./interface";

// Singleton instance - can be swapped for different implementations
let storageInstance: IStorage = new LocalStorageAdapter();

export const storage = storageInstance;

/**
 * Set a custom storage implementation (useful for testing or swapping backends)
 */
export function setStorageImplementation(impl: IStorage): void {
  storageInstance = impl;
}

// Re-export types
export type { IStorage } from "./interface";
