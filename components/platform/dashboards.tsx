import { ReactNode } from "react";

type DashboardStatItem = {
  label: string;
  value: string;
  detail?: string;
  tone?: "neutral" | "positive" | "warning" | "critical";
};

type DashboardMeterItem = {
  label: string;
  value: number;
  displayValue: string;
  detail?: string;
  color: string;
};

type DashboardRankingItem = {
  label: string;
  value: number;
  displayValue: string;
  detail?: string;
  color?: string;
};

type DashboardProgressItem = {
  label: string;
  progress: number;
  valueLabel: string;
  detail?: string;
  tone?: "neutral" | "positive" | "warning" | "critical";
};

type DashboardFigureItem = {
  label: string;
  value: number;
  displayValue: string;
  detail?: string;
  color: string;
};

function getToneClass(tone: DashboardStatItem["tone"]) {
  switch (tone) {
    case "positive":
      return "positive";
    case "warning":
      return "warning";
    case "critical":
      return "critical";
    default:
      return "neutral";
  }
}

function buildDonutBackground(items: DashboardFigureItem[]) {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  if (total <= 0) {
    return "conic-gradient(var(--border-light) 0deg 360deg)";
  }

  let cursor = 0;
  const segments = items.map((item) => {
    const next = cursor + (item.value / total) * 360;
    const segment = `${item.color} ${cursor}deg ${next}deg`;
    cursor = next;
    return segment;
  });

  return `conic-gradient(${segments.join(", ")})`;
}

/* ══════════════════════════════════════════════════════════
   SPARKLINE (inline mini-chart, SVG)
   ══════════════════════════════════════════════════════════ */

