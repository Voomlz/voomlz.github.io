import "./App.css";
import * as config from "../era/spells";

import React, { useState } from "react";
import { Button } from "primereact/button";
import { Message } from "primereact/message";

import { ReportInput } from "./components/ReportInput";
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
 * Main container component for threat visualization
 */
export const App: React.FC = () => {
  const [
    state,
    {
      setUrl,
      loadReport,
      setFightId,
      setEnemyId,
      setTargetId,
      setTargetKey,
      loadFight,
      clearError,
    },
  ] = useThreatState(config);
  const { report, fight, enemyId, targetId, isLoading, error } = state;

  const [plotRange, setPlotRange] = useState<[number, number]>([0, 0]);

  // // Cache for plot data to be shared between components
  // // const [plotData, setPlotData] = useState<any[]>([]);

  // // Setup global props for backward compatibility
  // useEffect(() => {
  //   window.plotData = plotData;
  //   window.recolorPlot = () => {
  //     // This would trigger a re-render of the plot component
  //     if (enemy) {
  //       setEnemy(
  //         Object.create(
  //           Object.getPrototypeOf(enemy),
  //           Object.getOwnPropertyDescriptors(enemy)
  //         )
  //       );
  //     }
  //   };
  // }, [plotData, enemy, setEnemy]);

  const enemy = fight && enemyId ? fight.enemies[enemyId] : undefined;
  const activeTrace = enemy && targetId ? enemy.threat[targetId] : undefined;

  return (
    <div className="threat-viewer">
      <h1>WoW Classic Threat Viewer</h1>

      <div className="selectors">
        <div className="selector-row">
          <ReportInput
            disabled={isLoading}
            value={state.url || ""}
            onLoadClicked={loadReport}
            onChange={setUrl}
          />
        </div>

        <div className="selector-row">
          <FightSelector
            report={report}
            value={state.fightId}
            onChange={setFightId}
            disabled={isLoading}
            onLoadFight={loadFight}
          />
        </div>

        <div className="selector-row">
          <EnemySelector
            fight={fight}
            value={state.enemyId}
            onChange={setEnemyId}
            disabled={isLoading}
          />
        </div>

        <div className="selector-row">
          <TargetSelector
            fight={fight}
            enemyId={enemyId}
            value={state.targetId}
            onChange={setTargetId}
            disabled={isLoading}
          />
        </div>
      </div>

      {error && (
        <Message
          severity="error"
          icon="pi pi-exclamation-triangle"
          content={
            <>
              {error}
              <Button
                icon="pi pi-times"
                onClick={clearError}
                className="p-button-text p-button-rounded"
                style={{ marginLeft: "auto" }}
              />
            </>
          }
        />
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
            const [, , , targetId] = targetKey.split(";");
            if (targetId) {
              setTargetKey(targetKey);
            }
          }}
        />
      )}

      {activeTrace && (
        <ThreatTable
          config={config}
          trace={activeTrace}
          plotRange={plotRange}
        />
      )}

      <InfoButtonBar />
    </div>
  );
};

function InfoButtonBar() {
  // Modal states
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const [changelogOpen, setChangelogOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);

  return (
    <div className="info-links">
      <Button
        label="Disclaimer"
        onClick={() => setDisclaimerOpen(true)}
        icon="pi pi-info-circle"
      />
      <Disclaimer
        isOpen={disclaimerOpen}
        onClose={() => setDisclaimerOpen(false)}
      />
      <Button
        label="Changelog"
        onClick={() => setChangelogOpen(true)}
        icon="pi pi-history"
      />
      <Changelog
        isOpen={changelogOpen}
        onClose={() => setChangelogOpen(false)}
      />
      <Button
        label="Tutorial"
        onClick={() => setTutorialOpen(true)}
        icon="pi pi-question-circle"
      />
      <Tutorial isOpen={tutorialOpen} onClose={() => setTutorialOpen(false)} />
    </div>
  );
}
