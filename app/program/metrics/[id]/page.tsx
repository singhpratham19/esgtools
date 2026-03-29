import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/platform/app-shell";
import { MetricEditorForm } from "@/components/platform/forms";
import { listEvidence, getMetric } from "@/lib/db";
import { formatTonnes } from "@/lib/esg";

export default function MetricDetailPage({ params }: { params: { id: string } }) {
  const metric = getMetric(params.id);
  if (!metric) {
    notFound();
  }

  const evidence = listEvidence().filter((item) => item.metric === metric.label || item.proofId === metric.proofId);

  return (
    <AppShell
      activePath="/program"
      title={metric.label}
      subtitle="Metric detail, editable values, and linked evidence."
    >
      <section className="page-grid">
        <div className="page-section span-7 stack">
          <div className="detail-card">
            <div className="section-header">
              <h3>Metric Profile</h3>
              <p>Scope, methodology, factor, and source context.</p>
            </div>
            <dl className="detail-grid">
              <div>
                <dt>Facility</dt>
                <dd>{metric.facilityId}</dd>
              </div>
              <div>
                <dt>Scope</dt>
                <dd>{metric.scope}</dd>
              </div>
              <div>
                <dt>Quantity</dt>
                <dd>{`${metric.quantity} ${metric.unit}`}</dd>
              </div>
              <div>
                <dt>Emissions</dt>
                <dd>{formatTonnes(metric.emissionsTonnes)}</dd>
              </div>
              <div>
                <dt>Methodology</dt>
                <dd>{metric.methodology}</dd>
              </div>
              <div>
                <dt>Source</dt>
                <dd>{metric.source}</dd>
              </div>
            </dl>
          </div>

          <div className="table-card">
            <div className="section-header">
              <h3>Linked Evidence</h3>
              <p>Supporting records connected to this metric.</p>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Proof ID</th>
                  <th>Document</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {evidence.map((item) => (
                  <tr key={item.proofId}>
                    <td>{item.proofId}</td>
                    <td>
                      <strong>{item.documentName}</strong>
                      <span className="row-subtle">{item.documentType}</span>
                    </td>
                    <td>{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="page-section span-5 stack">
          <MetricEditorForm metric={metric} />
          <div className="detail-card">
            <div className="section-header">
              <h3>Navigation</h3>
            </div>
            <Link className="entity-link" href="/program">
              Back to program metrics
            </Link>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
