import "./App.css";
import * as era from "../era/spells";
import * as sod from "../sod/spells";
import * as tbc from "../classic/tbc/spells";

import React, { memo, useCallback, useState } from "react";
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
import { Config, useThreatState } from "./components/hooks/useThreatState";

import "./App.css";

const configs = Object.freeze<Config>({
  vanilla: era,
  fresh: era,
  sod,
  classic: tbc,
});

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
  ] = useThreatState(configs);
  const { report, fight, enemyId, targetId, isLoading, error } = state;

  const [plotRange, setPlotRange] = useState<[number, number]>([0, 0]);

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
              <span>{error}</span>
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

      <CompatibilityWarning />

      {report && enemy && fight && (
        <ThreatPlot
          config={report.config}
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

      {report && activeTrace && (
        <ThreatTable
          config={report.config}
          trace={activeTrace}
          plotRange={plotRange}
        />
      )}

      <InfoButtonBar />
    </div>
  );
};

const InfoButtonBar: React.FC = memo(() => {
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
});

const CompatibilityWarning: React.FC = memo(() => {
  const [isDismissed, setIsDismissed] = useState(
    localStorage.getItem("compatWarningDismissed") === "true"
  );

  const dismissWarning = useCallback(() => {
    localStorage.setItem("compatWarningDismissed", JSON.stringify(true));
    setIsDismissed(true);
  }, []);

  if (isDismissed) return null;

  return (
    <Message
      severity="error"
      icon="pi pi-exclamation-triangle"
      content={
        <>
          <ul>
            <li>
              Note: SoD threat is getting close, but still missing some class
              and raid boss mechanics. Feel free to provide help and give
              feedback on the{" "}
              <a href="https://discord.gg/3J4FGUNfW7" target="__blank">
                discord
              </a>
            </li>
            <li>
              Wrath/Cata/MoP logs are not compatible with the tool. There is no
              work in progress to make them compatible.
            </li>
          </ul>
          <Button
            icon="pi pi-times"
            onClick={dismissWarning}
            className="p-button-text p-button-rounded"
            style={{ marginLeft: "auto" }}
          />
        </>
      }
    />
  );
});
