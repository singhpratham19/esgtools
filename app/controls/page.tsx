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
  const evidenceStatusItems = [
    {
      label: "Verified",
      value: verifiedEvidence,
      displayValue: `${verifiedEvidence}`,
      detail: "Approved for reporting use",
      color: "var(--success)"
    },
    {
      label: "Needs review",
      value: reviewEvidence,
      displayValue: `${reviewEvidence}`,
      detail: "Pending reviewer validation",
      color: "var(--warning)"
    },
    {
      label: "Missing proof",
      value: missingEvidence,
      displayValue: `${missingEvidence}`,
      detail: "Unbacked records requiring upload",
      color: "var(--critical)"
    }
  ];
  const taskPipelineItems = [
    {
      label: "Open",
      value: tasks.filter((task) => task.status === "Open").length,
      displayValue: `${tasks.filter((task) => task.status === "Open").length}`,
      detail: "Awaiting owner action",
      color: "var(--blue)"
    },
    {
      label: "In review",
      value: tasks.filter((task) => task.status === "In review").length,
      displayValue: `${tasks.filter((task) => task.status === "In review").length}`,
      detail: "Under reviewer signoff",
      color: "var(--warning)"
    },
    {
      label: "Blocked",
      value: blockedTasks,
      displayValue: `${blockedTasks}`,
      detail: "Dependent on unresolved issues",
      color: "var(--critical)"
    }
  ];
  const taskFigureItems = [
    {
      label: "Open",
      value: tasks.filter((task) => task.status === "Open").length,
      displayValue: `${tasks.filter((task) => task.status === "Open").length}`,
      detail: "Needs action",
      color: "var(--blue)"
    },
    {
      label: "Review",
      value: tasks.filter((task) => task.status === "In review").length,
      displayValue: `${tasks.filter((task) => task.status === "In review").length}`,
      detail: "Under review",
      color: "var(--warning)"
    },
    {
      label: "Blocked",
      value: blockedTasks,
      displayValue: `${blockedTasks}`,
      detail: "Blocked items",
      color: "var(--critical)"
    }
  ];
  const priorityQueueItems = tasks
    .map((task) => {
      const progress =
        task.status === "Done" ? 100 : task.status === "In review" ? 72 : task.status === "Blocked" ? 18 : 42;
      const tone =
        task.status === "Done"
          ? "positive"
          : task.status === "Blocked"
            ? "critical"
            : task.priority === "P1"
              ? "warning"
              : "neutral";

      return {
        label: task.title,
        progress,
        valueLabel: `${task.priority} | ${task.status}`,
        detail: `${task.assignee} | ${task.framework} | due ${task.dueDate}`,
        tone
      } as const;
    })
    .slice(0, 5);

  return (
    <AppShell
      activePath="/controls"
      title="Controls and Evidence"
      subtitle="Manage uploaded documents, remediation tasks, and control execution."
    >
      <DashboardStatGrid
        items={[
          {
            label: "Evidence records",
            value: `${evidence.length}`,
            detail: "Documents and proof packs",
            tone: "neutral"
          },
          {
            label: "Verified rate",
            value: `${Math.round((verifiedEvidence / evidence.length) * 100)}%`,
            detail: "Evidence cleared for reporting use",
            tone: verifiedEvidence / evidence.length > 0.7 ? "positive" : "warning"
          },
          {
            label: "Open actions",
            value: `${openTasks}`,
            detail: "Remediation and follow-up tasks",
            tone: openTasks > 3 ? "warning" : "neutral"
          }
        ]}
      />

      <section className="page-grid dashboard-row">
        <div className="page-section span-6">
          <DashboardMeterCard
            title="Evidence Lifecycle"
            subtitle="Current proof status."
            items={evidenceStatusItems}
          />
        </div>
        <div className="page-section span-6">
          <DashboardDonutCard
            title="Evidence Readiness"
            subtitle="Verified versus unresolved evidence."
            totalLabel={`${Math.round((verifiedEvidence / Math.max(evidence.length, 1)) * 100)}%`}
            items={evidenceStatusItems}
          />
        </div>
      </section>

      <section className="page-grid dashboard-row">
        <div className="page-section span-6">
          <DashboardMeterCard
            title="Task Pipeline"
            subtitle="Execution status across remediation work."
            items={taskPipelineItems}
          />
        </div>
        <div className="page-section span-6">
          <DashboardColumnChartCard
            title="Action Load"
            subtitle="Current distribution of task statuses."
            items={taskFigureItems}
          />
        </div>
      </section>

      <section className="page-grid dashboard-row">
        <div className="page-section span-12">
          <DashboardProgressCard
            title="Priority Queue"
            subtitle="Top remediation items and disclosure blockers."
            items={priorityQueueItems}
          />
        </div>
      </section>

      <section className="page-grid">
        <div className="page-section span-8">
          <div className="section-header">
            <h3>Evidence Register</h3>
          </div>
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Proof ID</th>
                  <th>Document</th>
                  <th>Metric</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {evidence.map((item) => (
                  <tr key={item.proofId}>
                    <td><span className="pill">{item.proofId}</span></td>
                    <td>
                      <strong>{item.documentName}</strong>
                      <span className="row-subtle">{item.filePath || item.documentType}</span>
                    </td>
                    <td>{item.metric}</td>
                    <td><StatusBadge status={item.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="page-section span-4 stack">
          <EvidenceUploadForm />
          <TaskCreateForm />
        </div>
      </section>

      <section className="page-grid">
        <div className="page-section span-12">
          <div className="section-header">
            <h3>Control Tasks</h3>
          </div>
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Assignee</th>
                  <th>Due</th>
                  <th>Status</th>
                  <th>Framework</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <Link className="entity-link" href={`/controls/tasks/${task.id}`}>
                        {task.title}
                      </Link>
                    </td>
                    <td>{task.assignee}</td>
                    <td>{task.dueDate}</td>
                    <td><StatusBadge status={task.status} /></td>
                    <td><span className="pill">{task.framework}</span></td>
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
