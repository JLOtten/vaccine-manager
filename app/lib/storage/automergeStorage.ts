/**
 * Automerge Repo implementation of the IStorage interface
 * Uses Automerge Repo for proper document management, persistence, and sync
 */

import { Repo } from "@automerge/automerge-repo";
import { IndexedDBStorageAdapter } from "@automerge/automerge-repo-storage-indexeddb";
import type { DocHandle } from "@automerge/automerge-repo";
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

export class AutomergeStorageAdapter implements IStorage {
  private repo: Repo;
  private handle: DocHandle<AppData> | null = null;
  private initPromise: Promise<void>;

  constructor() {
    // Initialize Repo with IndexedDB storage
    this.repo = new Repo({
      storage: new IndexedDBStorageAdapter(),
      network: [], // No network sync for now
    });

    // Initialize document handle
    this.initPromise = this.initializeDocument();
  }

  private async initializeDocument(): Promise<void> {
    if (typeof window === "undefined") {
      return; // SSR fallback
    }

    // Check if we have a stored document URL
    const storedUrl = localStorage.getItem(DOCUMENT_URL_KEY);

    if (storedUrl) {
      try {
        // Try to load existing document
        this.handle = this.repo.find<AppData>(storedUrl as any);
        await this.handle.whenReady();
        
        // Verify the document loaded successfully
        if (this.handle.docSync()) {
          return;
        }
      } catch (error) {
        console.error("Failed to load existing document:", error);
      }
    }

    // Create new document if none exists or loading failed
    this.handle = this.repo.create<AppData>();
    this.handle.change((doc) => {
      Object.assign(doc, this.getDefaultData());
    });

    // Store the document URL for future sessions
    localStorage.setItem(DOCUMENT_URL_KEY, this.handle.url);
    await this.handle.whenReady();
  }

  private async ensureReady(): Promise<void> {
    await this.initPromise;
    if (!this.handle) {
      throw new Error("Document handle not initialized");
    }
    await this.handle.whenReady();
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

  private getDefaultData(): AppData {
    return {
      version: STORAGE_VERSION,
      familyMembers: [],
      vaccines: this.getDefaultVaccines(),
      vaccineRecords: [],
      lastModified: new Date().toISOString(),
    };
  }

  private getDefaultVaccines(): Vaccine[] {
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

  // Read operations
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

  // Write operations - Family Members
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
    updates: Partial<FamilyMemberCreate>
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
        (r) => r.familyMemberId !== id
      );

      doc.lastModified = new Date().toISOString();
    });
  }

  // Write operations - Vaccine Records
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
    updates: Partial<VaccineRecordCreate>
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
      const defaultData = this.getDefaultData();
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
      
      // Create new handle with merged document
      const newHandle = this.repo.create<AppData>();
      newHandle.change((doc) => {
        Object.assign(doc, JSON.parse(JSON.stringify(mergedDoc)));
      });
      
      // Update reference and store new URL
      this.handle = newHandle;
      localStorage.setItem(DOCUMENT_URL_KEY, newHandle.url);
      
      await this.handle.whenReady();
    } catch (error) {
      throw new Error(
        `Failed to import CRDT data. Make sure you're importing a .crdt file, not a .json file. ${
          error instanceof Error ? error.message : "Unknown error"
        }`
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
