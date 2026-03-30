import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

import {
  controlTasks,
  emissionActivities,
  evidenceRecords,
  frameworkItems,
  supplierRecords,
  targetPrograms
} from "@/data/esg-data";
import {
  EmissionActivity,
  EvidenceRecord,
  FrameworkItem,
  QualityState,
  SupplierRecord,
  TargetProgram,
  TaskItem
} from "@/lib/types";

const isVercel = !!process.env.VERCEL;
const storageDir = isVercel
  ? path.join("/tmp", "esgtool-storage")
  : path.join(process.cwd(), "storage");
const dbPath = path.join(storageDir, "esgtool.sqlite");

let database: Database.Database | null = null;

type MetricRow = {
  id: string;
  facility_id: string;
  scope: string;
  category: string;
  label: string;
  quantity: number;
  unit: string;
  emissions_tonnes: number;
  factor_label: string;
  methodology: string;
  proof_id: string;
  source: string;
  variance_pct: number;
  quality: string;
  scenario_driver: string;
};

type EvidenceRow = {
  proof_id: string;
  facility_id: string;
  document_name: string;
  metric: string;
  owner: string;
  reviewer: string;
  uploaded_at: string;
  document_type: string;
  status: string;
  file_path: string | null;
};

type SupplierRow = {
  id: string;
  name: string;
  category: string;
  spend_usd: number;
  emissions_tonnes: number;
  response_rate: number;
  risk: string;
  status: string;
};

type TaskRow = {
  id: string;
  title: string;
  assignee: string;
  due_date: string;
  status: string;
  priority: string;
  framework: string;
};

type DisclosureRow = {
  id: string;
  framework: string;
  code: string;
  title: string;
  value: string;
  source: string;
  status: string;
};

type TargetRow = {
  id: string;
  title: string;
  pillar: string;
  baseline: string;
  target: string;
  target_year: string;
  owner: string;
  status: string;
};

export function getDb() {
  if (database) {
    return database;
  }

  fs.mkdirSync(storageDir, { recursive: true });

  database = new Database(dbPath, { timeout: 5000 });

  initializeSchema(database);
  seedDatabase(database);

  return database;
}

function initializeSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS metrics (
      id TEXT PRIMARY KEY,
      facility_id TEXT NOT NULL,
      scope TEXT NOT NULL,
      category TEXT NOT NULL,
      label TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      emissions_tonnes REAL NOT NULL,
      factor_label TEXT NOT NULL,
      methodology TEXT NOT NULL,
      proof_id TEXT NOT NULL,
      source TEXT NOT NULL,
      variance_pct REAL NOT NULL,
      quality TEXT NOT NULL,
      scenario_driver TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS evidence (
      proof_id TEXT PRIMARY KEY,
      facility_id TEXT NOT NULL,
      document_name TEXT NOT NULL,
      metric TEXT NOT NULL,
      owner TEXT NOT NULL,
      reviewer TEXT NOT NULL,
      uploaded_at TEXT NOT NULL,
      document_type TEXT NOT NULL,
      status TEXT NOT NULL,
      file_path TEXT
    );

    CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      spend_usd REAL NOT NULL,
      emissions_tonnes REAL NOT NULL,
      response_rate REAL NOT NULL,
      risk TEXT NOT NULL,
      status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      assignee TEXT NOT NULL,
      due_date TEXT NOT NULL,
      status TEXT NOT NULL,
      priority TEXT NOT NULL,
      framework TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS disclosures (
      id TEXT PRIMARY KEY,
      framework TEXT NOT NULL,
      code TEXT NOT NULL,
      title TEXT NOT NULL,
      value TEXT NOT NULL,
      source TEXT NOT NULL,
      status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS targets (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      pillar TEXT NOT NULL,
      baseline TEXT NOT NULL,
      target TEXT NOT NULL,
      target_year TEXT NOT NULL,
      owner TEXT NOT NULL,
      status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS imports (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      imported_at TEXT NOT NULL,
      metrics_added INTEGER NOT NULL,
      evidence_added INTEGER NOT NULL,
      note TEXT NOT NULL
    );
  `);
}

function seedDatabase(db: Database.Database) {
  if (countTable(db, "metrics") === 0) {
    const insert = db.prepare(`
      INSERT INTO metrics (
        id, facility_id, scope, category, label, quantity, unit,
        emissions_tonnes, factor_label, methodology, proof_id,
        source, variance_pct, quality, scenario_driver
      ) VALUES (
        @id, @facility_id, @scope, @category, @label, @quantity, @unit,
        @emissions_tonnes, @factor_label, @methodology, @proof_id,
        @source, @variance_pct, @quality, @scenario_driver
      )
    `);

    const transaction = db.transaction((items: EmissionActivity[]) => {
      for (const item of items) {
        insert.run(metricToRow(item));
      }
    });

    transaction(emissionActivities);
  }

  if (countTable(db, "evidence") === 0) {
    const insert = db.prepare(`
      INSERT INTO evidence (
        proof_id, facility_id, document_name, metric, owner, reviewer,
        uploaded_at, document_type, status, file_path
      ) VALUES (
        @proof_id, @facility_id, @document_name, @metric, @owner, @reviewer,
        @uploaded_at, @document_type, @status, @file_path
      )
    `);

    const transaction = db.transaction((items: EvidenceRecord[]) => {
      for (const item of items) {
        insert.run(evidenceToRow(item));
      }
    });

    transaction(evidenceRecords);
  }

  if (countTable(db, "suppliers") === 0) {
    const insert = db.prepare(`
      INSERT INTO suppliers (
        id, name, category, spend_usd, emissions_tonnes,
        response_rate, risk, status
      ) VALUES (
        @id, @name, @category, @spend_usd, @emissions_tonnes,
        @response_rate, @risk, @status
      )
    `);

    const transaction = db.transaction((items: SupplierRecord[]) => {
      for (const item of items) {
        insert.run(supplierToRow(item));
      }
    });

    transaction(supplierRecords);
  }

  if (countTable(db, "tasks") === 0) {
    const insert = db.prepare(`
      INSERT INTO tasks (
        id, title, assignee, due_date, status, priority, framework
      ) VALUES (
        @id, @title, @assignee, @due_date, @status, @priority, @framework
      )
    `);

    const transaction = db.transaction((items: TaskItem[]) => {
      for (const item of items) {
        insert.run(taskToRow(item));
      }
    });

    transaction(controlTasks);
  }

  if (countTable(db, "disclosures") === 0) {
    const insert = db.prepare(`
      INSERT INTO disclosures (
        id, framework, code, title, value, source, status
      ) VALUES (
        @id, @framework, @code, @title, @value, @source, @status
      )
    `);

    const transaction = db.transaction((items: FrameworkItem[]) => {
      for (const item of items) {
        insert.run(disclosureToRow(item));
      }
    });

    transaction(frameworkItems);
  }

  if (countTable(db, "targets") === 0) {
    const insert = db.prepare(`
      INSERT INTO targets (
        id, title, pillar, baseline, target, target_year, owner, status
      ) VALUES (
        @id, @title, @pillar, @baseline, @target, @target_year, @owner, @status
      )
    `);

    const transaction = db.transaction((items: TargetProgram[]) => {
      for (const item of items) {
        insert.run(targetToRow(item));
      }
    });

    transaction(targetPrograms);
  }
}

function countTable(db: Database.Database, tableName: string) {
  const row = db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get() as {
    count: number;
  };
  return row.count;
}

export function listMetrics(facilityId?: string) {
  const db = getDb();
  const rows = facilityId && facilityId !== "all"
    ? db
        .prepare("SELECT * FROM metrics WHERE facility_id = ? ORDER BY label")
        .all(facilityId)
    : db.prepare("SELECT * FROM metrics ORDER BY label").all();

  return (rows as MetricRow[]).map(rowToMetric);
}

export function getMetric(id: string) {
  const db = getDb();
  const row = db.prepare("SELECT * FROM metrics WHERE id = ?").get(id) as
    | MetricRow
    | undefined;
  return row ? rowToMetric(row) : null;
}

export function createMetric(input: EmissionActivity) {
  const db = getDb();
  db.prepare(`
    INSERT INTO metrics (
      id, facility_id, scope, category, label, quantity, unit,
      emissions_tonnes, factor_label, methodology, proof_id,
      source, variance_pct, quality, scenario_driver
    ) VALUES (
      @id, @facility_id, @scope, @category, @label, @quantity, @unit,
      @emissions_tonnes, @factor_label, @methodology, @proof_id,
      @source, @variance_pct, @quality, @scenario_driver
    )
  `).run(metricToRow(input));

  return getMetric(input.id);
}

export function updateMetric(id: string, input: EmissionActivity) {
  const db = getDb();
  db.prepare(`
    UPDATE metrics SET
      facility_id = @facility_id,
      scope = @scope,
      category = @category,
      label = @label,
      quantity = @quantity,
      unit = @unit,
      emissions_tonnes = @emissions_tonnes,
      factor_label = @factor_label,
      methodology = @methodology,
      proof_id = @proof_id,
      source = @source,
      variance_pct = @variance_pct,
      quality = @quality,
      scenario_driver = @scenario_driver
    WHERE id = @id
  `).run(metricToRow({ ...input, id }));

  return getMetric(id);
}

export function deleteMetric(id: string) {
  const db = getDb();
  db.prepare("DELETE FROM metrics WHERE id = ?").run(id);
}

export function listEvidence(facilityId?: string) {
  const db = getDb();
  const rows = facilityId && facilityId !== "all"
    ? db
        .prepare("SELECT * FROM evidence WHERE facility_id = ? ORDER BY uploaded_at DESC")
        .all(facilityId)
    : db.prepare("SELECT * FROM evidence ORDER BY uploaded_at DESC").all();

  return (rows as EvidenceRow[]).map(rowToEvidence);
}

export function getEvidence(proofId: string) {
  const db = getDb();
  const row = db.prepare("SELECT * FROM evidence WHERE proof_id = ?").get(proofId) as
    | EvidenceRow
    | undefined;
  return row ? rowToEvidence(row) : null;
}

export function createEvidence(input: EvidenceRecord) {
  const db = getDb();
  db.prepare(`
    INSERT INTO evidence (
      proof_id, facility_id, document_name, metric, owner, reviewer,
      uploaded_at, document_type, status, file_path
    ) VALUES (
      @proof_id, @facility_id, @document_name, @metric, @owner, @reviewer,
      @uploaded_at, @document_type, @status, @file_path
    )
  `).run(evidenceToRow(input));

  return getEvidence(input.proofId);
}

export function updateEvidence(proofId: string, input: EvidenceRecord) {
  const db = getDb();
  db.prepare(`
    UPDATE evidence SET
      facility_id = @facility_id,
      document_name = @document_name,
      metric = @metric,
      owner = @owner,
      reviewer = @reviewer,
      uploaded_at = @uploaded_at,
      document_type = @document_type,
      status = @status,
      file_path = @file_path
    WHERE proof_id = @proof_id
  `).run(evidenceToRow({ ...input, proofId }));

  return getEvidence(proofId);
}

export function deleteEvidence(proofId: string) {
  const db = getDb();
  db.prepare("DELETE FROM evidence WHERE proof_id = ?").run(proofId);
}

export function listSuppliers() {
  const db = getDb();
  return (db.prepare("SELECT * FROM suppliers ORDER BY emissions_tonnes DESC").all() as SupplierRow[]).map(
    rowToSupplier
  );
}

export function getSupplier(id: string) {
  const db = getDb();
  const row = db.prepare("SELECT * FROM suppliers WHERE id = ?").get(id) as
    | SupplierRow
    | undefined;
  return row ? rowToSupplier(row) : null;
}

export function createSupplier(input: SupplierRecord) {
  const db = getDb();
  db.prepare(`
    INSERT INTO suppliers (
      id, name, category, spend_usd, emissions_tonnes, response_rate, risk, status
    ) VALUES (
      @id, @name, @category, @spend_usd, @emissions_tonnes, @response_rate, @risk, @status
    )
  `).run(supplierToRow(input));

  return getSupplier(input.id);
}

export function updateSupplier(id: string, input: SupplierRecord) {
  const db = getDb();
  db.prepare(`
    UPDATE suppliers SET
      name = @name,
      category = @category,
      spend_usd = @spend_usd,
      emissions_tonnes = @emissions_tonnes,
      response_rate = @response_rate,
      risk = @risk,
      status = @status
    WHERE id = @id
  `).run(supplierToRow({ ...input, id }));

  return getSupplier(id);
}

export function deleteSupplier(id: string) {
  const db = getDb();
  db.prepare("DELETE FROM suppliers WHERE id = ?").run(id);
}

export function listTasks() {
  const db = getDb();
  return (db.prepare("SELECT * FROM tasks ORDER BY due_date ASC").all() as TaskRow[]).map(
    rowToTask
  );
}

export function getTask(id: string) {
  const db = getDb();
  const row = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as
    | TaskRow
    | undefined;
  return row ? rowToTask(row) : null;
}

export function createTask(input: TaskItem) {
  const db = getDb();
  db.prepare(`
    INSERT INTO tasks (
      id, title, assignee, due_date, status, priority, framework
    ) VALUES (
      @id, @title, @assignee, @due_date, @status, @priority, @framework
    )
  `).run(taskToRow(input));

  return getTask(input.id);
}

export function updateTask(id: string, input: TaskItem) {
  const db = getDb();
  db.prepare(`
    UPDATE tasks SET
      title = @title,
      assignee = @assignee,
      due_date = @due_date,
      status = @status,
      priority = @priority,
      framework = @framework
    WHERE id = @id
  `).run(taskToRow({ ...input, id }));

  return getTask(id);
}

export function deleteTask(id: string) {
  const db = getDb();
  db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
}

export function listDisclosures() {
  const db = getDb();
  return (db.prepare("SELECT * FROM disclosures ORDER BY framework, code").all() as DisclosureRow[]).map(
    rowToDisclosure
  );
}

export function getDisclosure(id: string) {
  const db = getDb();
  const row = db.prepare("SELECT * FROM disclosures WHERE id = ?").get(id) as
    | DisclosureRow
    | undefined;
  return row ? rowToDisclosure(row) : null;
}

export function createDisclosure(input: FrameworkItem) {
  const db = getDb();
  db.prepare(`
    INSERT INTO disclosures (
      id, framework, code, title, value, source, status
    ) VALUES (
      @id, @framework, @code, @title, @value, @source, @status
    )
  `).run(disclosureToRow(input));

  return getDisclosure(input.id);
}

export function updateDisclosure(id: string, input: FrameworkItem) {
  const db = getDb();
  db.prepare(`
    UPDATE disclosures SET
      framework = @framework,
      code = @code,
      title = @title,
      value = @value,
      source = @source,
      status = @status
    WHERE id = @id
  `).run(disclosureToRow({ ...input, id }));

  return getDisclosure(id);
}

export function deleteDisclosure(id: string) {
  const db = getDb();
  db.prepare("DELETE FROM disclosures WHERE id = ?").run(id);
}

export function listTargets() {
  const db = getDb();
  return (db.prepare("SELECT * FROM targets ORDER BY target_year ASC").all() as TargetRow[]).map(
    rowToTarget
  );
}

export function getTarget(id: string) {
  const db = getDb();
  const row = db.prepare("SELECT * FROM targets WHERE id = ?").get(id) as
    | TargetRow
    | undefined;
  return row ? rowToTarget(row) : null;
}

export function createTarget(input: TargetProgram) {
  const db = getDb();
  db.prepare(`
    INSERT INTO targets (
      id, title, pillar, baseline, target, target_year, owner, status
    ) VALUES (
      @id, @title, @pillar, @baseline, @target, @target_year, @owner, @status
    )
  `).run(targetToRow(input));

  return getTarget(input.id);
}

export function updateTarget(id: string, input: TargetProgram) {
  const db = getDb();
  db.prepare(`
    UPDATE targets SET
      title = @title,
      pillar = @pillar,
      baseline = @baseline,
      target = @target,
      target_year = @target_year,
      owner = @owner,
      status = @status
    WHERE id = @id
  `).run(targetToRow({ ...input, id }));

  return getTarget(id);
}

export function deleteTarget(id: string) {
  const db = getDb();
  db.prepare("DELETE FROM targets WHERE id = ?").run(id);
}

export function addImportRecord(input: {
  id: string;
  filename: string;
  importedAt: string;
  metricsAdded: number;
  evidenceAdded: number;
  note: string;
}) {
  const db = getDb();
  db.prepare(`
    INSERT INTO imports (
      id, filename, imported_at, metrics_added, evidence_added, note
    ) VALUES (
      @id, @filename, @importedAt, @metricsAdded, @evidenceAdded, @note
    )
  `).run(input);
}

function metricToRow(item: EmissionActivity): MetricRow {
  return {
    id: item.id,
    facility_id: item.facilityId,
    scope: item.scope,
    category: item.category,
    label: item.label,
    quantity: item.quantity,
    unit: item.unit,
    emissions_tonnes: item.emissionsTonnes,
    factor_label: item.factorLabel,
    methodology: item.methodology,
    proof_id: item.proofId,
    source: item.source,
    variance_pct: item.variancePct,
    quality: item.quality,
    scenario_driver: item.scenarioDriver
  };
}

function rowToMetric(row: MetricRow): EmissionActivity {
  return {
    id: row.id,
    facilityId: row.facility_id,
    scope: row.scope as EmissionActivity["scope"],
    category: row.category,
    label: row.label,
    quantity: row.quantity,
    unit: row.unit,
    emissionsTonnes: row.emissions_tonnes,
    factorLabel: row.factor_label,
    methodology: row.methodology,
    proofId: row.proof_id,
    source: row.source,
    variancePct: row.variance_pct,
    quality: row.quality as QualityState,
    scenarioDriver: row.scenario_driver as EmissionActivity["scenarioDriver"]
  };
}

function evidenceToRow(item: EvidenceRecord): EvidenceRow {
  return {
    proof_id: item.proofId,
    facility_id: item.facilityId,
    document_name: item.documentName,
    metric: item.metric,
    owner: item.owner,
    reviewer: item.reviewer,
    uploaded_at: item.uploadedAt,
    document_type: item.documentType,
    status: item.status,
    file_path: item.filePath ?? null
  };
}

function rowToEvidence(row: EvidenceRow): EvidenceRecord {
  return {
    proofId: row.proof_id,
    facilityId: row.facility_id,
    documentName: row.document_name,
    metric: row.metric,
    owner: row.owner,
    reviewer: row.reviewer,
    uploadedAt: row.uploaded_at,
    documentType: row.document_type,
    status: row.status as QualityState,
    filePath: row.file_path ?? undefined
  };
}

function supplierToRow(item: SupplierRecord): SupplierRow {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    spend_usd: item.spendUsd,
    emissions_tonnes: item.emissionsTonnes,
    response_rate: item.responseRate,
    risk: item.risk,
    status: item.status
  };
}

function rowToSupplier(row: SupplierRow): SupplierRecord {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    spendUsd: row.spend_usd,
    emissionsTonnes: row.emissions_tonnes,
    responseRate: row.response_rate,
    risk: row.risk as SupplierRecord["risk"],
    status: row.status as SupplierRecord["status"]
  };
}

function taskToRow(item: TaskItem): TaskRow {
  return {
    id: item.id,
    title: item.title,
    assignee: item.assignee,
    due_date: item.dueDate,
    status: item.status,
    priority: item.priority,
    framework: item.framework
  };
}

function rowToTask(row: TaskRow): TaskItem {
  return {
    id: row.id,
    title: row.title,
    assignee: row.assignee,
    dueDate: row.due_date,
    status: row.status as TaskItem["status"],
    priority: row.priority as TaskItem["priority"],
    framework: row.framework
  };
}

function disclosureToRow(item: FrameworkItem): DisclosureRow {
  return {
    id: item.id,
    framework: item.framework,
    code: item.code,
    title: item.title,
    value: item.value,
    source: item.source,
    status: item.status
  };
}

function rowToDisclosure(row: DisclosureRow): FrameworkItem {
  return {
    id: row.id,
    framework: row.framework,
    code: row.code,
    title: row.title,
    value: row.value,
    source: row.source,
    status: row.status as FrameworkItem["status"]
  };
}

function targetToRow(item: TargetProgram): TargetRow {
  return {
    id: item.id,
    title: item.title,
    pillar: item.pillar,
    baseline: item.baseline,
    target: item.target,
    target_year: item.targetYear,
    owner: item.owner,
    status: item.status
  };
}

function rowToTarget(row: TargetRow): TargetProgram {
  return {
    id: row.id,
    title: row.title,
    pillar: row.pillar as TargetProgram["pillar"],
    baseline: row.baseline,
    target: row.target,
    targetYear: row.target_year,
    owner: row.owner,
    status: row.status as TargetProgram["status"]
  };
}
