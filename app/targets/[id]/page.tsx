import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/platform/app-shell";
import { TargetEditorForm } from "@/components/platform/forms";
import { StatusBadge } from "@/components/platform/status-badge";
import { getTarget } from "@/lib/db";

export default async function TargetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const target = getTarget(id);
  if (!target) {
    notFound();
  }

  return (
    <AppShell
      activePath="/targets"
      title={target.title}
      subtitle="Target detail, baseline, goal, and current delivery state."
    >
      <section className="page-grid">
        <div className="page-section span-7">
          <div className="detail-card">
            <div className="section-header">
              <h3>Target Profile</h3>
            </div>
            <dl className="detail-grid">
              <div>
                <dt>Pillar</dt>
                <dd><span className="pill">{target.pillar}</span></dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd><StatusBadge status={target.status} /></dd>
              </div>
              <div>
                <dt>Baseline</dt>
                <dd>{target.baseline}</dd>
              </div>
              <div>
                <dt>Target</dt>
                <dd>{target.target}</dd>
              </div>
              <div>
                <dt>Target year</dt>
                <dd>{target.targetYear}</dd>
              </div>
              <div>
                <dt>Owner</dt>
                <dd>{target.owner}</dd>
              </div>
            </dl>
          </div>
        </div>
        <div className="page-section span-5 stack">
          <TargetEditorForm target={target} />
          <div className="detail-card">
            <Link className="entity-link" href="/targets">
              &larr; Back to targets
            </Link>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
