"use client";

import { ChangeEvent, useState } from "react";

import {
  companyProfile,
  defaultScenario,
  emissionActivities,
  evidenceRecords,
  facilities,
  frameworkItems,
  reductionLevers,
  resourceMetrics,
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
    label: "Capture",
    caption: "Activity ledger and calculation engine"
  },
  {
    id: "review",
    label: "Review",
    caption: "Evidence, exceptions, and data quality"
  },
  {
    id: "reports",
    label: "Reports",
    caption: "BRSR, ESRS, and GRI output readiness"
  },
  {
    id: "plan",
    label: "Plan",
    caption: "Reduction modeling and implementation roadmap"
  }
];

const qualityOptions: QualityState[] = [
  "Verified",
  "Needs review",
  "Missing proof"
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

  const metrics = [
    {
      label: "Carbon footprint",
      value: formatTonnes(totalCarbon),
      note: `${formatPercent((scopeMix["Scope 3"] / Math.max(totalCarbon, 1)) * 100)} of visible footprint is Scope 3`
    },
    {
      label: "Water withdrawal",
      value: `${formatNumber(totalWaterUse)} m3`,
      note: `${formatPercent(diversionRate)} average diversion rate`
    },
    {
      label: "Audit score",
      value: `${auditScore}/100`,
      note: `${evidenceMix["Missing proof"]} records are blocking full assurance`
    },
    {
      label: "Reporting readiness",
      value: `${reportScore}%`,
      note: "Single dataset feeding BRSR, ESRS, and GRI views"
    }
  ];

  const reviewQueue = visibleActivities
    .filter((activity) => activity.quality !== "Verified" || Math.abs(activity.variancePct) >= 10)
    .sort((left, right) => right.emissionsTonnes - left.emissionsTonnes);

  const missingEvidence = visibleEvidence.filter(
    (record) => record.status === "Missing proof"
  );

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
            <p className="sidebar-kicker">Environmental intelligence</p>
            <h1>Impact Control Room</h1>
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
          <p className="sidebar-label">What changed from the spreadsheet</p>
          <ul className="sidebar-list">
            <li>Editable activity ledger instead of static rows</li>
            <li>Proof-linked quality workflow instead of manual coloring</li>
            <li>Live rollups by scope, facility, and framework</li>
            <li>Reduction planning tied to the same calculation base</li>
          </ul>
        </div>
      </aside>

      <section className="tool-main">
        <header className="topbar">
          <div>
            <p className="topbar-label">Current view</p>
            <h2>{workspaceTitle(workspace)}</h2>
            <p className="topbar-copy">
              This version is structured as software for sustainability teams, not a
              showcase page.
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
          </div>
        </header>

        <section className="metric-strip">
          {metrics.map((metric) => (
            <article className="metric-card" key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
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
              title="Emission hotspots"
              detail="Largest drivers in the current filtered perimeter"
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
              title="Scope mix"
              detail="All views roll up from the same underlying activity ledger"
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
    <section className="workspace-grid">
      <article className="panel panel-main">
        <PanelHeader
          title="Activity ledger"
          detail="Edit quantities directly. Emissions recalculate immediately using the implied factor from each seed record."
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
                    <strong>{activity.label}</strong>
                    <span>{activity.category}</span>
                  </td>
                  <td>{activity.scope}</td>
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
                  <td>{activity.proofId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <aside className="panel panel-side">
        <PanelHeader
          title="Selected line item"
          detail="Transparent calculation context for reviewers and auditors"
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
    <section className="workspace-grid">
      <article className="panel panel-main">
        <PanelHeader
          title="Evidence registry"
          detail="Every metric should be backed by a file, an owner, and a review state."
        />
        <div className="evidence-stack">
          {evidence.map((record) => (
            <div className="evidence-row" key={record.proofId}>
              <div>
                <strong>{record.documentName}</strong>
                <span>{`${record.proofId} | ${record.documentType}`}</span>
              </div>
              <div>
                <span>{record.metric}</span>
                <strong>{record.owner}</strong>
              </div>
              <div>
                <span>{record.uploadedAt}</span>
                <strong>{record.reviewer}</strong>
              </div>
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
            </div>
          ))}
        </div>
      </article>

      <aside className="panel panel-side">
        <PanelHeader
          title="Exception queue"
          detail="Focus reviewer time where quality or variance can materially move disclosed results."
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
                  <span>{item.proofId}</span>
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
    <section className="workspace-grid">
      <article className="panel panel-main">
        <PanelHeader
          title="Framework output matrix"
          detail="One source ledger, multiple disclosure views. This is where a platform beats spreadsheet duplication."
        />
        <div className="framework-grid">
          {frameworkItems.map((item) => (
            <div className="framework-tile" key={item.id}>
              <div className="framework-topline">
                <span>{`${item.framework} | ${item.code}`}</span>
                <span className={frameworkTone(item.status)}>{item.status}</span>
              </div>
              <strong>{item.title}</strong>
              <p>{item.value}</p>
              <small>{item.source}</small>
            </div>
          ))}
        </div>
      </article>

      <aside className="panel panel-side">
        <PanelHeader
          title="Report package"
          detail="Readiness depends on both disclosure coverage and evidence quality."
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
    <section className="workspace-grid">
      <article className="panel panel-main">
        <PanelHeader
          title="Reduction workbench"
          detail="Move the scenario sliders to model how interventions shift the visible footprint."
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
          title="Levers"
          detail="Each program is linked to the relevant emissions drivers in the model."
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
      return "Capture and calculation";
    case "review":
      return "Evidence review";
    case "reports":
      return "Disclosure reporting";
    case "plan":
      return "Reduction planning";
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
