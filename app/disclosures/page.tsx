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
import { DisclosureCreateForm } from "@/components/platform/forms";
import { disclosureThemes, governanceRecords, peopleMetrics } from "@/data/esg-data";
import { listDisclosures } from "@/lib/db";

export default function DisclosuresPage() {
  const disclosures = listDisclosures();
  const readyDisclosures = disclosures.filter((item) => item.status === "Ready").length;
  const inProgressDisclosures = disclosures.filter((item) => item.status === "In progress").length;
  const needsEvidenceDisclosures = disclosures.filter((item) => item.status === "Needs evidence").length;

  const pillarRequirements = Array.from(
    disclosureThemes.reduce((acc, theme) => {
      const current = acc.get(theme.pillar) || { ready: 0, requirements: 0 };
      current.ready += theme.ready;
      current.requirements += theme.requirements;
      acc.set(theme.pillar, current);
      return acc;
    }, new Map<string, { ready: number; requirements: number }>())
  ).map(([pillar, totals]) => ({
    label: pillar,
    value: totals.requirements,
    displayValue: `${totals.ready}/${totals.requirements}`,
    detail: `${Math.round((totals.ready / totals.requirements) * 100)}% binder ready`,
    color: pillar === "Environmental" ? "var(--primary)" : pillar === "Social" ? "var(--accent)" : "var(--warning)"
  }));

  const themeCoverage = disclosureThemes.map((theme) => {
    const progress = Math.round((theme.ready / theme.requirements) * 100);
    const tone = progress >= 75 ? "positive" : progress >= 50 ? "warning" : "critical";
    return { label: theme.theme, progress, valueLabel: `${theme.ready}/${theme.requirements}`, detail: `${theme.pillar} | ${theme.needsEvidence} need evidence`, tone } as const;
  });

  const themeFigureItems = disclosureThemes.map((theme) => ({
    label: theme.theme.split(" ")[0],
    value: theme.ready,
    displayValue: `${theme.ready}`,
    detail: `${theme.requirements} required`,
    color: theme.pillar === "Environmental" ? "var(--primary)" : theme.pillar === "Social" ? "var(--accent)" : "var(--warning)"
  }));

  return (
    <AppShell
      activePath="/disclosures"
      title="Disclosure Binder"
      subtitle="Framework requirements, narrative status, and non-environmental ESG disclosures."
      tabs={[
        { label: "Overview", active: true },
        { label: "Items", count: disclosures.length },
        { label: "Themes", count: disclosureThemes.length },
        { label: "People", count: peopleMetrics.length },
        { label: "Governance", count: governanceRecords.length },
      ]}
    >
      <DashboardStatGrid
        items={[
          { label: "Binder readiness", value: `${Math.round((readyDisclosures / Math.max(disclosures.length, 1)) * 100)}%`, detail: "Items marked ready", tone: readyDisclosures / disclosures.length > 0.65 ? "positive" : "warning" },
          { label: "In progress", value: `${inProgressDisclosures}`, detail: "Narratives in draft", tone: inProgressDisclosures > 0 ? "warning" : "neutral" },
          { label: "Needs evidence", value: `${needsEvidenceDisclosures}`, detail: "Blocked by missing support", tone: needsEvidenceDisclosures > 0 ? "critical" : "positive" },
          { label: "Non-env metrics", value: `${peopleMetrics.length + governanceRecords.length}`, detail: "People & governance indicators", tone: "neutral" }
        ]}
      />

      <section className="page-grid dashboard-row">
        <div className="page-section span-6">
          <DashboardMeterCard title="Disclosure Status" subtitle="Current binder state." items={[
            { label: "Ready", value: readyDisclosures, displayValue: `${readyDisclosures}`, detail: "Release-ready", color: "var(--success)" },
            { label: "In progress", value: inProgressDisclosures, displayValue: `${inProgressDisclosures}`, detail: "Awaiting completion", color: "var(--warning)" },
            { label: "Needs evidence", value: needsEvidenceDisclosures, displayValue: `${needsEvidenceDisclosures}`, detail: "Blocked", color: "var(--critical)" }
          ]} />
        </div>
        <div className="page-section span-6">
          <DashboardDonutCard title="Binder Figure" subtitle="Ready vs blocked disclosure lines." totalLabel={`${Math.round((readyDisclosures / Math.max(disclosures.length, 1)) * 100)}%`} items={[
            { label: "Ready", value: readyDisclosures, displayValue: `${readyDisclosures}`, detail: "Release-ready", color: "var(--success)" },
            { label: "In progress", value: inProgressDisclosures, displayValue: `${inProgressDisclosures}`, detail: "Drafting", color: "var(--warning)" },
            { label: "Needs evidence", value: needsEvidenceDisclosures, displayValue: `${needsEvidenceDisclosures}`, detail: "Blocked", color: "var(--critical)" }
          ]} />
        </div>
      </section>

      <section className="page-grid dashboard-row">
        <div className="page-section span-6">
          <DashboardMeterCard title="Pillar Coverage" subtitle="Requirements by ESG pillar." items={pillarRequirements} />
        </div>
        <div className="page-section span-6">
          <DashboardColumnChartCard title="Theme Figures" subtitle="Ready counts by theme." items={themeFigureItems} />
        </div>
      </section>

      <section className="page-grid dashboard-row">
        <div className="page-section span-12">
          <DashboardProgressCard title="Theme Completion" subtitle="Topic-level readiness." items={themeCoverage} />
        </div>
      </section>

      <section className="page-grid">
        <div className="page-section span-8">
          <div className="section-header"><h3>Disclosure Items</h3></div>
          <div className="table-card">
            <table className="data-table">
              <thead><tr><th>Framework</th><th>Requirement</th><th>Status</th></tr></thead>
              <tbody>
                {disclosures.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.framework}</strong><span className="row-subtle">{item.code}</span></td>
                    <td><Link className="entity-link" href={`/disclosures/${item.id}`}>{item.title}</Link></td>
                    <td><StatusBadge status={item.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="page-section span-4 stack">
          <DisclosureCreateForm />
        </div>
      </section>

      <section className="page-grid">
        <div className="page-section span-5">
          <div className="section-header"><h3>Disclosure Themes</h3></div>
          <div className="list-card">
            {disclosureThemes.map((theme) => (
              <div className="list-row" key={theme.id}>
                <div><strong>{theme.theme}</strong><span>{theme.pillar}</span></div>
                <span className="pill">{`${theme.ready}/${theme.requirements}`}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="page-section span-3">
          <div className="section-header"><h3>People Metrics</h3></div>
          <div className="list-card">
            {peopleMetrics.map((metric) => (
              <div className="list-row" key={metric.id}>
                <div><strong>{metric.label}</strong><span>{metric.value}</span></div>
              </div>
            ))}
          </div>
        </div>
        <div className="page-section span-4">
          <div className="section-header"><h3>Governance</h3></div>
          <div className="list-card">
            {governanceRecords.map((record) => (
              <div className="list-row" key={record.id}>
                <div><strong>{record.label}</strong><span>{record.value}</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
