import Link from "next/link";
import { ReactNode } from "react";

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
  children,
}: {
  activePath: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
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
        </nav>

        <div className="saas-sidebar-footer">
          <div className="saas-sidebar-card">
            <p>FY 2025</p>
            <ul>
              <li>GHG Protocol</li>
              <li>BRSR &middot; CSRD</li>
              <li>GRI &middot; SASB</li>
            </ul>
          </div>
        </div>
      </aside>

      <section className="saas-main">
        <header className="saas-header">
          <div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          <div className="saas-header-pills">
            <span>Audit-ready</span>
            <span>Excel import</span>
          </div>
        </header>
        {children}
      </section>
    </main>
  );
}
