import React, { useEffect, useState } from "react";
// Remove import from types
// import { TargetSelectorProps } from "./types";
import { NPC, ThreatTrace } from "../../../era/threat/unit.js";
import { GameVersionConfig } from "../../../era/base";

/**
 * Props for the TargetSelector component
 */
export interface TargetSelectorProps {
  config: GameVersionConfig;
  enemy: NPC | null;
  onTargetSelected: (trace: ThreatTrace) => void;
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
  const [targets, setTargets] = useState<{ key: string; name: string }[]>([]);

  // Update targets list when enemy changes
  useEffect(() => {
    if (!enemy) {
      setTargets([]);
      return;
    }

    const sortedTargets = Object.keys(enemy.threat)
      .map((k) => ({
        key: k,
        name: enemy.threat[k].target.name,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    setTargets(sortedTargets);
  }, [enemy]);

  const handleTargetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!enemy) return;

    const value = e.target.value;
    setSelectedTargetKey(value);

    if (!value) return;

    const [reportId, fightId, enemyId, targetId] = value.split(";");
    const threatTrace = enemy.threat[targetId];

    onTargetSelected(threatTrace);
  };

  return (
    <div className="target-selector">
      <select
        id="targetSelect"
        value={selectedTargetKey}
        onChange={handleTargetChange}
        disabled={!enemy}
      >
        <option value="">Select a target</option>
        {targets.map((target) => (
          <option
            key={target.key}
            value={
              enemy?.fight.reportId && enemy?.fight.id && enemy?.key
                ? `${enemy.fight.reportId};${enemy.fight.id};${enemy.key};${target.key}`
                : ""
            }
          >
            {target.name} - {target.key}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TargetSelector;
