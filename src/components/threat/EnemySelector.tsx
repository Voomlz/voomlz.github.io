import React, { useEffect, useMemo, useState } from "react";
// Remove import from types
// import { EnemySelectorProps } from "./types";
import { Fight } from "../../../era/threat/fight.js";
import { NPC } from "../../../era/threat/unit.js";
import { Dropdown } from "primereact/dropdown";

/**
 * Props for the EnemySelector component
 */
export interface EnemySelectorProps {
  fight: Fight | null;
  onEnemySelected: (enemy: NPC) => void;
}

/**
 * Component for selecting an enemy from a fight
 */
const EnemySelector: React.FC<EnemySelectorProps> = ({
  fight,
  onEnemySelected,
}) => {
  const [selectedEnemyKey, setSelectedEnemyKey] = useState<string>("");

  // Memoize enemies list based on fight changes
  const sortedEnemies = useMemo(() => {
    if (!fight) {
      return [];
    }

    return Object.values(fight.enemies)
      .sort(byTypeThenName)
      .map((enemy) => ({
        label: `${enemy.name} - ${enemy.key}`,
        value: `${fight.reportId};${fight.id};${enemy.key}`,
      }));
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
        options={sortedEnemies}
        onChange={(e) => handleEnemyChange(e.value)}
        disabled={!fight}
        placeholder="Select an enemy"
        className="w-full"
      />
    </div>
  );
};

export default EnemySelector;

function byTypeThenName(a: NPC, b: NPC): number {
  // Ensure proper type comparison by converting to string
  const typeA = String(a.type);
  const typeB = String(b.type);
  return typeA.localeCompare(typeB) || a.name.localeCompare(b.name);
}
