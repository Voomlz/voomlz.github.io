import React, { useState, useEffect } from "react";
import { ThreatTrace, Unit } from "../../../era/threat/unit.js";
import { GameVersionConfig } from "../../../era/base";
import ColorSelector from "./ColorSelector";

/**
 * Props for the ThreatTable component
 */
export interface ThreatTableProps {
  config: GameVersionConfig;
  trace: ThreatTrace;
}

/**
 * Component for displaying the threat table, buff table, and talent table
 */
const ThreatTable: React.FC<ThreatTableProps> = ({ config, trace }) => {
  const [plotXRange, setPlotXRange] = useState<[number, number]>([0, 0]);
  const [threatBySkill, setThreatBySkill] = useState<Record<string, number>>(
    {}
  );
  const [rangeWidth, setRangeWidth] = useState<number>(0);

  // Update threat data when the trace or plot range changes
  useEffect(() => {
    if (!trace) return;

    // Get the current plot range from the global state or use a default
    // This would normally be passed from the parent component
    const currentRange = window.plotXRange || [0, 100];
    setPlotXRange(currentRange);

    const width = currentRange[1] - currentRange[0];
    setRangeWidth(width);

    // Get threat by skill for the current range
    const threatData = trace.threatBySkill(currentRange);
    setThreatBySkill(threatData);
  }, [trace]);

  if (!trace) {
    return <div>No target selected</div>;
  }

  const sortedSkills = Object.keys(threatBySkill).sort(
    (a, b) => threatBySkill[b] - threatBySkill[a]
  );

  const totalThreat = Object.values(threatBySkill).reduce(
    (sum, val) => sum + val,
    0
  );

  // Handler for color change
  const handleColorChange = (color: string) => {
    if (trace?.target?.global) {
      trace.target.global.color = color;
      // Trigger redraw in parent component (this would normally be via props)
      if (typeof window.recolorPlot === "function") {
        window.recolorPlot();
      }
    }
  };

  // Get the initial color for ColorSelector
  const getInitialColor = () => {
    // This would normally come from state in the parent
    if (trace?.target?.global?.color) {
      return trace.target.global.color;
    }

    // Find color from plotData
    if (window.plotData) {
      for (const plot of window.plotData) {
        if (plot.unitKey === trace.target.key) {
          return plot.marker.color || "#ffffff";
        }
      }
    }

    return "#ffffff";
  };

  return (
    <div id="threatTableContainer">
      {/* Target info and color selector */}
      <div>
        {trace.target.name} - Started fight with threat coeff{" "}
        {trace.target.initialCoeff.toFixed(4)}
        {trace.target.global && (
          <ColorSelector
            target={trace.target}
            onColorChange={handleColorChange}
            initialColor={getInitialColor()}
          />
        )}
      </div>

      {/* Threat table */}
      <table>
        <thead>
          <tr>
            <th>Ability</th>
            <th title="Over the currently zoomed x range.">Threat (*)</th>
            <th>Per {rangeWidth.toFixed(2)} seconds</th>
          </tr>
        </thead>
        <tbody>
          {sortedSkills.map((skill) => (
            <tr key={skill}>
              <td>{skill}</td>
              <td align="right">{threatBySkill[skill].toFixed(2)}</td>
              <td align="right">
                {(threatBySkill[skill] / rangeWidth).toFixed(2)}
              </td>
            </tr>
          ))}
          <tr>
            <td>Total</td>
            <td align="right">{totalThreat.toFixed(2)}</td>
            <td align="right">{(totalThreat / rangeWidth).toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      {/* Buff table */}
      {trace.target.global && (
        <table>
          <thead>
            <tr>
              <th>Buff</th>
              <th title="Fetch fight again to recompute">
                On/off at start (*)
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(trace.target.global.initialBuffs).map(
              ([buffId, status]) => {
                const coefficient =
                  typeof config.buffMultipliers[buffId] === "function"
                    ? config.buffMultipliers[buffId](trace.target.spellSchool)
                    : "";

                return (
                  <tr key={buffId}>
                    <td>
                      {config.buffNames[buffId]} {coefficient}
                    </td>
                    <td>
                      <select
                        value={status}
                        onChange={(e) => {
                          trace.target.global.initialBuffs[buffId] = parseInt(
                            e.target.value
                          );
                        }}
                      >
                        <option value="0">Infer</option>
                        <option value="1">On</option>
                        <option value="2">Off</option>
                        <option value="3">Inferred on</option>
                        <option value="4">Inferred off</option>
                      </select>
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      )}

      {/* Talent table */}
      {trace.target.global && (
        <table>
          <thead>
            <tr>
              <th>Talent name</th>
              <th title="Fetch fight again to recompute">Rank (*)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(trace.target.global.talents).map(
              ([talentName, talent]) => (
                <tr key={talentName}>
                  <td>{talentName}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      max={talent.maxRank}
                      value={talent.rank}
                      className="talent"
                      onChange={(e) => {
                        talent.rank = parseInt(e.target.value);
                      }}
                    />
                    {` / ${talent.maxRank}`}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

// Add window global types
declare global {
  interface Window {
    plotXRange: [number, number];
    recolorPlot: () => void;
    plotData: any[];
  }
}

export default ThreatTable;
