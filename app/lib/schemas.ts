/**
 * Zod schemas for runtime validation
 */

import { z } from "zod";

export const FamilyMemberSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sex: z.enum(["Male", "Female", "Other"]).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const VaccineSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
});

export const VaccineRecordSchema = z.object({
  id: z.string().uuid(),
  familyMemberId: z.string().uuid(),
  vaccineId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  location: z.string().min(1),
  dosage: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const AppDataSchema = z.object({
  version: z.string(),
  familyMembers: z.array(FamilyMemberSchema),
  vaccines: z.array(VaccineSchema),
  vaccineRecords: z.array(VaccineRecordSchema),
  lastModified: z.string().datetime(),
  exportedAt: z.string().datetime().optional(),
});
