"use client";

import { ChangeEvent, useState } from "react";

import {
  companyProfile,
  controlTasks,
  defaultScenario,
  disclosureThemes,
  emissionActivities,
  evidenceRecords,
  facilities,
  frameworkItems,
  governanceRecords,
  materialTopics,
  metricLibrary,
  peopleMetrics,
  reductionLevers,
  resourceMetrics,
  supplierRecords,
  targetPrograms,
  validationRules
} from "@/data/esg-data";
import {
  averageWasteDiversion,
  emissionsByScope,
  filterByFacility,
  formatNumber,
  formatPercent,
  formatTonnes,
  groupedQualityCount,
  hotspotActivities,
  qualityScore,
  scenarioProjection,
  statusScore,
  totalEmissions,
  totalWater
} from "@/lib/esg";
import { EmissionActivity, QualityState, ScenarioSettings, Scope } from "@/lib/types";

type Workspace = "capture" | "review" | "reports" | "plan";

const workspaces: Array<{
  id: Workspace;
  label: string;
  caption: string;
}> = [
  {
    id: "capture",
    label: "Program",
    caption: "Metric catalog and data collection"
  },
  {
    id: "review",
    label: "Controls",
    caption: "Evidence, tasks, and quality controls"
  },
  {
    id: "reports",
    label: "Disclosures",
    caption: "Framework mapping and report binder"
  },
  {
    id: "plan",
    label: "Targets",
    caption: "Action plans and target management"
  }
];

const qualityOptions: QualityState[] = [
  "Verified",
  "Needs review",
  "Missing proof"
];

const processStages = [
  {
    title: "Scoping",
    value: "91% complete",
    status: "On track"
  },
  {
    title: "Collection",
    value: "6 items open",
    status: "Attention"
  },
  {
    title: "Review",
    value: "BRSR + ESRS",
    status: "In progress"
  },
  {
    title: "Publish",
    value: "5 funded levers",
    status: "Ready"
  }
];

const suiteModules = [
  "Framework explorer",
  "Program manager",
  "Evidence requests",
  "Control testing",
  "Disclosure binder",
  "Target tracker"
];

const scopeColors: Record<Scope, string> = {
  "Scope 1": "var(--scope-1)",
  "Scope 2": "var(--scope-2)",
  "Scope 3": "var(--scope-3)"
};

