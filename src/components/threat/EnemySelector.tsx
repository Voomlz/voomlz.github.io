import React, { useEffect, useState } from "react";
// Remove import from types
// import { EnemySelectorProps } from "./types";
import { Fight } from "../../../era/threat/fight.js";
import { NPC } from "../../../era/threat/unit.js";
import { GameVersionConfig } from "../../../era/base";

/**
 * Props for the EnemySelector component
 */
export interface EnemySelectorProps {
  config: GameVersionConfig;
  fight: Fight | null;
  onEnemySelected: (enemy: NPC) => void;
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
  const [enemies, setEnemies] = useState<NPC[]>([]);

  // Update enemies list when fight changes
  useEffect(() => {
    if (!fight) {
      setEnemies([]);
      return;
    }

    const sortedEnemies = Object.values(fight.enemies).sort((a, b) => {
      // Ensure proper type comparison by converting to string
      const typeA = String(a.type);
      const typeB = String(b.type);
      return typeA.localeCompare(typeB) || a.name.localeCompare(b.name);
    });

    setEnemies(sortedEnemies);
  }, [fight]);

  const handleEnemyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!fight) return;

    const value = e.target.value;
    setSelectedEnemyKey(value);

    if (!value) return;

    const [reportId, fightId, enemyId] = value.split(";");
    const selectedEnemy = fight.enemies[enemyId];

    onEnemySelected(selectedEnemy);
  };

  return (
    <div className="enemy-selector">
      <select
        id="enemySelect"
        value={selectedEnemyKey}
        onChange={handleEnemyChange}
        disabled={!fight}
      >
        <option value="">Select an enemy</option>
        {enemies.map((enemy) => (
          <option
            key={enemy.key}
            value={`${fight?.reportId};${fight?.id};${enemy.key}`}
          >
            {enemy.name} - {enemy.key}
          </option>
        ))}
      </select>
    </div>
  );
};

export default EnemySelector;
