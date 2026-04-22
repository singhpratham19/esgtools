"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useState, useMemo } from "react";

/* ──────────────────────────────────────────────────────────
   CSV Export Button — downloads rows as CSV
   ────────────────────────────────────────────────────────── */

type CsvRow = Record<string, string | number | boolean | null | undefined>;

export function ExportCsvButton({
  data,
  filename,
  label = "Export CSV",
  className = "btn",
}: {
  data: CsvRow[];
  filename: string;
  label?: string;
  className?: string;
}) {
  function handleExport() {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const escape = (v: unknown) => {
      if (v === null || v === undefined) return "";
      const s = String(v);
      if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };
    const csv = [
      headers.join(","),
      ...data.map((row) => headers.map((h) => escape(row[h])).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <button className={className} onClick={handleExport} type="button" disabled={!data.length}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {label}
    </button>
  );
}

/* ──────────────────────────────────────────────────────────
   Refresh Button — re-runs server components
   ────────────────────────────────────────────────────────── */

export function RefreshButton({ label = "Refresh", className = "btn" }: { label?: string; className?: string }) {
  const router = useRouter();
  const [spinning, setSpinning] = useState(false);

  function handle() {
    setSpinning(true);
    router.refresh();
    setTimeout(() => setSpinning(false), 800);
  }

  return (
    <button className={className} onClick={handle} type="button" disabled={spinning}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ animation: spinning ? "spin 600ms linear" : undefined }}
      >
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" />
        <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14" />
      </svg>
      {spinning ? "Refreshing…" : label}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
}

/* ──────────────────────────────────────────────────────────
   Jump-to button — smooth scrolls to an element by id
   ────────────────────────────────────────────────────────── */

export function JumpToButton({
  targetId,
  label,
  icon,
  className = "btn primary",
}: {
  targetId: string;
  label: string;
  icon?: ReactNode;
  className?: string;
}) {
  function handle() {
    const el = document.getElementById(targetId);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    const firstInput = el.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      "input, textarea, select"
    );
    firstInput?.focus();
  }

  return (
    <button className={className} onClick={handle} type="button">
      {icon ?? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      )}
      {label}
    </button>
  );
}

/* ──────────────────────────────────────────────────────────
   Quick-status action — PATCH a task/metric/etc. via API
   ────────────────────────────────────────────────────────── */

export function QuickUpdateButton({
  endpoint,
  body,
  label,
  confirmLabel = label,
  icon,
  className = "row-action",
}: {
  endpoint: string;
  body: Record<string, unknown>;
  label: string;
  confirmLabel?: string;
  icon?: ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "pending" | "done" | "error">("idle");

  async function handle() {
    setState("pending");
    try {
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("fail");
      setState("done");
      router.refresh();
      setTimeout(() => setState("idle"), 1500);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2000);
    }
  }

  return (
    <button className={className} onClick={handle} type="button" disabled={state === "pending"}>
      {icon}
      {state === "pending" ? "…" : state === "done" ? "✓ " + confirmLabel : state === "error" ? "Error" : label}
    </button>
  );
}

/* ──────────────────────────────────────────────────────────
   Client-side text filter wrapping children rows
   Shows a search box and hides rows whose data-search attribute
   doesn't contain the query.
   ────────────────────────────────────────────────────────── */

export function FilterBar({
  placeholder = "Filter…",
  children,
  extra,
}: {
  placeholder?: string;
  children?: ReactNode;
  extra?: ReactNode;
}) {
  const [q, setQ] = useState("");

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.toLowerCase();
    setQ(value);
    const rows = document.querySelectorAll<HTMLElement>("[data-search]");
    rows.forEach((row) => {
      const text = (row.dataset.search || "").toLowerCase();
      row.style.display = !value || text.includes(value) ? "" : "none";
    });
  }

  return (
    <div className="filter-bar">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ opacity: 0.5 }}>
        <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" />
      </svg>
      <input type="text" placeholder={placeholder} value={q} onChange={onChange} />
      {children}
      {extra ? <span style={{ marginLeft: "auto" }}>{extra}</span> : null}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Print / Save report button
   ────────────────────────────────────────────────────────── */

export function PrintButton({ label = "Print report", className = "btn" }: { label?: string; className?: string }) {
  return (
    <button className={className} onClick={() => window.print()} type="button">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 6 2 18 2 18 9" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
      </svg>
      {label}
    </button>
  );
}

/* ──────────────────────────────────────────────────────────
   Copy-to-clipboard badge
   ────────────────────────────────────────────────────────── */

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  async function handle() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* noop */
    }
  }
  return (
    <button className="row-action" onClick={handle} type="button">
      {copied ? "Copied ✓" : label}
    </button>
  );
}

/* ──────────────────────────────────────────────────────────
   Summary counter — renders a big number + label
   (used on integrated dashboard header)
   ────────────────────────────────────────────────────────── */

export function useCounter(values: number[]) {
  return useMemo(() => values.reduce((s, v) => s + v, 0), [values]);
}
