import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/platform/app-shell";
import { TaskEditorForm } from "@/components/platform/forms";
import { getTask } from "@/lib/db";

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const task = getTask(params.id);
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
                <dd>{task.status}</dd>
              </div>
              <div>
                <dt>Framework</dt>
                <dd>{task.framework}</dd>
              </div>
            </dl>
          </div>
        </div>
        <div className="page-section span-5 stack">
          <TaskEditorForm task={task} />
          <div className="detail-card">
            <Link className="entity-link" href="/controls">
              Back to controls
            </Link>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
