import { useMemo } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Player, ThreatTrace } from "../../era/threat/unit.js";
import { GameVersionConfig, Talent } from "../../era/base";
import { ColorSelector } from "./ColorSelector";
import { Card } from "primereact/card";

import styles from "./ThreatTable.module.css";
import { InputText } from "primereact/inputtext";
import { classColors } from "../../era/colors.js";
import { SetUnitSettings, UnitSettings } from "./hooks/useUnitSettings.js";

/**
 * Props for the ThreatTable component
 */
export interface ThreatTableProps {
  config: GameVersionConfig;
  trace: ThreatTrace<Player> | null;
  plotRange: [number, number];
  unitSettings?: UnitSettings;
  setUnitSettings: SetUnitSettings;
}

/**
 * Component for displaying the threat table, buff table, and talent table
 */
export const ThreatTable: React.FC<ThreatTableProps> = ({
  config,
  trace,
  plotRange,
  unitSettings = {} as UnitSettings,
  setUnitSettings,
}) => {
  // Get the current plot range from props
  const rangeWidth = plotRange[1] - plotRange[0];

  // Process threat data using useMemo instead of useEffect
  const threatBySkill = useMemo<Record<string, number>>(() => {
    if (!trace) {
      return {};
    }

    // Get threat by skill for the current range
    return trace.threatBySkill(plotRange);
  }, [trace, plotRange]);

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
    setUnitSettings("color", color);
  };

  const talents: Record<string, Talent> =
    config.talents[trace.target.type] ?? {};
  const talentSettings = unitSettings?.talents ?? {};

  const buffSettings = unitSettings?.buffs ?? {};

  type TalentTableData = { talentName: string; talent: Talent };

  const talentDataTable = Object.entries(talents).map<TalentTableData>(
    ([talentName, talent]) => ({
      talentName,
      talent,
    })
  );

  const buffDataTable = Object.entries(trace.target.initialBuffs ?? {}).map(
    ([buffId, status]) => {
      const buffIdNum = parseInt(buffId);
      const mult = config.buffMultipliers[buffIdNum];
      let coefficient = 1.0;
      if (typeof mult === "function") {
        coefficient = mult(trace.target.spellSchool);
      }
      const buffName = config.buffNames[buffIdNum] || buffId;
      return {
        buffId,
        buffName,
        coefficient,
        initialValue: status,
      };
    }
  );

  const setTalentRank = (name: string, rank: number): void => {
    setUnitSettings("talents", name, rank);
  };

  const setBuffOverride = (buffId: string, status: number): void => {
    setUnitSettings("buffs", buffId, status);
  };

  return (
    <Card id="threatTableContainer">
      {/* Target info and color selector */}
      <div>
        <ColorSelector
          onChange={handleColorChange}
          value={
            unitSettings?.color ?? classColors[trace.target.type] ?? "#ffffff"
          }
        />
        {trace.target.name} - Started fight with threat coeff{" "}
        {trace.target.initialCoeff.toFixed(4)}
      </div>

      {/* Threat table */}
      <div className={styles.mainThreatTable}>
        <DataTable showGridlines size="small" value={tableData}>
          <Column field="name" header="Ability" />
          <Column field="threat" header="Threat (*)" align="right" />
          <Column
            field="threatPerSecond"
            header={`Per ${rangeWidth.toFixed(2)} seconds`}
            align="right"
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
              header="On/off at start"
              body={(rowData) => (
                <select
                  value={buffSettings[rowData.buffId] ?? rowData.initialValue}
                  onChange={(e) =>
                    setBuffOverride(rowData.buffId, parseInt(e.target.value))
                  }
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
              body={({ talentName, talent }: TalentTableData) => (
                <>
                  <InputText
                    size="small"
                    type="number"
                    min="0"
                    max={talent.maxRank}
                    value={
                      "" +
                      (talentSettings[talentName] ??
                        talent.rank ??
                        talent.maxRank)
                    }
                    className="talent"
                    onChange={(e) =>
                      setTalentRank(talentName, parseInt(e.target.value))
                    }
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
