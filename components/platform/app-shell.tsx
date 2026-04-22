import Link from "next/link";
import { ReactNode } from "react";
import { climatiqEnabled } from "@/lib/climatiq";

const sections = [
  {
    href: "/program",
    label: "Program",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" />
      </svg>
    ),
  },
  {
    href: "/controls",
    label: "Controls",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      </svg>
    ),
  },
  {
    href: "/disclosures",
    label: "Disclosures",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" />
      </svg>
    ),
  },
  {
    href: "/suppliers",
    label: "Suppliers",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: "/targets",
    label: "Targets",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
      </svg>
    ),
  },
];

export function AppShell({
  activePath,
  title,
  subtitle,
  tabs,
  children,
}: {
  activePath: string;
  title: string;
  subtitle: string;
  tabs?: { label: string; count?: number; active?: boolean }[];
  children: ReactNode;
}) {
  const activeSection = sections.find((s) => activePath.startsWith(s.href));
  const hasClimatiq = climatiqEnabled();

  return (
    <main className="saas-shell">
      <aside className="saas-sidebar">
        <div className="saas-brand">
          <span className="saas-brand-mark">ESG</span>
          <div>
            <p className="saas-kicker">Sustainability Platform</p>
            <h1>Aster Materials</h1>
          </div>
        </div>

        <nav className="saas-nav">
          <span className="saas-nav-section">Workspace</span>
          {sections.map((section) => (
            <Link
              className={
                activePath.startsWith(section.href)
                  ? "saas-link active"
                  : "saas-link"
              }
              href={section.href}
              key={section.href}
            >
              {section.icon}
              {section.label}
            </Link>
          ))}

          <span className="saas-nav-section" style={{ marginTop: 12 }}>Reporting Cycle</span>
          <div className="saas-sidebar-stat">
            <span>Gross emissions YTD</span>
            <strong>12,480 tCO₂e</strong>
            <span className="delta">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="7 17 17 7" /><polyline points="8 7 17 7 17 16" />
              </svg>
              4.2% vs FY24
            </span>
          </div>
          <div className="saas-sidebar-stat">
            <span>Audit readiness</span>
            <strong>87%</strong>
            <span className="delta">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="7 17 17 7" /><polyline points="8 7 17 7 17 16" />
              </svg>
              +12pp QoQ
            </span>
          </div>
        </nav>

        <div className="saas-sidebar-footer">
          <div className="saas-sidebar-card">
            <p>FY 2025 Frameworks</p>
            <ul>
              <li>GHG Protocol</li>
              <li>BRSR &middot; CSRD</li>
              <li>GRI &middot; SASB &middot; TCFD</li>
            </ul>
          </div>
        </div>
      </aside>

      <section className="saas-main">
        <div className="saas-topbar">
          <div className="saas-breadcrumb">
            Aster Materials
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
            <span>{activeSection?.label || "Dashboard"}</span>
          </div>
          <div className="saas-topbar-search">
            <input type="text" placeholder="Search emissions, suppliers, disclosures…" />
            <kbd>⌘K</kbd>
          </div>
          <div className="saas-topbar-actions">
            {hasClimatiq && (
              <span className="climatiq-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                Climatiq Live
              </span>
            )}
            <span className="saas-topbar-badge">
              <span className="dot" />
              Audit-ready
            </span>
            <span className="saas-topbar-pill">FY 2025</span>
            <span className="saas-user-chip">
              <span className="saas-user-avatar">PS</span>
              Pratham S.
            </span>
          </div>
        </div>

        <div className="saas-content">
          <header className="saas-header">
            <div>
              <h2>{title}</h2>
              <p>{subtitle}</p>
            </div>
            <div className="saas-header-actions">
              {hasClimatiq && (
                <span className="climatiq-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                  Emission factors powered by Climatiq
                </span>
              )}
            </div>
          </header>

          {tabs && tabs.length > 0 && (
            <div className="workspace-tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.label}
                  className={`workspace-tab ${tab.active ? "active" : ""}`}
                  type="button"
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="tab-count">{tab.count}</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {children}
        </div>
      </section>
    </main>
  );
}
