import React, { useEffect, useMemo } from "react";
import { Dropdown } from "primereact/dropdown";
import { Fight } from "../../era/threat/fight.js";

/**
 * Props for the TargetSelector component
 */
export interface TargetSelectorProps {
  fight: Fight | undefined;
  enemyId: number | undefined;
  value: number | undefined;
  onChange: (targetId: number) => void;
  disabled: boolean;
}

/**
 * Component for selecting a target (player) from an enemy's threat table
 */
export const TargetSelector: React.FC<TargetSelectorProps> = ({
  fight,
  enemyId,
  value,
  onChange,
  disabled,
}) => {
  const sortedTargets = useMemo(() => {
    if (!fight || !enemyId) {
      return [];
    }

    const enemy = fight.enemies[enemyId];

    if (!enemy) {
      return [];
    }

    return Object.entries(enemy.threat)
      .map(([k, v]) => ({
        label: `${v.target.name} - ${k}`,
        value: Number(k),
        isPet: v.target.type === "Pet",
      }))
      .sort(byPlayersThenName);
  }, [enemyId, fight]);

  useEffect(() => {
    if (value === undefined && sortedTargets.length > 0) {
      onChange(Number(sortedTargets[0].value));
    }
  }, [value, sortedTargets, onChange]);

  return (
    <>
      <label htmlFor="targetSelect">Target:</label>
      <Dropdown
        inputId="targetSelect"
        options={sortedTargets}
        value={value}
        onChange={(e) => onChange(Number(e.value))}
        disabled={disabled}
        placeholder="Select a target"
      />
    </>
  );
};

const byPlayersThenName = (
  a: { label: string; isPet: boolean },
  b: { label: string; isPet: boolean }
): number => {
  return Number(a.isPet) - Number(b.isPet) || a.label.localeCompare(b.label);
};
