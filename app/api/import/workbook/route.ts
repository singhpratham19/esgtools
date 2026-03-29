import fs from "fs";
import path from "path";

import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

import { addImportRecord, createEvidence, createMetric } from "@/lib/db";
import { createId, timestamp } from "@/lib/server";
import { EmissionActivity, EvidenceRecord } from "@/lib/types";

const defaultWorkbookPath =
  "/Users/prathamsingh/Downloads/ESG_Proof_to_Report (1) (1).xlsx";

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => ({}));
  const filePath = payload.filePath || defaultWorkbookPath;

  if (!fs.existsSync(filePath)) {
    return NextResponse.json(
      { error: `Workbook not found at ${filePath}` },
      { status: 404 }
    );
  }

  const workbook = XLSX.readFile(filePath);
  const metrics = parseMetrics(workbook);
  const evidence = parseEvidence(workbook);

  for (const metric of metrics) {
    createMetric(metric);
  }

  for (const record of evidence) {
    createEvidence(record);
  }

  addImportRecord({
    id: createId("import"),
    filename: path.basename(filePath),
    importedAt: timestamp(),
    metricsAdded: metrics.length,
    evidenceAdded: evidence.length,
    note: "Workbook import completed"
  });

  return NextResponse.json({
    ok: true,
    filePath,
    metricsAdded: metrics.length,
    evidenceAdded: evidence.length
  });
}

function parseMetrics(workbook: XLSX.WorkBook): EmissionActivity[] {
  const sheet = workbook.Sheets.Data_Input;
  if (!sheet) {
    return [];
  }

  const rows = XLSX.utils.sheet_to_json<(string | number | undefined)[]>(sheet, {
    header: 1,
    raw: true
  });

  const metrics: EmissionActivity[] = [];

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index] ?? [];
    const category = typeof row[0] === "string" ? row[0] : "";
    const label = typeof row[1] === "string" ? row[1] : "";
    const value = row[2];
    const unit = typeof row[3] === "string" ? row[3] : "unit";

    if (!label || typeof value !== "number") {
      continue;
    }

    metrics.push({
      id: createId(`import-metric-${index}`),
      facilityId: "pune",
      scope: inferScope(category, label),
      category: category || "Imported",
      label,
      quantity: value,
      unit,
      emissionsTonnes: Number((value * 0.01).toFixed(2)),
      factorLabel: "Imported from workbook - factor review required",
      methodology: "Workbook import",
      proofId: createId("proof"),
      source: "Imported workbook",
      variancePct: 0,
      quality: "Needs review",
      scenarioDriver: inferDriver(label)
    });
  }

  return metrics.slice(0, 20);
}

function parseEvidence(workbook: XLSX.WorkBook): EvidenceRecord[] {
  const sheet = workbook.Sheets.Audit_Trail_Master;
  if (!sheet) {
    return [];
  }

  const rows = XLSX.utils.sheet_to_json<(string | number | undefined)[]>(sheet, {
    header: 1,
    raw: true
  });

  const records: EvidenceRecord[] = [];

  for (const row of rows) {
    if (typeof row[0] !== "string" || !row[0].startsWith("P-")) {
      continue;
    }

    records.push({
      proofId: createId("import-proof"),
      facilityId: "pune",
      documentName: typeof row[1] === "string" ? row[1] : "Imported evidence",
      metric: typeof row[2] === "string" ? row[2] : "Imported metric",
      owner: typeof row[6] === "string" ? row[6] : "Imported owner",
      reviewer: typeof row[6] === "string" ? row[6] : "Pending",
      uploadedAt: typeof row[4] === "string" ? row[4] : timestamp(),
      documentType: typeof row[5] === "string" ? row[5] : "Imported document",
      status: "Needs review"
    });
  }

  return records.slice(0, 20);
}

function inferScope(category: string, label: string): EmissionActivity["scope"] {
  const text = `${category} ${label}`.toLowerCase();
  if (text.includes("scope 3") || text.includes("supplier") || text.includes("transport")) {
    return "Scope 3";
  }
  if (text.includes("electricity")) {
    return "Scope 2";
  }
  return "Scope 1";
}

function inferDriver(label: string): EmissionActivity["scenarioDriver"] {
  const text = label.toLowerCase();
  if (text.includes("electricity") || text.includes("solar")) {
    return "renewable-electricity";
  }
  if (text.includes("transport") || text.includes("logistics")) {
    return "logistics-shift";
  }
  if (text.includes("waste")) {
    return "waste-circularity";
  }
  if (text.includes("steel") || text.includes("supplier") || text.includes("aluminum")) {
    return "supplier-programs";
  }
  return "thermal-efficiency";
}
