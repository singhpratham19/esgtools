import {
  BenchmarkSignal,
  CompanyProfile,
  DisclosureTheme,
  EmissionActivity,
  EvidenceRecord,
  Facility,
  FrameworkItem,
  GovernanceRecord,
  MaterialTopic,
  MetricLibraryItem,
  PeopleMetric,
  ReductionLever,
  ResourceMetric,
  ScenarioSettings,
  SupplierRecord,
  TargetProgram,
  TaskItem,
  ValidationRule
} from "@/lib/types";

export const companyProfile: CompanyProfile = {
  name: "Aster Materials",
  sector: "Industrial manufacturing",
  reportingYear: "FY2025",
  headquarters: "Mumbai, India",
  summary:
    "A production-grade ESG control room shaped from your workbook, but rebuilt as a modern climate-data product with auditability, reporting readiness, and decarbonization planning.",
  frameworks: [
    "GHG Protocol",
    "BRSR",
    "CSRD / ESRS",
    "GRI 302/303/305/306",
    "SASB",
    "TCFD / IFRS S2",
    "CDP"
  ]
};

export const facilities: Facility[] = [
  {
    id: "pune",
    name: "Pune Forge Campus",
    location: "Maharashtra, India",
    productionTonnes: 1800,
    renewableShare: 12,
    dataHealth: "Watch",
    energySpendUsd: 182000
  },
  {
    id: "nashik",
    name: "Nashik Assembly Plant",
    location: "Maharashtra, India",
    productionTonnes: 940,
    renewableShare: 18,
    dataHealth: "Strong",
    energySpendUsd: 124000
  },
  {
    id: "chennai",
    name: "Chennai Logistics Hub",
    location: "Tamil Nadu, India",
    productionTonnes: 420,
    renewableShare: 26,
    dataHealth: "Watch",
    energySpendUsd: 76000
  }
];

