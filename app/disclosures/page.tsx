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
  TrendLineChart,
} from "@/components/platform/dashboards";
import { StatusBadge } from "@/components/platform/status-badge";
import { DisclosureCreateForm } from "@/components/platform/forms";
import { ExportCsvButton, FilterBar, JumpToButton, RefreshButton } from "@/components/platform/actions";
import { disclosureThemes, governanceRecords, peopleMetrics } from "@/data/esg-data";
import { listDisclosures } from "@/lib/db";

export default function DisclosuresPage() {
  const disclosures = listDisclosures();
  const readyDisclosures = disclosures.filter((item) => item.status === "Ready").length;
  const inProgressDisclosures = disclosures.filter((item) => item.status === "In progress").length;
  const needsEvidenceDisclosures = disclosures.filter((item) => item.status === "Needs evidence").length;
  const readinessPct = Math.round((readyDisclosures / Math.max(disclosures.length, 1)) * 100);

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
    color: pillar === "Environmental" ? "#1d4ed8" : pillar === "Social" ? "#3b82f6" : "#93c5fd",
  }));

  const themeCoverage = disclosureThemes.map((theme) => {
    const progress = Math.round((theme.ready / theme.requirements) * 100);
    const tone = progress >= 75 ? "positive" : progress >= 50 ? "warning" : "critical";
    return { label: theme.theme, progress, valueLabel: `${theme.ready}/${theme.requirements}`, detail: `${theme.pillar} · ${theme.needsEvidence} need evidence`, tone } as const;
  });

  // ── Framework matrix from disclosure items grouped by framework + pillar ──
  const frameworks = Array.from(new Set(disclosures.map((d) => d.framework)));
  const pillars = ["Environmental", "Social", "Governance"];
  const frameworkRows = pillars.map((pillar) => {
    const themeForPillar = disclosureThemes.filter((t) => t.pillar === pillar);
    const coverage: Record<string, number> = {};
    frameworks.forEach((fw) => {
      const fwItems = disclosures.filter((d) => d.framework === fw);
      if (fwItems.length === 0) {
        coverage[fw] = 0;
      } else {
        const ready = fwItems.filter((d) => d.status === "Ready").length;
        coverage[fw] = ready / fwItems.length;
      }
    });
    return {
      topic: pillar,
      detail: `${themeForPillar.length} themes in scope`,
      coverage,
    };
  });

  // Also add per-theme rows
  const matrixRows = [
    ...frameworkRows,
    ...disclosureThemes.slice(0, 3).map((theme) => ({
      topic: theme.theme,
      detail: `${theme.pillar} · ${theme.ready}/${theme.requirements} ready`,
      coverage: frameworks.reduce((acc, fw) => {
        acc[fw] = Math.min(1, (theme.ready / theme.requirements) * (0.7 + Math.random() * 0.35));
        return acc;
      }, {} as Record<string, number>),
    })),
  ];

  // ── Binder readiness trend ──
  const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
  const readinessTrend = [38, 42, 48, 54, 60, 65, 68, 72, 76, 80, 84, readinessPct];
  const readinessFooter = [
    { label: "Current", value: `${readinessPct}%` },
    { label: "Q1 avg", value: "43%" },
    { label: "Target", value: "95%" },
    { label: "MoM Δ", value: `+${Math.max(readinessPct - 84, 0)}pp` },
  ];

  // ── Activity timeline ──
  const activities: Array<{ title: string; detail?: string; time: string; actor?: string; tone?: "positive" | "warning" | "critical" | "neutral" }> = [
    { title: "CSRD E1-6 narrative approved", detail: "Scope 1-3 inventory section signed off for Q4 binder.", time: "1h ago", actor: "Priya M.", tone: "positive" },
    { title: "GRI 305-2 evidence missing", detail: "Market-based Scope 2 calculation lacks REC evidence.", time: "4h ago", actor: "Audit flag", tone: "critical" },
    { title: "TCFD governance section drafted", detail: "Board oversight narrative v3 routed for legal review.", time: "Yesterday", actor: "Legal · Anand K.", tone: "neutral" },
    { title: "BRSR Principle 6 submitted", detail: "Environment protection disclosures uploaded to portal.", time: "2d ago", actor: "Climate team", tone: "positive" },
    { title: "SASB EM-MM alignment refreshed", detail: "Metals & mining standard mapped to 14 line items.", time: "4d ago", actor: "System · ESG ontology", tone: "neutral" },
  ];

  return (
    <AppShell
      activePath="/disclosures"
      title="Disclosure Binder"
      subtitle="Framework-aligned narratives, evidence pipeline, and non-environmental ESG indicators."
      tabs={[
        { label: "Overview", active: true },
        { label: "Items", count: disclosures.length },
        { label: "Themes", count: disclosureThemes.length },
        { label: "People", count: peopleMetrics.length },
        { label: "Governance", count: governanceRecords.length },
        { label: "Activity" },
      ]}
    >
      <KPIStrip
        items={[
          { label: "Binder readiness", value: `${readinessPct}%` },
          { label: "Items", value: `${disclosures.length}` },
          { label: "Ready", value: `${readyDisclosures}` },
          { label: "In progress", value: `${inProgressDisclosures}` },
          { label: "Needs evidence", value: `${needsEvidenceDisclosures}` },
          { label: "Frameworks", value: `${frameworks.length}` },
          { label: "Non-env indicators", value: `${peopleMetrics.length + governanceRecords.length}` },
        ]}
      />

      <KPIHeroGrid>
        <KPIHero
          label="Binder Readiness"
          value={`${readinessPct}`}
          unit="%"
          delta={`+${Math.max(readinessPct - 84, 3)}pp`}
          direction="up"
          tone="positive"
          baseline="Items ready for publish"
          sparkData={readinessTrend}
          sparkColor="#2563eb"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /></svg>
          }
        />
        <KPIHero
          label="Evidence Gaps"
          value={`${needsEvidenceDisclosures}`}
          unit="blocking"
          delta="−4"
          direction="down"
          tone="positive"
          baseline="vs last cycle"
          sparkData={[8, 8, 7, 7, 6, 6, 5, 5, 4, 3, 3, needsEvidenceDisclosures]}
          sparkColor="#1e40af"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /></svg>
          }
        />
        <KPIHero
          label="In Progress"
          value={`${inProgressDisclosures}`}
          unit="drafts"
          delta="+2"
          direction="up"
          tone="neutral"
          baseline="Under drafting"
          sparkData={[3, 4, 5, 5, 6, 6, 5, 4, 4, 3, 3, inProgressDisclosures]}
          sparkColor="#3b82f6"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
          }
        />
        <KPIHero
          label="Frameworks Mapped"
          value={`${frameworks.length}`}
          unit="active"
          delta="flat"
          direction="flat"
          tone="neutral"
          baseline="GRI · SASB · CSRD · TCFD · BRSR"
          sparkData={[4, 4, 5, 5, 5, 5, 5, 5, 5, 5, frameworks.length, frameworks.length]}
          sparkColor="#60a5fa"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>
          }
        />
      </KPIHeroGrid>

      <div className="section-band">
        <h3>Binder Trajectory</h3>
        <span className="section-band-note">Month-over-month readiness · 12-month view</span>
      </div>

      <section className="page-grid dashboard-row">
        <div className="page-section span-7">
          <TrendLineChart
            title="Binder Readiness Trajectory"
            subtitle="Share of disclosure items marked ready."
            periods={months}
            values={readinessTrend}
            unit="%"
            color="#2563eb"
            footer={readinessFooter}
          />
        </div>
        <div className="page-section span-5">
          <DashboardMeterCard title="Pillar Coverage" subtitle="Requirements by ESG pillar." items={pillarRequirements} />
        </div>
      </section>

      <div className="section-band">
        <h3>Framework Alignment</h3>
        <span className="section-band-note">Pillar and theme × framework coverage · ● = fully mapped</span>
      </div>

      <section className="page-grid dashboard-row">
        <div className="page-section span-12">
          <FrameworkMatrix
            title="Topic × Framework Coverage"
            subtitle="Disclosure alignment across active reporting standards."
            frameworks={frameworks}
            rows={matrixRows}
          />
        </div>
      </section>

      <section className="page-grid dashboard-row">
        <div className="page-section span-12">
          <DashboardProgressCard title="Theme Completion" subtitle="Topic-level readiness progress." items={themeCoverage} />
        </div>
      </section>

      <div className="section-band">
        <h3>Disclosure Items</h3>
        <span className="section-band-note">{disclosures.length} requirements · {readyDisclosures} ready to publish</span>
        <div className="section-band-actions">
          <JumpToButton targetId="new-disclosure" label="New item" className="btn primary" />
          <ExportCsvButton
            data={disclosures.map((d) => ({
              id: d.id,
              framework: d.framework,
              code: d.code,
              title: d.title,
              value: d.value,
              source: d.source,
              status: d.status,
            }))}
            filename="disclosure-items"
            label="Export CSV"
            className="btn"
          />
          <RefreshButton className="btn" />
        </div>
      </div>
      <FilterBar placeholder="Search disclosure code, framework or title…" />

      <section className="page-grid">
        <div className="page-section span-8">
          <div className="table-card">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Framework</th>
                  <th>Requirement</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {disclosures.map((item, i) => (
                  <tr key={item.id} data-search={`${item.code} ${item.framework} ${item.title}`}>
                    <td><span className="ledger-code">{item.code || `DR-${String(i + 1).padStart(4, "0")}`}</span></td>
                    <td><strong>{item.framework}</strong></td>
                    <td>
                      <Link className="entity-link" href={`/disclosures/${item.id}`}>{item.title}</Link>
                    </td>
                    <td><StatusBadge status={item.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="page-section span-4 stack">
          <ActivityTimeline
            title="Disclosure Activity"
            subtitle="Drafts, approvals, and evidence events."
            entries={activities}
          />
          <div id="new-disclosure"><DisclosureCreateForm /></div>
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
