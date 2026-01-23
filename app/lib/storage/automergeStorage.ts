/**
 * Automerge Repo implementation for storage operations
 * Uses Automerge Repo for proper document management, persistence, and sync
 *
 * Components should use the React hooks (useDocument) for reading/writing data.
 * This module focuses on export/import/clear operations and provides the repo instance.
 */

import {
  Repo,
  BroadcastChannelNetworkAdapter,
  IndexedDBStorageAdapter,
} from "@automerge/react";
import type { DocHandle, DocumentId } from "@automerge/automerge-repo";
import * as Automerge from "@automerge/automerge";
import type {
  AppData,
  FamilyMember,
  FamilyMemberCreate,
  Vaccine,
  VaccineRecord,
  VaccineRecordCreate,
} from "../types";
import type { IStorage } from "./interface";

const STORAGE_VERSION = "1.0.0";
const DOCUMENT_URL_KEY = "vaccine-manager-document-url";

// Lazy-initialized Repo instance (browser-only)
let repoInstance: Repo | null = null;

/**
 * Get or create the Repo instance (lazy initialization for browser-only)
 * Now includes BroadcastChannel for cross-tab sync
 */
export function getRepo(): Repo {
  if (typeof window === "undefined") {
    throw new Error("Repo can only be initialized in browser context");
  }

  if (!repoInstance) {
    repoInstance = new Repo({
      storage: new IndexedDBStorageAdapter(),
      network: [new BroadcastChannelNetworkAdapter()], // Enables cross-tab sync
    });
  }

  return repoInstance;
}

// Export a getter for the repo (for backward compatibility)
export const repo = typeof window !== "undefined" ? getRepo() : (null as any);

/**
 * Get or initialize the document URL
 * This function ensures a document exists and returns its URL for use with useDocument()
 */
export async function getOrCreateDocumentUrl(): Promise<DocumentId> {
  if (typeof window === "undefined") {
    throw new Error("Cannot access document in SSR context");
  }

  // Check if we have a stored document URL
  const storedUrl = localStorage.getItem(DOCUMENT_URL_KEY);

  const currentRepo = getRepo();

  if (storedUrl) {
    // Just return the stored URL - the repo will handle loading it
    return storedUrl as DocumentId;
  }

  // Create new document if none exists
  const handle = currentRepo.create<AppData>();
  handle.change((doc) => {
    Object.assign(doc, getDefaultData());
  });

  // Store the document URL for future sessions
  localStorage.setItem(DOCUMENT_URL_KEY, handle.url);

  return handle.url as unknown as DocumentId;
}

/**
 * Get default data structure for a new document
 */
function getDefaultData(): AppData {
  return {
    version: STORAGE_VERSION,
    familyMembers: [],
    vaccines: getDefaultVaccines(),
    vaccineRecords: [],
    lastModified: new Date().toISOString(),
  };
}

/**
 * Get default vaccines for a new document
 */
function getDefaultVaccines(): Vaccine[] {
  return [
    {
      id: crypto.randomUUID(),
      name: "COVID-19",
      description: "COVID-19 vaccine (any manufacturer)",
    },
    {
      id: crypto.randomUUID(),
      name: "Seasonal Flu",
      description: "Annual influenza vaccine",
    },
    {
      id: crypto.randomUUID(),
      name: "Tdap",
      description: "Tetanus, diphtheria, and pertussis vaccine",
    },
  ];
}

export class AutomergeStorageAdapter implements IStorage {
  private handle: DocHandle<AppData> | null = null;
  private initPromise: Promise<void>;

  constructor() {
    // Initialize document handle
    this.initPromise = this.initializeDocument();
  }

  private async initializeDocument(): Promise<void> {
    if (typeof window === "undefined") {
      return; // SSR fallback
    }

    const currentRepo = getRepo();

    // Check if we have a stored document URL
    const storedUrl = localStorage.getItem(DOCUMENT_URL_KEY);

    if (storedUrl) {
      // Find the existing document - find() returns a Promise in v2
      this.handle = await currentRepo.find<AppData>(storedUrl as any);
      return;
    }

    // Create new document if none exists
    this.handle = currentRepo.create<AppData>();
    this.handle.change((doc) => {
      Object.assign(doc, getDefaultData());
    });

    // Store the document URL for future sessions
    localStorage.setItem(DOCUMENT_URL_KEY, this.handle.url);
  }