export const emissionActivities: EmissionActivity[] = [
  {
    id: "pune-grid",
    facilityId: "pune",
    scope: "Scope 2",
    category: "Energy",
    label: "Grid electricity consumption",
    quantity: 45000,
    unit: "kWh",
    emissionsTonnes: 29.25,
    factorLabel: "CEA 2024-25 grid factor: 0.650 kgCO2e / kWh",
    methodology: "Activity-based",
    proofId: "P-ENG-001",
    source: "Utility bill",
    variancePct: 14,
    quality: "Verified",
    scenarioDriver: "renewable-electricity"
  },
  {
    id: "pune-steam",
    facilityId: "pune",
    scope: "Scope 1",
    category: "Thermal",
    label: "Steam from boiler",
    quantity: 120,
    unit: "MT",
    emissionsTonnes: 112.8,
    factorLabel: "10 GJ / MT x 0.094 tCO2e / GJ",
    methodology: "Activity-based",
    proofId: "P-STEAM-001",
    source: "Boiler log",
    variancePct: 11,
    quality: "Verified",
    scenarioDriver: "thermal-efficiency"
  },
  {
    id: "pune-diesel",
    facilityId: "pune",
    scope: "Scope 1",
    category: "Mobile combustion",
    label: "Diesel consumption",
    quantity: 5000,
    unit: "L",
    emissionsTonnes: 13.19,
    factorLabel: "0.832 kg / L x 3.169 tCO2e / MT",
    methodology: "Activity-based",
    proofId: "P-FUEL-001",
    source: "Purchase invoice",
    variancePct: 7,
    quality: "Verified",
    scenarioDriver: "thermal-efficiency"
  },
  {
    id: "pune-steel",
    facilityId: "pune",
    scope: "Scope 3",
    category: "Purchased goods",
    label: "Steel raw material purchased",
    quantity: 250,
    unit: "MT",
    emissionsTonnes: 625,
    factorLabel: "Industry average cradle-to-gate: 2.5 tCO2e / MT",
    methodology: "Supplier factor",
    proofId: "P-SUPPLIER-001",
    source: "Purchase register",
    variancePct: 19,
    quality: "Needs review",
    scenarioDriver: "supplier-programs"
  },
  {
    id: "pune-outbound",
    facilityId: "pune",
    scope: "Scope 3",
    category: "Logistics",
    label: "Outbound truck transport",
    quantity: 12500,
    unit: "km",
    emissionsTonnes: 1.88,
    factorLabel: "DEFRA freight factor: 0.15 kgCO2e / tkm equivalent",
    methodology: "Distance-based",
    proofId: "P-TRANSPORT-001",
    source: "Logistics invoice",
    variancePct: 5,
    quality: "Verified",
    scenarioDriver: "logistics-shift"
  },
  {
    id: "pune-landfill",
    facilityId: "pune",
    scope: "Scope 3",
    category: "Waste",
    label: "Waste sent to landfill",
    quantity: 12,
    unit: "MT",
    emissionsTonnes: 5.4,
    factorLabel: "Landfill disposal estimate: 0.45 tCO2e / MT",
    methodology: "Waste pathway model",
    proofId: "P-WASTE-001",
    source: "Waste segregation log",
    variancePct: 17,
    quality: "Needs review",
    scenarioDriver: "waste-circularity"
  },
  {
    id: "nashik-grid",
    facilityId: "nashik",
    scope: "Scope 2",
    category: "Energy",
    label: "Grid electricity consumption",
    quantity: 30000,
    unit: "kWh",
    emissionsTonnes: 19.5,
    factorLabel: "CEA 2024-25 grid factor: 0.650 kgCO2e / kWh",
    methodology: "Activity-based",
    proofId: "P-ENG-014",
    source: "Utility bill",
    variancePct: 4,
    quality: "Verified",
    scenarioDriver: "renewable-electricity"
  },
  {
    id: "nashik-gas",
    facilityId: "nashik",
    scope: "Scope 1",
    category: "Thermal",
    label: "Natural gas consumption",
    quantity: 15000,
    unit: "Nm3",
    emissionsTonnes: 56.3,
    factorLabel: "1.84 kg / Nm3 x 2.04 tCO2e / MT",
    methodology: "Activity-based",
    proofId: "P-GAS-002",
    source: "Gas ledger",
    variancePct: 9,
    quality: "Verified",
    scenarioDriver: "thermal-efficiency"
  },
  {
    id: "nashik-aluminum",
    facilityId: "nashik",
    scope: "Scope 3",
    category: "Purchased goods",
    label: "Aluminum purchased",
    quantity: 48,
    unit: "MT",
    emissionsTonnes: 576,
    factorLabel: "Cradle-to-gate factor: 12.0 tCO2e / MT",
    methodology: "Industry average",
    proofId: "P-SUPPLIER-014",
    source: "Supplier declaration",
    variancePct: 22,
    quality: "Needs review",
    scenarioDriver: "supplier-programs"
  },
  {
    id: "nashik-plastic",
    facilityId: "nashik",
    scope: "Scope 3",
    category: "Purchased goods",
    label: "Plastic and polymer feedstock",
    quantity: 32,
    unit: "MT",
    emissionsTonnes: 176,
    factorLabel: "Average polymer factor: 5.5 tCO2e / MT",
    methodology: "Spend-adjusted factor",
    proofId: "P-SUPPLIER-015",
    source: "Purchase order export",
    variancePct: 13,
    quality: "Verified",
    scenarioDriver: "supplier-programs"
  },
  {
    id: "nashik-freight",
    facilityId: "nashik",
    scope: "Scope 3",
    category: "Logistics",
    label: "Supplier goods transport distance",
    quantity: 8900,
    unit: "km",
    emissionsTonnes: 1.78,
    factorLabel: "Mixed freight estimate: 0.20 kgCO2e / tkm equivalent",
    methodology: "Distance-based",
    proofId: "P-TRANSPORT-014",
    source: "Inbound freight report",
    variancePct: 6,
    quality: "Verified",
    scenarioDriver: "logistics-shift"
  },
  {
    id: "nashik-landfill",
    facilityId: "nashik",
    scope: "Scope 3",
    category: "Waste",
    label: "Waste sent to landfill",
    quantity: 6,
    unit: "MT",
    emissionsTonnes: 2.7,
    factorLabel: "Landfill disposal estimate: 0.45 tCO2e / MT",
    methodology: "Waste pathway model",
    proofId: "P-WASTE-014",
    source: "EHS disposal report",
    variancePct: 8,
    quality: "Verified",
    scenarioDriver: "waste-circularity"
  },
  {
    id: "chennai-grid",
    facilityId: "chennai",
    scope: "Scope 2",
    category: "Energy",
    label: "Warehouse electricity consumption",
    quantity: 16000,
    unit: "kWh",
    emissionsTonnes: 10.4,
    factorLabel: "CEA 2024-25 grid factor: 0.650 kgCO2e / kWh",
    methodology: "Activity-based",
    proofId: "P-ENG-027",
    source: "Warehouse bill",
    variancePct: 3,
    quality: "Verified",
    scenarioDriver: "renewable-electricity"
  },
  {
    id: "chennai-diesel",
    facilityId: "chennai",
    scope: "Scope 1",
    category: "Mobile combustion",
    label: "Fleet diesel consumption",
    quantity: 2800,
    unit: "L",
    emissionsTonnes: 7.38,
    factorLabel: "0.832 kg / L x 3.169 tCO2e / MT",
    methodology: "Activity-based",
    proofId: "P-FUEL-027",
    source: "Fuel card statement",
    variancePct: 16,
    quality: "Needs review",
    scenarioDriver: "thermal-efficiency"
  },
  {
    id: "chennai-rail",
    facilityId: "chennai",
    scope: "Scope 3",
    category: "Logistics",
    label: "Outbound rail transport",
    quantity: 19000,
    unit: "km",
    emissionsTonnes: 0.76,
    factorLabel: "Rail factor: 0.04 kgCO2e / tkm equivalent",
    methodology: "Distance-based",
    proofId: "P-TRANSPORT-027",
    source: "Carrier report",
    variancePct: -9,
    quality: "Verified",
    scenarioDriver: "logistics-shift"
  },
  {
    id: "chennai-packaging",
    facilityId: "chennai",
    scope: "Scope 3",
    category: "Purchased goods",
    label: "Packaging material",
    quantity: 40,
    unit: "MT",
    emissionsTonnes: 22,
    factorLabel: "Paper packaging factor: 0.55 tCO2e / MT",
    methodology: "Supplier factor",
    proofId: "P-SUPPLIER-027",
    source: "Packaging register",
    variancePct: 4,
    quality: "Verified",
    scenarioDriver: "supplier-programs"
  },
  {
    id: "chennai-landfill",
    facilityId: "chennai",
    scope: "Scope 3",
    category: "Waste",
    label: "Warehouse waste to landfill",
    quantity: 3,
    unit: "MT",
    emissionsTonnes: 1.35,
    factorLabel: "Landfill disposal estimate: 0.45 tCO2e / MT",
    methodology: "Waste pathway model",
    proofId: "P-WASTE-027",
    source: "Waste ticket",
    variancePct: 2,
    quality: "Missing proof",
    scenarioDriver: "waste-circularity"
  }
];