export function ESGPlatform() {
  const [workspace, setWorkspace] = useState<Workspace>("capture");
  const [selectedFacility, setSelectedFacility] = useState("all");
  const [selectedActivityId, setSelectedActivityId] = useState(emissionActivities[0]?.id ?? "");
  const [activities, setActivities] = useState(emissionActivities);
  const [evidence, setEvidence] = useState(evidenceRecords);
  const [scenario, setScenario] = useState<ScenarioSettings>(defaultScenario);

  const visibleActivities = filterByFacility(activities, selectedFacility);
  const visibleEvidence = filterByFacility(evidence, selectedFacility);
  const visibleResources = filterByFacility(resourceMetrics, selectedFacility);

  const activeActivity =
    visibleActivities.find((activity) => activity.id === selectedActivityId) ??
    visibleActivities[0] ??
    activities[0];

  const totalCarbon = totalEmissions(visibleActivities);
  const scopeMix = emissionsByScope(visibleActivities);
  const totalWaterUse = totalWater(visibleResources);
  const diversionRate = averageWasteDiversion(visibleResources);
  const auditScore = qualityScore(visibleEvidence);
  const reportScore = statusScore(frameworkItems);
  const evidenceMix = groupedQualityCount(visibleEvidence);
  const hotspotList = hotspotActivities(visibleActivities, 4);
  const scenarioView = scenarioProjection(visibleActivities, scenario);
  const metricCoverage = metricLibrary.filter((item) => item.status === "Collected").length;
  const disclosureRequirementCount = disclosureThemes.reduce(
    (sum, theme) => sum + theme.requirements,
    0
  );
  const highRiskSuppliers = supplierRecords.filter((supplier) => supplier.risk === "High").length;

  const reviewQueue = visibleActivities
    .filter((activity) => activity.quality !== "Verified" || Math.abs(activity.variancePct) >= 10)
    .sort((left, right) => right.emissionsTonnes - left.emissionsTonnes);

  const missingEvidence = visibleEvidence.filter(
    (record) => record.status === "Missing proof"
  );

  const metrics = [
    {
      label: "Reported emissions",
      value: formatTonnes(totalCarbon),
      note: `${formatPercent((scopeMix["Scope 3"] / Math.max(totalCarbon, 1)) * 100)} mapped to value-chain disclosures`
    },
    {
      label: "Metric coverage",
      value: `${metricCoverage}/${metricLibrary.length}`,
      note: "Environmental, social, and governance metrics in controlled scope"
    },
    {
      label: "Disclosure linkage",
      value: `${reportScore}%`,
      note: `${disclosureRequirementCount} mapped requirements across major frameworks`
    },
    {
      label: "Open actions",
      value: `${controlTasks.filter((task) => task.status !== "Done").length}`,
      note: `${highRiskSuppliers} high-risk suppliers and ${missingEvidence.length} missing proofs`
    }
  ];

  function updateActivityQuantity(id: string, rawValue: string) {
    const quantity = Number(rawValue);

    if (Number.isNaN(quantity) || quantity < 0) {
      return;
    }

    setActivities((current) =>
      current.map((activity) => {
        if (activity.id !== id) {
          return activity;
        }

        const impliedFactor =
          activity.quantity === 0 ? 0 : activity.emissionsTonnes / activity.quantity;

        return {
          ...activity,
          quantity,
          emissionsTonnes: round(quantity * impliedFactor)
        };
      })
    );
  }

  function updateActivityQuality(id: string, quality: QualityState) {
    setActivities((current) =>
      current.map((activity) =>
        activity.id === id
          ? {
              ...activity,
              quality
            }
          : activity
      )
    );

    const proofId = activities.find((activity) => activity.id === id)?.proofId;

    if (!proofId) {
      return;
    }

    setEvidence((current) =>
      current.map((record) =>
        record.proofId === proofId
          ? {
              ...record,
              status: quality
            }
          : record
      )
    );
  }

  function updateEvidenceStatus(proofId: string, quality: QualityState) {
    setEvidence((current) =>
      current.map((record) =>
        record.proofId === proofId
          ? {
              ...record,
              status: quality
            }
          : record
      )
    );

    setActivities((current) =>
      current.map((activity) =>
        activity.proofId === proofId
          ? {
              ...activity,
              quality
            }
          : activity
      )
    );
  }

  return (
    <main className="tool-shell">
      <aside className="tool-sidebar">
        <div className="brand-block">
          <span className="brand-mark">ESG</span>
          <div>
            <p className="sidebar-kicker">Environmental intelligence suite</p>
            <h1>Impact Control Tower</h1>
          </div>
        </div>

        <div className="sidebar-panel">
          <p className="sidebar-label">Workspace</p>
          <nav className="workspace-nav">
            {workspaces.map((item) => (
              <button
                className={workspace === item.id ? "workspace-link active" : "workspace-link"}
                key={item.id}
                onClick={() => setWorkspace(item.id)}
                type="button"
              >
                <strong>{item.label}</strong>
                <span>{item.caption}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-panel">
          <p className="sidebar-label">Perimeter</p>
          <div className="company-card">
            <strong>{companyProfile.name}</strong>
            <span>{companyProfile.reportingYear}</span>
            <p>{companyProfile.sector}</p>
          </div>
          <div className="facility-list">
            <button
              className={selectedFacility === "all" ? "facility-chip active" : "facility-chip"}
              onClick={() => setSelectedFacility("all")}
              type="button"
            >
              Enterprise view
            </button>
            {facilities.map((facility) => (
              <button
                className={
                  selectedFacility === facility.id ? "facility-chip active" : "facility-chip"
                }
                key={facility.id}
                onClick={() => setSelectedFacility(facility.id)}
                type="button"
              >
                {facility.name}
              </button>
            ))}
          </div>
        </div>

        <div className="sidebar-panel">
          <p className="sidebar-label">Platform modules</p>
          <ul className="sidebar-list">
            {suiteModules.map((module) => (
              <li key={module}>{module}</li>
            ))}
          </ul>
        </div>
      </aside>

      <section className="tool-main">
        <div className="system-bar">
          <div className="system-context">
            <span>Sustainability Cloud</span>
            <span>/</span>
            <span>ESG Program</span>
            <span>/</span>
            <strong>{workspaceTitle(workspace)}</strong>
          </div>
          <div className="system-status">
            <span className="system-pill">Live model</span>
            <span className="system-pill">Audit connected</span>
            <span className="system-pill">{companyProfile.reportingYear}</span>
          </div>
        </div>

        <header className="topbar">
          <div>
            <p className="topbar-label">Current view</p>
            <h2>{workspaceTitle(workspace)}</h2>
            <p className="topbar-copy">
              Controlled ESG program workspace linking metric collection, evidence,
              framework mapping, and disclosure preparation in one audit-ready flow.
            </p>
          </div>
          <div className="topbar-actions">
            <div className="topbar-pill">
              <span>Entity</span>
              <strong>{selectedFacility === "all" ? "Enterprise" : facilityName(selectedFacility)}</strong>
            </div>
            <div className="topbar-pill">
              <span>Coverage</span>
              <strong>{visibleActivities.length} active records</strong>
            </div>
            <div className="topbar-pill primary">
              <span>Priority queue</span>
              <strong>{reviewQueue.length} exceptions</strong>
            </div>
          </div>
        </header>

        <section className="command-bar">
          <div className="command-actions">
            <button className="command-button primary" type="button">
              Generate disclosure package
            </button>
            <button className="command-button" type="button">
              Launch control testing
            </button>
            <button className="command-button" type="button">
              Open evidence request
            </button>
            <button className="command-button" type="button">
              Export assurance file
            </button>
          </div>
          <div className="command-filters">
            <span className="filter-pill">Reporting year: {companyProfile.reportingYear}</span>
            <span className="filter-pill">
              Entity: {selectedFacility === "all" ? "Enterprise" : facilityName(selectedFacility)}
            </span>
            <span className="filter-pill">Framework set: BRSR / ESRS / GRI</span>
            <span className="filter-pill">Quality threshold: 10% variance</span>
          </div>
        </section>

        <section className="workspace-strip">
          {workspaces.map((item) => (
            <button
              className={workspace === item.id ? "workspace-tab active" : "workspace-tab"}
              key={item.id}
              onClick={() => setWorkspace(item.id)}
              type="button"
            >
              <strong>{item.label}</strong>
              <span>{item.caption}</span>
            </button>
          ))}
        </section>

        <section className="object-grid">
          <article className="object-panel">
            <div className="object-header">
              <div>
                <p className="panel-kicker">Reporting program</p>
                <h3>{companyProfile.name}</h3>
              </div>
              <span className="object-badge">Audit-ready environment</span>
            </div>
            <div className="object-metadata">
              <div>
                <span>Program owner</span>
                <strong>Sustainability reporting office</strong>
              </div>
              <div>
                <span>Business context</span>
                <strong>{companyProfile.sector}</strong>
              </div>
              <div>
                <span>Reporting perimeter</span>
                <strong>{selectedFacility === "all" ? "Enterprise consolidated" : facilityName(selectedFacility)}</strong>
              </div>
              <div>
                <span>Disclosure stack</span>
                <strong>{companyProfile.frameworks.slice(0, 3).join(" / ")}</strong>
              </div>
            </div>
          </article>

          <article className="process-panel">
            <p className="panel-kicker">Business process status</p>
            <div className="process-grid">
              {processStages.map((stage) => (
                <div className="process-card" key={stage.title}>
                  <span>{stage.title}</span>
                  <strong>{stage.value}</strong>
                  <small>{stage.status}</small>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="metric-strip">
          {metrics.map((metric) => (
            <article className="metric-card" key={metric.label}>
              <span className="metric-label">{metric.label}</span>
              <strong className="metric-value">{metric.value}</strong>
              <p>{metric.note}</p>
            </article>
          ))}
        </section>

        {workspace === "capture" ? (
          <CaptureWorkspace
            activities={visibleActivities}
            activeActivity={activeActivity}
            onPickActivity={setSelectedActivityId}
            onQuantityChange={updateActivityQuantity}
            onQualityChange={updateActivityQuality}
            scopeMix={scopeMix}
          />
        ) : null}

        {workspace === "review" ? (
          <ReviewWorkspace
            evidence={visibleEvidence}
            missingEvidence={missingEvidence}
            reviewQueue={reviewQueue}
            onEvidenceStatusChange={updateEvidenceStatus}
          />
        ) : null}

        {workspace === "reports" ? (
          <ReportsWorkspace
            frameworkScore={reportScore}
            reportScore={auditScore}
            scopeMix={scopeMix}
          />
        ) : null}

        {workspace === "plan" ? (
          <PlanWorkspace
            scenario={scenario}
            scenarioView={scenarioView}
            onScenarioChange={setScenario}
          />
        ) : null}

        <section className="bottom-grid">
          <article className="panel">
            <PanelHeader
              title="Disclosure drivers"
              detail="Largest quantitative contributors linked to the current reporting perimeter"
            />
            <div className="hotspot-stack">
              {hotspotList.map((hotspot) => (
                <div className="hotspot-row" key={hotspot.id}>
                  <div>
                    <strong>{hotspot.label}</strong>
                    <span>{`${hotspot.scope} | ${hotspot.category}`}</span>
                  </div>
                  <div className="hotspot-meta">
                    <strong>{formatTonnes(hotspot.emissionsTonnes)}</strong>
                    <span>{hotspot.proofId}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <PanelHeader
              title="Framework footprint split"
              detail="All outputs are linked back to the same source program metrics"
            />
            <div className="scope-stack">
              {Object.entries(scopeMix).map(([scope, value]) => (
                <div className="scope-row" key={scope}>
                  <div className="scope-row-copy">
                    <span>{scope}</span>
                    <strong>{formatTonnes(value)}</strong>
                  </div>
                  <div className="scope-track">
                    <span
                      className="scope-fill"
                      style={{
                        width: `${(value / Math.max(totalCarbon, 1)) * 100}%`,
                        background: scopeColors[scope as Scope]
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <PanelHeader
              title="Control summary"
              detail="Assurance, validation, and documentation coverage"
            />
            <div className="summary-grid">
              <div className="summary-tile">
                <span>Verified evidence</span>
                <strong>{evidenceMix.Verified}</strong>
              </div>
              <div className="summary-tile">
                <span>Needs review</span>
                <strong>{evidenceMix["Needs review"]}</strong>
              </div>
              <div className="summary-tile">
                <span>Missing proof</span>
                <strong>{evidenceMix["Missing proof"]}</strong>
              </div>
              <div className="summary-tile">
                <span>Validation rules</span>
                <strong>{validationRules.length}</strong>
              </div>
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}

function CaptureWorkspace({
  activities,
  activeActivity,
  onPickActivity,
  onQuantityChange,
  onQualityChange,
  scopeMix
}: {
  activities: EmissionActivity[];
  activeActivity: EmissionActivity | undefined;
  onPickActivity: (id: string) => void;
  onQuantityChange: (id: string, value: string) => void;
  onQualityChange: (id: string, quality: QualityState) => void;
  scopeMix: Record<Scope, number>;
}) {
  const orderedActivities = [...activities].sort((left, right) =>
    left.scope.localeCompare(right.scope)
  );

  return (
    <>
      <section className="workspace-grid">
        <article className="panel panel-main">
          <PanelHeader
            title="Program metrics register"
            detail="The central metric register used to collect, update, and validate ESG values before they flow into disclosures."
          />
          <div className="ledger-wrap">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Activity</th>
                  <th>Scope</th>
                  <th>Quantity</th>
                  <th>Emissions</th>
                  <th>Variance</th>
                  <th>Quality</th>
                  <th>Proof</th>
                </tr>
              </thead>
              <tbody>
                {orderedActivities.map((activity) => (
                  <tr
                    className={activeActivity?.id === activity.id ? "is-selected" : undefined}
                    key={activity.id}
                    onClick={() => onPickActivity(activity.id)}
                  >
                    <td>
                      <strong className="row-title">{activity.label}</strong>
                      <span className="row-subtle">{activity.category}</span>
                    </td>
                    <td>
                      <span className="table-tag">{activity.scope}</span>
                    </td>
                    <td>
                      <label className="inline-input">
                        <input
                          min="0"
                          onChange={(event) => onQuantityChange(activity.id, event.target.value)}
                          step="0.1"
                          type="number"
                          value={activity.quantity}
                        />
                        <span>{activity.unit}</span>
                      </label>
                    </td>
                    <td>{formatTonnes(activity.emissionsTonnes)}</td>
                    <td>
                      <span className={varianceTone(activity.variancePct)}>
                        {formatPercent(activity.variancePct, 1)}
                      </span>
                    </td>
                    <td>
                      <select
                        onChange={(event) =>
                          onQualityChange(activity.id, event.target.value as QualityState)
                        }
                        value={activity.quality}
                      >
                        {qualityOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <span className="row-code">{activity.proofId}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <aside className="panel panel-side">
          <PanelHeader
            title="Metric record"
            detail="Context, methodology, and audit references for the selected program metric"
          />
          {activeActivity ? (
            <div className="detail-stack">
              <div className="detail-block">
                <span className="detail-label">Activity</span>
                <strong>{activeActivity.label}</strong>
                <p>{`${activeActivity.scope} | ${activeActivity.category}`}</p>
              </div>
              <div className="detail-block">
                <span className="detail-label">Calculation</span>
                <strong>{formatTonnes(activeActivity.emissionsTonnes)}</strong>
                <p>{`${formatNumber(activeActivity.quantity, activeActivity.quantity < 100 ? 1 : 0)} ${activeActivity.unit}`}</p>
                <small>{activeActivity.factorLabel}</small>
              </div>
              <div className="detail-block">
                <span className="detail-label">Method</span>
                <strong>{activeActivity.methodology}</strong>
                <p>{`Source: ${activeActivity.source}`}</p>
                <small>{`Proof: ${activeActivity.proofId}`}</small>
              </div>
              <div className="mini-scope-grid">
                {Object.entries(scopeMix).map(([scope, value]) => (
                  <div className="mini-scope-card" key={scope}>
                    <span>{scope}</span>
                    <strong>{formatTonnes(value)}</strong>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="empty-copy">No activity is available in the selected perimeter.</p>
          )}
        </aside>
      </section>

      <section className="workspace-extended">
        <article className="panel">
          <PanelHeader
            title="Metric library coverage"
            detail="A broader ESG metric catalog modeled after enterprise sustainability platforms."
          />
          <div className="evidence-wrap">
            <table className="ledger-table auxiliary-table">
              <thead>
                <tr>
                  <th>Pillar</th>
                  <th>Domain</th>
                  <th>Metric</th>
                  <th>Frameworks</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {metricLibrary.map((item) => (
                  <tr key={item.id}>
                    <td>{item.pillar}</td>
                    <td>{item.domain}</td>
                    <td>
                      <strong className="row-title">{item.name}</strong>
                      <span className="row-subtle">{`${item.unit} | ${item.owner}`}</span>
                    </td>
                    <td>{item.frameworks.join(", ")}</td>
                    <td>
                      <span className={libraryTone(item.status)}>{item.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel">
          <PanelHeader
            title="Material topics"
            detail="Materiality, stakeholder interest, and readiness used to decide what gets elevated into the reporting program."
          />
          <div className="topic-stack">
            {materialTopics.map((topic) => (
              <div className="topic-row" key={topic.id}>
                <div>
                  <strong>{topic.topic}</strong>
                  <span>{`${topic.pillar} | impact ${topic.impactLevel}`}</span>
                </div>
                <div className="topic-meta">
                  <span>{`Stakeholder interest: ${topic.stakeholderInterest}`}</span>
                  <strong className={libraryTone(topic.status === "Assessed" ? "Collected" : topic.status === "Refreshing" ? "Partial" : "Gap")}>
                    {topic.status}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}

function ReviewWorkspace({
  evidence,
  missingEvidence,
  reviewQueue,
  onEvidenceStatusChange
}: {
  evidence: typeof evidenceRecords;
  missingEvidence: typeof evidenceRecords;
  reviewQueue: EmissionActivity[];
  onEvidenceStatusChange: (proofId: string, quality: QualityState) => void;
}) {
  return (
    <>
      <section className="workspace-grid">
        <article className="panel panel-main">
        <PanelHeader
          title="Control center"
          detail="Evidence assignments and remediation activity for disclosure-quality data"
        />
        <div className="evidence-wrap">
          <table className="ledger-table evidence-table">
            <thead>
              <tr>
                <th>Evidence item</th>
                <th>Metric</th>
                <th>Owner</th>
                <th>Reviewer</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {evidence.map((record) => (
                <tr key={record.proofId}>
                  <td>
                    <strong className="row-title">{record.documentName}</strong>
                    <span className="row-subtle">{`${record.proofId} | ${record.documentType}`}</span>
                  </td>
                  <td>{record.metric}</td>
                  <td>
                    <strong className="row-title">{record.owner}</strong>
                    <span className="row-subtle">{record.uploadedAt}</span>
                  </td>
                  <td>{record.reviewer}</td>
                  <td>
                    <select
                      onChange={(event) =>
                        onEvidenceStatusChange(record.proofId, event.target.value as QualityState)
                      }
                      value={record.status}
                    >
                      {qualityOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </article>

        <aside className="panel panel-side">
        <PanelHeader
          title="Task queue"
          detail="Focus control owners on items that could materially affect disclosures or assurance readiness."
        />
        <div className="detail-stack">
          <div className="queue-box critical">
            <span>Missing proof</span>
            <strong>{missingEvidence.length}</strong>
          </div>
          <div className="queue-box watch">
            <span>Needs review</span>
            <strong>{reviewQueue.length}</strong>
          </div>
          <div className="detail-block">
            <span className="detail-label">Top exceptions</span>
            {reviewQueue.slice(0, 5).map((item) => (
              <div className="queue-row" key={item.id}>
                <div>
                  <strong>{item.label}</strong>
                  <span className="row-code">{item.proofId}</span>
                </div>
                <span>{formatTonnes(item.emissionsTonnes)}</span>
              </div>
            ))}
          </div>
          <div className="detail-block">
            <span className="detail-label">Validation controls</span>
            {validationRules.map((rule) => (
              <div className="validation-row" key={rule.id}>
                <div>
                  <strong>{rule.metric}</strong>
                  <span>{`${rule.currentValue} current`}</span>
                </div>
                <span className={stateTone(rule.status)}>{formatPercent(rule.variancePct, 1)}</span>
              </div>
            ))}
          </div>
        </div>
        </aside>
      </section>

      <section className="workspace-extended">
        <article className="panel">
          <PanelHeader
            title="Assigned control tasks"
            detail="Owners, due dates, and framework links for remediation and disclosure readiness work."
          />
          <div className="evidence-wrap">
            <table className="ledger-table auxiliary-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Assignee</th>
                  <th>Due date</th>
                  <th>Framework</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {controlTasks.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <strong className="row-title">{task.title}</strong>
                      <span className="row-subtle">{task.priority}</span>
                    </td>
                    <td>{task.assignee}</td>
                    <td>{task.dueDate}</td>
                    <td>{task.framework}</td>
                    <td>
                      <span className={taskTone(task.status)}>{task.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel">
          <PanelHeader
            title="Supplier oversight"
            detail="Supplier response coverage, emissions exposure, and escalation status for upstream reporting."
          />
          <div className="evidence-wrap">
            <table className="ledger-table auxiliary-table">
              <thead>
                <tr>
                  <th>Supplier</th>
                  <th>Category</th>
                  <th>Spend</th>
                  <th>Emissions</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {supplierRecords.map((supplier) => (
                  <tr key={supplier.id}>
                    <td>
                      <strong className="row-title">{supplier.name}</strong>
                      <span className="row-subtle">{`${supplier.responseRate}% response rate`}</span>
                    </td>
                    <td>{supplier.category}</td>
                    <td>{`$${formatNumber(supplier.spendUsd)}`}</td>
                    <td>{formatTonnes(supplier.emissionsTonnes)}</td>
                    <td>
                      <span className={supplierTone(supplier.risk)}>{`${supplier.status} | ${supplier.risk} risk`}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </>
  );
}

function ReportsWorkspace({
  frameworkScore,
  reportScore,
  scopeMix
}: {
  frameworkScore: number;
  reportScore: number;
  scopeMix: Record<Scope, number>;
}) {
  return (
    <>
      <section className="workspace-grid">
        <article className="panel panel-main">
        <PanelHeader
          title="Disclosure binder"
          detail="Managed reporting requirements linked to source metrics, evidence, and publication status."
        />
        <div className="evidence-wrap">
          <table className="ledger-table disclosure-table">
            <thead>
              <tr>
                <th>Framework</th>
                <th>Requirement</th>
                <th>Value</th>
                <th>Source</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {frameworkItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong className="row-title">{item.framework}</strong>
                    <span className="row-subtle">{item.code}</span>
                  </td>
                  <td>{item.title}</td>
                  <td>{item.value}</td>
                  <td>{item.source}</td>
                  <td>
                    <span className={frameworkTone(item.status)}>{item.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </article>

        <aside className="panel panel-side">
        <PanelHeader
          title="Filing package"
          detail="Readiness depends on framework coverage, evidence quality, and reviewer sign-off."
        />
        <div className="detail-stack">
          <div className="score-card">
            <span>Framework coverage</span>
            <strong>{frameworkScore}%</strong>
          </div>
          <div className="score-card">
            <span>Audit quality</span>
            <strong>{reportScore}%</strong>
          </div>
          <div className="detail-block">
            <span className="detail-label">Disclosure summary</span>
            {Object.entries(scopeMix).map(([scope, value]) => (
              <div className="summary-row" key={scope}>
                <span>{scope}</span>
                <strong>{formatTonnes(value)}</strong>
              </div>
            ))}
          </div>
          <div className="detail-block">
            <span className="detail-label">Export pack status</span>
            <ul className="compact-list">
              <li>BRSR environmental indicators mapped</li>
              <li>CSRD climate narrative partially ready</li>
              <li>GRI environmental metrics ready for pack generation</li>
              <li>Supplier primary-data refresh still required</li>
            </ul>
          </div>
        </div>
        </aside>
      </section>

      <section className="workspace-extended">
        <article className="panel">
          <PanelHeader
            title="Disclosure theme coverage"
            detail="Coverage by theme across environmental, social, and governance topic areas."
          />
          <div className="theme-grid">
            {disclosureThemes.map((theme) => (
              <div className="theme-card" key={theme.id}>
                <span>{`${theme.pillar} theme`}</span>
                <strong>{theme.theme}</strong>
                <p>{`${theme.ready}/${theme.requirements} requirements ready`}</p>
                <small>{`${theme.needsEvidence} still need evidence`}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <PanelHeader
            title="People and governance coverage"
            detail="Major firms typically extend ESG programs beyond environmental metrics into workforce and governance reporting."
          />
          <div className="split-stacks">
            <div className="mini-table">
              <h4>People metrics</h4>
              {peopleMetrics.map((metric) => (
                <div className="mini-row" key={metric.id}>
                  <div>
                    <strong>{metric.label}</strong>
                    <span>{metric.owner}</span>
                  </div>
                  <div className="mini-row-meta">
                    <strong>{metric.value}</strong>
                    <span className={stateTone(metric.status)}>{metric.benchmark}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mini-table">
              <h4>Governance metrics</h4>
              {governanceRecords.map((record) => (
                <div className="mini-row" key={record.id}>
                  <div>
                    <strong>{record.label}</strong>
                    <span>{record.framework}</span>
                  </div>
                  <div className="mini-row-meta">
                    <strong>{record.value}</strong>
                    <span className={stateTone(record.status)}>{record.owner}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>
    </>
  );
}

function PlanWorkspace({
  scenario,
  scenarioView,
  onScenarioChange
}: {
  scenario: ScenarioSettings;
  scenarioView: ReturnType<typeof scenarioProjection>;
  onScenarioChange: (scenario: ScenarioSettings) => void;
}) {
  return (
    <>
      <section className="workspace-grid">
        <article className="panel panel-main">
        <PanelHeader
          title="Target and action program"
          detail="Manage target assumptions and linked initiatives in the same governed environment used for reporting."
        />
        <div className="planner-layout">
          <div className="slider-column">
            <ScenarioSlider
              label="Renewable electricity"
              value={scenario.renewableElectricity}
              onChange={(value) =>
                onScenarioChange({
                  ...scenario,
                  renewableElectricity: value
                })
              }
            />
            <ScenarioSlider
              label="Thermal efficiency"
              value={scenario.thermalEfficiency}
              onChange={(value) =>
                onScenarioChange({
                  ...scenario,
                  thermalEfficiency: value
                })
              }
            />
            <ScenarioSlider
              label="Supplier programs"
              value={scenario.supplierPrograms}
              onChange={(value) =>
                onScenarioChange({
                  ...scenario,
                  supplierPrograms: value
                })
              }
            />
            <ScenarioSlider
              label="Logistics shift"
              value={scenario.logisticsShift}
              onChange={(value) =>
                onScenarioChange({
                  ...scenario,
                  logisticsShift: value
                })
              }
            />
            <ScenarioSlider
              label="Waste circularity"
              value={scenario.wasteCircularity}
              onChange={(value) =>
                onScenarioChange({
                  ...scenario,
                  wasteCircularity: value
                })
              }
            />
          </div>
          <div className="projection-column">
            <div className="projection-hero">
              <span>Projected footprint</span>
              <strong>{formatTonnes(scenarioView.projected)}</strong>
              <p>{`${formatTonnes(scenarioView.reduction)} modeled reduction from baseline`}</p>
            </div>
            <div className="projection-stack">
              {Object.entries(scenarioView.byScope).map(([scope, value]) => (
                <div className="summary-row" key={scope}>
                  <span>{scope}</span>
                  <strong>{formatTonnes(value)}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
        </article>

        <aside className="panel panel-side">
        <PanelHeader
          title="Initiatives"
          detail="Each action is linked to program drivers and can support future target disclosures."
        />
        <div className="lever-stack">
          {reductionLevers.map((lever) => (
            <div className="lever-row" key={lever.id}>
              <div>
                <strong>{lever.title}</strong>
                <span>{lever.owner}</span>
              </div>
              <div className="lever-meta">
                <strong>{formatTonnes(lever.maxReductionTonnes)}</strong>
                <span>{lever.payback}</span>
              </div>
            </div>
          ))}
        </div>
        </aside>
      </section>

      <section className="workspace-extended">
        <article className="panel">
          <PanelHeader
            title="Target program register"
            detail="Environmental, social, and governance targets tracked in one governed register."
          />
          <div className="evidence-wrap">
            <table className="ledger-table auxiliary-table">
              <thead>
                <tr>
                  <th>Target</th>
                  <th>Pillar</th>
                  <th>Baseline</th>
                  <th>Goal</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {targetPrograms.map((program) => (
                  <tr key={program.id}>
                    <td>
                      <strong className="row-title">{program.title}</strong>
                      <span className="row-subtle">{`${program.owner} | ${program.targetYear}`}</span>
                    </td>
                    <td>{program.pillar}</td>
                    <td>{program.baseline}</td>
                    <td>{program.target}</td>
                    <td>
                      <span className={targetTone(program.status)}>{program.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel">
          <PanelHeader
            title="Cross-functional action map"
            detail="Broader sustainability programs need climate, workforce, governance, and supplier actions under the same operating model."
          />
          <div className="summary-grid">
            <div className="summary-tile">
              <span>Environmental targets</span>
              <strong>{targetPrograms.filter((item) => item.pillar === "Environmental").length}</strong>
            </div>
            <div className="summary-tile">
              <span>Social targets</span>
              <strong>{targetPrograms.filter((item) => item.pillar === "Social").length}</strong>
            </div>
            <div className="summary-tile">
              <span>Governance targets</span>
              <strong>{targetPrograms.filter((item) => item.pillar === "Governance").length}</strong>
            </div>
            <div className="summary-tile">
              <span>Supplier actions</span>
              <strong>{supplierRecords.filter((item) => item.status !== "Primary data").length}</strong>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}

function PanelHeader({
  title,
  detail
}: {
  title: string;
  detail: string;
}) {
  return (
    <header className="panel-header">
      <div>
        <p className="panel-kicker">Module</p>
        <h3>{title}</h3>
      </div>
      <p>{detail}</p>
    </header>
  );
}

function ScenarioSlider({
  label,
  value,
  onChange
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="slider-row">
      <div className="slider-copy">
        <span>{label}</span>
        <strong>{formatPercent(value)}</strong>
      </div>
      <input
        max={100}
        min={0}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onChange(Number(event.target.value))
        }
        type="range"
        value={value}
      />
    </label>
  );
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function workspaceTitle(workspace: Workspace) {
  switch (workspace) {
    case "capture":
      return "Program metrics";
    case "review":
      return "Controls and evidence";
    case "reports":
      return "Disclosure management";
    case "plan":
      return "Targets and actions";
    default:
      return "ESG workspace";
  }
}

function facilityName(id: string) {
  return facilities.find((facility) => facility.id === id)?.name ?? "Unknown";
}

function varianceTone(value: number) {
  if (Math.abs(value) >= 15) {
    return "tone-critical";
  }
  if (Math.abs(value) >= 10) {
    return "tone-watch";
  }
  return "tone-strong";
}

function stateTone(state: string) {
  if (state === "Critical") {
    return "tone-critical";
  }
  if (state === "Watch") {
    return "tone-watch";
  }
  return "tone-strong";
}

function frameworkTone(state: string) {
  if (state === "Needs evidence") {
    return "tone-critical";
  }
  if (state === "In progress") {
    return "tone-watch";
  }
  return "tone-strong";
}

function libraryTone(state: string) {
  if (state === "Gap") {
    return "tone-critical";
  }
  if (state === "Partial" || state === "Refreshing") {
    return "tone-watch";
  }
  return "tone-strong";
}

function taskTone(state: string) {
  if (state === "Blocked") {
    return "tone-critical";
  }
  if (state === "Open" || state === "In review") {
    return "tone-watch";
  }
  return "tone-strong";
}

function supplierTone(risk: string) {
  if (risk === "High") {
    return "tone-critical";
  }
  if (risk === "Medium") {
    return "tone-watch";
  }
  return "tone-strong";
}

function targetTone(status: string) {
  if (status === "At risk") {
    return "tone-critical";
  }
  if (status === "Needs funding") {
    return "tone-watch";
  }
  return "tone-strong";
}
