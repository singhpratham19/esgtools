import Link from "next/link";

import { AppShell } from "@/components/platform/app-shell";
import {
  ActivityTimeline,
  DashboardMeterCard,
  DashboardProgressCard,
  HeatMap,
  KPIHero,
  KPIHeroGrid,
  KPIStrip,
  QualityPipeline,
  Sparkline,
  TrendLineChart,
} from "@/components/platform/dashboards";
import { StatusBadge } from "@/components/platform/status-badge";
import { EvidenceUploadForm, TaskCreateForm } from "@/components/platform/forms";
import { listEvidence, listTasks } from "@/lib/db";

export default function ControlsPage() {
  const evidence = listEvidence();
  const tasks = listTasks();
  const verifiedEvidence = evidence.filter((item) => item.status === "Verified").length;
  const reviewEvidence = evidence.filter((item) => item.status === "Needs review").length;
  const missingEvidence = evidence.filter((item) => item.status === "Missing proof").length;
  const openTasks = tasks.filter((task) => task.status === "Open").length;
  const blockedTasks = tasks.filter((task) => task.status === "Blocked").length;
  const inReviewTasks = tasks.filter((task) => task.status === "In review").length;
  const doneTasks = tasks.filter((task) => task.status === "Done").length;
  const verifiedPct = Math.round((verifiedEvidence / Math.max(evidence.length, 1)) * 100);

  const evidenceStatusItems = [
    { label: "Verified", value: verifiedEvidence, displayValue: `${verifiedEvidence}`, detail: "Approved for reporting", color: "#2563eb" },
    { label: "Needs review", value: reviewEvidence, displayValue: `${reviewEvidence}`, detail: "Pending validation", color: "#60a5fa" },
    { label: "Missing proof", value: missingEvidence, displayValue: `${missingEvidence}`, detail: "Requires upload", color: "#1e40af" },
  ];

  const priorityQueueItems = tasks
    .map((task) => {
      const progress = task.status === "Done" ? 100 : task.status === "In review" ? 72 : task.status === "Blocked" ? 18 : 42;
      const tone = task.status === "Done" ? "positive" : task.status === "Blocked" ? "critical" : task.priority === "P1" ? "warning" : "neutral";
      return { label: task.title, progress, valueLabel: `${task.priority} · ${task.status}`, detail: `${task.assignee} · due ${task.dueDate}`, tone } as const;
    })
    .slice(0, 5);

  // ── Heat map: priority x status ──
  const priorities = Array.from(new Set(tasks.map((t) => t.priority)));
  const statuses = ["Open", "In review", "Blocked", "Done"];
  const heatRows = priorities.map((p) => ({
    label: `Priority ${p}`,
    values: statuses.map((s) => tasks.filter((t) => t.priority === p && t.status === s).length),
  }));

  // ── Evidence verification trend ──
  const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
  const verificationTrend = [52, 56, 60, 63, 67, 70, 73, 76, 79, 82, 84, verifiedPct];

  // ── Activity log ──
  const activities: Array<{ title: string; detail?: string; time: string; actor?: string; tone?: "positive" | "warning" | "critical" | "neutral" }> = [
    { title: "Utility invoice batch verified", detail: "Q4 FY25 electricity invoices (12 docs) cleared by finance.", time: "30m ago", actor: "Auto-verify", tone: "positive" },
    { title: "P1 task escalated", detail: "Missing REC evidence for market-based Scope 2 is blocking CSRD.", time: "2h ago", actor: "System · P1 SLA", tone: "critical" },
    { title: "Audit trail exported", detail: "ISO 14064 evidence pack zipped and delivered to KPMG.", time: "Yesterday", actor: "Audit lead · Kiran P.", tone: "neutral" },
    { title: "Control self-assessment closed", detail: "Q4 operational control review completed with 3 findings.", time: "3d ago", actor: "Internal audit", tone: "positive" },
    { title: "DRR-04 policy republished", detail: "Data retention policy v3.2 effective FY26.", time: "5d ago", actor: "Governance", tone: "neutral" },
  ];

  return (
    <AppShell
      activePath="/controls"
      title="Controls &amp; Evidence"
      subtitle="Evidence lifecycle, remediation actions, and reporting-grade audit trail."
      tabs={[
        { label: "Overview", active: true },
        { label: "Evidence", count: evidence.length },
        { label: "Tasks", count: tasks.length },
        { label: "Priority Queue" },
        { label: "Audit trail" },
      ]}
    >
      <KPIStrip
        items={[
          { label: "Evidence records", value: `${evidence.length}` },
          { label: "Verified", value: `${verifiedPct}%` },
          { label: "Needs review", value: `${reviewEvidence}` },
          { label: "Missing proof", value: `${missingEvidence}` },
          { label: "Open tasks", value: `${openTasks}` },
          { label: "In review", value: `${inReviewTasks}` },
          { label: "Blocked", value: `${blockedTasks}` },
          { label: "Closed", value: `${doneTasks}` },
        ]}
      />

      <KPIHeroGrid>
        <KPIHero
          label="Evidence Verified"
          value={`${verifiedPct}`}
          unit="%"
          delta="+16pp"
          direction="up"
          tone="positive"
          baseline={`${verifiedEvidence} of ${evidence.length} records`}
          sparkData={verificationTrend}
          sparkColor="#2563eb"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          }
        />
        <KPIHero
          label="Open Remediation"
          value={`${openTasks}`}
          unit="tasks"
          delta="−3"
          direction="down"
          tone="positive"
          baseline="Awaiting action"
          sparkData={[12, 11, 11, 10, 10, 9, 9, 8, 7, 7, 6, openTasks]}
          sparkColor="#3b82f6"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
          }
        />
        <KPIHero
          label="P1 Blockers"
          value={`${blockedTasks}`}
          unit="critical"
          delta={blockedTasks > 0 ? "+1" : "flat"}
          direction={blockedTasks > 0 ? "up" : "flat"}
          tone={blockedTasks > 0 ? "negative" : "positive"}
          baseline="Requires executive escalation"
          sparkData={[0, 0, 1, 1, 1, 1, 2, 2, 1, 1, 1, blockedTasks]}
          sparkColor="#1e40af"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          }
        />
        <KPIHero
          label="Audit Readiness"
          value="91"
          unit="% score"
          delta="+5pp"
          direction="up"
          tone="positive"
          baseline="External auditor readiness"
          sparkData={[68, 70, 72, 74, 76, 78, 80, 82, 84, 86, 88, 91]}
          sparkColor="#1d4ed8"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></svg>
          }
        />
      </KPIHeroGrid>

      <div className="section-band">
        <h3>Evidence Pipeline</h3>
        <span className="section-band-note">Document lifecycle from ingest to release</span>
      </div>

      <section className="page-grid dashboard-row">
        <div className="page-section span-12">
          <QualityPipeline
            title="Evidence Lifecycle"
            subtitle="Document flow from ingestion to audit-ready release."
            stages={[
              { label: "Ingested", value: `${evidence.length}`, active: true },
              { label: "Classified", value: `${evidence.length - missingEvidence}` },
              { label: "Needs review", value: `${reviewEvidence}` },
              { label: "Verified", value: `${verifiedEvidence}` },
              { label: "Released", value: `${Math.max(verifiedEvidence - 1, 0)}` },
            ]}
          />
        </div>
      </section>

      <section className="page-grid dashboard-row">
        <div className="page-section span-7">
          <TrendLineChart
            title="Verification Trajectory"
            subtitle="Evidence verified for reporting · 12-month view"
            periods={months}
            values={verificationTrend}
            unit="%"
            color="#2563eb"
            footer={[
              { label: "Current", value: `${verifiedPct}%` },
              { label: "12-mo avg", value: `${Math.round(verificationTrend.reduce((s, v) => s + v, 0) / 12)}%` },
              { label: "SLA target", value: "90%" },
              { label: "MoM Δ", value: "+3pp" },
            ]}
          />
        </div>
        <div className="page-section span-5">
          <DashboardMeterCard title="Evidence Status" subtitle="Proof state across all records." items={evidenceStatusItems} />
        </div>
      </section>

      <div className="section-band">
        <h3>Remediation Heatmap</h3>
        <span className="section-band-note">Task volume by priority × status</span>
      </div>

      <section className="page-grid dashboard-row">
        <div className="page-section span-7">
          <HeatMap
            title="Priority × Status Matrix"
            subtitle="Concentration of open and blocked work across priorities."
            columns={statuses}
            rows={heatRows}
          />
        </div>
        <div className="page-section span-5">
          <DashboardProgressCard title="Priority Queue" subtitle="Top remediation items." items={priorityQueueItems} />
        </div>
      </section>

      <div className="section-band">
        <h3>Evidence Register</h3>
        <span className="section-band-note">{evidence.length} proof records · {verifiedEvidence} verified</span>
        <div className="section-band-actions">
          <button className="toolbar-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
            Upload
          </button>
        </div>
      </div>

      <section className="page-grid">
        <div className="page-section span-8">
          <div className="table-card">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Proof ID</th>
                  <th>Document</th>
                  <th>Metric</th>
                  <th>Trend</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {evidence.map((item, i) => {
                  const seed = (i * 23) % 100;
                  const trend = Array.from({ length: 8 }, (_, k) => 30 + k * 5 + Math.sin((seed + k) * 0.6) * 8);
                  return (
                    <tr key={item.proofId}>
                      <td><span className="ledger-code">{item.proofId}</span></td>
                      <td>
                        <strong>{item.documentName}</strong>
                        <span className="row-subtle">{item.filePath || item.documentType}</span>
                      </td>
                      <td>{item.metric}</td>
                      <td><Sparkline data={trend} width={72} height={20} color="#3b82f6" /></td>
                      <td><StatusBadge status={item.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="page-section span-4 stack">
          <ActivityTimeline
            title="Audit Trail"
            subtitle="Control execution and governance events."
            entries={activities}
          />
          <EvidenceUploadForm />
          <TaskCreateForm />
        </div>
      </section>

      <div className="section-band">
        <h3>Control Tasks</h3>
        <span className="section-band-note">{tasks.length} actions across all priorities</span>
      </div>

      <section className="page-grid">
        <div className="page-section span-12">
          <div className="table-card">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Task</th>
                  <th>Assignee</th>
                  <th>Due</th>
                  <th>Priority</th>
                  <th>Framework</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, i) => (
                  <tr key={task.id}>
                    <td><span className="ledger-code">CT-{String(i + 1).padStart(4, "0")}</span></td>
                    <td>
                      <Link className="entity-link" href={`/controls/tasks/${task.id}`}>{task.title}</Link>
                    </td>
                    <td>{task.assignee}</td>
                    <td>{task.dueDate}</td>
                    <td><span className="pill">{task.priority}</span></td>
                    <td><span className="pill">{task.framework}</span></td>
                    <td><StatusBadge status={task.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
