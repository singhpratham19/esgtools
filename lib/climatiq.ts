/**
 * Climatiq API client for emission factor search and CO2e estimation.
 *
 * Docs: https://www.climatiq.io/docs
 * Base: https://api.climatiq.io
 * Auth: Bearer token via CLIMATIQ_API_KEY env var
 */

const BASE = "https://api.climatiq.io";
const DATA_VERSION = "^21";

function apiKey(): string {
  const key = process.env.CLIMATIQ_API_KEY ?? "";
  return key;
}

function headers() {
  return {
    Authorization: `Bearer ${apiKey()}`,
    "Content-Type": "application/json",
  };
}

function isConfigured(): boolean {
  return apiKey().length > 0;
}

// ── Types ──────────────────────────────────────────────

export interface ClimatiqEmissionFactor {
  id: string;
  activity_id: string;
  name: string;
  category: string;
  sector: string;
  source: string;
  source_link: string;
  year: number;
  region: string;
  region_name: string;
  description: string;
  unit: string;
  unit_type: string;
  factor: number | null;
  factor_calculation_method: string | null;
  constituent_gases: {
    co2e_total: number | null;
    co2e_other: number | null;
    co2: number | null;
    ch4: number | null;
    n2o: number | null;
  } | null;
  supported_calculation_methods: string[];
  access_type: string;
}

export interface ClimatiqSearchResponse {
  current_page: number;
  last_page: number;
  total_results: number;
  results: ClimatiqEmissionFactor[];
  possible_filters: {
    year: number[];
    source: { source: string; datasets: string[] }[];
    region: { id: string; name: string }[];
    category: string[];
    sector: string[];
    unit_type: string[];
  };
}

export interface ClimatiqEstimation {
  co2e: number;
  co2e_unit: string;
  co2e_calculation_method: string;
  co2e_calculation_origin: string;
  emission_factor: {
    name: string;
    activity_id: string;
    id: string;
    source: string;
    year: number;
    region: string;
  } | null;
  constituent_gases: {
    co2e_total: number | null;
    co2: number | null;
    ch4: number | null;
    n2o: number | null;
  } | null;
  activity_data: {
    activity_value: number;
    activity_unit: string;
  };
  notices: { severity: string; message: string }[];
}

export interface ClimatiqFuelEstimation {
  combustion: {
    co2e: number;
    co2e_unit: string;
    co2e_calculation_method: string;
    constituent_gases: Record<string, number | null> | null;
  };
  well_to_tank: {
    co2e: number;
    co2e_unit: string;
  };
  notices: { severity: string; message: string }[];
}

export interface ClimatiqElectricityEstimation {
  location: {
    consumption: { co2e: number; co2e_unit: string };
    well_to_tank: { co2e: number; co2e_unit: string };
    transmission_and_distribution: { co2e: number; co2e_unit: string };
  };
  market: {
    consumption: { co2e: number; co2e_unit: string };
    well_to_tank: { co2e: number; co2e_unit: string };
    transmission_and_distribution: { co2e: number; co2e_unit: string };
  } | null;
  notices: { severity: string; message: string }[];
}

// ── Search endpoint ────────────────────────────────────

export interface SearchParams {
  query?: string;
  activity_id?: string;
  category?: string;
  scope?: string;
  sector?: string;
  source?: string;
  year?: number;
  region?: string;
  unit_type?: string;
  page?: number;
  results_per_page?: number;
}

export async function searchEmissionFactors(
  params: SearchParams
): Promise<ClimatiqSearchResponse> {
  if (!isConfigured()) {
    return emptySearchResponse();
  }

  const url = new URL(`${BASE}/data/v1/search`);
  url.searchParams.set("data_version", DATA_VERSION);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  const res = await fetch(url.toString(), { headers: headers(), next: { revalidate: 3600 } });

  if (!res.ok) {
    console.error(`[climatiq] search failed: ${res.status} ${res.statusText}`);
    return emptySearchResponse();
  }

  return res.json();
}

// ── Basic estimate endpoint ────────────────────────────

export interface EstimateParams {
  activity_id: string;
  parameters: Record<string, string | number>;
  data_version?: string;
  region?: string;
  year?: number;
}

export async function estimate(
  params: EstimateParams
): Promise<ClimatiqEstimation | null> {
  if (!isConfigured()) return null;

  const body: Record<string, unknown> = {
    emission_factor: {
      activity_id: params.activity_id,
      data_version: params.data_version ?? DATA_VERSION,
      ...(params.region ? { region: params.region } : {}),
      ...(params.year ? { year: params.year } : {}),
    },
    parameters: params.parameters,
  };

  const res = await fetch(`${BASE}/data/v1/estimate`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    console.error(`[climatiq] estimate failed: ${res.status} ${res.statusText}`);
    return null;
  }

  return res.json();
}

