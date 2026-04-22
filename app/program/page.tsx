import Link from "next/link";

import { AppShell } from "@/components/platform/app-shell";
import {
  ActivityTimeline,
  DashboardMeterCard,
  DashboardProgressCard,
  FrameworkMatrix,
  KPIHero,
  KPIHeroGrid,
  KPIStrip,
  Sparkline,
  StackedColumnChart,
  TrendLineChart,
} from "@/components/platform/dashboards";
import { StatusBadge } from "@/components/platform/status-badge";
import { MetricCreateForm, WorkbookImportForm } from "@/components/platform/forms";
import { materialTopics, metricLibrary } from "@/data/esg-data";
import { formatTonnes } from "@/lib/esg";
import { listMetrics } from "@/lib/db";
import { climatiqEnabled, searchEmissionFactors, suggestActivityId } from "@/lib/climatiq";

export default async function ProgramPage() {
  const metrics = listMetrics();
  const totalEmissions = metrics.reduce((sum, metric) => sum + metric.emissionsTonnes, 0);
  const verifiedMetrics = metrics.filter((metric) => metric.quality === "Verified").length;
  const metricCoverage = metricLibrary.filter((item) => item.status === "Collected").length;

  // ── Climatiq: fetch matched emission factors for top metrics ──
  const hasClimatiq = climatiqEnabled();
  let climatiqFactors: Record<string, { name: string; source: string; factor: number | null; region: string; year: number }> = {};

  if (hasClimatiq) {
    try {
      const topMetrics = metrics.slice(0, 5);
      const factorPromises = topMetrics.map(async (metric) => {
        const activityId = suggestActivityId(metric.scope, metric.category, metric.unit);
        const result = await searchEmissionFactors({
          activity_id: activityId,
          region: "IN",
          results_per_page: 1,
        });
        if (result.results.length > 0) {
          const ef = result.results[0];
          climatiqFactors[metric.id] = {
            name: ef.name,
            source: ef.source,
            factor: ef.factor,
            region: ef.region_name || ef.region,
            year: ef.year,
          };
        }
      });
      await Promise.all(factorPromises);
    } catch {
      // Climatiq unavailable — proceed without
    }
  }

  const scope1Total = metrics.filter((m) => m.scope === "Scope 1").reduce((s, m) => s + m.emissionsTonnes, 0);
  const scope2Total = metrics.filter((m) => m.scope === "Scope 2").reduce((s, m) => s + m.emissionsTonnes, 0);
  const scope3Total = metrics.filter((m) => m.scope === "Scope 3").reduce((s, m) => s + m.emissionsTonnes, 0);

  const scopeTotals = [
    { label: "Scope 1", value: scope1Total, displayValue: formatTonnes(scope1Total), detail: `${metrics.filter((m) => m.scope === "Scope 1").length} activities`, color: "var(--scope-1)" },
    { label: "Scope 2", value: scope2Total, displayValue: formatTonnes(scope2Total), detail: `${metrics.filter((m) => m.scope === "Scope 2").length} activities`, color: "var(--scope-2)" },
    { label: "Scope 3", value: scope3Total, displayValue: formatTonnes(scope3Total), detail: `${metrics.filter((m) => m.scope === "Scope 3").length} activities`, color: "var(--scope-3)" },
  ];

  const topicReadiness = materialTopics.map((topic) => {
    const progress = topic.status === "Assessed" ? 100 : topic.status === "Refreshing" ? 64 : 34;
    const tone = topic.status === "Assessed" ? "positive" : topic.status === "Refreshing" ? "warning" : "critical";
    return {
      label: topic.topic,
      progress,
      valueLabel: topic.status,
      detail: `${topic.pillar} | impact ${topic.impactLevel}`,
      tone,
    } as const;
  });

  // ── Synthetic monthly time-series for stacked chart (FY25 Apr-Mar view) ──
  const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
  const monthlyShare = [0.086, 0.083, 0.081, 0.084, 0.088, 0.086, 0.084, 0.082, 0.078, 0.08, 0.084, 0.084];
  const stackedSeries = [
    { label: "Scope 1", color: "#1e40af", values: monthlyShare.map((s) => Math.round(scope1Total * s)) },
    { label: "Scope 2", color: "#3b82f6", values: monthlyShare.map((s) => Math.round(scope2Total * s)) },
    { label: "Scope 3", color: "#93c5fd", values: monthlyShare.map((s) => Math.round(scope3Total * s)) },
  ];

  // ── Trend line: intensity kgCO2e/tonne produced ──
  const intensityTrend = [128, 125, 127, 123, 119, 117, 116, 114, 112, 111, 109, 108];
  const intensityFooter = [
    { label: "Current", value: "108" },
    { label: "FY24 avg", value: "131" },
    { label: "Target FY30", value: "78" },
    { label: "YoY Δ", value: "−17.6%" },
  ];

  // ── Framework matrix ──
  const frameworks = ["GHG", "GRI", "SASB", "CSRD", "TCFD", "BRSR"];
  const frameworkRows = [
    { topic: "Scope 1 & 2 inventory", detail: "Gross GHG from operations", coverage: { GHG: 1, GRI: 1, SASB: 1, CSRD: 1, TCFD: 0.85, BRSR: 1 } },
    { topic: "Scope 3 value chain", detail: "Purchased goods, logistics, commuting", coverage: { GHG: 0.75, GRI: 0.75, SASB: 0.5, CSRD: 0.75, TCFD: 0.5, BRSR: 0.5 } },
    { topic: "Energy consumption", detail: "Grid, renewable, onsite", coverage: { GHG: 1, GRI: 1, SASB: 1, CSRD: 1, TCFD: 0.75, BRSR: 1 } },
    { topic: "Water withdrawal & reuse", detail: "By source and stress basin", coverage: { GHG: 0, GRI: 1, SASB: 0.75, CSRD: 1, TCFD: 0.25, BRSR: 1 } },
    { topic: "Waste & circularity", detail: "Hazardous, non-hazardous, diversion", coverage: { GHG: 0, GRI: 1, SASB: 0.5, CSRD: 1, TCFD: 0, BRSR: 0.75 } },
    { topic: "Workforce & safety", detail: "Headcount, injuries, training", coverage: { GHG: 0, GRI: 1, SASB: 0.75, CSRD: 1, TCFD: 0, BRSR: 1 } },
  ];

  // ── Activity timeline ──
  const activities: Array<{ title: string; detail?: string; time: string; actor?: string; tone?: "positive" | "warning" | "critical" | "neutral" }> = [
    { title: "Scope 2 electricity factor refreshed", detail: "Grid factor updated via Climatiq feed for IN_DIESEL region.", time: "2h ago", actor: "System · Climatiq", tone: "positive" },
    { title: "Pune facility utility bill posted", detail: "March 2026 invoice for 142,810 kWh imported and auto-classified.", time: "5h ago", actor: "Ingest pipeline", tone: "neutral" },
    { title: "Evidence missing on forge Scope 1 diesel", detail: "Blocking quarterly disclosure; reassigned to ops.", time: "Yesterday · 18:40", actor: "Ananya S.", tone: "critical" },
    { title: "Materiality refresh approved", detail: "FY25 double materiality assessment signed off by CFO.", time: "2d ago · 11:02", actor: "Rohan M.", tone: "positive" },
    { title: "New supplier onboarded to CDP flow", detail: "Tier-1 casting vendor added; PDS request queued.", time: "3d ago", actor: "Supplier ops", tone: "neutral" },
  ];

  // ── Monthly total for hero spark ──
  const monthlyTotal = stackedSeries[0].values.map((_, i) => stackedSeries.reduce((s, ser) => s + ser.values[i], 0));

  return (
    <AppShell
      activePath="/program"
      title="Program Metrics"
      subtitle="Governed metric register, emissions ledger, and reporting-ready data quality pipeline."
      tabs={[
        { label: "Overview", active: true },
        { label: "Ledger", count: metrics.length },
        { label: "Library", count: metricLibrary.length },
        { label: "Material Topics", count: materialTopics.length },
        { label: "Analytics" },
        { label: "Activity" },
      ]}
    >
      <KPIStrip
        items={[
          { label: "Gross", value: formatTonnes(totalEmissions).split(" ")[0], unit: "tCO₂e" },
          { label: "Net", value: formatTonnes(totalEmissions * 0.93).split(" ")[0], unit: "tCO₂e" },
          { label: "Activities", value: `${metrics.length}` },
          { label: "Facilities", value: "3" },
          { label: "Data Q.", value: `${Math.round((verifiedMetrics / Math.max(metrics.length, 1)) * 100)}%`, unit: "verified" },
          { label: "Library cov.", value: `${metricCoverage}/${metricLibrary.length}` },
          { label: "Factors", value: hasClimatiq ? "Live" : "Static" },
        ]}
      />

      <KPIHeroGrid>
        <KPIHero
          label="Gross Emissions"
          value={formatTonnes(totalEmissions).split(" ")[0]}
          unit="tCO₂e"
          delta="−8.4%"
          direction="down"
          tone="positive"
          baseline="vs FY24"
          sparkData={monthlyTotal}
          sparkColor="#2563eb"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" />
            </svg>
          }
        />
        <KPIHero
          label="Carbon Intensity"
          value="108"
          unit="kgCO₂e/t"
          delta="−17.6%"
          direction="down"
          tone="positive"
          baseline="vs FY24 · 131"
          sparkData={intensityTrend}
          sparkColor="#3b82f6"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
          }
        />
        <KPIHero
          label="Data Quality"
          value={`${Math.round((verifiedMetrics / Math.max(metrics.length, 1)) * 100)}`}
          unit="% verified"
          delta="+12pp"
          direction="up"
          tone="positive"
          baseline={`${verifiedMetrics}/${metrics.length} metrics`}
          sparkData={[52, 58, 62, 65, 68, 72, 76, 78, 82, 85, 86, 87]}
          sparkColor="#1d4ed8"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          }
        />
        <KPIHero
          label="Library Coverage"
          value={`${Math.round((metricCoverage / Math.max(metricLibrary.length, 1)) * 100)}`}
          unit="%"
          delta="+4pp"
          direction="up"
          tone="positive"
          baseline={`${metricCoverage} of ${metricLibrary.length} collected`}
          sparkData={[60, 62, 65, 68, 70, 72, 74, 75, 77, 79, 80, 82]}
          sparkColor="#60a5fa"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2Z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7Z" /></svg>
          }
        />
      </KPIHeroGrid>

      <div className="section-band">
        <h3>Emissions Intelligence</h3>
        <span className="section-band-note">FY2025 reporting period · monthly aggregation · tCO₂e</span>
      </div>

      <section className="page-grid dashboard-row">
        <div className="page-section span-7">
          <StackedColumnChart
            title="Monthly Emissions by Scope"
            subtitle="GHG Protocol basis · activity data × emission factors"
            periods={months}
            series={stackedSeries}
            unit="tCO₂e"
            actions={<span className="panel-pill">MTD {formatTonnes(monthlyTotal[monthlyTotal.length - 1])}</span>}
          />
        </div>
        <div className="page-section span-5">
          <TrendLineChart
            title="Carbon Intensity Trend"
            subtitle="kgCO₂e per tonne produced · 12-month rolling"
            periods={months}
            values={intensityTrend}
            unit="kgCO₂e/t"
            color="#2563eb"
            footer={intensityFooter}
            actions={<span className="panel-pill">On pace</span>}
          />
        </div>
      </section>

      <section className="page-grid dashboard-row">
        <div className="page-section span-5">
          <DashboardMeterCard title="Scope Mix" subtitle="Current FY emissions share by GHG scope." items={scopeTotals} />
        </div>
        <div className="page-section span-7">
          <DashboardProgressCard title="Material Topic Readiness" subtitle="Double materiality assessment status by topic." items={topicReadiness} />
        </div>
      </section>

      <div className="section-band">
        <h3>Framework Alignment</h3>
        <span className="section-band-note">Topic × framework coverage · ● = fully mapped · numeric = % complete</span>
      </div>

      <section className="page-grid dashboard-row">
        <div className="page-section span-12">
          <FrameworkMatrix
            title="Disclosure Topic Coverage"
            subtitle="Mapping to active reporting frameworks for FY2025."
            frameworks={frameworks}
            rows={frameworkRows}
          />
        </div>
      </section>

      <div className="section-band">
        <h3>Emissions Ledger</h3>
        <span className="section-band-note">Current period · {metrics.length} journaled postings</span>
        <div className="section-band-actions">
          <button className="toolbar-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
            New posting
          </button>
          <button className="toolbar-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            Export CSV
          </button>
        </div>
      </div>

      <section className="page-grid">
        <div className="page-section span-8">
          <div className="table-card">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Posting</th>
                  <th>Facility</th>
                  <th>Scope</th>
                  <th className="num">Activity</th>
                  <th className="num">Emissions</th>
                  <th>Trend</th>
                  <th>Quality</th>
                  {hasClimatiq && <th>Factor</th>}
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric, i) => {
                  const seed = (i * 37 + metric.emissionsTonnes) % 100;
                  const trend = Array.from({ length: 8 }, (_, k) => {
                    const base = metric.emissionsTonnes / 12;
                    return base + Math.sin((seed + k) * 0.7) * base * 0.18 + (k * base * 0.02);
                  });
                  const scopeClass = metric.scope === "Scope 1" ? "s1" : metric.scope === "Scope 2" ? "s2" : "s3";
                  return (
                    <tr key={metric.id}>
                      <td>
                        <span className="ledger-code">EM-{String(i + 1).padStart(4, "0")}</span>
                        <div style={{ marginTop: 4 }}>
                          <Link className="entity-link" href={`/program/metrics/${metric.id}`}>
                            {metric.label}
                          </Link>
                          <span className="row-subtle">{metric.category}</span>
                        </div>
                      </td>
                      <td>{metric.facilityId}</td>
                      <td><span className={`ledger-scope ${scopeClass}`}>{metric.scope.replace("Scope ", "S")}</span></td>
                      <td className="num">{metric.quantity?.toLocaleString() ?? "—"} <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>{metric.unit}</span></td>
                      <td className="num">{formatTonnes(metric.emissionsTonnes)}</td>
                      <td><Sparkline data={trend} width={72} height={20} color="#3b82f6" /></td>
                      <td><StatusBadge status={metric.quality} /></td>
                      {hasClimatiq && (
                        <td>
                          {climatiqFactors[metric.id] ? (
                            <span className="climatiq-badge">
                              {climatiqFactors[metric.id].source} · {climatiqFactors[metric.id].year}
                            </span>
                          ) : (
                            <span style={{ color: "var(--text-muted)", fontSize: "10.5px" }}>—</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="page-section span-4 stack">
          <ActivityTimeline
            title="Recent Activity"
            subtitle="Audit log of data pipeline and governance events."
            entries={activities}
          />
          <WorkbookImportForm />
          <MetricCreateForm />
        </div>
      </section>

      <div className="section-band">
        <h3>Metric Library &amp; Material Topics</h3>
        <span className="section-band-note">{metricLibrary.length} metrics across ESG universe · {materialTopics.length} material topics</span>
      </div>

      <section className="page-grid">
        <div className="page-section span-7">
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Pillar</th>
                  <th>Domain</th>
                  <th>Metric</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {metricLibrary.map((item) => (
                  <tr key={item.id}>
                    <td>{item.pillar}</td>
                    <td>{item.domain}</td>
                    <td>
                      <strong>{item.name}</strong>
                      <span className="row-subtle">{item.frameworks.join(", ")}</span>
                    </td>
                    <td><StatusBadge status={item.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="page-section span-5">
          <div className="list-card">
            {materialTopics.map((topic) => (
              <div className="list-row" key={topic.id}>
                <div>
                  <strong>{topic.topic}</strong>
                  <span>{`${topic.pillar} · stakeholder ${topic.stakeholderInterest}`}</span>
                </div>
                <StatusBadge status={topic.status} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