export const resourceMetrics: ResourceMetric[] = [
  {
    id: "pune-water",
    facilityId: "pune",
    family: "Water",
    label: "Fresh water withdrawal",
    value: 3500,
    unit: "m3",
    benchmark: "1.94 m3 per production tonne",
    trendPct: 9,
    status: "Watch",
    proofId: "P-WATER-001"
  },
  {
    id: "pune-recycled-water",
    facilityId: "pune",
    family: "Water",
    label: "Recycled water reused",
    value: 620,
    unit: "m3",
    benchmark: "18% circular water share",
    trendPct: 13,
    status: "Strong",
    proofId: "P-WATER-009"
  },
  {
    id: "pune-diversion",
    facilityId: "pune",
    family: "Waste",
    label: "Waste diversion rate",
    value: 73,
    unit: "%",
    benchmark: "Target > 85%",
    trendPct: 6,
    status: "Watch",
    proofId: "P-WASTE-001"
  },
  {
    id: "nashik-water",
    facilityId: "nashik",
    family: "Water",
    label: "Fresh water withdrawal",
    value: 1800,
    unit: "m3",
    benchmark: "1.91 m3 per production tonne",
    trendPct: -4,
    status: "Strong",
    proofId: "P-WATER-014"
  },
  {
    id: "nashik-diversion",
    facilityId: "nashik",
    family: "Waste",
    label: "Waste diversion rate",
    value: 81,
    unit: "%",
    benchmark: "Target > 85%",
    trendPct: 4,
    status: "Watch",
    proofId: "P-WASTE-014"
  },
  {
    id: "nashik-solar",
    facilityId: "nashik",
    family: "Operations",
    label: "On-site solar generation",
    value: 8200,
    unit: "kWh",
    benchmark: "18% renewable share",
    trendPct: 21,
    status: "Strong",
    proofId: "P-ENG-016"
  },
  {
    id: "chennai-water",
    facilityId: "chennai",
    family: "Water",
    label: "Fresh water withdrawal",
    value: 760,
    unit: "m3",
    benchmark: "1.81 m3 per production tonne",
    trendPct: 2,
    status: "Strong",
    proofId: "P-WATER-027"
  },
  {
    id: "chennai-diversion",
    facilityId: "chennai",
    family: "Waste",
    label: "Waste diversion rate",
    value: 64,
    unit: "%",
    benchmark: "Target > 85%",
    trendPct: -8,
    status: "Critical",
    proofId: "P-WASTE-027"
  },
  {
    id: "chennai-renewables",
    facilityId: "chennai",
    family: "Operations",
    label: "Renewable electricity share",
    value: 26,
    unit: "%",
    benchmark: "Target > 40%",
    trendPct: 11,
    status: "Watch",
    proofId: "P-ENG-029"
  }
];

