import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/platform/app-shell";
import { TaskEditorForm } from "@/components/platform/forms";
import { StatusBadge } from "@/components/platform/status-badge";
import { getTask } from "@/lib/db";

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const task = getTask(id);
  if (!task) {
    notFound();
  }

  return (
    <AppShell
      activePath="/controls"
      title={task.title}
      subtitle="Task owner, due date, framework linkage, and workflow status."
    >
      <section className="page-grid">
        <div className="page-section span-7">
          <div className="detail-card">
            <div className="section-header">
              <h3>Task Context</h3>
            </div>
            <dl className="detail-grid">
              <div>
                <dt>Assignee</dt>
                <dd>{task.assignee}</dd>
              </div>
              <div>
                <dt>Due date</dt>
                <dd>{task.dueDate}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd><StatusBadge status={task.status} /></dd>
              </div>
              <div>
                <dt>Priority</dt>
                <dd><span className="pill">{task.priority}</span></dd>
              </div>
              <div>
                <dt>Framework</dt>
                <dd><span className="pill">{task.framework}</span></dd>
              </div>
            </dl>
          </div>
        </div>
        <div className="page-section span-5 stack">
          <TaskEditorForm task={task} />
          <div className="detail-card">
            <Link className="entity-link" href="/controls">
              &larr; Back to controls
            </Link>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