export function Sparkline({
  data,
  width = 84,
  height = 22,
  color = "var(--primary)",
  fill = true,
  strokeWidth = 1.5,
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fill?: boolean;
  strokeWidth?: number;
}) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const points = data.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return [x, y];
  });
  const pathD = points.map(([x, y], i) => (i === 0 ? `M ${x},${y}` : `L ${x},${y}`)).join(" ");
  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;
  return (
    <span className="sparkline" aria-hidden="true">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {fill && (
          <>
            <defs>
              <linearGradient id={`spark-grad-${Math.random().toString(36).slice(2, 8)}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.28" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={areaD} fill={color} fillOpacity="0.12" />
          </>
        )}
        <path d={pathD} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        {points.length > 0 && (
          <circle cx={points[points.length - 1][0]} cy={points[points.length - 1][1]} r="2" fill={color} />
        )}
      </svg>
    </span>
  );
}

/* ══════════════════════════════════════════════════════════
   DELTA BADGE (trend indicator)
   ══════════════════════════════════════════════════════════ */

export function DeltaBadge({
  value,
  direction,
  tone = "neutral",
}: {
  value: string;
  direction: "up" | "down" | "flat";
  tone?: "positive" | "negative" | "neutral";
}) {
  return (
    <span className={`kpi-delta ${direction} ${tone}`}>
      {direction === "up" && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="7 17 17 7" /><polyline points="8 7 17 7 17 16" />
        </svg>
      )}
      {direction === "down" && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="7 7 17 17" /><polyline points="17 8 17 17 8 17" />
        </svg>
      )}
      {direction === "flat" && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      )}
      {value}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════
   KPI HERO CARD (big stat with sparkline + delta)
   ══════════════════════════════════════════════════════════ */

export function KPIHero({
  label,
  value,
  unit,
  delta,
  direction = "up",
  tone = "neutral",
  baseline,
  sparkData,
  sparkColor,
  icon,
}: {
  label: string;
  value: string;
  unit?: string;
  delta?: string;
  direction?: "up" | "down" | "flat";
  tone?: "positive" | "negative" | "neutral";
  baseline?: string;
  sparkData?: number[];
  sparkColor?: string;
  icon?: ReactNode;
}) {
  return (
    <article className="kpi-hero">
      <div className="kpi-hero-header">
        <span className="kpi-hero-label">{label}</span>
        {icon && <span className="kpi-hero-icon">{icon}</span>}
      </div>
      <div className="kpi-hero-value">
        <strong>{value}</strong>
        {unit && <span className="unit">{unit}</span>}
      </div>
      {(delta || baseline) && (
        <div className="kpi-hero-meta">
          {delta && <DeltaBadge value={delta} direction={direction} tone={tone} />}
          {baseline && <span className="kpi-hero-baseline">{baseline}</span>}
        </div>
      )}
      {sparkData && sparkData.length > 1 && (
        <div className="kpi-hero-spark">
          <SparklineFull data={sparkData} color={sparkColor || "var(--primary)"} />
        </div>
      )}
    </article>
  );
}

function SparklineFull({ data, color }: { data: number[]; color: string }) {
  const width = 100;
  const height = 52;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const pts = data.map((v, i) => [i * step, height - ((v - min) / range) * (height - 6) - 3]);
  const lineD = pts.map(([x, y], i) => (i === 0 ? `M ${x},${y}` : `L ${x},${y}`)).join(" ");
  const areaD = `${lineD} L ${width},${height} L 0,${height} Z`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="kpi-spark-grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#kpi-spark-grad)" />
      <path d={lineD} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function KPIHeroGrid({ children }: { children: ReactNode }) {
  return <section className="kpi-hero-grid">{children}</section>;
}

/* ══════════════════════════════════════════════════════════
   KPI STRIP (compact inline metrics bar)
   ══════════════════════════════════════════════════════════ */

export function KPIStrip({
  items,
}: {
  items: { label: string; value: string; unit?: string }[];
}) {
  return (
    <div className="kpi-strip">
      {items.map((item) => (
        <div key={item.label} className="kpi-strip-item">
          <span className="kpi-strip-label">{item.label}</span>
          <div className="kpi-strip-value">
            <strong>{item.value}</strong>
            {item.unit && <span>{item.unit}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   STACKED COLUMN CHART (multi-series emissions over time)
   ══════════════════════════════════════════════════════════ */

type StackedSeries = { label: string; color: string; values: number[] };

export function StackedColumnChart({
  title,
  subtitle,
  periods,
  series,
  unit,
  actions,
}: {
  title: string;
  subtitle?: string;
  periods: string[];
  series: StackedSeries[];
  unit?: string;
  actions?: ReactNode;
}) {
  const columnTotals = periods.map((_, periodIdx) =>
    series.reduce((sum, s) => sum + (s.values[periodIdx] || 0), 0)
  );
  const maxTotal = Math.max(...columnTotals, 1);
  // Build nice rounded ceiling for gridlines
  const ceil = Math.pow(10, Math.floor(Math.log10(maxTotal)));
  const niceMax = Math.ceil(maxTotal / ceil) * ceil;
  const gridValues = [niceMax, niceMax * 0.75, niceMax * 0.5, niceMax * 0.25, 0];

  return (
    <article className="dashboard-panel elevated">
      <div className="dashboard-panel-header">
        <div>
          <span className="dashboard-card-label">{title}</span>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {actions ? <div className="dashboard-panel-actions">{actions}</div> : null}
      </div>
      <div className="stacked-chart">
        <div className="stacked-chart-canvas" style={{ paddingLeft: 34 }}>
          {gridValues.map((gv, i) => (
            <div
              key={i}
              className="stacked-chart-gridline"
              style={{ bottom: `${24 + (gv / niceMax) * (200 - 28)}px` }}
            >
              <span className="stacked-chart-gridlabel">{Math.round(gv).toLocaleString()}</span>
            </div>
          ))}
          {periods.map((period, pIdx) => {
            const total = columnTotals[pIdx];
            const heightPct = (total / niceMax) * 100;
            return (
              <div key={period} className="stacked-chart-col" style={{ height: `${heightPct}%` }}>
                <span className="stacked-chart-total">{Math.round(total).toLocaleString()}</span>
                {series.map((s) => {
                  const segPct = total > 0 ? ((s.values[pIdx] || 0) / total) * 100 : 0;
                  return (
                    <div
                      key={s.label}
                      className="stacked-chart-seg"
                      style={{ height: `${segPct}%`, background: s.color }}
                      title={`${s.label}: ${(s.values[pIdx] || 0).toLocaleString()}${unit ? ` ${unit}` : ""}`}
                    />
                  );
                })}
                <span className="stacked-chart-xlabel">{period}</span>
              </div>
            );
          })}
        </div>
        <div className="stacked-chart-legend">
          {series.map((s) => (
            <div key={s.label} className="stacked-chart-legend-item">
              <span className="stacked-chart-legend-dot" style={{ background: s.color }} />
              {s.label}
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

/* ══════════════════════════════════════════════════════════
   TREND LINE CHART (single series with area fill)
   ══════════════════════════════════════════════════════════ */

export function TrendLineChart({
  title,
  subtitle,
  periods,
  values,
  unit,
  color = "var(--primary)",
  actions,
  footer,
}: {
  title: string;
  subtitle?: string;
  periods: string[];
  values: number[];
  unit?: string;
  color?: string;
  actions?: ReactNode;
  footer?: { label: string; value: string }[];
}) {
  const width = 600;
  const height = 200;
  const padL = 40;
  const padR = 12;
  const padT = 14;
  const padB = 28;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const range = max - min || 1;
  const step = innerW / Math.max(values.length - 1, 1);
  const points = values.map((v, i) => [padL + i * step, padT + innerH - ((v - min) / range) * innerH]);
  const lineD = points.map(([x, y], i) => (i === 0 ? `M ${x},${y}` : `L ${x},${y}`)).join(" ");
  const areaD = `${lineD} L ${padL + innerW},${padT + innerH} L ${padL},${padT + innerH} Z`;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => min + t * range);

  return (
    <article className="dashboard-panel elevated">
      <div className="dashboard-panel-header">
        <div>
          <span className="dashboard-card-label">{title}</span>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {actions ? <div className="dashboard-panel-actions">{actions}</div> : null}
      </div>
      <div className="trend-chart">
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="trend-area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          {yTicks.map((t, i) => {
            const y = padT + innerH - ((t - min) / range) * innerH;
            return (
              <g key={i}>
                <line x1={padL} y1={y} x2={width - padR} y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray={i === 0 ? "" : "2 3"} />
                <text x={padL - 6} y={y + 3} fontSize="9" textAnchor="end" fill="#94a3b8">
                  {Math.round(t).toLocaleString()}
                </text>
              </g>
            );
          })}
          {periods.map((p, i) => {
            const x = padL + i * step;
            return (
              <text key={p} x={x} y={height - 10} fontSize="10" textAnchor="middle" fill="#94a3b8" fontWeight="600">
                {p}
              </text>
            );
          })}
          <path d={areaD} fill="url(#trend-area)" />
          <path d={lineD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          {points.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="2.5" fill="#fff" stroke={color} strokeWidth="1.8" />
          ))}
        </svg>
        {footer && (
          <div className="trend-chart-footer">
            {footer.map((f) => (
              <div key={f.label} className="trend-chart-footer-item">
                <span>{f.label}</span>
                <strong>{f.value}{unit ? ` ${unit}` : ""}</strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

/* ══════════════════════════════════════════════════════════
   FRAMEWORK COMPLIANCE MATRIX
   ══════════════════════════════════════════════════════════ */

export function FrameworkMatrix({
  title,
  subtitle,
  frameworks,
  rows,
  actions,
}: {
  title: string;
  subtitle?: string;
  frameworks: string[];
  rows: { topic: string; detail?: string; coverage: Record<string, number> }[];
  actions?: ReactNode;
}) {
  function cellClass(v: number) {
    if (v >= 1) return "full";
    if (v >= 0.75) return "high";
    if (v >= 0.5) return "mid";
    if (v >= 0.25) return "low";
    if (v > 0) return "low";
    return "none";
  }
  function cellLabel(v: number) {
    if (v >= 1) return "●";
    if (v > 0) return Math.round(v * 100);
    return "—";
  }
  return (
    <article className="dashboard-panel elevated">
      <div className="dashboard-panel-header">
        <div>
          <span className="dashboard-card-label">{title}</span>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {actions ? <div className="dashboard-panel-actions">{actions}</div> : null}
      </div>
      <div className="framework-matrix-wrapper">
        <table className="framework-matrix">
          <thead>
            <tr>
              <th>Topic</th>
              {frameworks.map((f) => (
                <th key={f}>{f}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.topic}>
                <td>
                  {row.topic}
                  {row.detail && <span>{row.detail}</span>}
                </td>
                {frameworks.map((f) => {
                  const v = row.coverage[f] ?? 0;
                  return (
                    <td key={f}>
                      <span className={`framework-cell ${cellClass(v)}`}>{cellLabel(v)}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

/* ══════════════════════════════════════════════════════════
   ACTIVITY TIMELINE (SAP-style audit log)
   ══════════════════════════════════════════════════════════ */

type ActivityEntry = {
  title: string;
  detail?: string;
  time: string;
  actor?: string;
  tone?: "neutral" | "positive" | "warning" | "critical";
};

export function ActivityTimeline({
  title,
  subtitle,
  entries,
  actions,
}: {
  title: string;
  subtitle?: string;
  entries: ActivityEntry[];
  actions?: ReactNode;
}) {
  return (
    <article className="dashboard-panel elevated">
      <div className="dashboard-panel-header">
        <div>
          <span className="dashboard-card-label">{title}</span>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {actions ? <div className="dashboard-panel-actions">{actions}</div> : null}
      </div>
      <div className="activity-timeline">
        {entries.map((e, i) => (
          <div key={i} className="activity-item">
            <span className={`activity-dot ${e.tone || "neutral"}`} />
            <div className="activity-body">
              <div className="activity-header">
                <span className="activity-title">{e.title}</span>
                <span className="activity-time">{e.time}</span>
              </div>
              {e.detail && <span className="activity-detail">{e.detail}</span>}
              {e.actor && <span className="activity-actor">{e.actor}</span>}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

/* ══════════════════════════════════════════════════════════
   HEAT MAP (risk / coverage grid)
   ══════════════════════════════════════════════════════════ */

export function HeatMap({
  title,
  subtitle,
  columns,
  rows,
  actions,
}: {
  title: string;
  subtitle?: string;
  columns: string[];
  rows: { label: string; values: number[] }[];
  actions?: ReactNode;
}) {
  const max = rows.reduce((m, r) => Math.max(m, ...r.values), 1);
  function cellClass(v: number) {
    if (v <= 0) return "h-0";
    const ratio = v / max;
    if (ratio >= 0.8) return "h-5";
    if (ratio >= 0.6) return "h-4";
    if (ratio >= 0.4) return "h-3";
    if (ratio >= 0.2) return "h-2";
    return "h-1";
  }
  return (
    <article className="dashboard-panel elevated">
      <div className="dashboard-panel-header">
        <div>
          <span className="dashboard-card-label">{title}</span>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {actions ? <div className="dashboard-panel-actions">{actions}</div> : null}
      </div>
      <div className="heatmap">
        <div className="heatmap-grid">
          <div
            className="heatmap-row header"
            style={{ gridTemplateColumns: `140px repeat(${columns.length}, minmax(0, 1fr))` }}
          >
            <span />
            {columns.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
          {rows.map((row) => (
            <div
              key={row.label}
              className="heatmap-row"
              style={{ gridTemplateColumns: `140px repeat(${columns.length}, minmax(0, 1fr))` }}
            >
              <span className="heatmap-label">{row.label}</span>
              {row.values.map((v, i) => (
                <span key={i} className={`heatmap-cell ${cellClass(v)}`}>
                  {v > 0 ? v : ""}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

/* ══════════════════════════════════════════════════════════
   DATA QUALITY PIPELINE (arrow-chevron flow)
   ══════════════════════════════════════════════════════════ */

export function QualityPipeline({
  title,
  subtitle,
  stages,
  actions,
}: {
  title: string;
  subtitle?: string;
  stages: { label: string; value: string; active?: boolean }[];
  actions?: ReactNode;
}) {
  return (
    <article className="dashboard-panel">
      <div className="dashboard-panel-header">
        <div>
          <span className="dashboard-card-label">{title}</span>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {actions ? <div className="dashboard-panel-actions">{actions}</div> : null}
      </div>
      <div className="quality-pipeline">
        {stages.map((s) => (
          <div key={s.label} className={`quality-pipeline-step ${s.active ? "active" : ""}`}>
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

/* ══════════════════════════════════════════════════════════
   LEGACY COMPONENTS (retained for compatibility)
   ══════════════════════════════════════════════════════════ */

export function DashboardStatGrid({ items }: { items: DashboardStatItem[] }) {
  return (
    <section className="dashboard-stat-grid">
      {items.map((item) => (
        <article className={`dashboard-stat-card ${getToneClass(item.tone)}`} key={item.label}>
          <span className="dashboard-card-label">{item.label}</span>
          <strong>{item.value}</strong>
          {item.detail ? <p>{item.detail}</p> : null}
        </article>
      ))}
    </section>
  );
}

export function DashboardMeterCard({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle?: string;
  items: DashboardMeterItem[];
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <article className="dashboard-panel">
      <div className="dashboard-panel-header">
        <div>
          <span className="dashboard-card-label">{title}</span>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        <strong>{total.toLocaleString()}</strong>
      </div>
      <div className="dashboard-meter-track" aria-label={title}>
        {items.map((item, index) => {
          const width = total > 0 ? (item.value / total) * 100 : 0;
          return (
            <span
              key={`${item.label}-${index}`}
              className="dashboard-meter-segment"
              style={{ width: `${width}%`, background: item.color }}
            />
          );
        })}
      </div>
      <div className="dashboard-meter-legend">
        {items.map((item) => {
          const share = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div className="dashboard-meter-row" key={item.label}>
              <div>
                <strong>{item.label}</strong>
                <span>{item.detail || `${share}% of tracked total`}</span>
              </div>
              <div className="dashboard-meter-meta">
                <span className="dashboard-meter-dot" style={{ background: item.color }} />
                <strong>{item.displayValue}</strong>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}

export function DashboardRankingCard({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle?: string;
  items: DashboardRankingItem[];
}) {
  const max = items.reduce((highest, item) => Math.max(highest, item.value), 0);

  return (
    <article className="dashboard-panel">
      <div className="dashboard-panel-header">
        <div>
          <span className="dashboard-card-label">{title}</span>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      </div>
      <div className="dashboard-ranking-list">
        {items.map((item) => {
          const width = max > 0 ? (item.value / max) * 100 : 0;
          return (
            <div className="dashboard-ranking-row" key={item.label}>
              <div className="dashboard-ranking-copy">
                <strong>{item.label}</strong>
                {item.detail ? <span>{item.detail}</span> : null}
              </div>
              <div className="dashboard-ranking-bar">
                <span style={{ width: `${width}%`, background: item.color || "var(--accent)" }} />
              </div>
              <strong className="dashboard-ranking-value">{item.displayValue}</strong>
            </div>
          );
        })}
      </div>
    </article>
  );
}

export function DashboardProgressCard({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle?: string;
  items: DashboardProgressItem[];
}) {
  return (
    <article className="dashboard-panel">
      <div className="dashboard-panel-header">
        <div>
          <span className="dashboard-card-label">{title}</span>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      </div>
      <div className="dashboard-progress-list">
        {items.map((item) => (
          <div className="dashboard-progress-row" key={item.label}>
            <div className="dashboard-progress-copy">
              <div>
                <strong>{item.label}</strong>
                {item.detail ? <span>{item.detail}</span> : null}
              </div>
              <strong>{item.valueLabel}</strong>
            </div>
            <div className="dashboard-progress-track">
              <span
                className={`dashboard-progress-fill ${getToneClass(item.tone)}`}
                style={{ width: `${Math.max(0, Math.min(item.progress, 100))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

export function DashboardDonutCard({
  title,
  subtitle,
  totalLabel,
  items,
}: {
  title: string;
  subtitle?: string;
  totalLabel: string;
  items: DashboardFigureItem[];
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <article className="dashboard-panel">
      <div className="dashboard-panel-header">
        <div>
          <span className="dashboard-card-label">{title}</span>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      </div>
      <div className="dashboard-donut-layout">
        <div
          aria-label={title}
          className="dashboard-donut-chart"
          style={{ background: buildDonutBackground(items) }}
        >
          <div className="dashboard-donut-center">
            <strong>{totalLabel}</strong>
            <span>{total.toLocaleString()} total</span>
          </div>
        </div>
        <div className="dashboard-donut-legend">
          {items.map((item) => (
            <div className="dashboard-meter-row" key={item.label}>
              <div>
                <strong>{item.label}</strong>
                <span>{item.detail || "Tracked segment"}</span>
              </div>
              <div className="dashboard-meter-meta">
                <span className="dashboard-meter-dot" style={{ background: item.color }} />
                <strong>{item.displayValue}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

export function DashboardColumnChartCard({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle?: string;
  items: DashboardFigureItem[];
}) {
  const max = items.reduce((highest, item) => Math.max(highest, item.value), 0);

  return (
    <article className="dashboard-panel">
      <div className="dashboard-panel-header">
        <div>
          <span className="dashboard-card-label">{title}</span>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      </div>
      <div className="dashboard-columns">
        {items.map((item) => {
          const height = max > 0 ? Math.max((item.value / max) * 100, 10) : 10;

          return (
            <div className="dashboard-column-item" key={item.label}>
              <span className="dashboard-column-value">{item.displayValue}</span>
              <div className="dashboard-column-track">
                <span
                  className="dashboard-column-bar"
                  style={{ height: `${height}%`, background: item.color }}
                />
              </div>
              <strong>{item.label}</strong>
              {item.detail ? <span>{item.detail}</span> : null}
            </div>
          );
        })}
      </div>
    </article>
  );
}