export const evidenceRecords: EvidenceRecord[] = [
  {
    proofId: "P-ENG-001",
    facilityId: "pune",
    documentName: "April 2025 MSEDCL Bill",
    metric: "Grid electricity consumption",
    owner: "Energy team",
    reviewer: "Audit Team A",
    uploadedAt: "2025-04-15 10:30",
    documentType: "Utility bill",
    status: "Verified"
  },
  {
    proofId: "P-STEAM-001",
    facilityId: "pune",
    documentName: "Boiler log - April 2025",
    metric: "Steam from boiler",
    owner: "Operations lead",
    reviewer: "Audit Team A",
    uploadedAt: "2025-04-15 11:00",
    documentType: "Internal log",
    status: "Verified"
  },
  {
    proofId: "P-FUEL-001",
    facilityId: "pune",
    documentName: "Diesel purchase invoice - April",
    metric: "Diesel consumption",
    owner: "Procurement",
    reviewer: "Audit Team B",
    uploadedAt: "2025-04-16 09:15",
    documentType: "Purchase invoice",
    status: "Verified"
  },
  {
    proofId: "P-WATER-001",
    facilityId: "pune",
    documentName: "Water utility bill - April 2025",
    metric: "Fresh water withdrawal",
    owner: "Sustainability",
    reviewer: "Audit Team B",
    uploadedAt: "2025-04-15 14:30",
    documentType: "Utility bill",
    status: "Verified"
  },
  {
    proofId: "P-SUPPLIER-014",
    facilityId: "nashik",
    documentName: "Primary aluminum factor declaration",
    metric: "Aluminum purchased",
    owner: "Supply chain",
    reviewer: "Climate analytics",
    uploadedAt: "2025-04-18 08:50",
    documentType: "Supplier declaration",
    status: "Needs review"
  },
  {
    proofId: "P-TRANSPORT-027",
    facilityId: "chennai",
    documentName: "Carrier rail lane export",
    metric: "Outbound rail transport",
    owner: "Logistics",
    reviewer: "Climate analytics",
    uploadedAt: "2025-04-19 15:20",
    documentType: "Logistics report",
    status: "Verified"
  },
  {
    proofId: "P-WASTE-027",
    facilityId: "chennai",
    documentName: "Warehouse waste manifest",
    metric: "Waste sent to landfill",
    owner: "Facilities",
    reviewer: "Pending",
    uploadedAt: "2025-04-19 18:00",
    documentType: "Waste ticket",
    status: "Missing proof"
  }
];

export const validationRules: ValidationRule[] = [
  {
    id: "vr-1",
    metric: "Grid electricity consumption (kWh)",
    currentValue: "91,000",
    priorValue: "84,200",
    variancePct: 8.1,
    thresholdPct: 10,
    proofRequired: true,
    signoff: "Energy controller",
    status: "Strong"
  },
  {
    id: "vr-2",
    metric: "Steam consumption (MT)",
    currentValue: "120",
    priorValue: "108",
    variancePct: 11.1,
    thresholdPct: 10,
    proofRequired: true,
    signoff: "Operations lead",
    status: "Watch"
  },
  {
    id: "vr-3",
    metric: "Steel purchased (MT)",
    currentValue: "250",
    priorValue: "211",
    variancePct: 18.5,
    thresholdPct: 10,
    proofRequired: true,
    signoff: "Supply chain head",
    status: "Critical"
  },
  {
    id: "vr-4",
    metric: "Waste diversion rate (%)",
    currentValue: "73",
    priorValue: "69",
    variancePct: 5.8,
    thresholdPct: 10,
    proofRequired: true,
    signoff: "EHS manager",
    status: "Strong"
  }
];

