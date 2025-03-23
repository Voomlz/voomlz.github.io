import React, { useMemo } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ThreatTrace } from "../../era/threat/unit.js";
import { GameVersionConfig, SpellMap } from "../../era/base";
import { ColorSelector } from "./ColorSelector";
import { Card } from "primereact/card";

import styles from "./ThreatTable.module.css";
import { InputText } from "primereact/inputtext";

/**
 * Interface for threat data calculations
 */
interface ThreatData {
  threatBySkill: Record<string, number>;
  rangeWidth: number;
}

/**
 * Extended version of GameVersionConfig with additional properties
 */
export interface ExtendedGameVersionConfig extends GameVersionConfig {
  buffMultipliers: Record<string, (spellSchool?: string) => number>;
  buffNames: Record<string, string>;
  spells: SpellMap<string>;
}

/**
 * Props for the ThreatTable component
 */
export interface ThreatTableProps {
  config: GameVersionConfig;
  trace: ThreatTrace | null;
  plotRange: [number, number];
}

/**
 * Component for displaying the threat table, buff table, and talent table
 */
export const ThreatTable: React.FC<ThreatTableProps> = ({
  config,
  trace,
  plotRange,
}) => {
  // Get the current plot range from props
  const width = plotRange[1] - plotRange[0];

  // Process threat data using useMemo instead of useEffect
  const { threatBySkill, rangeWidth } = useMemo<ThreatData>(() => {
    if (!trace) {
      return { threatBySkill: {}, rangeWidth: 0 };
    }

    // Get threat by skill for the current range
    const threatData = trace.threatBySkill(plotRange);
    return {
      threatBySkill: threatData,
      rangeWidth: width,
    };
  }, [trace, plotRange, width]);

  const tableData = useMemo(() => {
    const sortedSkills = Object.keys(threatBySkill).sort(
      (a, b) => threatBySkill[b] - threatBySkill[a]
    );

    const totalThreat = Object.values(threatBySkill).reduce(
      (sum: number, val: number) => sum + val,
      0
    );

    return sortedSkills
      .map((name) => ({
        name,
        threat: threatBySkill[name].toFixed(2),
        threatPerSecond: (threatBySkill[name] / rangeWidth).toFixed(2),
      }))
      .concat({
        name: "Total",
        threat: totalThreat.toFixed(2),
        threatPerSecond: (totalThreat / rangeWidth).toFixed(2),
      });
  }, [rangeWidth, threatBySkill]);

  if (!trace) {
    return <div>No target selected</div>;
  }

  // Handler for color change
  const handleColorChange = (color: string) => {
    if (trace?.target?.global) {
      trace.target.global.color = color;
      // Trigger redraw in parent component
      if (typeof window.recolorPlot === "function") {
        window.recolorPlot();
      }
    }
  };

  // Get the initial color for ColorSelector
  const getInitialColor = () => {
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

  const talentDataTable = trace.target.global
    ? Object.entries(trace.target.global.talents).map(
        ([talentName, talent]) => ({
          talentName,
          talent,
        })
      )
    : undefined;

  const buffDataTable = Object.entries(trace.target.global.initialBuffs).map(
    ([buffId, status]) => {
      const buffIdNum = parseInt(buffId);
      const coefficient = config.buffMultipliers[buffIdNum]?.(
        trace.target.spellSchool
      );
      const buffName = config.buffNames[buffIdNum] || buffId;
      return {
        buffId,
        buffName,
        coefficient,
        status,
      };
    }
  );
  return (
    <Card id="threatTableContainer">
      {/* Target info and color selector */}
      <div>
        {trace.target.global && (
          <ColorSelector
            target={trace.target}
            onColorChange={handleColorChange}
            initialColor={getInitialColor()}
          />
        )}
        {trace.target.name} - Started fight with threat coeff{" "}
        {trace.target.initialCoeff.toFixed(4)}
      </div>

      {/* Threat table */}
      <div className={styles.mainThreatTable}>
        <DataTable showGridlines size="small" value={tableData}>
          <Column field="name" header="Ability" />
          <Column field="threat" header="Threat (*)" />
          <Column
            field="threatPerSecond"
            header={`Per ${rangeWidth.toFixed(2)} seconds`}
          />
        </DataTable>
      </div>

      <div className={styles.fiftyFifty}>
        {/* Buff table */}
        {buffDataTable && (
          <DataTable showGridlines size="small" value={buffDataTable}>
            <Column
              field="buffName"
              header="Buff"
              body={(rowData) => (
                <span>
                  {rowData.buffName} {rowData.coefficient}
                </span>
              )}
            />
            <Column
              field="status"
              header="On/off at start (*)"
              headerTooltip="Fetch fight again to recompute"
              body={(rowData) => (
                <select
                  value={rowData.status}
                  onChange={(e) => {
                    if (trace.target.global) {
                      trace.target.global.initialBuffs[rowData.buffId] =
                        parseInt(e.target.value);
                    }
                  }}
                >
                  <option value="0">Infer</option>
                  <option value="1">On</option>
                  <option value="2">Off</option>
                  <option value="3">Inferred on</option>
                  <option value="4">Inferred off</option>
                </select>
              )}
            />
          </DataTable>
        )}

        {/* Talent table */}
        {talentDataTable && (
          <DataTable showGridlines size="small" value={talentDataTable}>
            <Column field="talentName" header="Talent name" />
            <Column
              field="talentRank"
              header="Rank (*)"
              body={({ talent }) => (
                <>
                  {/* TODO: doesn't update state */}
                  <InputText
                    size="small"
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
                </>
              )}
            />
          </DataTable>
        )}
      </div>
    </Card>
  );
};

// Add window global types
declare global {
  interface Window {
    recolorPlot: () => void;
    plotData: any[];
  }
}
