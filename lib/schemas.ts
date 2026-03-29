import { z } from "zod";

export const metricSchema = z.object({
  id: z.string().min(1),
  facilityId: z.string().min(1),
  scope: z.enum(["Scope 1", "Scope 2", "Scope 3"]),
  category: z.string().min(1),
  label: z.string().min(1),
  quantity: z.coerce.number().nonnegative(),
  unit: z.string().min(1),
  emissionsTonnes: z.coerce.number().nonnegative(),
  factorLabel: z.string().min(1),
  methodology: z.string().min(1),
  proofId: z.string().min(1),
  source: z.string().min(1),
  variancePct: z.coerce.number(),
  quality: z.enum(["Verified", "Needs review", "Missing proof"]),
  scenarioDriver: z.enum([
    "renewable-electricity",
    "thermal-efficiency",
    "supplier-programs",
    "logistics-shift",
    "waste-circularity"
  ])
});

export const evidenceSchema = z.object({
  proofId: z.string().min(1),
  facilityId: z.string().min(1),
  documentName: z.string().min(1),
  metric: z.string().min(1),
  owner: z.string().min(1),
  reviewer: z.string().min(1),
  uploadedAt: z.string().min(1),
  documentType: z.string().min(1),
  status: z.enum(["Verified", "Needs review", "Missing proof"]),
  filePath: z.string().optional()
});

export const supplierSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  spendUsd: z.coerce.number().nonnegative(),
  emissionsTonnes: z.coerce.number().nonnegative(),
  responseRate: z.coerce.number().min(0).max(100),
  risk: z.enum(["Low", "Medium", "High"]),
  status: z.enum(["Primary data", "Estimated", "Escalated"])
});

export const taskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  assignee: z.string().min(1),
  dueDate: z.string().min(1),
  status: z.enum(["Open", "In review", "Done", "Blocked"]),
  priority: z.enum(["P1", "P2", "P3"]),
  framework: z.string().min(1)
});

export const disclosureSchema = z.object({
  id: z.string().min(1),
  framework: z.string().min(1),
  code: z.string().min(1),
  title: z.string().min(1),
  value: z.string().min(1),
  source: z.string().min(1),
  status: z.enum(["Ready", "In progress", "Needs evidence"])
});

export const targetSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  pillar: z.enum(["Environmental", "Social", "Governance"]),
  baseline: z.string().min(1),
  target: z.string().min(1),
  targetYear: z.string().min(1),
  owner: z.string().min(1),
  status: z.enum(["On track", "Needs funding", "At risk"])
});