export const frameworkItems: FrameworkItem[] = [
  {
    id: "fw-1",
    framework: "BRSR",
    code: "E2-B",
    title: "GHG emissions (Scope 1 and 2)",
    value: "248.82 tCO2e",
    source: "Calculation ledger",
    status: "Ready"
  },
  {
    id: "fw-2",
    framework: "BRSR",
    code: "E4-B",
    title: "Total water from all sources",
    value: "6,060 m3",
    source: "Water proofs",
    status: "Ready"
  },
  {
    id: "fw-3",
    framework: "CSRD / ESRS E1",
    code: "E1-1",
    title: "Climate change mitigation",
    value: "All scopes inventoried with reduction plan",
    source: "Scenario planner + audit trail",
    status: "In progress"
  },
  {
    id: "fw-4",
    framework: "CSRD / ESRS E2",
    code: "E2-2",
    title: "Circular economy and waste",
    value: "72% average diversion rate",
    source: "Waste proofs",
    status: "Needs evidence"
  },
  {
    id: "fw-5",
    framework: "GRI",
    code: "302-1",
    title: "Energy consumption",
    value: "91,000 kWh electricity and thermal fuel inputs",
    source: "Energy proofs",
    status: "Ready"
  },
  {
    id: "fw-6",
    framework: "GRI",
    code: "305-3",
    title: "Other indirect GHG emissions",
    value: "1,411.87 tCO2e",
    source: "Supplier and logistics records",
    status: "In progress"
  }
];

export const reductionLevers: ReductionLever[] = [
  {
    id: "lever-1",
    title: "Renewable procurement and solar expansion",
    description:
      "Shift more purchased electricity to renewable contracts and increase on-site solar coverage at Pune and Nashik.",
    driver: "renewable-electricity",
    maxReductionTonnes: 46,
    investment: "$210k",
    payback: "22 months",
    owner: "Energy procurement"
  },
  {
    id: "lever-2",
    title: "Boiler and process heat efficiency",
    description:
      "Improve steam efficiency, condensate recovery, and fuel controls across thermal operations.",
    driver: "thermal-efficiency",
    maxReductionTonnes: 58,
    investment: "$145k",
    payback: "14 months",
    owner: "Plant engineering"
  },
  {
    id: "lever-3",
    title: "Supplier decarbonization program",
    description:
      "Prioritize steel and aluminum suppliers, gather primary data, and move high-carbon contracts to lower-intensity alternatives.",
    driver: "supplier-programs",
    maxReductionTonnes: 225,
    investment: "$95k",
    payback: "9 months",
    owner: "Strategic sourcing"
  },
  {
    id: "lever-4",
    title: "Modal shift and lane redesign",
    description:
      "Reduce truck-heavy lanes, consolidate shipments, and expand rail usage for long-haul outbound freight.",
    driver: "logistics-shift",
    maxReductionTonnes: 1.2,
    investment: "$38k",
    payback: "11 months",
    owner: "Logistics excellence"
  },
  {
    id: "lever-5",
    title: "Circular waste contracts",
    description:
      "Move landfill-bound waste into recycler and recovery contracts with proof-backed diversion tracking.",
    driver: "waste-circularity",
    maxReductionTonnes: 6.7,
    investment: "$18k",
    payback: "8 months",
    owner: "EHS"
  }
];

