import { useState, useEffect } from "react";
import { Report } from "../../../../era/threat/report.js";
import { Fight } from "../../../../era/threat/fight.js";
import { NPC, ThreatTrace } from "../../../../era/threat/unit.js";
import { GameVersionConfig } from "../../../../era/base";
import { getParameterByName, printError } from "../utils";

// URL parameter types
interface UrlParams {
  reportId: string | null;
  fightId: string | null;
  enemyId: string | null;
  targetId: string | null;
}

// Core state types
export interface ThreatState {
  id: string | null;
  report: Report | null;
  fight: Fight | null;
  enemy: NPC | null;
  threatTrace: ThreatTrace | null;
  isLoading: boolean;
  error: string | null;
}

export interface ThreatStateHandlers {
  setReport: (report: Report) => void;
  setFight: (fight: Fight) => void;
  setEnemy: (enemy: NPC) => void;
  setThreatTrace: (trace: ThreatTrace) => void;
  clearError: () => void;
}

// URL parameter handling
function getUrlParameters(): UrlParams {
  const reportId = extractReportIdFromUrl(getParameterByName("id"));
  const fightId = getParameterByName("fightId");
  const enemyId = getParameterByName("enemy");
  const targetParam = getParameterByName("target");
  const targetId = targetParam ? targetParam.split(";")[3] : null;

  return { reportId, fightId, enemyId, targetId };
}

// Initial state factory
function createInitialState(
  config: GameVersionConfig,
  urlParams: UrlParams
): ThreatState {
  return {
    id: urlParams.reportId,
    report: urlParams.reportId ? new Report(config, urlParams.reportId) : null,
    fight: null,
    enemy: null,
    threatTrace: null,
    isLoading: false,
    error: null,
  };
}

export function useThreatState(
  config: GameVersionConfig
): [ThreatState, ThreatStateHandlers] {
  // Initialize state from URL parameters
  const [state, setState] = useState<ThreatState>(() => {
    const urlParams = getUrlParameters();
    return createInitialState(config, urlParams);
  });

  // Effect to handle data fetching based on URL parameters
  useEffect(() => {
    const loadInitialState = async () => {
      if (!state.id || !state.report) return;

      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        await loadReportData(state.report, setState);
        setState((prev) => ({ ...prev, isLoading: false }));
      } catch (error) {
        handleError(error, setState);
      }
    };

    loadInitialState();
  }, [state.id, state.report, config]);

  const handlers: ThreatStateHandlers = {
    setReport: (report: Report) =>
      setState((prev) => ({ ...prev, report, error: null })),
    setFight: (fight: Fight) =>
      setState((prev) => ({ ...prev, fight, error: null })),
    setEnemy: (enemy: NPC) =>
      setState((prev) => ({ ...prev, enemy, error: null })),
    setThreatTrace: (trace: ThreatTrace) =>
      setState((prev) => ({ ...prev, threatTrace: trace, error: null })),
    clearError: () => setState((prev) => ({ ...prev, error: null })),
  };

  return [state, handlers];
}

// Helper functions for data loading and error handling
async function loadReportData(
  report: Report,
  setState: React.Dispatch<React.SetStateAction<ThreatState>>
) {
  await report.fetch();

  const urlParams = getUrlParameters();
  if (!urlParams.fightId) return;

  const fightIndex = parseInt(urlParams.fightId) - 1;
  const fightIds = Object.keys(report.fights);

  if (fightIndex >= 0 && fightIndex < fightIds.length) {
    const fightId = fightIds[fightIndex];
    const fight = report.fights[fightId];
    await loadFightData(fight, urlParams, setState);
  }
}

async function loadFightData(
  fight: Fight,
  urlParams: UrlParams,
  setState: React.Dispatch<React.SetStateAction<ThreatState>>
) {
  await fight.fetch();
  fight.process();
  setState((prev) => ({ ...prev, fight }));

  if (!urlParams.enemyId) return;

  const enemyIndex = parseInt(urlParams.enemyId);
  const enemyIds = Object.keys(fight.enemies);

  if (enemyIndex >= 0 && enemyIndex < enemyIds.length) {
    const enemyId = enemyIds[enemyIndex];
    const enemy = fight.enemies[enemyId];
    setState((prev) => ({ ...prev, enemy }));

    if (
      urlParams.targetId &&
      typeof urlParams.targetId === "string" &&
      enemy.threat[urlParams.targetId]
    ) {
      setState((prev) => ({
        ...prev,
        threatTrace: enemy.threat[urlParams.targetId as string],
      }));
    }
  }
}

function handleError(
  error: unknown,
  setState: React.Dispatch<React.SetStateAction<ThreatState>>
) {
  const errorMessage =
    error instanceof Error
      ? error.message
      : "An error occurred while loading data";
  setState((prev) => ({
    ...prev,
    isLoading: false,
    error: errorMessage,
  }));
  printError(error);
}

function extractReportIdFromUrl(idParam: string | null): string | null {
  if (!idParam) return null;
  const urlmatch = idParam.match(
    /https:\/\/(?:[a-z]+\.)?(?:classic\.|www\.)?warcraftlogs\.com\/reports\/((?:a:)?\w+)/
  );
  return urlmatch ? urlmatch[1] : idParam;
}
