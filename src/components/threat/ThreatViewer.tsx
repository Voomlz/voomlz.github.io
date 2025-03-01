import React, { useState, useEffect } from "react";
import { GameVersionConfig } from "../../../era/base";

import ReportSelector from "./ReportSelector";
import FightSelector from "./FightSelector";
import EnemySelector from "./EnemySelector";
import TargetSelector from "./TargetSelector";
import ThreatPlot from "./ThreatPlot";
import ThreatTable from "./ThreatTable";
import Disclaimer from "./Disclaimer";
import Changelog from "./Changelog";
import Tutorial from "./Tutorial";
import { useThreatState } from "./hooks/useThreatState";

/**
 * Props for ThreatViewer component
 */
export interface ThreatViewerProps {
  config: GameVersionConfig;
}

/**
 * Main container component for threat visualization
 */
const ThreatViewer: React.FC<ThreatViewerProps> = ({ config }) => {
  const [state, handlers] = useThreatState(config);
  const { report, fight, enemy, threatTrace } = state;
  const { setReport, setFight, setEnemy, setThreatTrace } = handlers;

  // Modal states
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const [changelogOpen, setChangelogOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);

  // Cache for plot data to be shared between components
  const [plotData, setPlotData] = useState<any[]>([]);
  const [plotXRange, setPlotXRange] = useState<[number, number]>([0, 0]);

  // Setup global props for backward compatibility
  useEffect(() => {
    window.plotXRange = plotXRange;
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
  }, [plotXRange, plotData, enemy, setEnemy]);

  return (
    <div className="threat-viewer">
      <h1>WoW Classic Threat Viewer</h1>

      <div className="info-links">
        <button onClick={() => setDisclaimerOpen(true)} className="info-link">
          Disclaimer
        </button>
        <button onClick={() => setChangelogOpen(true)} className="info-link">
          Changelog
        </button>
        <button onClick={() => setTutorialOpen(true)} className="info-link">
          Tutorial
        </button>
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
          <EnemySelector
            config={config}
            fight={fight}
            onEnemySelected={setEnemy}
          />
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
          onTargetClicked={(targetKey) => {
            if (!targetKey || !enemy) return;
            const [reportId, fightId, enemyId, targetId] = targetKey.split(";");
            if (targetId && enemy.threat[targetId]) {
              setThreatTrace(enemy.threat[targetId]);
            }
          }}
        />
      )}

      {threatTrace && <ThreatTable config={config} trace={threatTrace} />}

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

export default ThreatViewer;
