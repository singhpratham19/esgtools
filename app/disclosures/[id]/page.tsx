import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/platform/app-shell";
import { DisclosureEditorForm } from "@/components/platform/forms";
import { StatusBadge } from "@/components/platform/status-badge";
import { getDisclosure } from "@/lib/db";

export default async function DisclosureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const disclosure = getDisclosure(id);
  if (!disclosure) {
    notFound();
  }

  return (
    <AppShell
      activePath="/disclosures"
      title={`${disclosure.framework} ${disclosure.code}`}
      subtitle="Requirement detail, source trail, and editable disclosure state."
    >
      <section className="page-grid">
        <div className="page-section span-7">
          <div className="detail-card">
            <div className="section-header">
              <h3>Disclosure Context</h3>
            </div>
            <dl className="detail-grid">
              <div>
                <dt>Framework</dt>
                <dd>{disclosure.framework}</dd>
              </div>
              <div>
                <dt>Code</dt>
                <dd><span className="pill">{disclosure.code}</span></dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd><StatusBadge status={disclosure.status} /></dd>
              </div>
              <div>
                <dt>Source</dt>
                <dd>{disclosure.source}</dd>
              </div>
            </dl>
          </div>
        </div>
        <div className="page-section span-5 stack">
          <DisclosureEditorForm disclosure={disclosure} />
          <div className="detail-card">
            <Link className="entity-link" href="/disclosures">
              &larr; Back to disclosure binder
            </Link>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
