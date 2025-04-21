import { useState, useEffect, useMemo } from "react";
import Plot from "react-plotly.js";
import { Fight } from "../../era/threat/fight.js";
import { NPC, Player } from "../../era/threat/unit.js";
import { CoefficientDebug, GameVersionConfig } from "../../era/base";
import { classColors, getColor } from "../../era/colors.js";
import { Checkbox } from "primereact/checkbox";
import { Config, Layout, PlotData } from "plotly.js";

import styles from "./ThreatPlot.module.css";
import { Card } from "primereact/card";
import { SetGlobalSetting, ThreatSettings } from "./hooks/useUnitSettings.js";

/**
 * Props for the ThreatPlot component
 */
export interface ThreatPlotProps {
  config: GameVersionConfig;
  reportId: string;
  fight: Fight;
  enemy: NPC;
  plotRange: [number, number];
  setPlotRange: (plotWindow: [number, number]) => void;
  onTargetClicked: (target: string) => void;
  threatSettings: ThreatSettings;
  setGlobalSetting: SetGlobalSetting;
}

const PLOTLY_CONFIG: Partial<Config> = { responsive: true };

/**
 * Component for displaying the threat plot
 */
export const ThreatPlot: React.FC<ThreatPlotProps> = ({
  config,
  reportId,
  fight,
  enemy,
  plotRange,
  setPlotRange,
  onTargetClicked,
  threatSettings,
  setGlobalSetting,
}) => {
  const [colorByClass, setColorByClass] = useState(true);
  const [debugCoefficients, setDebugCoefficients] = useState(
    localStorage.getItem("debugCoefficients") === "true"
  );

  const title = enemy ? `Threat - ${enemy.name}` : undefined;

  // Generate plot data when the enemy changes
  const plotData = useMemo(
    () =>
      getPlotData({
        enemy,
        debugCoefficients,
        config,
        colorByClass,
        threatSettings,
      }),
    [colorByClass, config, debugCoefficients, enemy, threatSettings]
  );

  useEffect(() => {
    if (!enemy) return;

    setPlotRange([0, (fight.end - fight.start) / 1000]);
  }, [enemy, fight.end, fight.start, setPlotRange]);

  const handleColorByClassChange = (checked: boolean) => {
    setColorByClass(checked);
  };

  const handleDebugCoefficientsChange = (checked: boolean) => {
    setDebugCoefficients(checked);
    localStorage.setItem("debugCoefficients", JSON.stringify(checked));
  };

  const handlePlotClick = (event: Plotly.PlotMouseEvent) => {
    if (!event.points || event.points.length === 0) return;

    const point = event.points[0];
    const unitKey = (point.data as CustomData).unitKey;

    if (unitKey) {
      onTargetClicked(`${reportId};${fight.id};${enemy.key};${unitKey}`);
    }
  };

  const layout: Partial<Layout> = useMemo(
    () => ({
      title: {
        text: title,
        font: { color: "#fff" },
      },
      xaxis: {
        title: "Time (s)",
        titlefont: { color: "#fff" },
        tickcolor: "#666",
        tickfont: { color: "#fff" },
        rangemode: "tozero",
        gridcolor: "#666",
        linecolor: "#999",
        range: plotRange,
      },
      yaxis: {
        title: "Threat",
        titlefont: { color: "#fff" },
        tickcolor: "#666",
        tickfont: { color: "#fff" },
        rangemode: "tozero",
        gridcolor: "#666",
        linecolor: "#999",
      },
      hovermode: "closest",
      plot_bgcolor: "#161d21",
      paper_bgcolor: "#161d21",
      legend: { font: { color: "#fff" } },
      autosize: true,
    }),
    [title, plotRange]
  );

  return (
    <Card className={styles.threatPlot}>
      <div className={styles.content}>
        <Plot
          data={plotData}
          layout={layout}
          config={PLOTLY_CONFIG}
          onClick={handlePlotClick}
          className={styles.plot}
        />

        <div className={styles.plotControls}>
          <div className="flex align-items-center">
            <Checkbox
              checked={colorByClass}
              onChange={(e) => handleColorByClassChange(e.checked === true)}
              inputId="colorByClass"
            />
            <label htmlFor="colorByClass" className="ml-2">
              Color by class
            </label>
          </div>

          <div className="flex align-items-center">
            <Checkbox
              checked={debugCoefficients}
              onChange={(e) =>
                handleDebugCoefficientsChange(e.checked === true)
              }
              inputId="debugCoefficients"
            />
            <label htmlFor="debugCoefficients" className="ml-2">
              Display detailed coefficients
            </label>
          </div>

          {fight.faction === "Horde" && (
            <div className="flex align-items-center">
              <Checkbox
                checked={fight.tranquilAir}
                onChange={(e) =>
                  setGlobalSetting("tranquilAir", e.checked === true)
                }
                inputId="tranquilAir"
              />
              <label htmlFor="tranquilAir" className="ml-2">
                Tranquil Air
              </label>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

type CustomData = Partial<PlotData> & {
  unitKey: string;
};

function getPlotData({
  enemy,
  debugCoefficients,
  config,
  colorByClass,
  threatSettings,
}: {
  enemy: NPC;
  debugCoefficients: boolean;
  config: GameVersionConfig;
  colorByClass: boolean;
  threatSettings: ThreatSettings;
}) {
  const data: CustomData[] = [];

  for (const unitId in enemy.threat) {
    const unitInfo = enemy.threat[unitId];
    const unit = enemy.fightUnits[unitId] as Player;
    if (!unit || !unitInfo) continue;

    const time: number[] = [];
    const texts: string[] = [];

    for (let i = 0; i < unitInfo.time.length; i++) {
      const threatDiff = unitInfo.threat[i] - (unitInfo.threat[i - 1] || 0);
      const t = (unitInfo.time[i] - enemy.fight.start) / 1000;
      time.push(t);

      let text = `${
        unitInfo.text[i]
      }<br>Time: ${t}<br>Threat: ${threatDiff.toFixed(
        1
      )}<br>Total: ${unitInfo.threat[i].toFixed(1)}`;

      if (unitInfo.coeff[i]?.value !== undefined) {
        text += "<br>Coeff: " + unitInfo.coeff[i].value.toFixed(2);

        if (
          unitInfo.coeff[i].value !== 1 &&
          unitInfo.coeff[i].debug &&
          debugCoefficients
        ) {
          text +=
            "<br><br>" +
            unitInfo.coeff[i].debug
              .filter(({ value, bonus }) => value !== 1 || bonus)
              .map(coefficientDebugLabel)
              .join("<br>");
        }
      }

      if (unitInfo.fixateHistory[i]) {
        text += "<br>Fixate: " + unitInfo.fixateHistory[i];
      }

      if (unitInfo.invulnerabilityHistory[i].length) {
        text +=
          "<br>Invulnerability: " +
          unitInfo.invulnerabilityHistory[i]
            .map((x: string) => config.invulnerabilityBuffs[x])
            .join("+");
      }

      texts.push(text);
    }

    const pt: CustomData = {
      unitKey: unit.key,
      x: time,
      y: unitInfo.threat,
      text: texts,
      type: "scatter",
      mode: "lines+markers",
      name: `${unit.name} ${unit.initialCoeff.toFixed(2)}`,
      hoverinfo: "name+text",
      line: { shape: "hv" },
      marker: {
        line: {
          width: unitInfo.borderWidth,
          color: unitInfo.borderColor,
        },
      },
    };

    // Set color based on override > class color > white
    if (colorByClass && unit.type) {
      pt.marker!.color =
        threatSettings.units[unit.key]?.color ??
        classColors[unit.type] ??
        "#fff";
    }

    data.push(pt);
  }

  // Sort by max threat (highest first)
  data.sort((a, b) => Math.max(0, ...b.y) - Math.max(0, ...a.y));

  // Fill missing colors according to threat positions
  for (let i = 0; i < data.length; i++) {
    data[i].marker.color = data[i].marker?.color || getColor(i);
  }

  return data;
}

function coefficientDebugLabel(c: CoefficientDebug) {
  if (c.value !== 1 && c.bonus)
    return `• [x ${c.value.toFixed(2)}] ${c.label}
        <br>• [+ ${c.bonus}] ${c.label} (Bonus)`;
  if (c.value === 1 && c.bonus) return `• [+ ${c.bonus}] ${c.label} (Bonus)`;
  if (c.value === 1) return `• ${c.label}`;
  return `• [x ${c.value.toFixed(2)}] ${c.label}`;
}
