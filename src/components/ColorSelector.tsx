import React from "react";

/**
 * Props for the ColorSelector component
 */
export interface ColorSelectorProps {
  onChange: (color: string) => void;
  value: string;
}

/**
 * Component for selecting a color for a threat trace
 */
export const ColorSelector: React.FC<ColorSelectorProps> = ({
  onChange,
  value,
}) => {
  return (
    <input
      type="color"
      title="Change trace color"
      className="colorPicker"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};
