import React, { useState, useRef } from "react";
import { Report } from "../../../era/threat/report.js";
import { enableInput, printError } from "./utils";
import { GameVersionConfig } from "../../../era/base";

/**
 * Props for the ReportSelector component
 */
export interface ReportSelectorProps {
  config: GameVersionConfig;
  onReportSelected: (report: Report) => void;
}

/**
 * Component for selecting a Warcraft Logs report
 */
const ReportSelector: React.FC<ReportSelectorProps> = ({
  config,
  onReportSelected,
}) => {
  const [reportId, setReportId] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reports cache
  const reports: Record<string, Report> = {};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReportId(e.target.value);
    setError(false);
  };

  const handleSubmit = async () => {
    let id = reportId;
    const urlmatch = id.match(
      /https:\/\/(?:[a-z]+\.)?(?:classic\.|www\.)?warcraftlogs\.com\/reports\/((?:a:)?\w+)/
    );

    if (urlmatch) {
      id = urlmatch[1];
    }

    if (!id || (id.length !== 16 && id.length !== 18)) {
      setError(true);
      return;
    }

    if (!(id in reports)) {
      reports[id] = new Report(config, id);
    }

    try {
      enableInput(false);
      await reports[id].fetch();
      onReportSelected(reports[id]);
      enableInput(true);
    } catch (e) {
      printError(e);
    }
  };

  return (
    <div className="report-selector">
      <input
        ref={inputRef}
        id="reportSelect"
        type="text"
        placeholder="Warcraft Logs report ID or URL"
        value={reportId}
        onChange={handleChange}
        style={{ borderColor: error ? "red" : undefined }}
      />
      <button onClick={handleSubmit}>Load Report</button>
    </div>
  );
};

export default ReportSelector;
