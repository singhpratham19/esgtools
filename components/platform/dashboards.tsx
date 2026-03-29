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
  items
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
  items
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
  items
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
  items
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
  items
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