export const benchmarkSignals: BenchmarkSignal[] = [
  {
    platform: "Greenly",
    focus: "Fast carbon accounting with supplier and action workflows",
    capabilities: [
      "AI-assisted file structuring and factor matching",
      "Scope 1, 2, and 3 measurement with supplier screening",
      "Decarbonization roadmap and reporting support"
    ],
    sourceUrl: "https://greenly.earth/en-us/products/carbon-footprint"
  },
  {
    platform: "Watershed",
    focus: "Audit-ready measurement and disclosure control",
    capabilities: [
      "AI and API-based ESG data ingestion",
      "Transparent data lineage for audit-ready reporting",
      "Measure, report, and act workflow across scopes and frameworks"
    ],
    sourceUrl: "https://watershed.com/platform/measure"
  },
  {
    platform: "Credibl",
    focus: "Broad ESG KPI management with assurance and traceability",
    capabilities: [
      "1000+ KPI coverage across environmental, social, and governance topics",
      "AI-based variance analysis and assurance layer",
      "One-click reporting for CSRD, BRSR, SASB, TCFD, and more"
    ],
    sourceUrl: "https://www.crediblesg.com/"
  },
  {
    platform: "Persefoni",
    focus: "Controls-heavy carbon accounting and disclosure readiness",
    capabilities: [
      "Scope 1, 2, and 3 coverage aligned with GHG Protocol",
      "Activity and audit logs with assurance-ready controls",
      "Supplier engagement and reduction modeling"
    ],
    sourceUrl: "https://www.persefoni.com/business/carbon-footprint-measurement-analytics"
  }
];

export const defaultScenario: ScenarioSettings = {
  renewableElectricity: 35,
  thermalEfficiency: 20,
  supplierPrograms: 28,
  logisticsShift: 22,
  wasteCircularity: 45
};

export const metricLibrary: MetricLibraryItem[] = [
  {
    id: "ml-1",
    pillar: "Environmental",
    domain: "Climate",
    name: "Scope 1 gross emissions",
    unit: "tCO2e",
    frameworks: ["GHG Protocol", "ESRS E1", "BRSR"],
    owner: "Climate team",
    status: "Collected",
    assurance: "High"
  },
  {
    id: "ml-2",
    pillar: "Environmental",
    domain: "Climate",
    name: "Scope 2 market-based emissions",
    unit: "tCO2e",
    frameworks: ["GHG Protocol", "CDP", "IFRS S2"],
    owner: "Energy team",
    status: "Partial",
    assurance: "Medium"
  },
  {
    id: "ml-3",
    pillar: "Environmental",
    domain: "Climate",
    name: "Scope 3 category coverage",
    unit: "% categories assessed",
    frameworks: ["GHG Protocol", "ESRS E1", "CDP"],
    owner: "Supply chain",
    status: "Partial",
    assurance: "Medium"
  },
  {
    id: "ml-4",
    pillar: "Environmental",
    domain: "Water",
    name: "Water withdrawal by source",
    unit: "m3",
    frameworks: ["GRI 303", "ESRS E3", "BRSR"],
    owner: "EHS",
    status: "Collected",
    assurance: "High"
  },
  {
    id: "ml-5",
    pillar: "Environmental",
    domain: "Waste",
    name: "Waste generated and diverted",
    unit: "MT / %",
    frameworks: ["GRI 306", "ESRS E5", "BRSR"],
    owner: "EHS",
    status: "Collected",
    assurance: "Medium"
  },
  {
    id: "ml-6",
    pillar: "Environmental",
    domain: "Air and energy",
    name: "Energy consumption and renewable share",
    unit: "kWh / %",
    frameworks: ["GRI 302", "ESRS E1", "BRSR"],
    owner: "Energy team",
    status: "Collected",
    assurance: "High"
  },
  {
    id: "ml-7",
    pillar: "Social",
    domain: "Workforce",
    name: "Total headcount and turnover",
    unit: "Employees / %",
    frameworks: ["ESRS S1", "SASB", "BRSR"],
    owner: "HR",
    status: "Collected",
    assurance: "Medium"
  },
  {
    id: "ml-8",
    pillar: "Social",
    domain: "Health and safety",
    name: "LTIFR and fatalities",
    unit: "Rate / count",
    frameworks: ["GRI 403", "ESRS S1", "BRSR"],
    owner: "Safety office",
    status: "Collected",
    assurance: "High"
  },
  {
    id: "ml-9",
    pillar: "Social",
    domain: "Diversity and inclusion",
    name: "Gender diversity in management",
    unit: "%",
    frameworks: ["ESRS S1", "BRSR", "SASB"],
    owner: "HR",
    status: "Partial",
    assurance: "Medium"
  },
  {
    id: "ml-10",
    pillar: "Governance",
    domain: "Governance",
    name: "Board independence and ESG oversight",
    unit: "% / narrative",
    frameworks: ["ESRS G1", "BRSR", "SASB"],
    owner: "Company secretary",
    status: "Collected",
    assurance: "High"
  },
  {
    id: "ml-11",
    pillar: "Governance",
    domain: "Ethics and compliance",
    name: "Anti-bribery training and incidents",
    unit: "% / count",
    frameworks: ["ESRS G1", "BRSR"],
    owner: "Compliance",
    status: "Partial",
    assurance: "Medium"
  },
  {
    id: "ml-12",
    pillar: "Governance",
    domain: "Cyber and data",
    name: "Cybersecurity governance and incidents",
    unit: "count / narrative",
    frameworks: ["SASB", "IFRS S1", "ESRS G1"],
    owner: "Security office",
    status: "Gap",
    assurance: "Low"
  }
];

