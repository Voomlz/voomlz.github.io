import "./App.css";
import * as config from "../era/spells";

import React, { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";

import { ReportSelector } from "./components/ReportSelector";
import { FightSelector } from "./components/FightSelector";
import { EnemySelector } from "./components/EnemySelector";
import { TargetSelector } from "./components/TargetSelector";
import { ThreatPlot } from "./components/ThreatPlot";
import { ThreatTable } from "./components/ThreatTable";
import { Disclaimer } from "./components/dialog/Disclaimer";
import { Changelog } from "./components/dialog/Changelog";
import { Tutorial } from "./components/dialog/Tutorial";
import { useThreatState } from "./components/hooks/useThreatState";

import "./App.css";

/**
 * Props for App component
 */
export interface AppProps {}

/**
 * Main container component for threat visualization
 */
export const App: React.FC<AppProps> = () => {
  const [state, handlers] = useThreatState(config);
  const { report, fight, enemy, threatTrace, isLoading, error } = state;
  const { setReport, setFight, setEnemy, setThreatTrace, clearError } =
    handlers;

  // Modal states
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const [changelogOpen, setChangelogOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);

  // Cache for plot data to be shared between components
  const [plotData, setPlotData] = useState<any[]>([]);
  const [plotRange, setPlotRange] = useState<[number, number]>([0, 0]);

  // Setup global props for backward compatibility
  useEffect(() => {
    window.plotData = plotData;
    window.recolorPlot = () => {
      // This would trigger a re-render of the plot component
      if (enemy) {
        setEnemy(
          Object.create(
            Object.getPrototypeOf(enemy),
            Object.getOwnPropertyDescriptors(enemy)
          )
        );
      }
    };
  }, [plotData, enemy, setEnemy]);

  return (
    <div className="threat-viewer">
      <h1>WoW Classic Threat Viewer</h1>

      <div className="info-links">
        <Button
          label="Disclaimer"
          onClick={() => setDisclaimerOpen(true)}
          className="p-button-text"
          icon="pi pi-info-circle"
        />
        <Button
          label="Changelog"
          onClick={() => setChangelogOpen(true)}
          className="p-button-text"
          icon="pi pi-history"
        />
        <Button
          label="Tutorial"
          onClick={() => setTutorialOpen(true)}
          className="p-button-text"
          icon="pi pi-question-circle"
        />
      </div>

      {error && (
        <div className="error-message mb-3">
          <i
            className="pi pi-exclamation-triangle"
            style={{ marginRight: "0.5rem" }}
          />
          {error}
          <Button
            icon="pi pi-times"
            onClick={clearError}
            className="p-button-text p-button-rounded"
            style={{ marginLeft: "auto" }}
          />
        </div>
      )}

      <div className="selectors">
        <div className="selector-row">
          <label>Report:</label>
          <ReportSelector config={config} onReportSelected={setReport} />
        </div>

        <div className="selector-row">
          <label>Fight:</label>
          <FightSelector
            config={config}
            report={report}
            onFightSelected={setFight}
          />
        </div>

        <div className="selector-row">
          <label>Enemy:</label>
          <EnemySelector fight={fight} onEnemySelected={setEnemy} />
        </div>

        <div className="selector-row">
          <label>Target:</label>
          <TargetSelector
            config={config}
            enemy={enemy}
            onTargetSelected={setThreatTrace}
          />
        </div>
      </div>

      {isLoading && (
        <div className="loading-overlay">
          <ProgressSpinner />
          <div>Loading data...</div>
        </div>
      )}

      {enemy && fight && (
        <ThreatPlot
          config={config}
          reportId={report?.reportId || ""}
          fight={fight}
          enemy={enemy}
          plotRange={plotRange}
          setPlotRange={setPlotRange}
          onTargetClicked={(targetKey) => {
            if (!targetKey || !enemy) return;
            const [reportId, fightId, enemyId, targetId] = targetKey.split(";");
            if (targetId && enemy.threat[targetId]) {
              setThreatTrace(enemy.threat[targetId]);
            }
          }}
        />
      )}

      {threatTrace && (
        <ThreatTable
          config={config}
          trace={threatTrace}
          plotRange={plotRange}
        />
      )}

      {/* Modal components */}
      <Disclaimer
        isOpen={disclaimerOpen}
        onClose={() => setDisclaimerOpen(false)}
      />
      <Changelog
        isOpen={changelogOpen}
        onClose={() => setChangelogOpen(false)}
      />
      <Tutorial isOpen={tutorialOpen} onClose={() => setTutorialOpen(false)} />
    </div>
  );
};
