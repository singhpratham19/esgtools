export type Scope = "Scope 1" | "Scope 2" | "Scope 3";
export type QualityState = "Verified" | "Needs review" | "Missing proof";
export type HealthState = "Strong" | "Watch" | "Critical";
export type ScenarioDriver =
  | "renewable-electricity"
  | "thermal-efficiency"
  | "supplier-programs"
  | "logistics-shift"
  | "waste-circularity";

export interface CompanyProfile {
  name: string;
  sector: string;
  reportingYear: string;
  headquarters: string;
  summary: string;
  frameworks: string[];
}

export interface Facility {
  id: string;
  name: string;
  location: string;
  productionTonnes: number;
  renewableShare: number;
  dataHealth: HealthState;
  energySpendUsd: number;
}

export interface EmissionActivity {
  id: string;
  facilityId: string;
  scope: Scope;
  category: string;
  label: string;
  quantity: number;
  unit: string;
  emissionsTonnes: number;
  factorLabel: string;
  methodology: string;
  proofId: string;
  source: string;
  variancePct: number;
  quality: QualityState;
  scenarioDriver: ScenarioDriver;
}

export interface ResourceMetric {
  id: string;
  facilityId: string;
  family: "Water" | "Waste" | "Operations";
  label: string;
  value: number;
  unit: string;
  benchmark: string;
  trendPct: number;
  status: HealthState;
  proofId: string;
}

export interface EvidenceRecord {
  proofId: string;
  facilityId: string;
  documentName: string;
  metric: string;
  owner: string;
  reviewer: string;
  uploadedAt: string;
  documentType: string;
  status: QualityState;
}

export interface ValidationRule {
  id: string;
  metric: string;
  currentValue: string;
  priorValue: string;
  variancePct: number;
  thresholdPct: number;
  proofRequired: boolean;
  signoff: string;
  status: HealthState;
}

export interface FrameworkItem {
  id: string;
  framework: string;
  code: string;
  title: string;
  value: string;
  source: string;
  status: "Ready" | "In progress" | "Needs evidence";
}

export interface ReductionLever {
  id: string;
  title: string;
  description: string;
  driver: ScenarioDriver;
  maxReductionTonnes: number;
  investment: string;
  payback: string;
  owner: string;
}

export interface BenchmarkSignal {
  platform: string;
  focus: string;
  capabilities: string[];
  sourceUrl: string;
}

export interface ScenarioSettings {
  renewableElectricity: number;
  thermalEfficiency: number;
  supplierPrograms: number;
  logisticsShift: number;
  wasteCircularity: number;
}