export const materialTopics: MaterialTopic[] = [
  {
    id: "mt-1",
    pillar: "Environmental",
    topic: "Climate mitigation",
    impactLevel: "High",
    stakeholderInterest: "High",
    status: "Assessed"
  },
  {
    id: "mt-2",
    pillar: "Environmental",
    topic: "Water stewardship",
    impactLevel: "High",
    stakeholderInterest: "Medium",
    status: "Assessed"
  },
  {
    id: "mt-3",
    pillar: "Environmental",
    topic: "Circularity and waste",
    impactLevel: "Medium",
    stakeholderInterest: "Medium",
    status: "Refreshing"
  },
  {
    id: "mt-4",
    pillar: "Social",
    topic: "Worker health and safety",
    impactLevel: "High",
    stakeholderInterest: "High",
    status: "Assessed"
  },
  {
    id: "mt-5",
    pillar: "Social",
    topic: "Diversity and inclusion",
    impactLevel: "Medium",
    stakeholderInterest: "High",
    status: "Refreshing"
  },
  {
    id: "mt-6",
    pillar: "Governance",
    topic: "Business ethics and compliance",
    impactLevel: "High",
    stakeholderInterest: "High",
    status: "Pending"
  }
];

export const supplierRecords: SupplierRecord[] = [
  {
    id: "sup-1",
    name: "Shakti Steel Ltd.",
    category: "Steel",
    spendUsd: 1800000,
    emissionsTonnes: 625,
    responseRate: 88,
    risk: "High",
    status: "Primary data"
  },
  {
    id: "sup-2",
    name: "Nexa Aluminum",
    category: "Aluminum",
    spendUsd: 940000,
    emissionsTonnes: 576,
    responseRate: 54,
    risk: "High",
    status: "Escalated"
  },
  {
    id: "sup-3",
    name: "Polymer Axis",
    category: "Polymers",
    spendUsd: 420000,
    emissionsTonnes: 176,
    responseRate: 73,
    risk: "Medium",
    status: "Estimated"
  },
  {
    id: "sup-4",
    name: "EcoPack Industries",
    category: "Packaging",
    spendUsd: 160000,
    emissionsTonnes: 22,
    responseRate: 96,
    risk: "Low",
    status: "Primary data"
  }
];

export const controlTasks: TaskItem[] = [
  {
    id: "task-1",
    title: "Obtain primary factor for aluminum supplier",
    assignee: "Strategic sourcing",
    dueDate: "2025-05-12",
    status: "Open",
    priority: "P1",
    framework: "ESRS E1"
  },
  {
    id: "task-2",
    title: "Approve wastewater discharge evidence",
    assignee: "EHS manager",
    dueDate: "2025-05-07",
    status: "In review",
    priority: "P2",
    framework: "GRI 303"
  },
  {
    id: "task-3",
    title: "Refresh cybersecurity governance narrative",
    assignee: "Security office",
    dueDate: "2025-05-20",
    status: "Blocked",
    priority: "P2",
    framework: "SASB"
  },
  {
    id: "task-4",
    title: "Finalize board ESG oversight disclosure",
    assignee: "Company secretary",
    dueDate: "2025-05-15",
    status: "In review",
    priority: "P1",
    framework: "ESRS G1"
  },
  {
    id: "task-5",
    title: "Validate workforce diversity baseline",
    assignee: "HR analytics",
    dueDate: "2025-05-18",
    status: "Open",
    priority: "P2",
    framework: "ESRS S1"
  },
  {
    id: "task-6",
    title: "Close missing landfill manifest gap",
    assignee: "Facilities",
    dueDate: "2025-05-05",
    status: "Open",
    priority: "P1",
    framework: "GRI 306"
  }
];

