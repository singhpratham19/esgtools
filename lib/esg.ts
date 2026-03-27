import {
  EmissionActivity,
  EvidenceRecord,
  Facility,
  FrameworkItem,
  QualityState,
  ResourceMetric,
  ScenarioSettings,
  Scope
} from "@/lib/types";

const driverReductionCap = {
  "renewable-electricity": 0.82,
  "thermal-efficiency": 0.24,
  "supplier-programs": 0.18,
  "logistics-shift": 0.32,
  "waste-circularity": 0.58
} as const;

export function filterByFacility<T extends { facilityId: string }>(
  items: T[],
  facilityId: string
) {
  if (facilityId === "all") {
    return items;
  }

  return items.filter((item) => item.facilityId === facilityId);
}

export function totalEmissions(items: EmissionActivity[]) {
  return items.reduce((sum, item) => sum + item.emissionsTonnes, 0);
}

export function emissionsByScope(items: EmissionActivity[]) {
  return items.reduce<Record<Scope, number>>(
    (acc, item) => {
      acc[item.scope] += item.emissionsTonnes;
      return acc;
    },
    {
      "Scope 1": 0,
      "Scope 2": 0,
      "Scope 3": 0
    }
  );
}

export function hotspotActivities(items: EmissionActivity[], limit = 5) {
  return [...items]
    .sort((left, right) => right.emissionsTonnes - left.emissionsTonnes)
    .slice(0, limit);
}

export function groupedQualityCount(records: EvidenceRecord[]) {
  return records.reduce<Record<QualityState, number>>(
    (acc, record) => {
      acc[record.status] += 1;
      return acc;
    },
    {
      Verified: 0,
      "Needs review": 0,
      "Missing proof": 0
    }
  );
}

export function averageWasteDiversion(resources: ResourceMetric[]) {
  const wasteRates = resources.filter((resource) =>
    resource.label.toLowerCase().includes("diversion")
  );

  if (wasteRates.length === 0) {
    return 0;
  }

  return (
    wasteRates.reduce((sum, resource) => sum + resource.value, 0) /
    wasteRates.length
  );
}

export function totalWater(resources: ResourceMetric[]) {
  return resources
    .filter((resource) => resource.family === "Water")
    .reduce((sum, resource) => sum + resource.value, 0);
}

export function facilityPerformance(
  facilities: Facility[],
  activities: EmissionActivity[],
  resources: ResourceMetric[]
) {
  return facilities.map((facility) => {
    const facilityActivities = activities.filter(
      (activity) => activity.facilityId === facility.id
    );
    const facilityResources = resources.filter(
      (resource) => resource.facilityId === facility.id
    );
    const diversion =
      facilityResources.find((resource) =>
        resource.label.toLowerCase().includes("diversion")
      )?.value ?? 0;

    return {
      id: facility.id,
      name: facility.name,
      location: facility.location,
      emissions: totalEmissions(facilityActivities),
      intensity:
        totalEmissions(facilityActivities) / Math.max(facility.productionTonnes, 1),
      water:
        facilityResources
          .filter((resource) => resource.family === "Water")
          .reduce((sum, resource) => sum + resource.value, 0) /
        Math.max(facility.productionTonnes, 1),
      diversion,
      health: facility.dataHealth
    };
  });
}

export function scenarioProjection(
  items: EmissionActivity[],
  scenario: ScenarioSettings
) {
  const baseline = totalEmissions(items);

  const modelled = items.map((item) => {
    const driverValue = getScenarioValue(item.scenarioDriver, scenario);
    const reduction =
      item.emissionsTonnes *
      (driverValue / 100) *
      driverReductionCap[item.scenarioDriver];
    return {
      ...item,
      reduction,
      projected: Math.max(item.emissionsTonnes - reduction, 0)
    };
  });

  const projected = modelled.reduce((sum, item) => sum + item.projected, 0);

  const byScope = modelled.reduce<Record<Scope, number>>(
    (acc, item) => {
      acc[item.scope] += item.projected;
      return acc;
    },
    {
      "Scope 1": 0,
      "Scope 2": 0,
      "Scope 3": 0
    }
  );

  const byDriver = modelled.reduce<Record<string, number>>((acc, item) => {
    acc[item.scenarioDriver] = (acc[item.scenarioDriver] ?? 0) + item.reduction;
    return acc;
  }, {});

  return {
    baseline,
    projected,
    reduction: baseline - projected,
    byScope,
    byDriver
  };
}

function getScenarioValue(
  driver: EmissionActivity["scenarioDriver"],
  scenario: ScenarioSettings
) {
  switch (driver) {
    case "renewable-electricity":
      return scenario.renewableElectricity;
    case "thermal-efficiency":
      return scenario.thermalEfficiency;
    case "supplier-programs":
      return scenario.supplierPrograms;
    case "logistics-shift":
      return scenario.logisticsShift;
    case "waste-circularity":
      return scenario.wasteCircularity;
    default:
      return 0;
  }
}

export function statusScore(frameworks: FrameworkItem[]) {
  const ready = frameworks.filter((item) => item.status === "Ready").length;
  return Math.round((ready / Math.max(frameworks.length, 1)) * 100);
}

export function qualityScore(records: EvidenceRecord[]) {
  const qualityWeights: Record<QualityState, number> = {
    Verified: 1,
    "Needs review": 0.55,
    "Missing proof": 0.15
  };

  const raw = records.reduce(
    (sum, record) => sum + qualityWeights[record.status],
    0
  );

  return Math.round((raw / Math.max(records.length, 1)) * 100);
}

export function formatTonnes(value: number) {
  return `${Intl.NumberFormat("en-US", {
    maximumFractionDigits: value >= 100 ? 0 : 1
  }).format(value)} tCO2e`;
}

export function formatNumber(value: number, maximumFractionDigits = 0) {
  return Intl.NumberFormat("en-US", {
    maximumFractionDigits
  }).format(value);
}

export function formatPercent(value: number, maximumFractionDigits = 0) {
  return `${Intl.NumberFormat("en-US", {
    maximumFractionDigits
  }).format(value)}%`;
}
