/**
 * Data types for the Vaccine Manager application
 */

export interface FamilyMember {
  id: string;
  name: string;
  birthdate: string; // ISO date string (YYYY-MM-DD)
  sex?: "Male" | "Female" | "Other";
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
}

export interface Vaccine {
  id: string;
  name: string;
  description?: string;
}

export interface VaccineRecord {
  id: string;
  familyMemberId: string;
  vaccineId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  location: string;
  dosage?: string;
  notes?: string;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
  isDeleted?: boolean; // Soft delete flag
  deletedAt?: string; // ISO datetime string when deleted
}

export interface AppData {
  version: string;
  familyMembers: FamilyMember[];
  vaccines: Vaccine[];
  vaccineRecords: VaccineRecord[];
  lastModified: string; // ISO datetime string
  exportedAt?: string; // ISO datetime string
}

// Omit helper types for creating new records
export type FamilyMemberCreate = Omit<
  FamilyMember,
  "id" | "createdAt" | "updatedAt"
>;
export type VaccineRecordCreate = Omit<
  VaccineRecord,
  "id" | "createdAt" | "updatedAt"
>;