export const peopleMetrics: PeopleMetric[] = [
  {
    id: "pm-1",
    label: "Total workforce",
    category: "Workforce",
    value: "1,248 employees",
    owner: "HR operations",
    status: "Strong",
    benchmark: "Monthly HRIS sync"
  },
  {
    id: "pm-2",
    label: "Employee turnover",
    category: "Workforce",
    value: "11.4%",
    owner: "HR analytics",
    status: "Watch",
    benchmark: "Target < 10%"
  },
  {
    id: "pm-3",
    label: "Women in management",
    category: "Diversity",
    value: "27%",
    owner: "DEI office",
    status: "Watch",
    benchmark: "Target 35%"
  },
  {
    id: "pm-4",
    label: "LTIFR",
    category: "Safety",
    value: "0.62 per 200k hrs",
    owner: "Safety office",
    status: "Strong",
    benchmark: "Below industry median"
  }
];

export const governanceRecords: GovernanceRecord[] = [
  {
    id: "gov-1",
    label: "Independent directors",
    category: "Board",
    value: "67%",
    owner: "Company secretary",
    status: "Strong",
    framework: "ESRS G1"
  },
  {
    id: "gov-2",
    label: "ESG oversight at board level",
    category: "Board",
    value: "Audit and risk committee charter updated",
    owner: "Company secretary",
    status: "Strong",
    framework: "BRSR"
  },
  {
    id: "gov-3",
    label: "Anti-bribery training completion",
    category: "Compliance",
    value: "91%",
    owner: "Compliance office",
    status: "Watch",
    framework: "ESRS G1"
  },
  {
    id: "gov-4",
    label: "Confirmed cyber incidents",
    category: "Cybersecurity",
    value: "2 low-severity incidents",
    owner: "Security office",
    status: "Watch",
    framework: "SASB"
  }
];

export const disclosureThemes: DisclosureTheme[] = [
  {
    id: "dt-1",
    theme: "Climate and energy",
    pillar: "Environmental",
    requirements: 18,
    ready: 12,
    needsEvidence: 3
  },
  {
    id: "dt-2",
    theme: "Water and effluents",
    pillar: "Environmental",
    requirements: 8,
    ready: 6,
    needsEvidence: 1
  },
  {
    id: "dt-3",
    theme: "Waste and circularity",
    pillar: "Environmental",
    requirements: 9,
    ready: 5,
    needsEvidence: 2
  },
  {
    id: "dt-4",
    theme: "Workforce and safety",
    pillar: "Social",
    requirements: 11,
    ready: 7,
    needsEvidence: 2
  },
  {
    id: "dt-5",
    theme: "Governance and ethics",
    pillar: "Governance",
    requirements: 10,
    ready: 6,
    needsEvidence: 3
  }
];

export const targetPrograms: TargetProgram[] = [
  {
    id: "tp-1",
    title: "Reduce Scope 1 and 2 emissions intensity",
    pillar: "Environmental",
    baseline: "0.092 tCO2e / MT",
    target: "-42% by FY2030",
    targetYear: "2030",
    owner: "Climate team",
    status: "On track"
  },
  {
    id: "tp-2",
    title: "Increase renewable electricity share",
    pillar: "Environmental",
    baseline: "17%",
    target: "55% by FY2028",
    targetYear: "2028",
    owner: "Energy procurement",
    status: "Needs funding"
  },
  {
    id: "tp-3",
    title: "Achieve >90% waste diversion",
    pillar: "Environmental",
    baseline: "73%",
    target: "92% by FY2027",
    targetYear: "2027",
    owner: "EHS",
    status: "At risk"
  },
  {
    id: "tp-4",
    title: "Raise women in management",
    pillar: "Social",
    baseline: "27%",
    target: "35% by FY2028",
    targetYear: "2028",
    owner: "DEI office",
    status: "Needs funding"
  },
  {
    id: "tp-5",
    title: "Reach 100% anti-bribery training coverage",
    pillar: "Governance",
    baseline: "91%",
    target: "100% by FY2026",
    targetYear: "2026",
    owner: "Compliance office",
    status: "On track"
  }
];
