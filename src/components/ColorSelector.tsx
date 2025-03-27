import React from "react";
import { Unit } from "../../era/threat/unit.js";

/**
 * Props for the ColorSelector component
 */
export interface ColorSelectorProps {
  target: Unit;
  onColorChange: (color: string) => void;
  initialColor: string;
}

/**
 * Component for selecting a color for a threat trace
 */
export const ColorSelector: React.FC<ColorSelectorProps> = ({
  target,
  onColorChange,
  initialColor,
}) => {
  return (
    <input
      type="color"
      title="Change trace color"
      className="colorPicker"
      defaultValue={initialColor}
      onChange={(e) => onColorChange(e.target.value)}
    />
  );
};
