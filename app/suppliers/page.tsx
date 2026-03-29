import Link from "next/link";

import { AppShell } from "@/components/platform/app-shell";
import {
  DashboardColumnChartCard,
  DashboardDonutCard,
  DashboardMeterCard,
  DashboardStatGrid
} from "@/components/platform/dashboards";
import { StatusBadge } from "@/components/platform/status-badge";
import { SupplierCreateForm } from "@/components/platform/forms";
import { listSuppliers } from "@/lib/db";
import { formatTonnes } from "@/lib/esg";

export default function SuppliersPage() {
  const suppliers = listSuppliers();
  const totalSupplierEmissions = suppliers.reduce((sum, s) => sum + s.emissionsTonnes, 0);
  const averageResponseRate = suppliers.length > 0 ? suppliers.reduce((sum, s) => sum + s.responseRate, 0) / suppliers.length : 0;
  const primaryDataSuppliers = suppliers.filter((s) => s.status === "Primary data").length;
  const highRiskSuppliers = suppliers.filter((s) => s.risk === "High").length;

  const riskMix = [
    { label: "High risk", value: highRiskSuppliers, displayValue: `${highRiskSuppliers}`, detail: "Requires closer governance", color: "var(--critical)" },
    { label: "Medium risk", value: suppliers.filter((s) => s.risk === "Medium").length, displayValue: `${suppliers.filter((s) => s.risk === "Medium").length}`, detail: "Improve data quality", color: "var(--warning)" },
    { label: "Low risk", value: suppliers.filter((s) => s.risk === "Low").length, displayValue: `${suppliers.filter((s) => s.risk === "Low").length}`, detail: "Stable suppliers", color: "var(--success)" }
  ];

  const primaryDataFigure = [
    { label: "Primary data", value: primaryDataSuppliers, displayValue: `${primaryDataSuppliers}`, detail: "Supplier-specific", color: "var(--success)" },
    { label: "Other", value: Math.max(suppliers.length - primaryDataSuppliers, 0), displayValue: `${Math.max(suppliers.length - primaryDataSuppliers, 0)}`, detail: "Estimated / escalated", color: "var(--warning)" }
  ];

  const supplierFigures = suppliers.slice(0, 4).map((s) => ({
    label: s.name.split(" ")[0],
    value: s.emissionsTonnes,
    displayValue: formatTonnes(s.emissionsTonnes),
    detail: s.category,
    color: s.risk === "High" ? "var(--critical)" : s.risk === "Medium" ? "var(--warning)" : "var(--success)"
  }));

  return (
    <AppShell
      activePath="/suppliers"
      title="Supplier Oversight"
      subtitle="Supplier emissions, spend, response rates, and ESG risk."
      tabs={[
        { label: "Overview", active: true },
        { label: "Register", count: suppliers.length },
        { label: "Risk Matrix" },
      ]}
    >
      <DashboardStatGrid
        items={[
          { label: "Supplier emissions", value: formatTonnes(totalSupplierEmissions), detail: "Tracked upstream footprint", tone: "neutral" },
          { label: "Primary data share", value: `${primaryDataSuppliers}/${suppliers.length}`, detail: `${Math.round((primaryDataSuppliers / Math.max(suppliers.length, 1)) * 100)}% primary`, tone: primaryDataSuppliers / suppliers.length >= 0.5 ? "positive" : "warning" },
          { label: "Avg response", value: `${Math.round(averageResponseRate)}%`, detail: "Engagement rate", tone: averageResponseRate >= 80 ? "positive" : "warning" },
          { label: "High risk", value: `${highRiskSuppliers}`, detail: "Needs intervention", tone: highRiskSuppliers > 0 ? "critical" : "positive" }
        ]}
      />

      <section className="page-grid dashboard-row">
        <div className="page-section span-6">
          <DashboardMeterCard title="Risk Mix" subtitle="Supplier risk segmentation." items={riskMix} />
        </div>
        <div className="page-section span-6">
          <DashboardDonutCard title="Primary Data Coverage" subtitle="Supplier data quality." totalLabel={`${Math.round((primaryDataSuppliers / Math.max(suppliers.length, 1)) * 100)}%`} items={primaryDataFigure} />
        </div>
      </section>

      <section className="page-grid dashboard-row">
        <div className="page-section span-12">
          <DashboardColumnChartCard title="Supplier Emissions" subtitle="Largest upstream contributors." items={supplierFigures} />
        </div>
      </section>

      <section className="page-grid">
        <div className="page-section span-8">
          <div className="section-header"><h3>Supplier Register</h3></div>
          <div className="table-card">
            <table className="data-table">
              <thead><tr><th>Supplier</th><th>Category</th><th>Spend</th><th>Emissions</th><th>Risk</th><th>Status</th></tr></thead>
              <tbody>
                {suppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    <td>
                      <Link className="entity-link" href={`/suppliers/${supplier.id}`}>{supplier.name}</Link>
                      <span className="row-subtle">{`${supplier.responseRate}% response`}</span>
                    </td>
                    <td>{supplier.category}</td>
                    <td>{`$${supplier.spendUsd.toLocaleString()}`}</td>
                    <td>{formatTonnes(supplier.emissionsTonnes)}</td>
                    <td><StatusBadge status={supplier.risk} /></td>
                    <td><StatusBadge status={supplier.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="page-section span-4 stack">
          <SupplierCreateForm />
        </div>
      </section>
    </AppShell>
  );
}
