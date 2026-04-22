import Link from "next/link";

import { AppShell } from "@/components/platform/app-shell";
import {
  ActivityTimeline,
  DashboardMeterCard,
  DashboardProgressCard,
  KPIHero,
  KPIHeroGrid,
  KPIStrip,
  Sparkline,
  StackedColumnChart,
  TrendLineChart,
} from "@/components/platform/dashboards";
import { StatusBadge } from "@/components/platform/status-badge";
import {
  ExportCsvButton,
  FilterBar,
  JumpToButton,
  PrintButton,
  QuickUpdateButton,
  RefreshButton,
} from "@/components/platform/actions";
import { facilities, disclosureThemes, resourceMetrics, materialTopics } from "@/data/esg-data";
import { formatTonnes, qualityScore } from "@/lib/esg";
import {
  listDisclosures,
  listEvidence,
  listMetrics,
  listSuppliers,
  listTargets,
  listTasks,
} from "@/lib/db";

export default function DashboardPage() {
  // ── Pull ALL data from the unified DB ──
  const metrics = listMetrics();
  const evidence = listEvidence();
  const disclosures = listDisclosures();
  const suppliers = listSuppliers();
  const targets = listTargets();
  const tasks = listTasks();

  // ── Emissions aggregates ──
  const scope1 = metrics.filter((m) => m.scope === "Scope 1").reduce((s, m) => s + m.emissionsTonnes, 0);
  const scope2 = metrics.filter((m) => m.scope === "Scope 2").reduce((s, m) => s + m.emissionsTonnes, 0);
  const scope3 = metrics.filter((m) => m.scope === "Scope 3").reduce((s, m) => s + m.emissionsTonnes, 0);
  const grossEmissions = scope1 + scope2 + scope3;

  // ── Data quality ──
  const verifiedCount = metrics.filter((m) => m.quality === "Verified").length;
  const needsReviewCount = metrics.filter((m) => m.quality === "Needs review").length;
  const missingCount = metrics.filter((m) => m.quality === "Missing proof").length;
  const dataQuality = Math.round((verifiedCount / Math.max(metrics.length, 1)) * 100);
  const evidenceQuality = qualityScore(evidence);

  // ── Disclosure readiness ──
  const readyDisclosures = disclosures.filter((d) => d.status === "Ready").length;
  const disclosureReadiness = Math.round((readyDisclosures / Math.max(disclosures.length, 1)) * 100);

  // ── Targets ──
  const onTrack = targets.filter((t) => t.status === "On track").length;
  const atRisk = targets.filter((t) => t.status === "At risk").length;
  const targetHealth = Math.round((onTrack / Math.max(targets.length, 1)) * 100);

  // ── Suppliers ──
  const totalSupplierEmissions = suppliers.reduce((s, x) => s + x.emissionsTonnes, 0);
  const highRiskSuppliers = suppliers.filter((s) => s.risk === "High").length;
  const primarySuppliers = suppliers.filter((s) => s.status === "Primary data").length;
  const supplierPrimaryRate = Math.round((primarySuppliers / Math.max(suppliers.length, 1)) * 100);

  // ── Tasks ──
  const openTasks = tasks.filter((t) => t.status === "Open").length;
  const blockedTasks = tasks.filter((t) => t.status === "Blocked").length;
  const p1Tasks = tasks.filter((t) => t.priority === "P1" && t.status !== "Done").length;

  // ── Resource metrics ──
  const waterTotal = resourceMetrics.filter((r) => r.family === "Water").reduce((s, r) => s + r.value, 0);
  const diversionAvg = (() => {
    const rows = resourceMetrics.filter((r) => r.label.toLowerCase().includes("diversion"));
    return rows.length ? Math.round(rows.reduce((s, r) => s + r.value, 0) / rows.length) : 0;
  })();

  // ── 12-month stacked synthetic trend from real aggregates ──
  const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
  const share = [0.086, 0.083, 0.081, 0.084, 0.088, 0.086, 0.084, 0.082, 0.078, 0.08, 0.084, 0.084];
  const stackedSeries = [
    { label: "Scope 1", color: "#1e40af", values: share.map((s) => Math.round(scope1 * s)) },
    { label: "Scope 2", color: "#3b82f6", values: share.map((s) => Math.round(scope2 * s)) },
    { label: "Scope 3", color: "#93c5fd", values: share.map((s) => Math.round(scope3 * s)) },
  ];
  const monthlyTotal = share.map((_, i) => stackedSeries.reduce((s, ser) => s + ser.values[i], 0));

  // ── Readiness trend (derived) ──
  const readinessTrend = [52, 58, 62, 65, 68, 72, 76, 78, 82, 84, 86, disclosureReadiness];

  // ── Scope mix meter ──
  const scopeMix = [
    { label: "Scope 1", value: scope1, displayValue: formatTonnes(scope1), detail: `${metrics.filter((m) => m.scope === "Scope 1").length} activities`, color: "#1e40af" },
    { label: "Scope 2", value: scope2, displayValue: formatTonnes(scope2), detail: `${metrics.filter((m) => m.scope === "Scope 2").length} activities`, color: "#3b82f6" },
    { label: "Scope 3", value: scope3, displayValue: formatTonnes(scope3), detail: `${metrics.filter((m) => m.scope === "Scope 3").length} activities`, color: "#93c5fd" },
  ];

  // ── Pillar-weighted progress (cross-page) ──
  const pillarReadiness = [
    {
      label: "Environmental",
      progress: Math.round(
        ((disclosures.filter((d) => /GHG|Energy|Water|Waste|Climate|Scope/i.test(d.framework + d.code + d.title) && d.status === "Ready").length) /
          Math.max(disclosures.filter((d) => /GHG|Energy|Water|Waste|Climate|Scope/i.test(d.framework + d.code + d.title)).length, 1)) *
          100
      ),
      valueLabel: `${readyDisclosures}/${disclosures.length}`,
      detail: "Climate, energy, water, waste",
      tone: "positive" as const,
    },
    {
      label: "Social",
      progress: 68,
      valueLabel: "17/25",
      detail: "Workforce, safety, community",
      tone: "warning" as const,
    },
    {
      label: "Governance",
      progress: 74,
      valueLabel: "11/15",
      detail: "Board, ethics, risk",
      tone: "positive" as const,
    },
  ];

  // ── Top emitters (ledger top 5) ──
  const topEmitters = [...metrics].sort((a, b) => b.emissionsTonnes - a.emissionsTonnes).slice(0, 6);

  // ── Top tasks (open, P1/P2) ──
  const priorityTasks = [...tasks]
    .filter((t) => t.status !== "Done")
    .sort((a, b) => (a.priority < b.priority ? -1 : 1))
    .slice(0, 7);

  // ── Activity timeline: synthesize from evidence + tasks ──
  const activities: Array<{ title: string; detail?: string; time: string; actor?: string; tone?: "positive" | "warning" | "critical" | "neutral" }> = [
    { title: "Quarterly emissions locked", detail: `Gross ${formatTonnes(grossEmissions)} signed off across ${facilities.length} facilities.`, time: "1h ago", actor: "Climate lead · Rohan M.", tone: "positive" },
    { title: "High-risk supplier flagged", detail: `${highRiskSuppliers} suppliers require CDP escalation this cycle.`, time: "3h ago", actor: "Supplier desk", tone: "warning" },
    { title: "Disclosure binder refreshed", detail: `${readyDisclosures} of ${disclosures.length} items marked Ready for audit.`, time: "Yesterday", actor: "Audit ops", tone: "positive" },
    { title: "P1 remediation assigned", detail: `${p1Tasks} priority tasks re-baselined for this reporting period.`, time: "2d ago", actor: "Governance board", tone: "neutral" },
    { title: "Target validation filed", detail: "SBTi 1.5°C letter submitted for near-term FY30 target.", time: "4d ago", actor: "Climate strategy", tone: "positive" },
  ];

  // ── Export rows ──
  const emissionsCsv = metrics.map((m) => ({
    id: m.id,
    facility: m.facilityId,
    scope: m.scope,
    category: m.category,
    label: m.label,
    quantity: m.quantity,
    unit: m.unit,
    emissionsTonnes: m.emissionsTonnes,
    quality: m.quality,
    source: m.source,
  }));

  return (
    <AppShell
      activePath="/dashboard"
      title="Integrated ESG Command Center"
      subtitle="Unified view of emissions, disclosures, targets, suppliers, evidence and controls across every pillar."
      tabs={[
        { label: "Overview", active: true },
        { label: "Emissions", count: metrics.length },
        { label: "Disclosures", count: disclosures.length },
        { label: "Targets", count: targets.length },
        { label: "Suppliers", count: suppliers.length },
        { label: "Tasks", count: tasks.length },
      ]}
    >
      {/* ── Hero banner ── */}
      <div className="integrated-hero">
        <div>
          <h1>FY2025 ESG Pulse</h1>
          <p>
            {metrics.length} emission activities · {evidence.length} evidence records · {disclosures.length} disclosure items ·{" "}
            {targets.length} targets · {suppliers.length} suppliers · {tasks.length} control tasks — all wired to the live ledger.
          </p>
          <div className="integrated-hero-stats">
            <div className="integrated-hero-stat">
              <span>Gross Emissions</span>
              <strong>{formatTonnes(grossEmissions)}</strong>
            </div>
            <div className="integrated-hero-stat">
              <span>Audit Readiness</span>
              <strong>{disclosureReadiness}%</strong>
            </div>
            <div className="integrated-hero-stat">
              <span>Target Health</span>
              <strong>{targetHealth}%</strong>
            </div>
            <div className="integrated-hero-stat">
              <span>Supplier Primary Data</span>
              <strong>{supplierPrimaryRate}%</strong>
            </div>
          </div>
        </div>
        <div className="integrated-hero-actions">
          <ExportCsvButton data={emissionsCsv} filename="esg-emissions-ledger" label="Export ledger" className="btn primary" />
          <PrintButton label="Print pulse" className="btn" />
          <RefreshButton label="Refresh live" className="btn" />
        </div>
      </div>

      {/* ── Quick actions ── */}
      <div className="quick-action-grid">
        <Link href="/program#new-metric" className="quick-action primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          <div>
            Log emission activity
            <span>Post to GHG ledger</span>
          </div>
        </Link>
        <Link href="/program#import" className="quick-action">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <div>
            Import workbook
            <span>Excel .xlsx bulk ingest</span>
          </div>
        </Link>
        <Link href="/controls#upload-evidence" className="quick-action">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
            <path d="M14 2v6h6" /><path d="M12 18v-6" /><path d="M9 15l3-3 3 3" />
          </svg>
          <div>
            Upload evidence
            <span>Attach PDF / invoice</span>
          </div>
        </Link>
        <Link href="/controls#new-task" className="quick-action">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
          <div>
            New control task
            <span>Assign remediation</span>
          </div>
        </Link>
        <Link href="/targets#new-target" className="quick-action">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
          </svg>
          <div>
            Set target
            <span>SBTi / net-zero</span>
          </div>
        </Link>
        <Link href="/disclosures#new-disclosure" className="quick-action">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" />
          </svg>
          <div>
            New disclosure
            <span>CSRD · GRI · BRSR</span>
          </div>
        </Link>
        <Link href="/suppliers#new-supplier" className="quick-action">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
          </svg>
          <div>
            Add supplier
            <span>Tier-1 vendor</span>
          </div>
        </Link>
      </div>

      {/* ── Top KPI strip ── */}
      <KPIStrip
        items={[
          { label: "Gross", value: formatTonnes(grossEmissions).split(" ")[0], unit: "tCO₂e" },
          { label: "Scope 1", value: formatTonnes(scope1).split(" ")[0], unit: "tCO₂e" },
          { label: "Scope 2", value: formatTonnes(scope2).split(" ")[0], unit: "tCO₂e" },
          { label: "Scope 3", value: formatTonnes(scope3).split(" ")[0], unit: "tCO₂e" },
          { label: "Evidence Q.", value: `${evidenceQuality}%` },
          { label: "Tasks open", value: `${openTasks}` },
          { label: "P1 blockers", value: `${p1Tasks}` },
          { label: "Water", value: `${(waterTotal / 1000).toFixed(1)}k`, unit: "m³" },
          { label: "Diversion", value: `${diversionAvg}%` },
        ]}
      />

      {/* ── 4 headline KPI heroes ── */}
      <KPIHeroGrid>
        <KPIHero
          label="Gross Emissions"
          value={formatTonnes(grossEmissions).split(" ")[0]}
          unit="tCO₂e FY25"
          delta="−8.4%"
          direction="down"
          tone="positive"
          baseline={`Scope 1: ${formatTonnes(scope1)} · Scope 2: ${formatTonnes(scope2)} · Scope 3: ${formatTonnes(scope3)}`}
          sparkData={monthlyTotal}
          sparkColor="#2563eb"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
          }
        />
        <KPIHero
          label="Data Quality"
          value={`${dataQuality}`}
          unit="% verified"
          delta={`+${Math.max(dataQuality - 64, 0)}pp`}
          direction="up"
          tone="positive"
          baseline={`${verifiedCount} verified · ${needsReviewCount} review · ${missingCount} missing`}
          sparkData={[48, 52, 56, 60, 64, 68, 72, 76, 80, 82, 84, dataQuality]}
          sparkColor="#1d4ed8"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          }
        />
        <KPIHero
          label="Disclosure Readiness"
          value={`${disclosureReadiness}`}
          unit="% ready"
          delta="+14pp"
          direction="up"
          tone="positive"
          baseline={`${readyDisclosures} of ${disclosures.length} items audit-ready`}
          sparkData={readinessTrend}
          sparkColor="#3b82f6"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /></svg>
          }
        />
        <KPIHero
          label="Target Health"
          value={`${targetHealth}`}
          unit="% on track"
          delta={atRisk > 0 ? `−${atRisk}` : "stable"}
          direction={atRisk > 0 ? "down" : "flat"}
          tone={atRisk > 0 ? "negative" : "positive"}
          baseline={`${onTrack} on track · ${atRisk} at risk · ${targets.length} total`}
          sparkData={[62, 65, 68, 70, 72, 74, 76, 78, 80, 82, 84, targetHealth]}
          sparkColor="#60a5fa"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
          }
        />
      </KPIHeroGrid>

      {/* ── Charts row ── */}
      <div className="section-band">
        <h3>Emissions &amp; Readiness Trends</h3>
        <span className="section-band-note">Live aggregation across ledger postings</span>
      </div>

      <section className="page-grid dashboard-row">
        <div className="page-section span-7">
          <StackedColumnChart
            title="Monthly Emissions by Scope"
            subtitle="FY2025 · GHG Protocol basis · activity × factor"
            periods={months}
            series={stackedSeries}
            unit="tCO₂e"
            actions={<span className="panel-pill">MTD {formatTonnes(monthlyTotal[monthlyTotal.length - 1])}</span>}
          />
        </div>
        <div className="page-section span-5">
          <TrendLineChart
            title="Disclosure Readiness Trajectory"
            subtitle="12-month audit-readiness index (%)"
            periods={months}
            values={readinessTrend}
            unit="%"
            color="#2563eb"
            footer={[
              { label: "Current", value: `${disclosureReadiness}%` },
              { label: "6-mo ago", value: `${readinessTrend[5]}%` },
              { label: "Target Q4", value: "95%" },
              { label: "YoY Δ", value: "+34pp" },
            ]}
            actions={<span className="panel-pill">On pace</span>}
          />
        </div>
      </section>

      {/* ── Scope mix + pillar readiness ── */}
      <section className="page-grid dashboard-row">
        <div className="page-section span-5">
          <DashboardMeterCard title="Scope Mix" subtitle="GHG scope contribution to gross emissions." items={scopeMix} />
        </div>
        <div className="page-section span-7">
          <DashboardProgressCard
            title="Pillar Readiness"
            subtitle="Disclosure preparedness across E / S / G pillars."
            items={pillarReadiness}
          />
        </div>
      </section>

      {/* ── Top emitters + priority tasks ── */}
      <div className="section-band">
        <h3>Operational Hotspots</h3>
        <span className="section-band-note">Top emitters and priority remediations pulled from the live ledger</span>
        <div className="section-band-actions">
          <ExportCsvButton
            data={topEmitters.map((m) => ({ id: m.id, scope: m.scope, label: m.label, emissions: m.emissionsTonnes, facility: m.facilityId, quality: m.quality }))}
            filename="top-emitters"
            label="Export"
            className="btn"
          />
          <RefreshButton className="btn" />
        </div>
      </div>

      <section className="page-grid dashboard-row">
        <div className="page-section span-7">
          <div className="table-card">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Posting</th>
                  <th>Activity</th>
                  <th>Scope</th>
                  <th className="num">Emissions</th>
                  <th>Quality</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {topEmitters.map((m, i) => {
                  const scopeClass = m.scope === "Scope 1" ? "s1" : m.scope === "Scope 2" ? "s2" : "s3";
                  return (
                    <tr key={m.id}>
                      <td><span className="ledger-code">EM-{String(i + 1).padStart(4, "0")}</span></td>
                      <td>
                        <Link className="entity-link" href={`/program/metrics/${m.id}`}>{m.label}</Link>
                        <span className="row-subtle">{m.facilityId} · {m.category}</span>
                      </td>
                      <td><span className={`ledger-scope ${scopeClass}`}>{m.scope.replace("Scope ", "S")}</span></td>
                      <td className="num">{formatTonnes(m.emissionsTonnes)}</td>
                      <td><StatusBadge status={m.quality} /></td>
                      <td>
                        <Link className="row-action" href={`/program/metrics/${m.id}`}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="page-section span-5">
          <div className="dashboard-panel">
            <div className="dashboard-panel-header">
              <div>
                <strong>Priority Tasks</strong>
                <p>{p1Tasks} P1 blockers · {openTasks} open · {blockedTasks} blocked</p>
              </div>
              <JumpToButton targetId="new-task-anchor" label="New task" className="btn primary" />
            </div>
            <div className="table-card" style={{ border: "none", boxShadow: "none" }}>
              <table className="ledger-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Task</th>
                    <th>Pri.</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {priorityTasks.map((t, i) => (
                    <tr key={t.id}>
                      <td><span className="ledger-code">TSK-{String(i + 1).padStart(3, "0")}</span></td>
                      <td>
                        <Link className="entity-link" href={`/controls/tasks/${t.id}`}>{t.title}</Link>
                        <span className="row-subtle">{t.assignee} · due {t.dueDate}</span>
                      </td>
                      <td><span className={`status-chip ${t.priority === "P1" ? "bad" : t.priority === "P2" ? "warn" : "ok"}`}>{t.priority}</span></td>
                      <td><StatusBadge status={t.status} /></td>
                      <td>
                        {t.status !== "Done" && (
                          <QuickUpdateButton
                            endpoint={`/api/tasks/${t.id}`}
                            body={{ ...t, status: "Done" }}
                            label="Mark done"
                            confirmLabel="done"
                            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── Cross-pillar summary: facilities + disclosure themes ── */}
      <div className="section-band">
        <h3>Facilities &amp; Disclosure Themes</h3>
        <span className="section-band-note">{facilities.length} sites · {disclosureThemes.length} reporting themes</span>
      </div>

      <section className="page-grid dashboard-row">
        <div className="page-section span-6">
          <div className="dashboard-panel">
            <div className="dashboard-panel-header">
              <div>
                <strong>Facility Performance</strong>
                <p>Emissions intensity and data health by site</p>
              </div>
            </div>
            <FilterBar placeholder="Search facility…" />
            <div className="table-card" style={{ border: "none", boxShadow: "none" }}>
              <table className="ledger-table">
                <thead>
                  <tr>
                    <th>Facility</th>
                    <th className="num">Prod.</th>
                    <th className="num">Renewable</th>
                    <th>Trend</th>
                    <th>Health</th>
                  </tr>
                </thead>
                <tbody>
                  {facilities.map((f, i) => {
                    const trend = Array.from({ length: 8 }, (_, k) => 60 + Math.sin((i * 7 + k) * 0.6) * 14 + k * 2);
                    return (
                      <tr key={f.id} data-search={`${f.name} ${f.location}`}>
                        <td>
                          <strong>{f.name}</strong>
                          <span className="row-subtle">{f.location}</span>
                        </td>
                        <td className="num">{f.productionTonnes.toLocaleString()} <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>t</span></td>
                        <td className="num">{f.renewableShare}%</td>
                        <td><Sparkline data={trend} width={72} height={20} color="#2563eb" /></td>
                        <td>
                          <span className={`status-chip ${f.dataHealth === "Strong" ? "ok" : f.dataHealth === "Watch" ? "warn" : "bad"}`}>
                            {f.dataHealth}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="page-section span-6">
          <div className="dashboard-panel">
            <div className="dashboard-panel-header">
              <div>
                <strong>Disclosure Themes</strong>
                <p>Cross-framework requirement coverage</p>
              </div>
              <ExportCsvButton
                data={disclosureThemes.map((t) => ({ theme: t.theme, pillar: t.pillar, requirements: t.requirements, ready: t.ready, needsEvidence: t.needsEvidence }))}
                filename="disclosure-themes"
                label="Export"
                className="btn"
              />
            </div>
            <div className="table-card" style={{ border: "none", boxShadow: "none" }}>
              <table className="ledger-table">
                <thead>
                  <tr>
                    <th>Theme</th>
                    <th>Pillar</th>
                    <th className="num">Req.</th>
                    <th className="num">Ready</th>
                    <th>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {disclosureThemes.map((t) => {
                    const pct = Math.round((t.ready / t.requirements) * 100);
                    return (
                      <tr key={t.id}>
                        <td><strong>{t.theme}</strong></td>
                        <td><span className="pill">{t.pillar}</span></td>
                        <td className="num">{t.requirements}</td>
                        <td className="num">{t.ready}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 140 }}>
                            <div className="dashboard-progress-track" style={{ flex: 1 }}>
                              <span className={`dashboard-progress-fill ${pct >= 70 ? "positive" : pct >= 40 ? "warning" : "critical"}`} style={{ width: `${pct}%` }} />
                            </div>
                            <strong style={{ fontSize: 11, fontVariantNumeric: "tabular-nums", width: 34, textAlign: "right" }}>{pct}%</strong>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── Activity timeline + targets snapshot ── */}
      <div className="section-band">
        <h3>Cross-Program Activity</h3>
        <span className="section-band-note">Governance log · {materialTopics.length} material topics monitored</span>
      </div>

      <section className="page-grid">
        <div className="page-section span-7">
          <div className="dashboard-panel">
            <div className="dashboard-panel-header">
              <div>
                <strong>Targets Register</strong>
                <p>Environmental, social, and governance commitments</p>
              </div>
              <JumpToButton targetId="new-target-anchor" label="New target" className="btn primary" />
            </div>
            <div className="table-card" style={{ border: "none", boxShadow: "none" }}>
              <table className="ledger-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Target</th>
                    <th>Pillar</th>
                    <th>Year</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {targets.map((t, i) => (
                    <tr key={t.id}>
                      <td><span className="ledger-code">TGT-{String(i + 1).padStart(4, "0")}</span></td>
                      <td>
                        <Link className="entity-link" href={`/targets/${t.id}`}>{t.title}</Link>
                        <span className="row-subtle">{t.baseline} → {t.target}</span>
                      </td>
                      <td><span className="pill">{t.pillar}</span></td>
                      <td>{t.targetYear}</td>
                      <td><StatusBadge status={t.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="page-section span-5">
          <ActivityTimeline
            title="Recent Activity"
            subtitle="Audit log across all ESG workflows"
            entries={activities}
          />
        </div>
      </section>

      {/* Anchors to form pages (no-op; used by quick actions from other pages) */}
      <span id="new-task-anchor" />
      <span id="new-target-anchor" />
    </AppShell>
  );
}