  /**
   * Get the document URL for use with React hooks
   */
  async getDocumentUrl(): Promise<DocumentId | null> {
    await this.ensureReady();
    return (this.handle?.url as unknown as DocumentId) || null;
  }

  private async ensureReady(): Promise<void> {
    await this.initPromise;
    if (!this.handle) {
      throw new Error("Document handle not initialized");
    }
    // Wait for the document to be ready using the handle's doc() method
    // which will wait until the document is loaded from storage or network
    try {
      await this.handle.doc();
    } catch (error) {
      console.error("Error ensuring document ready:", error);
      throw error;
    }
  }

  private getDoc(): AppData {
    if (!this.handle) {
      throw new Error("Document handle not initialized");
    }
    const doc = this.handle.docSync();
    if (!doc) {
      throw new Error("Document not loaded");
    }
    return doc;
  }

  // NOTE: Read and write operations are now handled by useDocument() React hook.
  // These legacy methods remain for backward compatibility but are deprecated.
  // Components should use useDocument() directly instead.

  async getData(): Promise<AppData> {
    await this.ensureReady();
    const doc = this.getDoc();
    return JSON.parse(JSON.stringify(doc));
  }

  async getFamilyMembers(): Promise<FamilyMember[]> {
    await this.ensureReady();
    const doc = this.getDoc();
    return JSON.parse(JSON.stringify(doc.familyMembers));
  }

  async getFamilyMember(id: string): Promise<FamilyMember | null> {
    await this.ensureReady();
    const doc = this.getDoc();
    const member = doc.familyMembers.find((m) => m.id === id);
    return member ? JSON.parse(JSON.stringify(member)) : null;
  }

  async getVaccines(): Promise<Vaccine[]> {
    await this.ensureReady();
    const doc = this.getDoc();
    return JSON.parse(JSON.stringify(doc.vaccines));
  }

  async getVaccine(id: string): Promise<Vaccine | null> {
    await this.ensureReady();
    const doc = this.getDoc();
    const vaccine = doc.vaccines.find((v) => v.id === id);
    return vaccine ? JSON.parse(JSON.stringify(vaccine)) : null;
  }

  async getVaccineRecords(familyMemberId?: string): Promise<VaccineRecord[]> {
    await this.ensureReady();
    const doc = this.getDoc();
    const records = familyMemberId
      ? doc.vaccineRecords.filter((r) => r.familyMemberId === familyMemberId)
      : doc.vaccineRecords;
    return JSON.parse(JSON.stringify(records));
  }

  async getVaccineRecord(id: string): Promise<VaccineRecord | null> {
    await this.ensureReady();
    const doc = this.getDoc();
    const record = doc.vaccineRecords.find((r) => r.id === id);
    return record ? JSON.parse(JSON.stringify(record)) : null;
  }

