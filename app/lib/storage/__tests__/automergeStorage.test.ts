import { describe, it, expect, beforeEach, vi } from "vitest";
import { AutomergeStorageAdapter } from "../automergeStorage";
import type { FamilyMember, VaccineRecord } from "../../types";

// Create a shared mock document data object
let mockDocData: any = {
  version: "1.0.0",
  familyMembers: [],
  vaccines: [
    { id: "vac-1", name: "COVID-19", description: "COVID-19 vaccine" },
    { id: "vac-2", name: "Seasonal Flu", description: "Flu vaccine" },
  ],
  vaccineRecords: [],
  lastModified: new Date().toISOString(),
};

// Create mock handle that can be reused
const createMockHandle = () => {
  const handle = {
    url: "automerge:test-doc-id",
    doc: vi.fn().mockResolvedValue(mockDocData),
    docSync: vi.fn(() => mockDocData),
    change: vi.fn((fn: any) => {
      fn(mockDocData);
    }),
  };
  return handle;
};

let mockHandle = createMockHandle();

// Mock Automerge Repo
vi.mock("@automerge/automerge-repo", () => {
  return {
    Repo: class MockRepo {
      create() {
        mockHandle = createMockHandle();
        return mockHandle;
      }
      find() {
        return mockHandle;
      }
    },
  };
});

vi.mock("@automerge/automerge-repo-storage-indexeddb", () => ({
  IndexedDBStorageAdapter: class MockIndexedDBStorageAdapter {},
}));

vi.mock("@automerge/automerge", () => ({
  save: vi.fn((doc: any) => new Uint8Array([1, 2, 3])),
  load: vi.fn(() => ({
    version: "1.0.0",
    familyMembers: [],
    vaccines: [],
    vaccineRecords: [],
    lastModified: new Date().toISOString(),
  })),
  merge: vi.fn((doc1: any, doc2: any) => ({ ...doc1, ...doc2 })),
}));

