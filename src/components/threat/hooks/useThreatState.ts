import { useState, useEffect } from "react";
import { Report } from "../../../../era/threat/report.js";
import { Fight } from "../../../../era/threat/fight.js";
import { NPC, ThreatTrace } from "../../../../era/threat/unit.js";
import { GameVersionConfig } from "../../../../era/base";
import { getParameterByName, printError } from "../utils";

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

export function useThreatState(
  config: GameVersionConfig
): [ThreatState, ThreatStateHandlers] {
  // Initialize state from URL parameters
  const [state, setState] = useState<ThreatState>(() => {
    let idParam = getParameterByName("id");
    idParam = extractReportIdFromUrl(idParam);
    return {
      id: idParam,
      report: idParam ? new Report(config, idParam) : null,
      fight: null,
      enemy: null,
      threatTrace: null,
      isLoading: false,
      error: null,
    };
  });

  // Effect to handle initial URL parameters and data fetching
  useEffect(() => {
    const loadInitialState = async () => {
      if (!state.id || !state.report) return;

      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        // Fetch report data
        await state.report.fetch();

        // Handle fight parameter
        const fightParam = getParameterByName("fightId");
        if (fightParam) {
          const fightIndex = parseInt(fightParam) - 1;
          const fightIds = Object.keys(state.report.fights);
          if (fightIndex >= 0 && fightIndex < fightIds.length) {
            const fightId = fightIds[fightIndex];
            const newFight = state.report.fights[fightId];

            // Fetch fight data
            await newFight.fetch();
            newFight.process();

            setState((prev) => ({ ...prev, fight: newFight }));

            // Handle enemy parameter
            const enemyParam = getParameterByName("enemy");
            if (enemyParam) {
              const enemyIndex = parseInt(enemyParam);
              const enemyIds = Object.keys(newFight.enemies);
              if (enemyIndex >= 0 && enemyIndex < enemyIds.length) {
                const enemyId = enemyIds[enemyIndex];
                const newEnemy = newFight.enemies[enemyId];

                setState((prev) => ({ ...prev, enemy: newEnemy }));

                // Handle target parameter
                const targetParam = getParameterByName("target");
                if (targetParam) {
                  const [reportId, fightId, enemyId, targetId] =
                    targetParam.split(";");
                  if (targetId && newEnemy.threat[targetId]) {
                    setState((prev) => ({
                      ...prev,
                      threatTrace: newEnemy.threat[targetId],
                    }));
                  }
                }
              }
            }
          }
        }

        setState((prev) => ({ ...prev, isLoading: false }));
      } catch (error) {
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

function extractReportIdFromUrl(idParam: string | null): string | null {
  if (!idParam) return null;
  const urlmatch = idParam.match(
    /https:\/\/(?:[a-z]+\.)?(?:classic\.|www\.)?warcraftlogs\.com\/reports\/((?:a:)?\w+)/
  );
  return urlmatch ? urlmatch[1] : idParam;
}
