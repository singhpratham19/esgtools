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
  const totalSupplierEmissions = suppliers.reduce((sum, supplier) => sum + supplier.emissionsTonnes, 0);
  const averageResponseRate = suppliers.length > 0
    ? suppliers.reduce((sum, supplier) => sum + supplier.responseRate, 0) / suppliers.length
    : 0;
  const primaryDataSuppliers = suppliers.filter((supplier) => supplier.status === "Primary data").length;
  const highRiskSuppliers = suppliers.filter((supplier) => supplier.risk === "High").length;
  const riskMix = [
    {
      label: "High risk",
      value: highRiskSuppliers,
      displayValue: `${highRiskSuppliers}`,
      detail: "Suppliers requiring closer governance",
      color: "var(--critical)"
    },
    {
      label: "Medium risk",
      value: suppliers.filter((supplier) => supplier.risk === "Medium").length,
      displayValue: `${suppliers.filter((supplier) => supplier.risk === "Medium").length}`,
      detail: "Suppliers to improve data quality",
      color: "var(--warning)"
    },
    {
      label: "Low risk",
      value: suppliers.filter((supplier) => supplier.risk === "Low").length,
      displayValue: `${suppliers.filter((supplier) => supplier.risk === "Low").length}`,
      detail: "Stable suppliers with lower exposure",
      color: "var(--success)"
    }
  ];
  const primaryDataFigure = [
    {
      label: "Primary data",
      value: primaryDataSuppliers,
      displayValue: `${primaryDataSuppliers}`,
      detail: "Supplier-specific data",
      color: "var(--success)"
    },
    {
      label: "Other",
      value: Math.max(suppliers.length - primaryDataSuppliers, 0),
      displayValue: `${Math.max(suppliers.length - primaryDataSuppliers, 0)}`,
      detail: "Estimated or escalated",
      color: "var(--warning)"
    }
  ];
  const supplierFigures = suppliers.slice(0, 4).map((supplier) => ({
    label: supplier.name.split(" ")[0],
    value: supplier.emissionsTonnes,
    displayValue: formatTonnes(supplier.emissionsTonnes),
    detail: supplier.category,
    color: supplier.risk === "High" ? "var(--critical)" : supplier.risk === "Medium" ? "var(--warning)" : "var(--success)"
  }));
  return (
    <AppShell
      activePath="/suppliers"
      title="Supplier Oversight"
      subtitle="Track supplier emissions, spend, response rates, and risk across the ESG program."
    >
      <DashboardStatGrid
        items={[
          {
            label: "Supplier emissions",
            value: formatTonnes(totalSupplierEmissions),
            detail: "Tracked upstream footprint",
            tone: "neutral"
          },
          {
            label: "Primary data share",
            value: `${primaryDataSuppliers}/${suppliers.length}`,
            detail: "Suppliers reporting primary data",
            tone: primaryDataSuppliers / suppliers.length >= 0.5 ? "positive" : "warning"
          },
          {
            label: "Average response",
            value: `${Math.round(averageResponseRate)}%`,
            detail: "Supplier engagement response rate",
            tone: averageResponseRate >= 80 ? "positive" : "warning"
          }
        ]}
      />

      <section className="page-grid dashboard-row">
        <div className="page-section span-6">
          <DashboardMeterCard
            title="Risk Mix"
            subtitle="Supplier register segmented by governance risk."
            items={riskMix}
          />
        </div>
        <div className="page-section span-6">
          <DashboardDonutCard
            title="Primary Data Coverage"
            subtitle="Supplier data quality across the register."
            totalLabel={`${Math.round((primaryDataSuppliers / Math.max(suppliers.length, 1)) * 100)}%`}
            items={primaryDataFigure}
          />
        </div>
      </section>

      <section className="page-grid dashboard-row">
        <div className="page-section span-12">
          <DashboardColumnChartCard
            title="Supplier Emissions"
            subtitle="Largest upstream contributors in the current register."
            items={supplierFigures}
          />
        </div>
      </section>

      <section className="page-grid">
        <div className="page-section span-8">
          <div className="section-header">
            <h3>Suppliers</h3>
          </div>
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Supplier</th>
                  <th>Category</th>
                  <th>Spend</th>
                  <th>Emissions</th>
                  <th>Risk</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    <td>
                      <Link className="entity-link" href={`/suppliers/${supplier.id}`}>
                        {supplier.name}
                      </Link>
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
