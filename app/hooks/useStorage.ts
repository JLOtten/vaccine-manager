/**
 * Custom hooks for accessing Automerge storage with React
 * Uses @automerge/automerge-repo-react-hooks for automatic re-renders
 */

import { useState, useMemo, useEffect } from "react";
import { useDocument } from "@automerge/react";
import type { DocumentId } from "@automerge/automerge-repo";
import { storage, getOrCreateDocumentUrl } from "~/lib/storage";
import type {
  AppData,
  FamilyMember,
  FamilyMemberCreate,
  Vaccine,
  VaccineRecord,
  VaccineRecordCreate,
} from "~/lib/types";

/**
 * Hook to get the document URL
 * Initializes the document if it doesn't exist
 * Returns null during SSR
 */
function useDocumentUrl() {
  const [documentUrl, setDocumentUrl] = useState<DocumentId | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only run in browser
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    getOrCreateDocumentUrl()
      .then((url) => {
        setDocumentUrl(url);
        setLoading(false);
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Failed to initialize document",
        );
        setLoading(false);
      });
  }, []);

  return { documentUrl, loading, error };
}

/**
 * Hook for managing family members
 * Uses useDocument() for automatic re-renders on data changes
 */
export function useFamilyMembers() {
  const {
    documentUrl,
    loading: urlLoading,
    error: urlError,
  } = useDocumentUrl();
  const [doc, changeDoc] = useDocument<AppData>(documentUrl!);
  const [error, setError] = useState<string | null>(null);

  // SSR fallback - if no document URL yet (SSR or loading), show loading state
  const isSSR = typeof window === "undefined";

  // Combine loading states
  const loading = isSSR || urlLoading || (!doc && !urlError);

  // Get members from document
  const members = useMemo(() => {
    if (!doc) return [];
    return [...doc.familyMembers]; // Create a shallow copy for React
  }, [doc?.familyMembers]);

  const addMember = async (member: FamilyMemberCreate) => {
    if (!doc) {
      throw new Error("Document not ready");
    }

    try {
      const now = new Date().toISOString();
      const newMember: FamilyMember = {
        ...member,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };

      changeDoc((d) => {
        d.familyMembers.push(newMember);
        d.lastModified = now;
      });

      setError(null);
      return newMember;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to add family member";
      setError(message);
      throw new Error(message);
    }
  };

  const updateMember = async (
    id: string,
    updates: Partial<FamilyMemberCreate>,
  ) => {
    if (!doc) {
      throw new Error("Document not ready");
    }

    try {
      const index = doc.familyMembers.findIndex((m) => m.id === id);
      if (index === -1) {
        throw new Error(`Family member with id ${id} not found`);
      }

      const now = new Date().toISOString();

      changeDoc((d) => {
        const member = d.familyMembers[index];
        Object.assign(member, updates);
        member.updatedAt = now;
        d.lastModified = now;
      });

      setError(null);
      return doc.familyMembers[index];
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update family member";
      setError(message);
      throw new Error(message);
    }
  };

  const deleteMember = async (id: string) => {
    if (!doc) {
      throw new Error("Document not ready");
    }

    try {
      changeDoc((d) => {
        // Remove family member
        const memberIndex = d.familyMembers.findIndex((m) => m.id === id);
        if (memberIndex !== -1) {
          d.familyMembers.splice(memberIndex, 1);
        }

        // Remove associated vaccine records
        d.vaccineRecords = d.vaccineRecords.filter(
          (r) => r.familyMemberId !== id,
        );

        d.lastModified = new Date().toISOString();
      });

      setError(null);
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
    error: error || urlError,
    addMember,
    updateMember,
    deleteMember,
    refresh: () => {}, // No-op: document updates automatically
  };
}

/**
 * Hook for managing vaccines
 * Uses useDocument() for automatic re-renders on data changes
 */
export function useVaccines() {
  const {
    documentUrl,
    loading: urlLoading,
    error: urlError,
  } = useDocumentUrl();
  const [doc] = useDocument<AppData>(documentUrl!);

  // SSR fallback
  const isSSR = typeof window === "undefined";

  // Combine loading states
  const loading = isSSR || urlLoading || (!doc && !urlError);

  // Get vaccines from document
  const vaccines = useMemo(() => {
    if (!doc) return [];
    return [...doc.vaccines]; // Create a shallow copy for React
  }, [doc?.vaccines]);

  return {
    vaccines,
    loading,
    error: urlError,
    refresh: () => {}, // No-op: document updates automatically
  };
}

/**
 * Hook for managing vaccine records
 * Uses useDocument() for automatic re-renders on data changes
 */
export function useVaccineRecords(familyMemberId?: string) {
  const {
    documentUrl,
    loading: urlLoading,
    error: urlError,
  } = useDocumentUrl();
  const [doc, changeDoc] = useDocument<AppData>(documentUrl!);
  const [error, setError] = useState<string | null>(null);

  // SSR fallback
  const isSSR = typeof window === "undefined";

  // Combine loading states
  const loading = isSSR || urlLoading || (!doc && !urlError);

  // Get records from document (filtered if familyMemberId provided)
  const records = useMemo(() => {
    if (!doc) return [];
    const allRecords = [...doc.vaccineRecords];
    return familyMemberId
      ? allRecords.filter((r) => r.familyMemberId === familyMemberId)
      : allRecords;
  }, [doc?.vaccineRecords, familyMemberId]);

  const addRecord = async (record: VaccineRecordCreate) => {
    if (!doc) {
      throw new Error("Document not ready");
    }

    try {
      const now = new Date().toISOString();
      const newRecord: VaccineRecord = {
        ...record,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };

      changeDoc((d) => {
        d.vaccineRecords.push(newRecord);
        d.lastModified = now;
      });

      setError(null);
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
    updates: Partial<VaccineRecordCreate>,
  ) => {
    if (!doc) {
      throw new Error("Document not ready");
    }

    try {
      const index = doc.vaccineRecords.findIndex((r) => r.id === id);
      if (index === -1) {
        throw new Error(`Vaccine record with id ${id} not found`);
      }

      const now = new Date().toISOString();

      changeDoc((d) => {
        const record = d.vaccineRecords[index];
        Object.assign(record, updates);
        record.updatedAt = now;
        d.lastModified = now;
      });

      setError(null);
      return doc.vaccineRecords[index];
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update vaccine record";
      setError(message);
      throw new Error(message);
    }
  };

  const deleteRecord = async (id: string) => {
    if (!doc) {
      throw new Error("Document not ready");
    }

    try {
      changeDoc((d) => {
        const index = d.vaccineRecords.findIndex((r) => r.id === id);
        if (index !== -1) {
          d.vaccineRecords.splice(index, 1);
        }
        d.lastModified = new Date().toISOString();
      });

      setError(null);
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
    error: error || urlError,
    addRecord,
    updateRecord,
    deleteRecord,
    refresh: () => {}, // No-op: document updates automatically
  };
}

/**
 * Hook for export/import functionality
 * These operations still use the storage adapter
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
      const message =
        err instanceof Error ? err.message : "Failed to clear data";
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
