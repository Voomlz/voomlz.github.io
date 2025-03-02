import { useState, useEffect, useMemo, useCallback } from "react";
import { Report } from "../../../era/threat/report.js";
import { Fight } from "../../../era/threat/fight.js";
import { GameVersionConfig } from "../../../era/base";
import { getParameterByName } from "../utils.js";

// Types
interface UrlParams {
  id: string | undefined;
  fightId: string | undefined;
  enemyId: string | undefined;
  targetId: string | undefined;
}

export interface ThreatState {
  url: string | undefined;
  reportId: string | undefined;
  fightId: number | undefined;
  enemyId: number | undefined;
  targetId: number | undefined;

  isLoading: boolean;
  error: string | undefined;

  report: Report | undefined;
  fight: Fight | undefined;
}

export interface ThreatStateHandlers {
  setUrl: (url: string) => void;
  loadReport: () => void;
  setFightId: (fightId: number) => void;
  setEnemyId: (enemyId: number) => void;
  setTargetId: (targetId: number) => void;
  setTargetKey: (targetKey: string) => void;
  loadFight: () => void;
  clearError: () => void;
}

/**
 * Gets URL parameters for threat data
 * @returns {UrlParams} Parsed URL parameters
 */
function getUrlParameters(): UrlParams {
  const id = getParameterByName("id");
  const fightId = getParameterByName("fightId");
  const enemyId = getParameterByName("enemy");
  const targetParam = getParameterByName("target");
  const targetId = targetParam ? targetParam.split(";")[3] : undefined;

  return { id, fightId, enemyId, targetId };
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
 * ```tsx
 * const [state, handlers] = useThreatState(config);
 * const { report, fight, enemy, threatTrace, isLoading, error } = state;
 * const { setReport, setFight, setEnemy, setThreatTrace, clearError } = handlers;
 * ```
 */
export function useThreatState(
  config: GameVersionConfig
): [ThreatState, ThreatStateHandlers] {
  const urlParams = getUrlParameters();

  const [state, setState] = useState<ThreatState>(() =>
    createInitialState(urlParams)
  );

  const handleError = useCallback(
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
      console.error(error);
    },
    [setState]
  );

  const loadReport = useCallback(async () => {
    if (!state.reportId) return;
    if (state.report?.reportId === state.reportId) return;

    setState((prev) => ({ ...prev, isLoading: true, error: undefined }));
    try {
      const report = new Report(config, state.reportId);
      await report.fetch();
      setState((prev) => ({ ...prev, report, isLoading: false }));
    } catch (error) {
      handleError(error);
    }
  }, [state.reportId, state.report?.reportId, config, handleError]);

  // Effect to fetch report data once on mount
  useEffect(() => {
    if (urlParams.id) {
      loadReport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlParams.id]);

  const loadFight = useCallback(async () => {
    if (!state.report || !state.fightId) return;

    setState((prev) => ({ ...prev, isLoading: true, error: undefined }));
    try {
      const fight = await loadFightData(state.report, state.fightId);
      setState((prev) => ({ ...prev, fight, isLoading: false }));
    } catch (error) {
      handleError(error);
    }
  }, [state.report, state.fightId, handleError]);

  const handlers = useMemo(
    () => ({
      setUrl: (url: string) =>
        setState((prev) => ({
          ...prev,
          url,
          reportId: extractReportIdFromUrl(url),
        })),
      setFightId: (fightId: number | undefined) =>
        setState((prev) => ({ ...prev, fightId, error: undefined })), // TODO: set state.fight if we already have it in memory
      setEnemyId: (enemyId: number | undefined) =>
        setState((prev) => ({ ...prev, enemyId, error: undefined })),
      setTargetId: (targetId: number | undefined) =>
        setState((prev) => ({ ...prev, targetId, error: undefined })),
      setTargetKey: (targetKey: string | undefined) =>
        setState((prev) => {
          const [reportId, fightId, enemyId, targetId] =
            targetKey?.split(";") ?? [];
          return {
            ...prev,
            reportId,
            fightId: fightId ? Number(fightId) : undefined,
            enemyId: enemyId ? Number(enemyId) : undefined,
            targetId: targetId ? Number(targetId) : undefined,
            error: undefined,
          };
        }),
      clearError: () => setState((prev) => ({ ...prev, error: undefined })),
      loadFight,
      loadReport,
    }),
    [loadFight, loadReport]
  );

  return [state, handlers];
}

/**
 * Creates the initial threat state from URL parameters
 */
function createInitialState(urlParams: UrlParams): ThreatState {
  return {
    url: urlParams.id,
    reportId: urlParams.id ? extractReportIdFromUrl(urlParams.id) : undefined,
    report: undefined,

    fightId: undefined,
    fight: undefined,

    enemyId: undefined,
    targetId: undefined,
    isLoading: false,
    error: undefined,
  };
}

async function loadFightData(
  report: Report,
  fightId: number
): Promise<Fight | undefined> {
  const fight = report.fights[fightId];
  if (!fight)
    throw new Error(`Fight ${fightId} not found in report ${report.reportId}`);
  await fight.fetch();
  fight.process();
  return fight;

  // const wclFight = report.data.fights[fightId];
  // if (!wclFight)
  //   throw new Error(
  //     `Fight ${fightId} not found in report ${report.data.fights}`
  //   );

  // // create a new Fight object so that object equality checks work
  // const newFight = new Fight(
  //   config,
  //   report.reportId,
  //   wclFight,
  //   report.data.units,
  //   report.data.faction
  // );

  // await newFight.fetch();
  // newFight.process();
  // report.fights[fightId] = newFight;
  // return newFight;
}

function extractReportIdFromUrl(
  idParam: string | undefined
): string | undefined {
  if (!idParam) return undefined;
  const urlmatch = idParam.match(
    /https:\/\/(?:[a-z]+\.)?(?:classic\.|www\.)?warcraftlogs\.com\/reports\/((?:a:)?\w+)/
  );
  return urlmatch ? urlmatch[1] : idParam;
}
