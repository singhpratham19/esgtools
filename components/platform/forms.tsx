"use client";

import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";

import {
  EmissionActivity,
  FrameworkItem,
  SupplierRecord,
  TargetProgram,
  TaskItem
} from "@/lib/types";

type FormState = {
  pending: boolean;
  message: string;
};

const emptyState: FormState = {
  pending: false,
  message: ""
};

export function WorkbookImportForm() {
  const router = useRouter();
  const [filePath, setFilePath] = useState(
    "/Users/prathamsingh/Downloads/ESG_Proof_to_Report (1) (1).xlsx"
  );
  const [state, setState] = useState<FormState>(emptyState);

  async function handleSubmit() {
    setState({
      pending: true,
      message: ""
    });

    const response = await fetch("/api/import/workbook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ filePath })
    });

    const payload = await response.json();
    setState({
      pending: false,
      message: response.ok
        ? `Imported ${payload.metricsAdded} metrics and ${payload.evidenceAdded} evidence records`
        : payload.error || "Import failed"
    });
    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <div className="entity-form">
      <h3>Import Workbook</h3>
      <label>
        Workbook path
        <input onChange={(event) => setFilePath(event.target.value)} value={filePath} />
      </label>
      <button disabled={state.pending} onClick={handleSubmit} type="button">
        {state.pending ? "Importing..." : "Import Excel workbook"}
      </button>
      {state.message ? <p className="form-message">{state.message}</p> : null}
    </div>
  );
}