// ── Electricity endpoint ───────────────────────────────

export interface ElectricityParams {
  region: string;
  amount_kwh: number;
  year?: number;
}

export async function estimateElectricity(
  params: ElectricityParams
): Promise<ClimatiqElectricityEstimation | null> {
  if (!isConfigured()) return null;

  const body = {
    region: params.region,
    year: params.year,
    amount: {
      energy: params.amount_kwh,
      energy_unit: "kWh",
    },
  };

  const res = await fetch(`${BASE}/energy/v1.3/electricity`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    console.error(`[climatiq] electricity estimate failed: ${res.status}`);
    return null;
  }

  return res.json();
}

// ── Fuel endpoint ──────────────────────────────────────

export interface FuelParams {
  fuel_type: string;
  amount: number;
  amount_unit: string;
  region?: string;
  year?: number;
}

export async function estimateFuel(
  params: FuelParams
): Promise<ClimatiqFuelEstimation | null> {
  if (!isConfigured()) return null;

  const amountKey =
    params.amount_unit === "kWh" ? "energy" :
    params.amount_unit === "kg" || params.amount_unit === "t" ? "weight" :
    "volume";

  const body: Record<string, unknown> = {
    fuel_type: params.fuel_type,
    amount: {
      [amountKey]: params.amount,
      [`${amountKey}_unit`]: params.amount_unit,
    },
    ...(params.region ? { region: params.region } : {}),
    ...(params.year ? { year: params.year } : {}),
  };

  const res = await fetch(`${BASE}/energy/v1.3/fuel`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    console.error(`[climatiq] fuel estimate failed: ${res.status}`);
    return null;
  }

  return res.json();
}

// ── Batch estimate ─────────────────────────────────────

export async function batchEstimate(
  items: EstimateParams[]
): Promise<(ClimatiqEstimation | null)[]> {
  if (!isConfigured() || items.length === 0) return [];

  const body = items.map((item) => ({
    emission_factor: {
      activity_id: item.activity_id,
      data_version: item.data_version ?? DATA_VERSION,
      ...(item.region ? { region: item.region } : {}),
      ...(item.year ? { year: item.year } : {}),
    },
    parameters: item.parameters,
  }));

  const res = await fetch(`${BASE}/data/v1/estimate/batch`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    console.error(`[climatiq] batch estimate failed: ${res.status}`);
    return items.map(() => null);
  }

  const data = await res.json();
  return data.results ?? [];
}

// ── Helpers ────────────────────────────────────────────

/**
 * Maps an internal scope + category to a Climatiq activity_id suggestion.
 */
export function suggestActivityId(
  scope: string,
  category: string,
  unit: string
): string {
  const cat = category.toLowerCase();
  const u = unit.toLowerCase();

  // Scope 1: Direct emissions
  if (scope === "Scope 1") {
    if (cat.includes("diesel") || cat.includes("fuel")) return "fuel_type_fuel_use-fuel_type_diesel";
    if (cat.includes("natural gas") || cat.includes("gas")) return "fuel_type_fuel_use-fuel_type_natural_gas";
    if (cat.includes("combustion")) return "fuel_type_fuel_use-fuel_type_motor_gasoline";
    if (cat.includes("refrigerant")) return "refrigerants-use_of_refrigerants";
    return "fuel_type_fuel_use-fuel_type_natural_gas";
  }

  // Scope 2: Purchased energy
  if (scope === "Scope 2") {
    if (u.includes("kwh") || cat.includes("electric")) return "electricity-supply_grid-source_residual_mix";
    if (cat.includes("heat") || cat.includes("steam")) return "heat_and_steam-type_heat_and_steam";
    return "electricity-supply_grid-source_residual_mix";
  }

  // Scope 3: Value chain
  if (cat.includes("travel") || cat.includes("commut")) return "passenger_vehicle-vehicle_type_car-fuel_source_na";
  if (cat.includes("freight") || cat.includes("logistic") || cat.includes("transport")) return "freight_vehicle-vehicle_type_hgv-fuel_source_na";
  if (cat.includes("waste")) return "waste_type_mixed_msw-disposal_method_landfilled";
  if (cat.includes("water")) return "water-supply_type_supply";
  if (cat.includes("purchas") || cat.includes("goods")) return "consumer_goods-type_clothing";

  return "electricity-supply_grid-source_residual_mix";
}

/** Whether the Climatiq API is configured with a key. */
export function climatiqEnabled(): boolean {
  return isConfigured();
}

function emptySearchResponse(): ClimatiqSearchResponse {
  return {
    current_page: 1,
    last_page: 1,
    total_results: 0,
    results: [],
    possible_filters: {
      year: [],
      source: [],
      region: [],
      category: [],
      sector: [],
      unit_type: [],
    },
  };
}
