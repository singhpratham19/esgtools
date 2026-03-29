export type Scope = "Scope 1" | "Scope 2" | "Scope 3";
export type QualityState = "Verified" | "Needs review" | "Missing proof";
export type HealthState = "Strong" | "Watch" | "Critical";
export type Pillar = "Environmental" | "Social" | "Governance";
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
  filePath?: string;
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

export interface MetricLibraryItem {
  id: string;
  pillar: Pillar;
  domain: string;
  name: string;
  unit: string;
  frameworks: string[];
  owner: string;
  status: "Collected" | "Partial" | "Gap";
  assurance: "High" | "Medium" | "Low";
}

export interface MaterialTopic {
  id: string;
  pillar: Pillar;
  topic: string;
  impactLevel: "High" | "Medium" | "Low";
  stakeholderInterest: "High" | "Medium" | "Low";
  status: "Assessed" | "Refreshing" | "Pending";
}

export interface SupplierRecord {
  id: string;
  name: string;
  category: string;
  spendUsd: number;
  emissionsTonnes: number;
  responseRate: number;
  risk: "Low" | "Medium" | "High";
  status: "Primary data" | "Estimated" | "Escalated";
}

export interface TaskItem {
  id: string;
  title: string;
  assignee: string;
  dueDate: string;
  status: "Open" | "In review" | "Done" | "Blocked";
  priority: "P1" | "P2" | "P3";
  framework: string;
}

export interface PeopleMetric {
  id: string;
  label: string;
  category: string;
  value: string;
  owner: string;
  status: HealthState;
  benchmark: string;
}

export interface GovernanceRecord {
  id: string;
  label: string;
  category: string;
  value: string;
  owner: string;
  status: HealthState;
  framework: string;
}

export interface DisclosureTheme {
  id: string;
  theme: string;
  pillar: Pillar;
  requirements: number;
  ready: number;
  needsEvidence: number;
}

export interface TargetProgram {
  id: string;
  title: string;
  pillar: Pillar;
  baseline: string;
  target: string;
  targetYear: string;
  owner: string;
  status: "On track" | "Needs funding" | "At risk";
}