export function MetricCreateForm() {
  const router = useRouter();
  const [state, setState] = useState<FormState>(emptyState);
  const [form, setForm] = useState({
    facilityId: "pune",
    scope: "Scope 1",
    category: "Environmental",
    label: "",
    quantity: "0",
    unit: "kWh",
    emissionsTonnes: "0",
    factorLabel: "Manual entry",
    methodology: "Manual",
    proofId: "",
    source: "User input",
    variancePct: "0",
    quality: "Needs review",
    scenarioDriver: "renewable-electricity"
  });

  async function handleSubmit() {
    setState({ pending: true, message: "" });
    const response = await fetch("/api/metrics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    });
    const payload = await response.json();
    setState({
      pending: false,
      message: response.ok ? `Created metric ${payload.label}` : payload.error || "Create failed"
    });
    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <div className="entity-form">
      <h3>New Metric</h3>
      <div className="form-grid">
        <label>
          Label
          <input onChange={(event) => updateForm(setForm, "label", event.target.value)} value={form.label} />
        </label>
        <label>
          Facility
          <select onChange={(event) => updateForm(setForm, "facilityId", event.target.value)} value={form.facilityId}>
            <option value="pune">Pune</option>
            <option value="nashik">Nashik</option>
            <option value="chennai">Chennai</option>
          </select>
        </label>
        <label>
          Scope
          <select onChange={(event) => updateForm(setForm, "scope", event.target.value)} value={form.scope}>
            <option value="Scope 1">Scope 1</option>
            <option value="Scope 2">Scope 2</option>
            <option value="Scope 3">Scope 3</option>
          </select>
        </label>
        <label>
          Quantity
          <input onChange={(event) => updateForm(setForm, "quantity", event.target.value)} value={form.quantity} />
        </label>
        <label>
          Unit
          <input onChange={(event) => updateForm(setForm, "unit", event.target.value)} value={form.unit} />
        </label>
        <label>
          Emissions
          <input onChange={(event) => updateForm(setForm, "emissionsTonnes", event.target.value)} value={form.emissionsTonnes} />
        </label>
        <label>
          Proof ID
          <input onChange={(event) => updateForm(setForm, "proofId", event.target.value)} value={form.proofId} />
        </label>
      </div>
      <button disabled={state.pending} onClick={handleSubmit} type="button">
        {state.pending ? "Saving..." : "Create metric"}
      </button>
      {state.message ? <p className="form-message">{state.message}</p> : null}
    </div>
  );
}

export function MetricEditorForm({ metric }: { metric: EmissionActivity }) {
  const router = useRouter();
  const [state, setState] = useState<FormState>(emptyState);
  const [form, setForm] = useState({
    ...metric,
    quantity: String(metric.quantity),
    emissionsTonnes: String(metric.emissionsTonnes),
    variancePct: String(metric.variancePct)
  });

  async function save() {
    setState({ pending: true, message: "" });
    const response = await fetch(`/api/metrics/${metric.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    });
    setState({
      pending: false,
      message: response.ok ? "Metric updated" : "Update failed"
    });
    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <div className="entity-form">
      <h3>Edit Metric</h3>
      <div className="form-grid">
        <label>
          Label
          <input onChange={(event) => updateForm(setForm, "label", event.target.value)} value={form.label} />
        </label>
        <label>
          Category
          <input onChange={(event) => updateForm(setForm, "category", event.target.value)} value={form.category} />
        </label>
        <label>
          Quantity
          <input onChange={(event) => updateForm(setForm, "quantity", event.target.value)} value={form.quantity} />
        </label>
        <label>
          Emissions
          <input onChange={(event) => updateForm(setForm, "emissionsTonnes", event.target.value)} value={form.emissionsTonnes} />
        </label>
        <label>
          Quality
          <select onChange={(event) => updateForm(setForm, "quality", event.target.value)} value={form.quality}>
            <option value="Verified">Verified</option>
            <option value="Needs review">Needs review</option>
            <option value="Missing proof">Missing proof</option>
          </select>
        </label>
        <label>
          Source
          <input onChange={(event) => updateForm(setForm, "source", event.target.value)} value={form.source} />
        </label>
      </div>
      <div className="form-actions">
        <button disabled={state.pending} onClick={save} type="button">
          {state.pending ? "Saving..." : "Save changes"}
        </button>
        <DeleteEntityButton endpoint={`/api/metrics/${metric.id}`} redirectTo="/program" />
      </div>
      {state.message ? <p className="form-message">{state.message}</p> : null}
    </div>
  );
}

export function EvidenceUploadForm() {
  const router = useRouter();
  const [state, setState] = useState<FormState>(emptyState);
  const [form, setForm] = useState({
    facilityId: "pune",
    metric: "",
    owner: "",
    reviewer: "",
    documentType: "Upload"
  });
  const [file, setFile] = useState<File | null>(null);

  async function handleSubmit() {
    if (!file) {
      setState({ pending: false, message: "Choose a file first" });
      return;
    }

    setState({ pending: true, message: "" });
    const data = new FormData();
    data.set("file", file);
    Object.entries(form).forEach(([key, value]) => data.set(key, value));

    const response = await fetch("/api/upload/evidence", {
      method: "POST",
      body: data
    });
    const payload = await response.json();
    setState({
      pending: false,
      message: response.ok ? `Uploaded ${payload.documentName}` : payload.error || "Upload failed"
    });
    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <div className="entity-form">
      <h3>Upload Evidence</h3>
      <div className="form-grid">
        <label>
          Metric
          <input onChange={(event) => updateForm(setForm, "metric", event.target.value)} value={form.metric} />
        </label>
        <label>
          Owner
          <input onChange={(event) => updateForm(setForm, "owner", event.target.value)} value={form.owner} />
        </label>
        <label>
          Reviewer
          <input onChange={(event) => updateForm(setForm, "reviewer", event.target.value)} value={form.reviewer} />
        </label>
        <label>
          File
          <input onChange={(event) => setFile(event.target.files?.[0] ?? null)} type="file" />
        </label>
      </div>
      <button disabled={state.pending} onClick={handleSubmit} type="button">
        {state.pending ? "Uploading..." : "Upload evidence"}
      </button>
      {state.message ? <p className="form-message">{state.message}</p> : null}
    </div>
  );
}

export function TaskCreateForm() {
  const router = useRouter();
  const [state, setState] = useState<FormState>(emptyState);
  const [form, setForm] = useState({
    title: "",
    assignee: "",
    dueDate: "",
    status: "Open",
    priority: "P2",
    framework: ""
  });

  async function submit() {
    setState({ pending: true, message: "" });
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setState({
      pending: false,
      message: response.ok ? "Task created" : "Task creation failed"
    });
    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <div className="entity-form">
      <h3>New Task</h3>
      <div className="form-grid">
        <label>
          Title
          <input onChange={(event) => updateForm(setForm, "title", event.target.value)} value={form.title} />
        </label>
        <label>
          Assignee
          <input onChange={(event) => updateForm(setForm, "assignee", event.target.value)} value={form.assignee} />
        </label>
        <label>
          Due date
          <input onChange={(event) => updateForm(setForm, "dueDate", event.target.value)} type="date" value={form.dueDate} />
        </label>
        <label>
          Framework
          <input onChange={(event) => updateForm(setForm, "framework", event.target.value)} value={form.framework} />
        </label>
      </div>
      <button disabled={state.pending} onClick={submit} type="button">
        {state.pending ? "Saving..." : "Create task"}
      </button>
      {state.message ? <p className="form-message">{state.message}</p> : null}
    </div>
  );
}

export function TaskEditorForm({ task }: { task: TaskItem }) {
  const router = useRouter();
  const [state, setState] = useState<FormState>(emptyState);
  const [form, setForm] = useState(task);

  async function save() {
    setState({ pending: true, message: "" });
    const response = await fetch(`/api/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setState({ pending: false, message: response.ok ? "Task updated" : "Update failed" });
    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <div className="entity-form">
      <h3>Edit Task</h3>
      <div className="form-grid">
        <label>
          Title
          <input onChange={(event) => updateForm(setForm, "title", event.target.value)} value={form.title} />
        </label>
        <label>
          Assignee
          <input onChange={(event) => updateForm(setForm, "assignee", event.target.value)} value={form.assignee} />
        </label>
        <label>
          Due date
          <input onChange={(event) => updateForm(setForm, "dueDate", event.target.value)} type="date" value={form.dueDate} />
        </label>
        <label>
          Status
          <select onChange={(event) => updateForm(setForm, "status", event.target.value)} value={form.status}>
            <option value="Open">Open</option>
            <option value="In review">In review</option>
            <option value="Done">Done</option>
            <option value="Blocked">Blocked</option>
          </select>
        </label>
      </div>
      <div className="form-actions">
        <button disabled={state.pending} onClick={save} type="button">
          {state.pending ? "Saving..." : "Save task"}
        </button>
        <DeleteEntityButton endpoint={`/api/tasks/${task.id}`} redirectTo="/controls" />
      </div>
      {state.message ? <p className="form-message">{state.message}</p> : null}
    </div>
  );
}

export function SupplierCreateForm() {
  const router = useRouter();
  const [state, setState] = useState<FormState>(emptyState);
  const [form, setForm] = useState({
    name: "",
    category: "",
    spendUsd: "0",
    emissionsTonnes: "0",
    responseRate: "0",
    risk: "Medium",
    status: "Estimated"
  });

  async function submit() {
    setState({ pending: true, message: "" });
    const response = await fetch("/api/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setState({ pending: false, message: response.ok ? "Supplier created" : "Create failed" });
    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <div className="entity-form">
      <h3>New Supplier</h3>
      <div className="form-grid">
        <label>
          Name
          <input onChange={(event) => updateForm(setForm, "name", event.target.value)} value={form.name} />
        </label>
        <label>
          Category
          <input onChange={(event) => updateForm(setForm, "category", event.target.value)} value={form.category} />
        </label>
        <label>
          Spend
          <input onChange={(event) => updateForm(setForm, "spendUsd", event.target.value)} value={form.spendUsd} />
        </label>
        <label>
          Emissions
          <input onChange={(event) => updateForm(setForm, "emissionsTonnes", event.target.value)} value={form.emissionsTonnes} />
        </label>
      </div>
      <button disabled={state.pending} onClick={submit} type="button">
        {state.pending ? "Saving..." : "Create supplier"}
      </button>
      {state.message ? <p className="form-message">{state.message}</p> : null}
    </div>
  );
}

export function SupplierEditorForm({ supplier }: { supplier: SupplierRecord }) {
  const router = useRouter();
  const [state, setState] = useState<FormState>(emptyState);
  const [form, setForm] = useState({
    ...supplier,
    spendUsd: String(supplier.spendUsd),
    emissionsTonnes: String(supplier.emissionsTonnes),
    responseRate: String(supplier.responseRate)
  });

  async function save() {
    setState({ pending: true, message: "" });
    const response = await fetch(`/api/suppliers/${supplier.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setState({ pending: false, message: response.ok ? "Supplier updated" : "Update failed" });
    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <div className="entity-form">
      <h3>Edit Supplier</h3>
      <div className="form-grid">
        <label>
          Name
          <input onChange={(event) => updateForm(setForm, "name", event.target.value)} value={form.name} />
        </label>
        <label>
          Category
          <input onChange={(event) => updateForm(setForm, "category", event.target.value)} value={form.category} />
        </label>
        <label>
          Risk
          <select onChange={(event) => updateForm(setForm, "risk", event.target.value)} value={form.risk}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </label>
        <label>
          Status
          <select onChange={(event) => updateForm(setForm, "status", event.target.value)} value={form.status}>
            <option value="Primary data">Primary data</option>
            <option value="Estimated">Estimated</option>
            <option value="Escalated">Escalated</option>
          </select>
        </label>
      </div>
      <div className="form-actions">
        <button disabled={state.pending} onClick={save} type="button">
          {state.pending ? "Saving..." : "Save supplier"}
        </button>
        <DeleteEntityButton endpoint={`/api/suppliers/${supplier.id}`} redirectTo="/suppliers" />
      </div>
      {state.message ? <p className="form-message">{state.message}</p> : null}
    </div>
  );
}

export function DisclosureCreateForm() {
  const router = useRouter();
  const [state, setState] = useState<FormState>(emptyState);
  const [form, setForm] = useState({
    framework: "",
    code: "",
    title: "",
    value: "",
    source: "",
    status: "In progress"
  });

  async function submit() {
    setState({ pending: true, message: "" });
    const response = await fetch("/api/disclosures", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setState({ pending: false, message: response.ok ? "Disclosure created" : "Create failed" });
    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <div className="entity-form">
      <h3>New Disclosure Item</h3>
      <div className="form-grid">
        <label>
          Framework
          <input onChange={(event) => updateForm(setForm, "framework", event.target.value)} value={form.framework} />
        </label>
        <label>
          Code
          <input onChange={(event) => updateForm(setForm, "code", event.target.value)} value={form.code} />
        </label>
        <label className="span-2">
          Title
          <input onChange={(event) => updateForm(setForm, "title", event.target.value)} value={form.title} />
        </label>
      </div>
      <button disabled={state.pending} onClick={submit} type="button">
        {state.pending ? "Saving..." : "Create disclosure"}
      </button>
      {state.message ? <p className="form-message">{state.message}</p> : null}
    </div>
  );
}

export function DisclosureEditorForm({ disclosure }: { disclosure: FrameworkItem }) {
  const router = useRouter();
  const [state, setState] = useState<FormState>(emptyState);
  const [form, setForm] = useState(disclosure);

  async function save() {
    setState({ pending: true, message: "" });
    const response = await fetch(`/api/disclosures/${disclosure.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setState({ pending: false, message: response.ok ? "Disclosure updated" : "Update failed" });
    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <div className="entity-form">
      <h3>Edit Disclosure</h3>
      <div className="form-grid">
        <label className="span-2">
          Title
          <input onChange={(event) => updateForm(setForm, "title", event.target.value)} value={form.title} />
        </label>
        <label className="span-2">
          Value
          <textarea onChange={(event) => updateForm(setForm, "value", event.target.value)} value={form.value} />
        </label>
        <label>
          Source
          <input onChange={(event) => updateForm(setForm, "source", event.target.value)} value={form.source} />
        </label>
        <label>
          Status
          <select onChange={(event) => updateForm(setForm, "status", event.target.value)} value={form.status}>
            <option value="Ready">Ready</option>
            <option value="In progress">In progress</option>
            <option value="Needs evidence">Needs evidence</option>
          </select>
        </label>
      </div>
      <div className="form-actions">
        <button disabled={state.pending} onClick={save} type="button">
          {state.pending ? "Saving..." : "Save disclosure"}
        </button>
        <DeleteEntityButton endpoint={`/api/disclosures/${disclosure.id}`} redirectTo="/disclosures" />
      </div>
      {state.message ? <p className="form-message">{state.message}</p> : null}
    </div>
  );
}

export function TargetCreateForm() {
  const router = useRouter();
  const [state, setState] = useState<FormState>(emptyState);
  const [form, setForm] = useState({
    title: "",
    pillar: "Environmental",
    baseline: "",
    target: "",
    targetYear: "",
    owner: "",
    status: "On track"
  });

  async function submit() {
    setState({ pending: true, message: "" });
    const response = await fetch("/api/targets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setState({ pending: false, message: response.ok ? "Target created" : "Create failed" });
    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <div className="entity-form">
      <h3>New Target</h3>
      <div className="form-grid">
        <label>
          Title
          <input onChange={(event) => updateForm(setForm, "title", event.target.value)} value={form.title} />
        </label>
        <label>
          Pillar
          <select onChange={(event) => updateForm(setForm, "pillar", event.target.value)} value={form.pillar}>
            <option value="Environmental">Environmental</option>
            <option value="Social">Social</option>
            <option value="Governance">Governance</option>
          </select>
        </label>
        <label>
          Baseline
          <input onChange={(event) => updateForm(setForm, "baseline", event.target.value)} value={form.baseline} />
        </label>
        <label>
          Target
          <input onChange={(event) => updateForm(setForm, "target", event.target.value)} value={form.target} />
        </label>
      </div>
      <button disabled={state.pending} onClick={submit} type="button">
        {state.pending ? "Saving..." : "Create target"}
      </button>
      {state.message ? <p className="form-message">{state.message}</p> : null}
    </div>
  );
}

export function TargetEditorForm({ target }: { target: TargetProgram }) {
  const router = useRouter();
  const [state, setState] = useState<FormState>(emptyState);
  const [form, setForm] = useState(target);

  async function save() {
    setState({ pending: true, message: "" });
    const response = await fetch(`/api/targets/${target.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setState({ pending: false, message: response.ok ? "Target updated" : "Update failed" });
    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <div className="entity-form">
      <h3>Edit Target</h3>
      <div className="form-grid">
        <label className="span-2">
          Title
          <input onChange={(event) => updateForm(setForm, "title", event.target.value)} value={form.title} />
        </label>
        <label>
          Baseline
          <input onChange={(event) => updateForm(setForm, "baseline", event.target.value)} value={form.baseline} />
        </label>
        <label>
          Target
          <input onChange={(event) => updateForm(setForm, "target", event.target.value)} value={form.target} />
        </label>
        <label>
          Status
          <select onChange={(event) => updateForm(setForm, "status", event.target.value)} value={form.status}>
            <option value="On track">On track</option>
            <option value="Needs funding">Needs funding</option>
            <option value="At risk">At risk</option>
          </select>
        </label>
      </div>
      <div className="form-actions">
        <button disabled={state.pending} onClick={save} type="button">
          {state.pending ? "Saving..." : "Save target"}
        </button>
        <DeleteEntityButton endpoint={`/api/targets/${target.id}`} redirectTo="/targets" />
      </div>
      {state.message ? <p className="form-message">{state.message}</p> : null}
    </div>
  );
}

export function DeleteEntityButton({
  endpoint,
  redirectTo
}: {
  endpoint: string;
  redirectTo: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    setPending(true);
    await fetch(endpoint, { method: "DELETE" });
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <button className="danger-button" disabled={pending} onClick={handleDelete} type="button">
      {pending ? "Deleting..." : "Delete"}
    </button>
  );
}

function updateForm(
  setForm: Dispatch<SetStateAction<any>>,
  key: string,
  value: string
) {
  setForm((current: any) => ({
    ...current,
    [key]: value
  }));
}
