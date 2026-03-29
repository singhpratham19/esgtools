import Link from "next/link";

import { AppShell } from "@/components/platform/app-shell";
import {
  DashboardColumnChartCard,
  DashboardDonutCard,
  DashboardMeterCard,
  DashboardStatGrid
} from "@/components/platform/dashboards";
import { StatusBadge } from "@/components/platform/status-badge";
import { TargetCreateForm } from "@/components/platform/forms";
import { listTargets } from "@/lib/db";

export default function TargetsPage() {
  const targets = listTargets();
  const onTrackTargets = targets.filter((t) => t.status === "On track").length;
  const fundingTargets = targets.filter((t) => t.status === "Needs funding").length;
  const atRiskTargets = targets.filter((t) => t.status === "At risk").length;

  const pillarMix = ["Environmental", "Social", "Governance"].map((pillar) => ({
    label: pillar,
    value: targets.filter((t) => t.pillar === pillar).length,
    displayValue: `${targets.filter((t) => t.pillar === pillar).length}`,
    detail: "Active targets",
    color: pillar === "Environmental" ? "var(--primary)" : pillar === "Social" ? "var(--accent)" : "var(--warning)"
  }));

  const statusMix = [
    { label: "On track", value: onTrackTargets, displayValue: `${onTrackTargets}`, detail: "Meeting execution expectations", color: "var(--success)" },
    { label: "Needs funding", value: fundingTargets, displayValue: `${fundingTargets}`, detail: "Blocked by capital allocation", color: "var(--warning)" },
    { label: "At risk", value: atRiskTargets, displayValue: `${atRiskTargets}`, detail: "Material execution risk", color: "var(--critical)" }
  ];

  const targetHealthFigure = [
    { label: "On track", value: onTrackTargets, displayValue: `${onTrackTargets}`, detail: "Running to plan", color: "var(--success)" },
    { label: "Needs funding", value: fundingTargets, displayValue: `${fundingTargets}`, detail: "Budget pending", color: "var(--warning)" },
    { label: "At risk", value: atRiskTargets, displayValue: `${atRiskTargets}`, detail: "Needs intervention", color: "var(--critical)" }
  ];

  return (
    <AppShell
      activePath="/targets"
      title="Targets & Actions"
      subtitle="Environmental, social, and governance targets in one governed register."
      tabs={[
        { label: "Overview", active: true },
        { label: "Register", count: targets.length },
        { label: "Roadmap" },
      ]}
    >
      <DashboardStatGrid
        items={[
          { label: "Active targets", value: `${targets.length}`, detail: "Programs in roadmap", tone: "neutral" },
          { label: "On track", value: `${onTrackTargets}`, detail: "Progressing to plan", tone: "positive" },
          { label: "Needs funding", value: `${fundingTargets}`, detail: "Awaiting allocation", tone: fundingTargets > 0 ? "warning" : "neutral" },
          { label: "At risk", value: `${atRiskTargets}`, detail: "Needs intervention", tone: atRiskTargets > 0 ? "critical" : "positive" }
        ]}
      />

      <section className="page-grid dashboard-row">
        <div className="page-section span-6">
          <DashboardMeterCard title="Pillar Mix" subtitle="Target distribution." items={pillarMix} />
        </div>
        <div className="page-section span-6">
          <DashboardDonutCard title="Target Health" subtitle="Overall portfolio status." totalLabel={`${Math.round((onTrackTargets / Math.max(targets.length, 1)) * 100)}%`} items={targetHealthFigure} />
        </div>
      </section>

      <section className="page-grid dashboard-row">
        <div className="page-section span-12">
          <DashboardColumnChartCard title="Execution Status" subtitle="Target distribution by delivery state." items={statusMix} />
        </div>
      </section>

      <section className="page-grid">
        <div className="page-section span-8">
          <div className="section-header"><h3>Target Register</h3></div>
          <div className="table-card">
            <table className="data-table">
              <thead><tr><th>Target</th><th>Pillar</th><th>Goal</th><th>Year</th><th>Status</th></tr></thead>
              <tbody>
                {targets.map((target) => (
                  <tr key={target.id}>
                    <td>
                      <Link className="entity-link" href={`/targets/${target.id}`}>{target.title}</Link>
                      <span className="row-subtle">{target.owner}</span>
                    </td>
                    <td><span className="pill">{target.pillar}</span></td>
                    <td>{target.target}</td>
                    <td>{target.targetYear}</td>
                    <td><StatusBadge status={target.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="page-section span-4 stack">
          <TargetCreateForm />
        </div>
      </section>
    </AppShell>
  );
}
