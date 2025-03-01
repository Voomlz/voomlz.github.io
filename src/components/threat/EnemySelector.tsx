import React, { useEffect, useState } from "react";
// Remove import from types
// import { EnemySelectorProps } from "./types";
import { Fight } from "../../../era/threat/fight.js";
import { NPC } from "../../../era/threat/unit.js";
import { GameVersionConfig } from "../../../era/base";
import { Dropdown } from "primereact/dropdown";

/**
 * Props for the EnemySelector component
 */
export interface EnemySelectorProps {
  config: GameVersionConfig;
  fight: Fight | null;
  onEnemySelected: (enemy: NPC) => void;
}

interface EnemyOption {
  label: string;
  value: string;
}

/**
 * Component for selecting an enemy from a fight
 */
const EnemySelector: React.FC<EnemySelectorProps> = ({
  config,
  fight,
  onEnemySelected,
}) => {
  const [selectedEnemyKey, setSelectedEnemyKey] = useState<string>("");
  const [enemies, setEnemies] = useState<EnemyOption[]>([]);

  // Update enemies list when fight changes
  useEffect(() => {
    if (!fight) {
      setEnemies([]);
      return;
    }

    const sortedEnemies = Object.values(fight.enemies)
      .sort((a, b) => {
        // Ensure proper type comparison by converting to string
        const typeA = String(a.type);
        const typeB = String(b.type);
        return typeA.localeCompare(typeB) || a.name.localeCompare(b.name);
      })
      .map((enemy) => ({
        label: `${enemy.name} - ${enemy.key}`,
        value: `${fight.reportId};${fight.id};${enemy.key}`,
      }));

    setEnemies(sortedEnemies);
  }, [fight]);

  const handleEnemyChange = (value: string) => {
    if (!fight || !value) return;

    setSelectedEnemyKey(value);
    const [reportId, fightId, enemyId] = value.split(";");
    const selectedEnemy = fight.enemies[enemyId];

    onEnemySelected(selectedEnemy);
  };

  return (
    <div className="enemy-selector">
      <Dropdown
        id="enemySelect"
        value={selectedEnemyKey}
        options={enemies}
        onChange={(e) => handleEnemyChange(e.value)}
        disabled={!fight}
        placeholder="Select an enemy"
        className="w-full"
      />
    </div>
  );
};

export default EnemySelector;
