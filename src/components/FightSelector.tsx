import React, { useEffect, useMemo } from "react";
import { Report } from "../../era/threat/report.js";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { SelectItem } from "primereact/selectitem";

/**
 * Props for the FightSelector component
 */
export interface FightSelectorProps {
  report: Report | undefined;
  value: number | undefined;
  disabled: boolean;
  onChange: (fightId: number) => void;
  onLoadFight: () => void;
}

/**
 * Component for selecting a fight from a report
 */
export const FightSelector: React.FC<FightSelectorProps> = ({
  report,
  value,
  disabled,
  onChange,
  onLoadFight,
}) => {
  // Process fights list using useMemo instead of useEffect
  const sortedFights = useMemo(() => {
    if (!report) {
      return [];
    }

    // Process fights from the report
    const fightsArray = Object.values(report.fights);
    fightsArray.sort((a, b) => encounterSort(a) - encounterSort(b));

    const options: SelectItem[] = [];
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
        value: fight.id,
      });

      lastEncounterId = encounterSort(fight);
    });

    return options;
  }, [report]);

  // Auto select the first fight if nothing was selected
  useEffect(() => {
    if (value === undefined && sortedFights.length > 0) {
      onChange(Number(sortedFights[0].value));
    }
  }, [value, sortedFights, onChange]);

  return (
    <>
      <label htmlFor="fightSelect">Fight:</label>
      <div className="p-inputgroup flex-1">
        <Dropdown
          inputId="fightSelect"
          value={value}
          options={sortedFights}
          onChange={(e) => onChange(Number(e.value))}
          disabled={!report || disabled}
          placeholder="Select a fight"
        />
        <Button
          label="Fetch/Refresh"
          onClick={onLoadFight}
          disabled={disabled}
        />
      </div>
    </>
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
