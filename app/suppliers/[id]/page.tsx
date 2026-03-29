import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/platform/app-shell";
import { SupplierEditorForm } from "@/components/platform/forms";
import { getSupplier } from "@/lib/db";

export default function SupplierDetailPage({ params }: { params: { id: string } }) {
  const supplier = getSupplier(params.id);
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
                <dd>{supplier.risk}</dd>
              </div>
              <div>
                <dt>Spend</dt>
                <dd>{`$${supplier.spendUsd.toLocaleString()}`}</dd>
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
              Back to suppliers
            </Link>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