  async addFamilyMember(member: FamilyMemberCreate): Promise<FamilyMember> {
    await this.ensureReady();

    const now = new Date().toISOString();
    const newMember: FamilyMember = {
      ...member,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    this.handle!.change((doc) => {
      doc.familyMembers.push(newMember);
      doc.lastModified = now;
    });

    return JSON.parse(JSON.stringify(newMember));
  }

  async updateFamilyMember(
    id: string,
    updates: Partial<FamilyMemberCreate>,
  ): Promise<FamilyMember> {
    await this.ensureReady();
    const doc = this.getDoc();

    const index = doc.familyMembers.findIndex((m) => m.id === id);
    if (index === -1) {
      throw new Error(`Family member with id ${id} not found`);
    }

    const now = new Date().toISOString();

    this.handle!.change((doc) => {
      const member = doc.familyMembers[index];
      Object.assign(member, updates);
      member.updatedAt = now;
      doc.lastModified = now;
    });

    const updated = this.getDoc().familyMembers[index];
    return JSON.parse(JSON.stringify(updated));
  }

  async deleteFamilyMember(id: string): Promise<void> {
    await this.ensureReady();

    this.handle!.change((doc) => {
      // Remove family member
      const memberIndex = doc.familyMembers.findIndex((m) => m.id === id);
      if (memberIndex !== -1) {
        doc.familyMembers.splice(memberIndex, 1);
      }

      // Remove associated vaccine records
      doc.vaccineRecords = doc.vaccineRecords.filter(
        (r) => r.familyMemberId !== id,
      );

      doc.lastModified = new Date().toISOString();
    });
  }

  async addVaccineRecord(record: VaccineRecordCreate): Promise<VaccineRecord> {
    await this.ensureReady();

    const now = new Date().toISOString();
    const newRecord: VaccineRecord = {
      ...record,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    this.handle!.change((doc) => {
      doc.vaccineRecords.push(newRecord);
      doc.lastModified = now;
    });

    return JSON.parse(JSON.stringify(newRecord));
  }

  async updateVaccineRecord(
    id: string,
    updates: Partial<VaccineRecordCreate>,
  ): Promise<VaccineRecord> {
    await this.ensureReady();
    const doc = this.getDoc();

    const index = doc.vaccineRecords.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error(`Vaccine record with id ${id} not found`);
    }

    const now = new Date().toISOString();

    this.handle!.change((doc) => {
      const record = doc.vaccineRecords[index];
      Object.assign(record, updates);
      record.updatedAt = now;
      doc.lastModified = now;
    });

    const updated = this.getDoc().vaccineRecords[index];
    return JSON.parse(JSON.stringify(updated));
  }

  async deleteVaccineRecord(id: string): Promise<void> {
    await this.ensureReady();

    this.handle!.change((doc) => {
      const index = doc.vaccineRecords.findIndex((r) => r.id === id);
      if (index !== -1) {
        doc.vaccineRecords.splice(index, 1);
      }
      doc.lastModified = new Date().toISOString();
    });
  }

  // Utility operations
  async clear(): Promise<void> {
    await this.ensureReady();

    if (typeof window === "undefined") {
      return;
    }

    // Reset document to default data
    this.handle!.change((doc) => {
      const defaultData = getDefaultData();
      doc.familyMembers = defaultData.familyMembers;
      doc.vaccines = defaultData.vaccines;
      doc.vaccineRecords = defaultData.vaccineRecords;
      doc.version = defaultData.version;
      doc.lastModified = defaultData.lastModified;
    });

    // Clear the stored document URL to create fresh document on next load
    localStorage.removeItem(DOCUMENT_URL_KEY);
  }

  // Primary export (CRDT binary - importable and mergeable)
  async export(): Promise<Uint8Array> {
    await this.ensureReady();

    // Export the full document including all CRDT history
    const doc = this.handle!.docSync();
    if (!doc) {
      throw new Error("Document not ready for export");
    }

    return Automerge.save(doc);
  }

  // Import CRDT data and merge with existing document
  async import(data: Uint8Array | ArrayBuffer): Promise<void> {
    await this.ensureReady();

    try {
      const binary = data instanceof ArrayBuffer ? new Uint8Array(data) : data;

      // Load the imported document
      const importedDoc = Automerge.load<AppData>(binary);

      // Get current document
      const currentDoc = this.handle!.docSync();
      if (!currentDoc) {
        throw new Error("Current document not ready");
      }

      // Merge documents using Automerge.merge
      const mergedDoc = Automerge.merge(currentDoc, importedDoc);

      // Create a new document with the merged data
      // Note: We need to replace the entire handle with the merged document
      const oldUrl = this.handle!.url;

      const currentRepo = getRepo();

      // Create new handle with merged document
      const newHandle = currentRepo.create<AppData>();
      newHandle.change((doc) => {
        Object.assign(doc, JSON.parse(JSON.stringify(mergedDoc)));
      });

      // Update reference and store new URL
      this.handle = newHandle;
      localStorage.setItem(DOCUMENT_URL_KEY, newHandle.url);
    } catch (error) {
      throw new Error(
        `Failed to import CRDT data. Make sure you're importing a .crdt file, not a .json file. ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  // Secondary export (JSON - human-readable, NOT importable)
  async exportJSON(): Promise<string> {
    await this.ensureReady();
    const doc = this.getDoc();

    const plainData = JSON.parse(JSON.stringify(doc));
    plainData.exportedAt = new Date().toISOString();
    return JSON.stringify(plainData, null, 2);
  }
}
