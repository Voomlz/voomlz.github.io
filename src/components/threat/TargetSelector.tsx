import React, { useMemo, useState } from "react";
// Remove import from types
// import { TargetSelectorProps } from "./types";
import { NPC } from "../../../era/threat/unit.js";
import { ThreatTrace } from "../../../era/threat/unit.js";
import { GameVersionConfig } from "../../../era/base";
import { Dropdown } from "primereact/dropdown";

/**
 * Props for the TargetSelector component
 */
export interface TargetSelectorProps {
  config: GameVersionConfig;
  enemy: NPC | null;
  onTargetSelected: (threatTrace: ThreatTrace) => void;
}

interface TargetOption {
  label: string;
  value: string;
}

/**
 * Component for selecting a target (player) from an enemy's threat table
 */
const TargetSelector: React.FC<TargetSelectorProps> = ({
  config,
  enemy,
  onTargetSelected,
}) => {
  const [selectedTargetKey, setSelectedTargetKey] = useState<string>("");

  // Process targets list using useMemo instead of useEffect
  const sortedTargets = useMemo(() => {
    if (!enemy) {
      return [];
    }

    return Object.keys(enemy.threat)
      .map((k) => ({
        label: `${enemy.threat[k].target.name} - ${k}`,
        value:
          enemy?.fight.reportId && enemy?.fight.id && enemy?.key
            ? `${enemy.fight.reportId};${enemy.fight.id};${enemy.key};${k}`
            : "",
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [enemy]);

  const handleTargetChange = (value: string) => {
    if (!enemy || !value) return;

    setSelectedTargetKey(value);
    const [reportId, fightId, enemyId, targetId] = value.split(";");
    const threatTrace = enemy.threat[targetId];

    onTargetSelected(threatTrace);
  };

  return (
    <div className="target-selector">
      <Dropdown
        id="targetSelect"
        value={selectedTargetKey}
        options={sortedTargets}
        onChange={(e) => handleTargetChange(e.value)}
        disabled={!enemy}
        placeholder="Select a target"
        className="w-full"
      />
    </div>
  );
};

export default TargetSelector;
