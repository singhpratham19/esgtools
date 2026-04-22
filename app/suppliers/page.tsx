import Link from "next/link";

import { AppShell } from "@/components/platform/app-shell";
import {
  ActivityTimeline,
  DashboardMeterCard,
  HeatMap,
  KPIHero,
  KPIHeroGrid,
  KPIStrip,
  Sparkline,
  TrendLineChart,
} from "@/components/platform/dashboards";
import { StatusBadge } from "@/components/platform/status-badge";
import { SupplierCreateForm } from "@/components/platform/forms";
import { listSuppliers } from "@/lib/db";
import { formatTonnes } from "@/lib/esg";

export default function SuppliersPage() {
  const suppliers = listSuppliers();
  const totalSupplierEmissions = suppliers.reduce((sum, s) => sum + s.emissionsTonnes, 0);
  const totalSpend = suppliers.reduce((sum, s) => sum + s.spendUsd, 0);
  const averageResponseRate = suppliers.length > 0 ? suppliers.reduce((sum, s) => sum + s.responseRate, 0) / suppliers.length : 0;
  const primaryDataSuppliers = suppliers.filter((s) => s.status === "Primary data").length;
  const highRiskSuppliers = suppliers.filter((s) => s.risk === "High").length;

  const riskMix = [
    { label: "High risk", value: highRiskSuppliers, displayValue: `${highRiskSuppliers}`, detail: "Requires closer governance", color: "var(--critical)" },
    { label: "Medium risk", value: suppliers.filter((s) => s.risk === "Medium").length, displayValue: `${suppliers.filter((s) => s.risk === "Medium").length}`, detail: "Improve data quality", color: "var(--warning)" },
    { label: "Low risk", value: suppliers.filter((s) => s.risk === "Low").length, displayValue: `${suppliers.filter((s) => s.risk === "Low").length}`, detail: "Stable suppliers", color: "var(--success)" },
  ];

  // ── Heat map: categories × risk bands ──
  const categories = Array.from(new Set(suppliers.map((s) => s.category)));
  const riskBands = ["Low", "Medium", "High"];
  const heatRows = categories.map((cat) => ({
    label: cat,
    values: riskBands.map((risk) => suppliers.filter((s) => s.category === cat && s.risk === risk).length),
  }));

  // ── Synthetic supplier emission trend ──
  const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
  const supplierTrend = months.map((_, i) => {
    const base = totalSupplierEmissions / 12;
    return Math.round(base + Math.sin(i * 0.6) * base * 0.12 + i * base * 0.008);
  });
  const supplierTrendFooter = [
    { label: "Current month", value: supplierTrend[supplierTrend.length - 1].toLocaleString() },
    { label: "12-mo avg", value: Math.round(supplierTrend.reduce((s, v) => s + v, 0) / 12).toLocaleString() },
    { label: "vs FY24", value: "−6.2%" },
    { label: "Primary data", value: `${Math.round((primaryDataSuppliers / Math.max(suppliers.length, 1)) * 100)}%` },
  ];

  // ── Supplier activity log ──
  const activities: Array<{ title: string; detail?: string; time: string; actor?: string; tone?: "positive" | "warning" | "critical" | "neutral" }> = [
    { title: "Tier-1 casting vendor onboarded", detail: "Primary data schedule accepted · FY25 baseline posted.", time: "2h ago", actor: "Supplier ops", tone: "positive" },
    { title: "Response rate dropped", detail: "Logistics tier responded 54% vs 82% baseline. Queued for outreach.", time: "Yesterday", actor: "System alert", tone: "warning" },
    { title: "CDP submission uploaded", detail: "Polymer feedstock supplier submitted 2025 CDP questionnaire.", time: "2d ago", actor: "Climate team", tone: "positive" },
    { title: "High-risk reclassification", detail: "Pune-region diesel haulage moved to High risk after route audit.", time: "3d ago", actor: "Risk · Neha R.", tone: "critical" },
  ];

  return (
    <AppShell
      activePath="/suppliers"
      title="Supplier Oversight"
      subtitle="Value-chain emissions, engagement, risk, and primary data governance."
      tabs={[
        { label: "Overview", active: true },
        { label: "Register", count: suppliers.length },
        { label: "Risk Matrix" },
        { label: "Engagement" },
        { label: "Activity" },
      ]}
    >
      <KPIStrip
        items={[
          { label: "Scope 3 (suppliers)", value: formatTonnes(totalSupplierEmissions).split(" ")[0], unit: "tCO₂e" },
          { label: "Suppliers", value: `${suppliers.length}` },
          { label: "Total spend", value: `$${(totalSpend / 1000).toFixed(1)}k` },
          { label: "Primary data", value: `${Math.round((primaryDataSuppliers / Math.max(suppliers.length, 1)) * 100)}%` },
          { label: "Avg response", value: `${Math.round(averageResponseRate)}%` },
          { label: "High risk", value: `${highRiskSuppliers}` },
          { label: "CDP lined up", value: "8" },
        ]}
      />

      <KPIHeroGrid>
        <KPIHero
          label="Upstream Scope 3"
          value={formatTonnes(totalSupplierEmissions).split(" ")[0]}
          unit="tCO₂e"
          delta="−6.2%"
          direction="down"
          tone="positive"
          baseline="vs FY24"
          sparkData={supplierTrend}
          sparkColor="#2563eb"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /></svg>
          }
        />
        <KPIHero
          label="Primary Data Coverage"
          value={`${Math.round((primaryDataSuppliers / Math.max(suppliers.length, 1)) * 100)}`}
          unit="%"
          delta="+14pp"
          direction="up"
          tone="positive"
          baseline={`${primaryDataSuppliers} of ${suppliers.length} suppliers`}
          sparkData={[32, 38, 42, 45, 48, 52, 55, 58, 62, 66, 68, 72]}
          sparkColor="#3b82f6"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          }
        />
        <KPIHero
          label="Engagement Rate"
          value={`${Math.round(averageResponseRate)}`}
          unit="%"
          delta="+8pp"
          direction="up"
          tone="positive"
          baseline="CDP + survey response"
          sparkData={[62, 64, 66, 68, 70, 72, 74, 76, 78, 80, 82, 84]}
          sparkColor="#1d4ed8"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
          }
        />
        <KPIHero
          label="High-risk suppliers"
          value={`${highRiskSuppliers}`}
          unit="flagged"
          delta={highRiskSuppliers > 0 ? `−2` : "flat"}
          direction={highRiskSuppliers > 0 ? "down" : "flat"}
          tone="positive"
          baseline="Requires remediation"
          sparkData={[5, 5, 4, 4, 4, 3, 3, 3, 2, 2, highRiskSuppliers, highRiskSuppliers]}
          sparkColor="#1e40af"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
          }
        />
      </KPIHeroGrid>

      <div className="section-band">
        <h3>Risk &amp; Exposure</h3>
        <span className="section-band-note">Supplier concentration by category × risk band</span>
      </div>

      <section className="page-grid dashboard-row">
        <div className="page-section span-7">
          <HeatMap
            title="Supplier Risk Matrix"
            subtitle="Count of suppliers by category and risk band."
            columns={riskBands}
            rows={heatRows}
          />
        </div>
        <div className="page-section span-5">
          <DashboardMeterCard title="Risk Mix" subtitle="Supplier risk segmentation." items={riskMix} />
        </div>
      </section>

      <section className="page-grid dashboard-row">
        <div className="page-section span-12">
          <TrendLineChart
            title="Upstream Scope 3 · 12-month view"
            subtitle="Supplier emissions monthly · tCO₂e"
            periods={months}
            values={supplierTrend}
            unit="tCO₂e"
            color="#2563eb"
            footer={supplierTrendFooter}
          />
        </div>
      </section>

      <div className="section-band">
        <h3>Supplier Register</h3>
        <span className="section-band-note">{suppliers.length} active vendors · sorted by emissions</span>
        <div className="section-band-actions">
          <button className="toolbar-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 8-8" /><polyline points="17 7 21 7 21 11" /></svg>
            Run CDP flow
          </button>
          <button className="toolbar-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            Export
          </button>
        </div>
      </div>

      <section className="page-grid">
        <div className="page-section span-8">
          <div className="table-card">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Supplier</th>
                  <th>Category</th>
                  <th className="num">Spend</th>
                  <th className="num">Emissions</th>
                  <th className="num">Response</th>
                  <th>Trend</th>
                  <th>Risk</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier, i) => {
                  const seed = (i * 29 + supplier.emissionsTonnes) % 100;
                  const trend = Array.from({ length: 8 }, (_, k) => {
                    const base = supplier.emissionsTonnes / 12;
                    return base + Math.sin((seed + k) * 0.65) * base * 0.2 + (k * base * 0.015);
                  });
                  return (
                    <tr key={supplier.id}>
                      <td>
                        <span className="ledger-code">SUP-{String(i + 1).padStart(4, "0")}</span>
                        <div style={{ marginTop: 4 }}>
                          <Link className="entity-link" href={`/suppliers/${supplier.id}`}>
                            {supplier.name}
                          </Link>
                          <span className="row-subtle">{supplier.responseRate}% response</span>
                        </div>
                      </td>
                      <td>{supplier.category}</td>
                      <td className="num">${supplier.spendUsd.toLocaleString()}</td>
                      <td className="num">{formatTonnes(supplier.emissionsTonnes)}</td>
                      <td className="num">{supplier.responseRate}%</td>
                      <td><Sparkline data={trend} width={72} height={20} color="#3b82f6" /></td>
                      <td><StatusBadge status={supplier.risk} /></td>
                      <td><StatusBadge status={supplier.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="page-section span-4 stack">
          <ActivityTimeline
            title="Supplier Activity"
            subtitle="Engagement, onboarding, and risk events."
            entries={activities}
          />
          <SupplierCreateForm />
        </div>
      </section>
    </AppShell>
  );
}
