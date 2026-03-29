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
  const onTrackTargets = targets.filter((target) => target.status === "On track").length;
  const fundingTargets = targets.filter((target) => target.status === "Needs funding").length;
  const atRiskTargets = targets.filter((target) => target.status === "At risk").length;
  const pillarMix = ["Environmental", "Social", "Governance"].map((pillar) => ({
    label: pillar,
    value: targets.filter((target) => target.pillar === pillar).length,
    displayValue: `${targets.filter((target) => target.pillar === pillar).length}`,
    detail: "Targets in active register",
    color: pillar === "Environmental" ? "var(--success)" : pillar === "Social" ? "var(--blue)" : "var(--warning)"
  }));
  const statusMix = [
    {
      label: "On track",
      value: onTrackTargets,
      displayValue: `${onTrackTargets}`,
      detail: "Programs meeting current execution expectations",
      color: "var(--success)"
    },
    {
      label: "Needs funding",
      value: fundingTargets,
      displayValue: `${fundingTargets}`,
      detail: "Programs blocked by capital allocation",
      color: "var(--warning)"
    },
    {
      label: "At risk",
      value: atRiskTargets,
      displayValue: `${atRiskTargets}`,
      detail: "Programs with material execution risk",
      color: "var(--critical)"
    }
  ];
  const targetHealthFigure = [
    {
      label: "On track",
      value: onTrackTargets,
      displayValue: `${onTrackTargets}`,
      detail: "Running to plan",
      color: "var(--success)"
    },
    {
      label: "Needs funding",
      value: fundingTargets,
      displayValue: `${fundingTargets}`,
      detail: "Budget pending",
      color: "var(--warning)"
    },
    {
      label: "At risk",
      value: atRiskTargets,
      displayValue: `${atRiskTargets}`,
      detail: "Needs intervention",
      color: "var(--critical)"
    }
  ];
  return (
    <AppShell
      activePath="/targets"
      title="Targets and Actions"
      subtitle="Track environmental, social, and governance targets in one governed register."
    >
      <DashboardStatGrid
        items={[
          {
            label: "Active targets",
            value: `${targets.length}`,
            detail: "Programs in the active roadmap",
            tone: "neutral"
          },
          {
            label: "On track",
            value: `${onTrackTargets}`,
            detail: "Targets progressing to plan",
            tone: "positive"
          },
          {
            label: "At risk",
            value: `${atRiskTargets}`,
            detail: "Targets needing intervention",
            tone: atRiskTargets > 0 ? "critical" : "neutral"
          }
        ]}
      />

      <section className="page-grid dashboard-row">
        <div className="page-section span-6">
          <DashboardMeterCard
            title="Pillar Mix"
            subtitle="How target coverage is distributed."
            items={pillarMix}
          />
        </div>
        <div className="page-section span-6">
          <DashboardDonutCard
            title="Target Health"
            subtitle="Overall status across the target portfolio."
            totalLabel={`${Math.round((onTrackTargets / Math.max(targets.length, 1)) * 100)}%`}
            items={targetHealthFigure}
          />
        </div>
      </section>

      <section className="page-grid dashboard-row">
        <div className="page-section span-12">
          <DashboardColumnChartCard
            title="Execution Status"
            subtitle="Current target distribution by delivery state."
            items={statusMix}
          />
        </div>
      </section>

      <section className="page-grid">
        <div className="page-section span-8">
          <div className="section-header">
            <h3>Target Register</h3>
          </div>
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Target</th>
                  <th>Pillar</th>
                  <th>Goal</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {targets.map((target) => (
                  <tr key={target.id}>
                    <td>
                      <Link className="entity-link" href={`/targets/${target.id}`}>
                        {target.title}
                      </Link>
                      <span className="row-subtle">{`${target.owner} | ${target.targetYear}`}</span>
                    </td>
                    <td>{target.pillar}</td>
                    <td>{target.target}</td>
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
