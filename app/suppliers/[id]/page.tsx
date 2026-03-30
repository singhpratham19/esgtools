import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/platform/app-shell";
import { SupplierEditorForm } from "@/components/platform/forms";
import { StatusBadge } from "@/components/platform/status-badge";
import { getSupplier } from "@/lib/db";
import { formatTonnes } from "@/lib/esg";

export default async function SupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supplier = getSupplier(id);
  if (!supplier) {
    notFound();
  }

  return (
    <AppShell
      activePath="/suppliers"
      title={supplier.name}
      subtitle="Supplier detail, risk posture, and emissions exposure."
    >
      <section className="page-grid">
        <div className="page-section span-7">
          <div className="detail-card">
            <div className="section-header">
              <h3>Supplier Profile</h3>
            </div>
            <dl className="detail-grid">
              <div>
                <dt>Category</dt>
                <dd>{supplier.category}</dd>
              </div>
              <div>
                <dt>Risk</dt>
                <dd><StatusBadge status={supplier.risk} /></dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd><StatusBadge status={supplier.status} /></dd>
              </div>
              <div>
                <dt>Spend</dt>
                <dd>{`$${supplier.spendUsd.toLocaleString()}`}</dd>
              </div>
              <div>
                <dt>Emissions</dt>
                <dd>{formatTonnes(supplier.emissionsTonnes)}</dd>
              </div>
              <div>
                <dt>Response rate</dt>
                <dd>{`${supplier.responseRate}%`}</dd>
              </div>
            </dl>
          </div>
        </div>
        <div className="page-section span-5 stack">
          <SupplierEditorForm supplier={supplier} />
          <div className="detail-card">
            <Link className="entity-link" href="/suppliers">
              &larr; Back to suppliers
            </Link>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
