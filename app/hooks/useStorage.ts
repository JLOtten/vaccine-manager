/**
 * Custom hooks for accessing storage
 */

import { useEffect, useState } from "react";
import { storage } from "~/lib/storage";
import type {
  FamilyMember,
  FamilyMemberCreate,
  Vaccine,
  VaccineRecord,
  VaccineRecordCreate,
} from "~/lib/types";

/**
 * Hook for managing family members
 */
export function useFamilyMembers() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await storage.getFamilyMembers();
      setMembers(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load family members"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const addMember = async (member: FamilyMemberCreate) => {
    try {
      const newMember = await storage.addFamilyMember(member);
      setMembers((prev) => [...prev, newMember]);
      return newMember;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to add family member";
      setError(message);
      throw new Error(message);
    }
  };

  const updateMember = async (id: string, updates: Partial<FamilyMemberCreate>) => {
    try {
      const updated = await storage.updateFamilyMember(id, updates);
      setMembers((prev) => prev.map((m) => (m.id === id ? updated : m)));
      return updated;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update family member";
      setError(message);
      throw new Error(message);
    }
  };

  const deleteMember = async (id: string) => {
    try {
      await storage.deleteFamilyMember(id);
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete family member";
      setError(message);
      throw new Error(message);
    }
  };

  return {
    members,
    loading,
    error,
    addMember,
    updateMember,
    deleteMember,
    refresh: loadMembers,
  };
}

/**
 * Hook for managing vaccines
 */
export function useVaccines() {
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVaccines = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await storage.getVaccines();
      setVaccines(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load vaccines");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVaccines();
  }, []);

  return { vaccines, loading, error, refresh: loadVaccines };
}

/**
 * Hook for managing vaccine records
 */
export function useVaccineRecords(familyMemberId?: string) {
  const [records, setRecords] = useState<VaccineRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await storage.getVaccineRecords(familyMemberId);
      setRecords(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load vaccine records"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [familyMemberId]);

  const addRecord = async (record: VaccineRecordCreate) => {
    try {
      const newRecord = await storage.addVaccineRecord(record);
      setRecords((prev) => [...prev, newRecord]);
      return newRecord;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to add vaccine record";
      setError(message);
      throw new Error(message);
    }
  };

  const updateRecord = async (
    id: string,
    updates: Partial<VaccineRecordCreate>
  ) => {
    try {
      const updated = await storage.updateVaccineRecord(id, updates);
      setRecords((prev) => prev.map((r) => (r.id === id ? updated : r)));
      return updated;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update vaccine record";
      setError(message);
      throw new Error(message);
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      await storage.deleteVaccineRecord(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete vaccine record";
      setError(message);
      throw new Error(message);
    }
  };

  return {
    records,
    loading,
    error,
    addRecord,
    updateRecord,
    deleteRecord,
    refresh: loadRecords,
  };
}

/**
 * Hook for export/import functionality
 */
export function useExportImport() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Primary export: CRDT binary format (.crdt) - importable and mergeable
  const exportData = async () => {
    try {
      setExporting(true);
      setError(null);
      const binary = await storage.export();
      const blob = new Blob([binary], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vaccine-records-${new Date().toISOString().split("T")[0]}.crdt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to export data";
      setError(message);
      throw new Error(message);
    } finally {
      setExporting(false);
    }
  };

  // Secondary export: JSON format (.json) - human-readable, NOT importable
  const exportJSON = async () => {
    try {
      setExporting(true);
      setError(null);
      const jsonString = await storage.exportJSON();
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vaccine-records-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to export JSON";
      setError(message);
      throw new Error(message);
    } finally {
      setExporting(false);
    }
  };

  // Import CRDT data (merges with existing data)
  const importData = async (file: File) => {
    try {
      setImporting(true);
      setError(null);
      
      // Read file as ArrayBuffer for binary data
      const arrayBuffer = await file.arrayBuffer();
      await storage.import(arrayBuffer);
      
      // Refresh the page to load merged data
      window.location.reload();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to import data";
      setError(message);
      throw new Error(message);
    } finally {
      setImporting(false);
    }
  };

  const clearData = async () => {
    try {
      setError(null);
      await storage.clear();
      // Refresh the page to load empty state
      window.location.reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to clear data";
      setError(message);
      throw new Error(message);
    }
  };

  return {
    exportData,
    exportJSON,
    importData,
    clearData,
    exporting,
    importing,
    error,
  };
}
