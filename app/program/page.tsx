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

export default function ProgramPage() {
  const metrics = listMetrics();
  const totalEmissions = metrics.reduce((sum, metric) => sum + metric.emissionsTonnes, 0);
  const verifiedMetrics = metrics.filter((metric) => metric.quality === "Verified").length;
  const metricCoverage = metricLibrary.filter((item) => item.status === "Collected").length;
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
      color: "var(--blue)"
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
    color: facilityId === "pune" ? "var(--blue)" : facilityId === "nashik" ? "var(--warning)" : "var(--success)"
  }));
  const topicReadiness = materialTopics.map((topic) => {
    const progress =
      topic.status === "Assessed" ? 100 : topic.status === "Refreshing" ? 64 : 34;
    const tone =
      topic.status === "Assessed" ? "positive" : topic.status === "Refreshing" ? "warning" : "critical";

    return {
      label: topic.topic,
      progress,
      valueLabel: topic.status,
      detail: `${topic.pillar} | impact ${topic.impactLevel} | stakeholder ${topic.stakeholderInterest}`,
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
      subtitle="Manage the governed metric register, import workbook data, and maintain the broader ESG metric catalog."
    >
      <DashboardStatGrid
        items={[
          {
            label: "Gross emissions",
            value: formatTonnes(totalEmissions),
            detail: "Across all inventoried activities",
            tone: "neutral"
          },
          {
            label: "Verified metrics",
            value: `${verifiedMetrics}/${metrics.length}`,
            detail: "Approved quality state",
            tone: verifiedMetrics === metrics.length ? "positive" : "warning"
          },
          {
            label: "Library coverage",
            value: `${metricCoverage}/${metricLibrary.length}`,
            detail: "Collected metrics in catalog",
            tone: metricCoverage / metricLibrary.length > 0.7 ? "positive" : "warning"
          }
        ]}
      />

      <section className="page-grid dashboard-row">
        <div className="page-section span-6">
          <DashboardMeterCard
            title="Scope Mix"
            subtitle="Emissions distribution across the inventory."
            items={scopeTotals}
          />
        </div>
        <div className="page-section span-6">
          <DashboardDonutCard
            title="Inventory Quality"
            subtitle="Current mix of approved and pending metric rows."
            totalLabel={`${Math.round((verifiedMetrics / Math.max(metrics.length, 1)) * 100)}%`}
            items={qualityMix}
          />
        </div>
      </section>

      <section className="page-grid dashboard-row">
        <div className="page-section span-6">
          <DashboardColumnChartCard
            title="Facility Footprint"
            subtitle="Emissions split across reporting sites."
            items={facilityFigures}
          />
        </div>
        <div className="page-section span-6">
          <DashboardProgressCard
            title="Material Topics"
            subtitle="Readiness for disclosure scoping."
            items={topicReadiness}
          />
        </div>
      </section>

      <section className="page-grid dashboard-row">
        <div className="page-section span-12">
          <DashboardMeterCard
            title="Metric Library Readiness"
            subtitle="Coverage status across the broader ESG metric universe."
            items={libraryStatus}
          />
        </div>
      </section>

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
