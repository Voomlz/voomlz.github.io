import React, { useEffect, useState } from "react";
import { Report } from "../../../era/threat/report.js";
import { Fight } from "../../../era/threat/fight.js";
import { enableInput, printError, encounterSort, TRASH_ID } from "./utils";
import { GameVersionConfig } from "../../../era/base";

/**
 * Props for the FightSelector component
 */
export interface FightSelectorProps {
  config: GameVersionConfig;
  report: Report | null;
  onFightSelected: (fight: Fight) => void;
}

/**
 * Component for selecting a fight from a report
 */
const FightSelector: React.FC<FightSelectorProps> = ({
  config,
  report,
  onFightSelected,
}) => {
  const [selectedFightId, setSelectedFightId] = useState<string>("");
  const [fights, setFights] = useState<Fight[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Update fights list when report changes
  useEffect(() => {
    if (!report) {
      setFights([]);
      return;
    }

    // Process fights from the report
    const fightsArray = Object.values(report.fights);
    fightsArray.sort((a, b) => encounterSort(a) - encounterSort(b));
    setFights(fightsArray);
  }, [report]);

  const handleFightChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!report) return;

    const value = e.target.value;
    setSelectedFightId(value);

    if (!value) return;

    const [reportId, fightId] = value.split(";");
    const selectedFight = report.fights[fightId];

    try {
      setLoading(true);
      enableInput(false);
      await selectedFight.fetch();
      selectedFight.process();
      onFightSelected(selectedFight);
    } catch (e) {
      printError(e);
    } finally {
      setLoading(false);
      enableInput(true);
    }
  };

  return (
    <div className="fight-selector">
      <select
        id="fightSelect"
        value={selectedFightId}
        onChange={handleFightChange}
        disabled={!report || loading}
      >
        <option value="">Select a fight</option>
        {fights.map((fight, index) => {
          // Add a divider for trash fights
          const isFirstTrash =
            index > 0 &&
            encounterSort(fights[index - 1]) < TRASH_ID &&
            encounterSort(fight) >= TRASH_ID;

          return (
            <React.Fragment key={fight.id}>
              {isFirstTrash && <option disabled>--- TRASH ---</option>}
              <option value={`${report?.reportId};${fight.id}`}>
                {fight.name} - {fight.id}
              </option>
            </React.Fragment>
          );
        })}
      </select>
    </div>
  );
};

export default FightSelector;
