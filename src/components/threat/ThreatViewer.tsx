import React, { useState, useEffect } from "react";
import { GameVersionConfig } from "../../../era/base";
import { Button } from "primereact/button";

import { ReportSelector } from "./ReportSelector";
import { FightSelector } from "./FightSelector";
import { EnemySelector } from "./EnemySelector";
import { TargetSelector } from "./TargetSelector";
import { ThreatPlot } from "./ThreatPlot";
import { ThreatTable, ExtendedGameVersionConfig } from "./ThreatTable";
import { Disclaimer } from "./Disclaimer";
import { Changelog } from "./Changelog";
import { Tutorial } from "./Tutorial";
import { useThreatState } from "./hooks/useThreatState";
import "./ThreatViewer.css";

/**
 * Props for ThreatViewer component
 */
export interface ThreatViewerProps {
  config: GameVersionConfig;
}

/**
 * Main container component for threat visualization
 */
export const ThreatViewer: React.FC<ThreatViewerProps> = ({ config }) => {
  const [state, handlers] = useThreatState(config);
  const { report, fight, enemy, threatTrace } = state;
  const { setReport, setFight, setEnemy, setThreatTrace } = handlers;

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
          config={config as ExtendedGameVersionConfig}
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
