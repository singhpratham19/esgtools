import Link from "next/link";

import { AppShell } from "@/components/platform/app-shell";
import {
  ActivityTimeline,
  DashboardMeterCard,
  KPIHero,
  KPIHeroGrid,
  KPIStrip,
  Sparkline,
  StackedColumnChart,
  TrendLineChart,
} from "@/components/platform/dashboards";
import { StatusBadge } from "@/components/platform/status-badge";
import { TargetCreateForm } from "@/components/platform/forms";
import { listTargets } from "@/lib/db";

export default function TargetsPage() {
  const targets = listTargets();
  const onTrackTargets = targets.filter((t) => t.status === "On track").length;
  const fundingTargets = targets.filter((t) => t.status === "Needs funding").length;
  const atRiskTargets = targets.filter((t) => t.status === "At risk").length;
  const healthPct = Math.round((onTrackTargets / Math.max(targets.length, 1)) * 100);

  const pillarMix = ["Environmental", "Social", "Governance"].map((pillar) => ({
    label: pillar,
    value: targets.filter((t) => t.pillar === pillar).length,
    displayValue: `${targets.filter((t) => t.pillar === pillar).length}`,
    detail: "Active targets",
    color: pillar === "Environmental" ? "#1d4ed8" : pillar === "Social" ? "#3b82f6" : "#93c5fd",
  }));

  // ── Projected trajectory toward 2030 net-zero glide ──
  const years = ["FY23", "FY24", "FY25", "FY26", "FY27", "FY28", "FY29", "FY30"];
  const actualTrend = [14200, 13400, 12480, NaN, NaN, NaN, NaN, NaN].filter((v) => !isNaN(v)) as number[];
  const planned = [14200, 13400, 12480, 11100, 9800, 8400, 7100, 5800];

  // ── Stacked: emissions reduction contribution by program ──
  const programYears = ["FY25", "FY26", "FY27", "FY28", "FY29", "FY30"];
  const programSeries = [
    { label: "Energy efficiency", color: "#1e40af", values: [420, 620, 780, 920, 1080, 1220] },
    { label: "Renewable PPA", color: "#2563eb", values: [180, 380, 640, 880, 1150, 1420] },
    { label: "Process redesign", color: "#3b82f6", values: [40, 120, 280, 520, 780, 1060] },
    { label: "Supplier engagement", color: "#60a5fa", values: [30, 90, 210, 380, 580, 800] },
    { label: "Logistics optimisation", color: "#93c5fd", values: [20, 60, 140, 240, 380, 520] },
  ];

  // ── Activity log ──
  const activities: Array<{ title: string; detail?: string; time: string; actor?: string; tone?: "positive" | "warning" | "critical" | "neutral" }> = [
    { title: "SBTi 1.5°C pathway submitted", detail: "Near-term 2030 target letter filed; validation pending.", time: "1d ago", actor: "Climate lead", tone: "positive" },
    { title: "Renewable PPA signed", detail: "140 MW solar PPA secured · 28% of FY27 glide path.", time: "3d ago", actor: "Energy desk · Arjun V.", tone: "positive" },
    { title: "DEI target re-baselined", detail: "FY30 women in mgmt target raised from 35% → 42%.", time: "1w ago", actor: "People council", tone: "neutral" },
    { title: "Waste diversion at risk", detail: "Nashik facility trending to 84% diversion vs 92% target.", time: "2w ago", actor: "Ops · Divya K.", tone: "warning" },
  ];

  return (
    <AppShell
      activePath="/targets"
      title="Targets &amp; Actions"
      subtitle="Environmental, social, and governance targets with financed decarbonization roadmap."
      tabs={[
        { label: "Overview", active: true },
        { label: "Register", count: targets.length },
        { label: "Roadmap" },
        { label: "Scenarios" },
        { label: "Activity" },
      ]}
    >
      <KPIStrip
        items={[
          { label: "Active targets", value: `${targets.length}` },
          { label: "Health", value: `${healthPct}%` },
          { label: "On track", value: `${onTrackTargets}` },
          { label: "Needs funding", value: `${fundingTargets}` },
          { label: "At risk", value: `${atRiskTargets}` },
          { label: "FY30 horizon", value: "5.8k", unit: "tCO₂e" },
          { label: "Glide path", value: "on pace" },
        ]}
      />

      <KPIHeroGrid>
        <KPIHero
          label="Portfolio Health"
          value={`${healthPct}`}
          unit="% on track"
          delta="+12pp"
          direction="up"
          tone="positive"
          baseline={`${onTrackTargets} of ${targets.length} targets`}
          sparkData={[42, 48, 52, 58, 62, 65, 68, 72, 74, 76, 78, healthPct]}
          sparkColor="#2563eb"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
          }
        />
        <KPIHero
          label="2030 Abatement"
          value="5.8"
          unit="k tCO₂e target"
          delta="−58%"
          direction="down"
          tone="positive"
          baseline="vs FY23 baseline 14.2k"
          sparkData={[14200, 13400, 12480, 11100, 9800, 8400, 7100, 5800]}
          sparkColor="#1d4ed8"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
          }
        />
        <KPIHero
          label="Capital Gap"
          value="$4.2"
          unit="M requested"
          delta={fundingTargets > 0 ? "+1" : "flat"}
          direction={fundingTargets > 0 ? "up" : "flat"}
          tone="negative"
          baseline={`${fundingTargets} targets blocked`}
          sparkData={[1.2, 1.8, 2.4, 2.9, 3.4, 3.8, 4.0, 4.1, 4.2, 4.2, 4.2, 4.2]}
          sparkColor="#1e40af"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
          }
        />
        <KPIHero
          label="SBTi Alignment"
          value="1.5"
          unit="°C pathway"
          delta="validated"
          direction="flat"
          tone="positive"
          baseline="Near-term FY30 + Net-Zero FY45"
          sparkData={[2.1, 2.0, 1.9, 1.85, 1.8, 1.75, 1.7, 1.65, 1.6, 1.55, 1.5, 1.5]}
          sparkColor="#3b82f6"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
          }
        />
      </KPIHeroGrid>

      <div className="section-band">
        <h3>Decarbonization Roadmap</h3>
        <span className="section-band-note">Planned absolute emissions vs 2030 glide path · tCO₂e</span>
      </div>

      <section className="page-grid dashboard-row">
        <div className="page-section span-7">
          <TrendLineChart
            title="2030 Glide Path"
            subtitle="FY23 baseline → FY30 near-term target (1.5°C aligned)"
            periods={years}
            values={planned}
            unit="tCO₂e"
            color="#2563eb"
            footer={[
              { label: "Baseline FY23", value: "14,200" },
              { label: "Current FY25", value: "12,480" },
              { label: "Target FY30", value: "5,800" },
              { label: "Abatement", value: "−58.5%" },
            ]}
            actions={<span className="panel-pill">SBTi 1.5°C</span>}
          />
        </div>
        <div className="page-section span-5">
          <DashboardMeterCard title="Pillar Mix" subtitle="Target distribution by ESG pillar." items={pillarMix} />
        </div>
      </section>

      <section className="page-grid dashboard-row">
        <div className="page-section span-12">
          <StackedColumnChart
            title="Abatement Wedge by Program"
            subtitle="Annualised emission reductions contributed by each initiative."
            periods={programYears}
            series={programSeries}
            unit="tCO₂e"
            actions={<span className="panel-pill">5 programs</span>}
          />
        </div>
      </section>

      <div className="section-band">
        <h3>Target Register</h3>
        <span className="section-band-note">{targets.length} governed targets · {onTrackTargets} on track</span>
        <div className="section-band-actions">
          <button className="toolbar-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
            New target
          </button>
        </div>
      </div>

      <section className="page-grid">
        <div className="page-section span-8">
          <div className="table-card">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Target</th>
                  <th>Pillar</th>
                  <th>Goal</th>
                  <th>Year</th>
                  <th>Progress</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {targets.map((target, i) => {
                  const seed = (i * 41) % 100;
                  const progress = Array.from({ length: 8 }, (_, k) => {
                    return 20 + k * 8 + Math.sin((seed + k) * 0.5) * 6;
                  });
                  return (
                    <tr key={target.id}>
                      <td><span className="ledger-code">TGT-{String(i + 1).padStart(4, "0")}</span></td>
                      <td>
                        <Link className="entity-link" href={`/targets/${target.id}`}>{target.title}</Link>
                        <span className="row-subtle">{target.owner}</span>
                      </td>
                      <td><span className="pill">{target.pillar}</span></td>
                      <td>{target.target}</td>
                      <td>{target.targetYear}</td>
                      <td><Sparkline data={progress} width={72} height={20} color="#2563eb" /></td>
                      <td><StatusBadge status={target.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="page-section span-4 stack">
          <ActivityTimeline
            title="Roadmap Activity"
            subtitle="Program-level milestones and governance."
            entries={activities}
          />
          <TargetCreateForm />
        </div>
      </section>
    </AppShell>
  );
}
