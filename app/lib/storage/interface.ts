/**
 * Storage interface - implement this to create different storage backends
 * (LocalStorage, IndexedDB, Cloudflare KV, Durable Objects, etc.)
 */

import type {
  AppData,
  FamilyMember,
  FamilyMemberCreate,
  Vaccine,
  VaccineRecord,
  VaccineRecordCreate,
} from "../types";

export interface IStorage {
  // Read operations
  getData(): Promise<AppData>;
  getFamilyMembers(): Promise<FamilyMember[]>;
  getFamilyMember(id: string): Promise<FamilyMember | null>;
  getVaccines(): Promise<Vaccine[]>;
  getVaccine(id: string): Promise<Vaccine | null>;
  getVaccineRecords(familyMemberId?: string): Promise<VaccineRecord[]>;
  getVaccineRecord(id: string): Promise<VaccineRecord | null>;

  // Write operations - Family Members
  addFamilyMember(member: FamilyMemberCreate): Promise<FamilyMember>;
  updateFamilyMember(
    id: string,
    updates: Partial<FamilyMemberCreate>,
  ): Promise<FamilyMember>;
  deleteFamilyMember(id: string): Promise<void>;

  // Write operations - Vaccine Records
  addVaccineRecord(record: VaccineRecordCreate): Promise<VaccineRecord>;
  updateVaccineRecord(
    id: string,
    updates: Partial<VaccineRecordCreate>,
  ): Promise<VaccineRecord>;
  deleteVaccineRecord(id: string): Promise<void>;

  // Utility operations
  clear(): Promise<void>;

  // Primary export/import (CRDT binary - mergeable)
  export(): Promise<Uint8Array>;
  import(data: Uint8Array | ArrayBuffer): Promise<void>;

  // Secondary export (JSON - human-readable, NOT importable)
  exportJSON(): Promise<string>;
}
