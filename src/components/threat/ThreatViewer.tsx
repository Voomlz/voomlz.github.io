import React, { useState, useEffect } from "react";
import { Report } from "../../../era/threat/report.js";
import { Fight } from "../../../era/threat/fight.js";
import { NPC, ThreatTrace } from "../../../era/threat/unit.js";
import { getParameterByName } from "./utils";
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
  const [report, setReport] = useState<Report | null>(null);
  const [fight, setFight] = useState<Fight | null>(null);
  const [enemy, setEnemy] = useState<NPC | null>(null);
  const [threatTrace, setThreatTrace] = useState<ThreatTrace | null>(null);
  const [plotXRange, setPlotXRange] = useState<[number, number]>([0, 0]);

  // Modal states
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const [changelogOpen, setChangelogOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);

  // Cache for plot data to be shared between components
  const [plotData, setPlotData] = useState<any[]>([]);

  // Setup global props for backward compatibility
  useEffect(() => {
    window.plotXRange = plotXRange;
    window.plotData = plotData;
    window.recolorPlot = () => {
      // This would trigger a re-render of the plot component
      if (enemy) {
        setEnemy((prevEnemy) => {
          if (!prevEnemy) return null;
          return Object.create(
            Object.getPrototypeOf(prevEnemy),
            Object.getOwnPropertyDescriptors(prevEnemy)
          );
        });
      }
    };
  }, [plotXRange, plotData, enemy]);

  // Load parameters from URL on initial render
  useEffect(() => {
    const idParam = getParameterByName("id");
    const fightParam = getParameterByName("fightId");
    const enemyParam = getParameterByName("enemy");
    const targetParam = getParameterByName("target");

    // Load the report if an ID is specified
    if (idParam) {
      const newReport = new Report(config, idParam);
      setReport(newReport);

      newReport.fetch().then(() => {
        if (fightParam) {
          const fightIndex = parseInt(fightParam) - 1;
          const fightIds = Object.keys(newReport.fights);
          if (fightIndex >= 0 && fightIndex < fightIds.length) {
            const fightId = fightIds[fightIndex];
            const newFight = newReport.fights[fightId];
            setFight(newFight);

            newFight.fetch().then(() => {
              newFight.process();

              if (enemyParam) {
                const enemyIndex = parseInt(enemyParam);
                const enemyIds = Object.keys(newFight.enemies);
                if (enemyIndex >= 0 && enemyIndex < enemyIds.length) {
                  const enemyId = enemyIds[enemyIndex];
                  const newEnemy = newFight.enemies[enemyId];
                  setEnemy(newEnemy);

                  if (targetParam) {
                    const [reportId, fightId, enemyId, targetId] =
                      targetParam.split(";");
                    if (targetId && newEnemy.threat[targetId]) {
                      setThreatTrace(newEnemy.threat[targetId]);
                    }
                  }
                }
              }
            });
          }
        }
      });
    }
  }, [config]);

  const handleReportSelected = (selectedReport: Report) => {
    setReport(selectedReport);
    setFight(null);
    setEnemy(null);
    setThreatTrace(null);
  };

  const handleFightSelected = (selectedFight: Fight) => {
    setFight(selectedFight);
    setEnemy(null);
    setThreatTrace(null);
  };

  const handleEnemySelected = (selectedEnemy: NPC) => {
    setEnemy(selectedEnemy);
    setThreatTrace(null);
  };

  const handleTargetSelected = (selectedTrace: ThreatTrace) => {
    setThreatTrace(selectedTrace);
  };

  const handleTargetClicked = (targetKey: string) => {
    if (!targetKey || !enemy) return;

    const [reportId, fightId, enemyId, targetId] = targetKey.split(";");
    if (targetId && enemy.threat[targetId]) {
      setThreatTrace(enemy.threat[targetId]);
    }
  };

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
          <ReportSelector
            config={config}
            onReportSelected={handleReportSelected}
          />
        </div>

        <div className="selector-row">
          <label>Fight:</label>
          <FightSelector
            config={config}
            report={report}
            onFightSelected={handleFightSelected}
          />
        </div>

        <div className="selector-row">
          <label>Enemy:</label>
          <EnemySelector
            config={config}
            fight={fight}
            onEnemySelected={handleEnemySelected}
          />
        </div>

        <div className="selector-row">
          <label>Target:</label>
          <TargetSelector
            config={config}
            enemy={enemy}
            onTargetSelected={handleTargetSelected}
          />
        </div>
      </div>

      {enemy && fight && (
        <ThreatPlot
          config={config}
          reportId={report?.reportId || ""}
          fight={fight}
          enemy={enemy}
          onTargetClicked={handleTargetClicked}
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