describe("AutomergeStorageAdapter", () => {
  let storage: AutomergeStorageAdapter;

  beforeEach(async () => {
    // Reset mock data before each test
    mockDocData = {
      version: "1.0.0",
      familyMembers: [],
      vaccines: [
        { id: "vac-1", name: "COVID-19", description: "COVID-19 vaccine" },
        { id: "vac-2", name: "Seasonal Flu", description: "Flu vaccine" },
      ],
      vaccineRecords: [],
      lastModified: new Date().toISOString(),
    };
    mockHandle = createMockHandle();

    storage = new AutomergeStorageAdapter();
    // Wait for initialization
    await new Promise((resolve) => setTimeout(resolve, 10));
  });

  describe("Initialization", () => {
    it("should initialize successfully", async () => {
      const data = await storage.getData();
      expect(data).toBeDefined();
      expect(data.version).toBe("1.0.0");
    });

    it("should have default vaccines", async () => {
      const vaccines = await storage.getVaccines();
      expect(vaccines.length).toBeGreaterThan(0);
    });
  });

  describe("Family Members", () => {
    it("should add a family member", async () => {
      const newMember = {
        name: "John Doe",
        birthdate: "1990-01-01",
        sex: "Male" as const,
      };

      const added = await storage.addFamilyMember(newMember);

      expect(added.id).toBeDefined();
      expect(added.id).toMatch(/^test-uuid-\d+$/);
      expect(added.name).toBe("John Doe");
      expect(added.birthdate).toBe("1990-01-01");
      expect(added.sex).toBe("Male");
      expect(added.createdAt).toBeDefined();
      expect(added.updatedAt).toBeDefined();
    });

    it("should get all family members", async () => {
      const newMember = {
        name: "Jane Doe",
        birthdate: "1992-05-15",
        sex: "Female" as const,
      };

      await storage.addFamilyMember(newMember);
      const members = await storage.getFamilyMembers();

      expect(Array.isArray(members)).toBe(true);
    });

    it("should get a family member by id", async () => {
      const newMember = {
        name: "Bob Smith",
        birthdate: "1985-03-20",
      };

      const added = await storage.addFamilyMember(newMember);
      const retrieved = await storage.getFamilyMember(added.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe("Bob Smith");
    });

    it("should return null for non-existent family member", async () => {
      const retrieved = await storage.getFamilyMember("non-existent-id");
      expect(retrieved).toBeNull();
    });

    it("should update a family member", async () => {
      const newMember = {
        name: "Original Name",
        birthdate: "1990-01-01",
      };

      const added = await storage.addFamilyMember(newMember);

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      const updated = await storage.updateFamilyMember(added.id, {
        name: "Updated Name",
      });

      expect(updated.name).toBe("Updated Name");
      expect(updated.updatedAt).toBeDefined();
    });

    it("should delete a family member", async () => {
      const newMember = {
        name: "To Delete",
        birthdate: "1990-01-01",
      };

      const added = await storage.addFamilyMember(newMember);
      await storage.deleteFamilyMember(added.id);

      const retrieved = await storage.getFamilyMember(added.id);
      expect(retrieved).toBeNull();
    });

    it("should delete associated vaccine records when deleting family member", async () => {
      // Add family member
      const member = await storage.addFamilyMember({
        name: "Test Person",
        birthdate: "1990-01-01",
      });

      // Get a vaccine
      const vaccines = await storage.getVaccines();
      const vaccine = vaccines[0];

      // Add vaccine record
      await storage.addVaccineRecord({
        familyMemberId: member.id,
        vaccineId: vaccine.id,
        date: "2024-01-15",
        location: "Clinic",
      });

      // Delete family member
      await storage.deleteFamilyMember(member.id);

      // Check that records are deleted
      const records = await storage.getVaccineRecords(member.id);
      expect(records.length).toBe(0);
    });
  });

  describe("Vaccines", () => {
    it("should get all vaccines", async () => {
      const vaccines = await storage.getVaccines();
      expect(Array.isArray(vaccines)).toBe(true);
      expect(vaccines.length).toBeGreaterThan(0);
    });

    it("should get a vaccine by id", async () => {
      const vaccines = await storage.getVaccines();
      const firstVaccine = vaccines[0];

      const retrieved = await storage.getVaccine(firstVaccine.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(firstVaccine.id);
    });

    it("should return null for non-existent vaccine", async () => {
      const retrieved = await storage.getVaccine("non-existent-id");
      expect(retrieved).toBeNull();
    });
  });

  describe("Vaccine Records", () => {
    let memberId: string;
    let vaccineId: string;

    beforeEach(async () => {
      const member = await storage.addFamilyMember({
        name: "Test Person",
        birthdate: "1990-01-01",
      });
      memberId = member.id;

      const vaccines = await storage.getVaccines();
      vaccineId = vaccines[0].id;
    });

    it("should add a vaccine record with all fields", async () => {
      const newRecord = {
        familyMemberId: memberId,
        vaccineId: vaccineId,
        date: "2024-01-15",
        location: "City Clinic",
        dosage: "0.5ml",
        notes: "No side effects",
      };

      const added = await storage.addVaccineRecord(newRecord);

      expect(added.id).toBeDefined();
      expect(added.familyMemberId).toBe(memberId);
      expect(added.vaccineId).toBe(vaccineId);
      expect(added.date).toBe("2024-01-15");
      expect(added.location).toBe("City Clinic");
      expect(added.dosage).toBe("0.5ml");
      expect(added.notes).toBe("No side effects");
      expect(added.createdAt).toBeDefined();
      expect(added.updatedAt).toBeDefined();
    });

    it("should add a vaccine record with optional fields omitted", async () => {
      // When optional fields aren't needed, simply omit them from the object
      const newRecord = {
        familyMemberId: memberId,
        vaccineId: vaccineId,
        date: "2024-01-15",
        location: "City Clinic",
        // dosage and notes intentionally omitted
      };

      const added = await storage.addVaccineRecord(newRecord);

      expect(added.id).toBeDefined();
      expect(added.familyMemberId).toBe(memberId);
      expect(added.date).toBe("2024-01-15");
      expect(added.location).toBe("City Clinic");
      expect(added.createdAt).toBeDefined();
      expect(added.updatedAt).toBeDefined();
    });

    it("should get all vaccine records", async () => {
      await storage.addVaccineRecord({
        familyMemberId: memberId,
        vaccineId: vaccineId,
        date: "2024-01-15",
        location: "Clinic",
      });

      const records = await storage.getVaccineRecords();
      expect(Array.isArray(records)).toBe(true);
    });

    it("should get vaccine records filtered by family member", async () => {
      // Add another family member
      const member2 = await storage.addFamilyMember({
        name: "Another Person",
        birthdate: "1995-06-10",
      });

      // Add records for both members
      await storage.addVaccineRecord({
        familyMemberId: memberId,
        vaccineId: vaccineId,
        date: "2024-01-15",
        location: "Clinic",
      });

      await storage.addVaccineRecord({
        familyMemberId: member2.id,
        vaccineId: vaccineId,
        date: "2024-02-20",
        location: "Hospital",
      });

      const member1Records = await storage.getVaccineRecords(memberId);
      expect(member1Records.every((r) => r.familyMemberId === memberId)).toBe(
        true,
      );
    });

    it("should get a vaccine record by id", async () => {
      const added = await storage.addVaccineRecord({
        familyMemberId: memberId,
        vaccineId: vaccineId,
        date: "2024-01-15",
        location: "Clinic",
      });

      const retrieved = await storage.getVaccineRecord(added.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(added.id);
    });

    it("should return null for non-existent vaccine record", async () => {
      const retrieved = await storage.getVaccineRecord("non-existent-id");
      expect(retrieved).toBeNull();
    });

    it("should update a vaccine record", async () => {
      const added = await storage.addVaccineRecord({
        familyMemberId: memberId,
        vaccineId: vaccineId,
        date: "2024-01-15",
        location: "Original Location",
      });

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      const updated = await storage.updateVaccineRecord(added.id, {
        location: "Updated Location",
        notes: "Added notes",
      });

      expect(updated.location).toBe("Updated Location");
      expect(updated.notes).toBe("Added notes");
      expect(updated.updatedAt).toBeDefined();
    });

    it("should delete a vaccine record", async () => {
      const added = await storage.addVaccineRecord({
        familyMemberId: memberId,
        vaccineId: vaccineId,
        date: "2024-01-15",
        location: "Clinic",
      });

      await storage.deleteVaccineRecord(added.id);

      const retrieved = await storage.getVaccineRecord(added.id);
      expect(retrieved).toBeNull();
    });
  });

  describe("Utility Operations", () => {
    it("should clear all data", async () => {
      // Add some data
      await storage.addFamilyMember({
        name: "Test Person",
        birthdate: "1990-01-01",
      });

      // Clear
      await storage.clear();

      // Verify cleared
      const members = await storage.getFamilyMembers();
      expect(members.length).toBe(0);
    });

    it("should export data as binary", async () => {
      const exported = await storage.export();
      expect(exported).toBeInstanceOf(Uint8Array);
      expect(exported.length).toBeGreaterThan(0);
    });

    it("should export data as JSON", async () => {
      const json = await storage.exportJSON();
      const parsed = JSON.parse(json);

      expect(parsed.version).toBeDefined();
      expect(parsed.familyMembers).toBeDefined();
      expect(parsed.vaccines).toBeDefined();
      expect(parsed.vaccineRecords).toBeDefined();
      expect(parsed.exportedAt).toBeDefined();
    });

    it("should import binary data", async () => {
      const binary = new Uint8Array([1, 2, 3]);

      // Should not throw
      await expect(storage.import(binary)).resolves.not.toThrow();
    });
  });

  describe("Error Handling", () => {
    it("should throw error when updating non-existent family member", async () => {
      await expect(
        storage.updateFamilyMember("non-existent-id", { name: "New Name" }),
      ).rejects.toThrow("Family member with id non-existent-id not found");
    });

    it("should throw error when updating non-existent vaccine record", async () => {
      await expect(
        storage.updateVaccineRecord("non-existent-id", {
          location: "New Location",
        }),
      ).rejects.toThrow("Vaccine record with id non-existent-id not found");
    });
  });
});
