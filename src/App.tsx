import React, { useCallback, useEffect, useMemo, useState } from "react";
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

import { Card } from "primereact/card";
import styles from "./App.module.css";
import {
  UnitSettingsKey,
  useUnitSettings,
} from "./components/hooks/useUnitSettings";

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
  ] = useThreatState();
  const { report, fight, enemyId, targetId, isLoading, error } = state;

  const { unitSettings, setUnitSetting } = useUnitSettings();

  const [plotRange, setPlotRange] = useState<[number, number]>([0, 0]);

  const fightData = useMemo(
    () => fight?.process(unitSettings),
    [fight, unitSettings]
  );

  const enemy = fight && enemyId ? fightData?.enemies[enemyId] : undefined;
  const activeTrace = enemy && targetId ? enemy.threat[targetId] : undefined;

  const activeUnitSettings = activeTrace
    ? unitSettings.units[activeTrace.target.key]
    : undefined;

  const setActiveUnitSetting = useCallback(
    (prop: UnitSettingsKey, key: string, value?: number) => {
      if (!activeTrace) return;
      setUnitSetting(activeTrace.target.key, prop, key, value);
    },
    [activeTrace, setUnitSetting]
  );

  return (
    <div className={styles.app}>
      <Card className={styles.selectors} title="WoW Classic Threat Viewer">
        <div className={styles.selectorRow}>
          <ReportInput
            disabled={isLoading}
            value={state.url || ""}
            onLoadClicked={loadReport}
            onChange={setUrl}
          />
        </div>

        <div className={styles.selectorRow}>
          <FightSelector
            report={report}
            value={state.fightId}
            onChange={setFightId}
            disabled={isLoading}
            onLoadFight={loadFight}
          />
        </div>

        <div className={styles.selectorRow}>
          <EnemySelector
            fight={fight}
            value={state.enemyId}
            onChange={setEnemyId}
            disabled={isLoading}
          />
        </div>

        <div className={styles.selectorRow}>
          <TargetSelector
            fight={fight}
            enemyId={enemyId}
            value={state.targetId}
            onChange={setTargetId}
            disabled={isLoading}
          />
        </div>
      </Card>

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
          unitSettings={unitSettings}
        />
      )}

      {report && activeTrace && (
        <ThreatTable
          config={report.config}
          trace={activeTrace}
          plotRange={plotRange}
          unitSettings={activeUnitSettings}
          setUnitSettings={setActiveUnitSetting}
        />
      )}

      <InfoButtonBar />
    </div>
  );
};

const InfoButtonBar: React.FC = () => {
  // Modal states
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const [changelogOpen, setChangelogOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);

  return (
    <div className={styles.infoBar}>
      <Button
        outlined
        severity="secondary"
        label="Disclaimer"
        onClick={() => setDisclaimerOpen(true)}
        icon="pi pi-info-circle"
      />
      <Disclaimer
        isOpen={disclaimerOpen}
        onClose={() => setDisclaimerOpen(false)}
      />
      <Button
        outlined
        severity="secondary"
        label="Changelog"
        onClick={() => setChangelogOpen(true)}
        icon="pi pi-history"
      />
      <Changelog
        isOpen={changelogOpen}
        onClose={() => setChangelogOpen(false)}
      />
      <Button
        outlined
        severity="secondary"
        label="Tutorial"
        onClick={() => setTutorialOpen(true)}
        icon="pi pi-question-circle"
      />
      <Tutorial isOpen={tutorialOpen} onClose={() => setTutorialOpen(false)} />
      <Button
        outlined
        severity="secondary"
        label="Discord"
        onClick={() => window.open("https://discord.gg/3J4FGUNfW7", "_blank")}
        icon="pi pi-discord"
      />
    </div>
  );
};

const CompatibilityWarning: React.FC = () => {
  const [isDismissed, setIsDismissed] = useState(
    localStorage.getItem("compatWarningDismissed") === "true"
  );

  const dismissWarning = () => {
    localStorage.setItem("compatWarningDismissed", JSON.stringify(true));
    setIsDismissed(true);
  };
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
};
