import React from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

/**
 * Props for the ReportSelector component
 */
export interface ReportInputProps {
  value: string;
  disabled: boolean;
  onLoadClicked: () => void;
  onChange: (url: string) => void;
}

/**
 * Component for selecting a Warcraft Logs report
 */
export const ReportInput: React.FC<ReportInputProps> = ({
  value,
  disabled,
  onLoadClicked,
  onChange,
}) => {
  return (
    <>
      <label htmlFor="reportSelect">Report:</label>
      <div className="p-inputgroup flex-1">
        <InputText
          id="reportSelect"
          placeholder="Warcraft Logs report URL"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
        <Button
          label="Load Report"
          onClick={onLoadClicked}
          icon="pi pi-search"
          disabled={disabled}
        />
      </div>
    </>
  );
};
