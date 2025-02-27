import React from "react";
// Remove import from types
// import { CheckboxProps } from "./types";

/**
 * Props for the Checkbox component
 */
export interface CheckboxProps {
  checked: boolean;
  text: string | null;
  onChange: (checked: boolean) => void;
}

/**
 * Simple checkbox component with label
 */
const Checkbox: React.FC<CheckboxProps> = ({ checked, text, onChange }) => {
  return (
    <div className="checkbox-container">
      <input
        type="checkbox"
        className="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {text && <label>{text}</label>}
    </div>
  );
};

export default Checkbox;
