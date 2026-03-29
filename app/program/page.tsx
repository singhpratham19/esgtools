import Link from "next/link";

import { AppShell } from "@/components/platform/app-shell";
import {
  DashboardColumnChartCard,
  DashboardDonutCard,
  DashboardMeterCard,
  DashboardProgressCard,
  DashboardStatGrid
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

  const scopeTotals = ["Scope 1", "Scope 2", "Scope 3"].map((scope) => {
    const total = metrics
      .filter((metric) => metric.scope === scope)
      .reduce((sum, metric) => sum + metric.emissionsTonnes, 0);
    const color = scope === "Scope 1" ? "var(--scope-1)" : scope === "Scope 2" ? "var(--scope-2)" : "var(--scope-3)";
    return {
      label: scope,
      value: total,
      displayValue: formatTonnes(total),
      detail: `${metrics.filter((metric) => metric.scope === scope).length} activities`,
      color
    };
  });

  const qualityMix = [
    {
      label: "Verified",
      value: verifiedMetrics,
      displayValue: `${verifiedMetrics}`,
      detail: "Ready for reporting",
      color: "var(--success)"
    },
    {
      label: "Needs review",
      value: metrics.filter((metric) => metric.quality === "Needs review").length,
      displayValue: `${metrics.filter((metric) => metric.quality === "Needs review").length}`,
      detail: "Pending review",
      color: "var(--warning)"
    },
    {
      label: "Other",
      value: metrics.filter((metric) => !["Verified", "Needs review"].includes(metric.quality)).length,
      displayValue: `${metrics.filter((metric) => !["Verified", "Needs review"].includes(metric.quality)).length}`,
      detail: "Other quality states",
      color: "var(--critical)"
    }
  ];

  const facilityFigures = Array.from(
    metrics.reduce((accumulator, metric) => {
      accumulator.set(metric.facilityId, (accumulator.get(metric.facilityId) || 0) + metric.emissionsTonnes);
      return accumulator;
    }, new Map<string, number>())
  ).map(([facilityId, value]) => ({
    label: facilityId.toUpperCase(),
    value,
    displayValue: formatTonnes(value),
    detail: "Current footprint",
    color: facilityId === "pune" ? "var(--scope-1)" : facilityId === "nashik" ? "var(--warning)" : "var(--primary)"
  }));

  const topicReadiness = materialTopics.map((topic) => {
    const progress = topic.status === "Assessed" ? 100 : topic.status === "Refreshing" ? 64 : 34;
    const tone = topic.status === "Assessed" ? "positive" : topic.status === "Refreshing" ? "warning" : "critical";
    return {
      label: topic.topic,
      progress,
      valueLabel: topic.status,
      detail: `${topic.pillar} | impact ${topic.impactLevel}`,
      tone
    } as const;
  });

  const libraryStatus = [
    {
      label: "Collected",
      value: metricLibrary.filter((item) => item.status === "Collected").length,
      displayValue: `${metricLibrary.filter((item) => item.status === "Collected").length}`,
      detail: "Governed metrics",
      color: "var(--success)"
    },
    {
      label: "Partial",
      value: metricLibrary.filter((item) => item.status === "Partial").length,
      displayValue: `${metricLibrary.filter((item) => item.status === "Partial").length}`,
      detail: "Needs completion",
      color: "var(--warning)"
    },
    {
      label: "Gap",
      value: metricLibrary.filter((item) => item.status === "Gap").length,
      displayValue: `${metricLibrary.filter((item) => item.status === "Gap").length}`,
      detail: "No controlled source",
      color: "var(--critical)"
    }
  ];

  return (
    <AppShell
      activePath="/program"
      title="Program Metrics"
      subtitle="Governed metric register, workbook data imports, and the ESG metric catalog."
      tabs={[
        { label: "Dashboard", active: true },
        { label: "Metrics Register", count: metrics.length },
        { label: "Library", count: metricLibrary.length },
        { label: "Material Topics", count: materialTopics.length },
      ]}
    >
      <DashboardStatGrid
        items={[
          {
            label: "Gross emissions",
            value: formatTonnes(totalEmissions),
            detail: `${metrics.length} inventoried activities`,
            tone: "neutral"
          },
          {
            label: "Verified metrics",
            value: `${verifiedMetrics}/${metrics.length}`,
            detail: `${Math.round((verifiedMetrics / Math.max(metrics.length, 1)) * 100)}% approved`,
            tone: verifiedMetrics === metrics.length ? "positive" : "warning"
          },
          {
            label: "Library coverage",
            value: `${metricCoverage}/${metricLibrary.length}`,
            detail: `${Math.round((metricCoverage / Math.max(metricLibrary.length, 1)) * 100)}% collected`,
            tone: metricCoverage / metricLibrary.length > 0.7 ? "positive" : "warning"
          },
          {
            label: "Emission factors",
            value: hasClimatiq ? "Climatiq" : "Manual",
            detail: hasClimatiq ? `${Object.keys(climatiqFactors).length} factors matched` : "Set CLIMATIQ_API_KEY to enable",
            tone: hasClimatiq ? "positive" : "neutral"
          }
        ]}
      />

      <section className="page-grid dashboard-row">
        <div className="page-section span-6">
          <DashboardMeterCard title="Scope Mix" subtitle="Emissions by GHG Protocol scope." items={scopeTotals} />
        </div>
        <div className="page-section span-6">
          <DashboardDonutCard
            title="Inventory Quality"
            subtitle="Approved vs pending metric rows."
            totalLabel={`${Math.round((verifiedMetrics / Math.max(metrics.length, 1)) * 100)}%`}
            items={qualityMix}
          />
        </div>
      </section>

      <section className="page-grid dashboard-row">
        <div className="page-section span-6">
          <DashboardColumnChartCard title="Facility Footprint" subtitle="Emissions by reporting site." items={facilityFigures} />
        </div>
        <div className="page-section span-6">
          <DashboardProgressCard title="Material Topics" subtitle="Disclosure scoping readiness." items={topicReadiness} />
        </div>
      </section>

      <section className="page-grid dashboard-row">
        <div className="page-section span-12">
          <DashboardMeterCard title="Metric Library Readiness" subtitle="Coverage across the ESG metric universe." items={libraryStatus} />
        </div>
      </section>

      {/* ── Metrics Register with toolbar ── */}
      <section className="page-grid">
        <div className="page-section span-8">
          <div className="section-header">
            <h3>Metrics Register</h3>
          </div>
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Facility</th>
                  <th>Scope</th>
                  <th>Emissions</th>
                  <th>Quality</th>
                  {hasClimatiq && <th>Climatiq Factor</th>}
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric) => (
                  <tr key={metric.id}>
                    <td>
                      <Link className="entity-link" href={`/program/metrics/${metric.id}`}>
                        {metric.label}
                      </Link>
                      <span className="row-subtle">{metric.category}</span>
                    </td>
                    <td>{metric.facilityId}</td>
                    <td>{metric.scope}</td>
                    <td>{formatTonnes(metric.emissionsTonnes)}</td>
                    <td><StatusBadge status={metric.quality} /></td>
                    {hasClimatiq && (
                      <td>
                        {climatiqFactors[metric.id] ? (
                          <span className="climatiq-badge">
                            {climatiqFactors[metric.id].source} &middot; {climatiqFactors[metric.id].year}
                          </span>
                        ) : (
                          <span style={{ color: "var(--text-muted)", fontSize: "10.5px" }}>—</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="page-section span-4 stack">
          <WorkbookImportForm />
          <MetricCreateForm />
        </div>
      </section>

      <section className="page-grid">
        <div className="page-section span-7">
          <div className="section-header">
            <h3>Metric Library</h3>
          </div>
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
          <div className="section-header">
            <h3>Material Topics</h3>
          </div>
          <div className="list-card">
            {materialTopics.map((topic) => (
              <div className="list-row" key={topic.id}>
                <div>
                  <strong>{topic.topic}</strong>
                  <span>{`${topic.pillar} | stakeholder ${topic.stakeholderInterest}`}</span>
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
