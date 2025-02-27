import React, { useEffect, useMemo } from "react";
import { Fight } from "../../era/threat/fight.js";
import { NPC } from "../../era/threat/unit.js";
import { Dropdown } from "primereact/dropdown";

/**
 * Props for the EnemySelector component
 */
export interface EnemySelectorProps {
  fight: Fight | undefined;
  value: number | undefined;
  onChange: (enemyId: number) => void;
  disabled: boolean;
}

/**
 * Component for selecting an enemy from a fight
 */
export const EnemySelector: React.FC<EnemySelectorProps> = ({
  fight,
  value,
  onChange,
  disabled,
}) => {
  const sortedEnemies = useMemo(() => {
    if (!fight) {
      return [];
    }

    return Object.values(fight.enemies)
      .sort(byTypeThenName)
      .map((enemy) => ({
        label: `${enemy.name} - ${enemy.key}`,
        value: Number(enemy.key),
      }));
  }, [fight]);

  useEffect(() => {
    if (value === undefined && sortedEnemies.length > 0) {
      onChange(Number(sortedEnemies[0].value));
    }
  }, [value, sortedEnemies, onChange]);

  return (
    <>
      <label htmlFor="enemySelect">Enemy:</label>
      <Dropdown
        inputId="enemySelect"
        value={value}
        options={sortedEnemies}
        onChange={(e) => onChange(Number(e.value))}
        disabled={disabled}
        placeholder="Select an enemy"
      />
    </>
  );
};

/**
 * Helper function to sort enemies by type then name
 */
const byTypeThenName = (a: NPC, b: NPC) => {
  const typeA = String(a.type);
  const typeB = String(b.type);
  if (typeA !== typeB) {
    return typeA.localeCompare(typeB);
  }
  return a.name.localeCompare(b.name);
};
