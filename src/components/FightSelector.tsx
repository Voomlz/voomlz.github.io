import React, { useMemo, useState } from "react";
import { Report } from "../../era/threat/report.js";
import { Fight } from "../../era/threat/fight.js";
import { enableInput } from "./utils";
import { GameVersionConfig } from "../../era/base";
import { Dropdown } from "primereact/dropdown";

/**
 * Props for the FightSelector component
 */
export interface FightSelectorProps {
  config: GameVersionConfig;
  report: Report | null;
  onFightSelected: (fight: Fight) => void;
}

/**
 * Interface for fight dropdown options
 */
interface FightOption {
  label: string;
  value: string;
  disabled?: boolean;
}

/**
 * Component for selecting a fight from a report
 */
export const FightSelector: React.FC<FightSelectorProps> = ({
  config,
  report,
  onFightSelected,
}) => {
  const [selectedFightId, setSelectedFightId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Process fights list using useMemo instead of useEffect
  const fights = useMemo(() => {
    if (!report) {
      return [];
    }

    // Process fights from the report
    const fightsArray = Object.values(report.fights);
    fightsArray.sort((a, b) => encounterSort(a) - encounterSort(b));

    const options: FightOption[] = [];
    let lastEncounterId = 0;

    fightsArray.forEach((fight) => {
      if (encounterSort(fight) >= TRASH_ID && lastEncounterId < TRASH_ID) {
        options.push({
          label: "--- TRASH ---",
          value: "",
          disabled: true,
        });
      }

      options.push({
        label: `${fight.name} - ${fight.id}`,
        value: `${report.reportId};${fight.id}`,
      });

      lastEncounterId = encounterSort(fight);
    });

    return options;
  }, [report]);

  const handleFightChange = async (value: string) => {
    if (!report || !value) return;

    setSelectedFightId(value);
    const [reportId, fightId] = value.split(";");
    const selectedFight = report.fights[fightId];

    try {
      setLoading(true);
      enableInput(false);
      await selectedFight.fetch();
      selectedFight.process();
      onFightSelected(selectedFight);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      enableInput(true);
    }
  };

  return (
    <div className="fight-selector">
      <Dropdown
        id="fightSelect"
        value={selectedFightId}
        options={fights}
        onChange={(e) => handleFightChange(e.value)}
        disabled={!report || loading}
        placeholder="Select a fight"
        className="w-full"
      />
    </div>
  );
};

/**
 * Helper function to determine the encounter sort order
 * @param param0 Object with encounter and id properties
 * @returns Sort value
 */
const TRASH_ID = 9999999;
function encounterSort({
  encounter,
  id,
}: {
  encounter: number;
  id: string | number;
}): number {
  return encounter === 0 ? TRASH_ID + Number(id) : encounter + Number(id);
}
