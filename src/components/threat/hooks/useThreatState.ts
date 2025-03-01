import { useState, useEffect, useMemo, useCallback } from "react";
import { Report } from "../../../../era/threat/report.js";
import { Fight } from "../../../../era/threat/fight.js";
import { NPC, ThreatTrace } from "../../../../era/threat/unit.js";
import { GameVersionConfig } from "../../../../era/base";
import { getParameterByName, printError } from "../utils";

// Types
interface UrlParams {
  reportId: string | null;
  fightId: string | null;
  enemyId: string | null;
  targetId: string | null;
}

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

/**
 * Gets URL parameters for threat data
 * @returns {UrlParams} Parsed URL parameters
 */
function getUrlParameters(): UrlParams {
  const reportId = extractReportIdFromUrl(getParameterByName("id"));
  const fightId = getParameterByName("fightId");
  const enemyId = getParameterByName("enemy");
  const targetParam = getParameterByName("target");
  const targetId = targetParam ? targetParam.split(";")[3] : null;

  return { reportId, fightId, enemyId, targetId };
}

/**
 * Custom hook for managing URL parameters related to threat data
 * @returns {UrlParams} Memoized URL parameters
 */
function useUrlParameters(): UrlParams {
  return useMemo(() => getUrlParameters(), []);
}

/**
 * Custom hook for managing error state and handling
 * @param setState - State setter function for ThreatState
 * @returns {(error: unknown) => void} Error handler function
 */
function useErrorHandler(
  setState: React.Dispatch<React.SetStateAction<ThreatState>>
): (error: unknown) => void {
  return useCallback(
    (error: unknown) => {
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
    },
    [setState]
  );
}

/**
 * Custom hook for managing threat data loading
 * @param state - Current threat state
 * @param setState - State setter function
 * @param handleError - Error handler function
 */
function useDataLoading(
  state: ThreatState,
  setState: React.Dispatch<React.SetStateAction<ThreatState>>,
  handleError: (error: unknown) => void
) {
  const urlParams = useUrlParameters();

  // Effect to fetch report data
  useEffect(() => {
    if (!state.id || !state.report) return;

    const fetchReport = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        await state.report!.fetch();
        setState((prev) => ({ ...prev, isLoading: false }));
      } catch (error) {
        handleError(error);
      }
    };

    fetchReport();
  }, [state.id, state.report, handleError, setState]);

  // Effect to handle fight data loading
  useEffect(() => {
    if (!state.report || !urlParams.fightId) return;

    const fetchFight = async () => {
      try {
        const fightIndex = parseInt(urlParams.fightId!) - 1;
        const fightIds = Object.keys(state.report!.fights);

        if (fightIndex >= 0 && fightIndex < fightIds.length) {
          const fightId = fightIds[fightIndex];
          const fight = state.report!.fights[fightId];
          await loadFightData(fight, urlParams, setState);
        }
      } catch (error) {
        handleError(error);
      }
    };

    fetchFight();
  }, [state.report, urlParams.fightId, handleError, setState, urlParams]);
}

/**
 * Custom hook for creating state handlers
 * @param setState - State setter function
 * @returns {ThreatStateHandlers} Object containing state handler functions
 */
function useStateHandlers(
  setState: React.Dispatch<React.SetStateAction<ThreatState>>
): ThreatStateHandlers {
  return useMemo(
    () => ({
      setReport: (report: Report) =>
        setState((prev) => ({ ...prev, report, error: null })),
      setFight: (fight: Fight) =>
        setState((prev) => ({ ...prev, fight, error: null })),
      setEnemy: (enemy: NPC) =>
        setState((prev) => ({ ...prev, enemy, error: null })),
      setThreatTrace: (trace: ThreatTrace) =>
        setState((prev) => ({ ...prev, threatTrace: trace, error: null })),
      clearError: () => setState((prev) => ({ ...prev, error: null })),
    }),
    [setState]
  );
}

/**
 * Main hook for managing threat state in the application
 *
 * This hook handles:
 * - URL parameter parsing
 * - Report, fight, enemy, and threat trace state management
 * - Data loading and error handling
 * - State update handlers
 *
 * @param config - Game version configuration
 * @returns {[ThreatState, ThreatStateHandlers]} Tuple containing current state and state handlers
 *
 * @example
 * ```tsx
 * const [state, handlers] = useThreatState(config);
 * const { report, fight, enemy, threatTrace, isLoading, error } = state;
 * const { setReport, setFight, setEnemy, setThreatTrace, clearError } = handlers;
 * ```
 */
export function useThreatState(
  config: GameVersionConfig
): [ThreatState, ThreatStateHandlers] {
  const urlParams = useUrlParameters();

  const [state, setState] = useState<ThreatState>(() =>
    createInitialState(config, urlParams)
  );

  const handleError = useErrorHandler(setState);
  const handlers = useStateHandlers(setState);

  useDataLoading(state, setState, handleError);

  return [state, handlers];
}

/**
 * Creates the initial threat state from URL parameters
 * @param config - Game version configuration
 * @param urlParams - URL parameters
 * @returns {ThreatState} Initial threat state
 */
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

// Helper functions for data loading and error handling
async function loadReportData(
  report: Report,
  setState: React.Dispatch<React.SetStateAction<ThreatState>>
) {
  await report.fetch();

  const params = getUrlParameters();
  if (!params.fightId) return;

  const fightIndex = parseInt(params.fightId) - 1;
  const fightIds = Object.keys(report.fights);

  if (fightIndex >= 0 && fightIndex < fightIds.length) {
    const fightId = fightIds[fightIndex];
    const fight = report.fights[fightId];
    await loadFightData(fight, params, setState);
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
