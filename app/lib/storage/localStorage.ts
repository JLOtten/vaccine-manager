/**
 * LocalStorage implementation of the IStorage interface
 */

import type {
  AppData,
  FamilyMember,
  FamilyMemberCreate,
  Vaccine,
  VaccineRecord,
  VaccineRecordCreate,
} from "../types";
import { AppDataSchema } from "../schemas";
import type { IStorage } from "./interface";

const STORAGE_KEY = "vaccine-manager-data";
const STORAGE_VERSION = "1.0.0";

export class LocalStorageAdapter implements IStorage {
  private getStoredData(): AppData {
    if (typeof window === "undefined") {
      // SSR fallback
      return this.getDefaultData();
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return this.getDefaultData();
    }

    try {
      const parsed = JSON.parse(stored);
      // Validate with Zod schema
      return AppDataSchema.parse(parsed);
    } catch (error) {
      console.error("Invalid data in localStorage:", error);
      return this.getDefaultData();
    }
  }

  private saveData(data: AppData): void {
    if (typeof window === "undefined") {
      return; // Can't save on server
    }

    data.lastModified = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
    return this.getStoredData();
  }

  async getFamilyMembers(): Promise<FamilyMember[]> {
    const data = this.getStoredData();
    return data.familyMembers;
  }

  async getFamilyMember(id: string): Promise<FamilyMember | null> {
    const data = this.getStoredData();
    return data.familyMembers.find((m) => m.id === id) || null;
  }

  async getVaccines(): Promise<Vaccine[]> {
    const data = this.getStoredData();
    return data.vaccines;
  }

  async getVaccine(id: string): Promise<Vaccine | null> {
    const data = this.getStoredData();
    return data.vaccines.find((v) => v.id === id) || null;
  }

  async getVaccineRecords(familyMemberId?: string): Promise<VaccineRecord[]> {
    const data = this.getStoredData();
    if (familyMemberId) {
      return data.vaccineRecords.filter(
        (r) => r.familyMemberId === familyMemberId,
      );
    }
    return data.vaccineRecords;
  }

  async getVaccineRecord(id: string): Promise<VaccineRecord | null> {
    const data = this.getStoredData();
    return data.vaccineRecords.find((r) => r.id === id) || null;
  }

  // Write operations - Family Members
  async addFamilyMember(member: FamilyMemberCreate): Promise<FamilyMember> {
    const data = this.getStoredData();
    const now = new Date().toISOString();
    const newMember: FamilyMember = {
      ...member,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    data.familyMembers.push(newMember);
    this.saveData(data);
    return newMember;
  }

  async updateFamilyMember(
    id: string,
    updates: Partial<FamilyMemberCreate>,
  ): Promise<FamilyMember> {
    const data = this.getStoredData();
    const index = data.familyMembers.findIndex((m) => m.id === id);
    if (index === -1) {
      throw new Error(`Family member with id ${id} not found`);
    }
    const updated: FamilyMember = {
      ...data.familyMembers[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    data.familyMembers[index] = updated;
    this.saveData(data);
    return updated;
  }

  async deleteFamilyMember(id: string): Promise<void> {
    const data = this.getStoredData();
    data.familyMembers = data.familyMembers.filter((m) => m.id !== id);
    // Also delete associated vaccine records
    data.vaccineRecords = data.vaccineRecords.filter(
      (r) => r.familyMemberId !== id,
    );
    this.saveData(data);
  }

  // Write operations - Vaccine Records
  async addVaccineRecord(record: VaccineRecordCreate): Promise<VaccineRecord> {
    const data = this.getStoredData();
    const now = new Date().toISOString();
    const newRecord: VaccineRecord = {
      ...record,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    data.vaccineRecords.push(newRecord);
    this.saveData(data);
    return newRecord;
  }

  async updateVaccineRecord(
    id: string,
    updates: Partial<VaccineRecordCreate>,
  ): Promise<VaccineRecord> {
    const data = this.getStoredData();
    const index = data.vaccineRecords.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error(`Vaccine record with id ${id} not found`);
    }
    const updated: VaccineRecord = {
      ...data.vaccineRecords[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    data.vaccineRecords[index] = updated;
    this.saveData(data);
    return updated;
  }

  async deleteVaccineRecord(id: string): Promise<void> {
    const data = this.getStoredData();
    data.vaccineRecords = data.vaccineRecords.filter((r) => r.id !== id);
    this.saveData(data);
  }

  // Utility operations
  async clear(): Promise<void> {
    if (typeof window === "undefined") {
      return;
    }
    localStorage.removeItem(STORAGE_KEY);
  }

  async export(): Promise<string> {
    const data = this.getStoredData();
    data.exportedAt = new Date().toISOString();
    return JSON.stringify(data, null, 2);
  }

  async import(jsonString: string): Promise<void> {
    try {
      const parsed = JSON.parse(jsonString);
      const validated = AppDataSchema.parse(parsed);
      this.saveData(validated);
    } catch (error) {
      throw new Error(
        `Invalid import data: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}
