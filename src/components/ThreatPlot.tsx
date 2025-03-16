import React, { useState, useEffect, useMemo } from "react";
import Plot from "react-plotly.js";
import { Fight } from "../../era/threat/fight.js";
import { NPC, Player } from "../../era/threat/unit.js";
import { GameVersionConfig } from "../../era/base";
import { classColors, getColor } from "../../era/colors.js";
import { Checkbox } from "primereact/checkbox";
import { Layout, PlotData } from "plotly.js";

const SCROLLBAR_WIDTH = 16;

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
}

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
}) => {
  const [colorByClass, setColorByClass] = useState<boolean>(true);
  const [debugCoefficients, setDebugCoefficients] = useState<boolean>(
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
      }),
    [enemy, debugCoefficients, config, colorByClass]
  );

  useEffect(() => {
    if (!enemy) return;

    setPlotRange([0, (fight.end - fight.start) / 1000]);
  }, [enemy, fight, config, debugCoefficients, colorByClass]);

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

  const handlePlotRelayout = (event: Plotly.PlotRelayoutEvent) => {
    const xRange = [event["xaxis.range[0]"], event["xaxis.range[1]"]];

    if (xRange[0] === undefined || xRange[1] === undefined) return;
    if (xRange[0] === plotRange[0] && xRange[1] === plotRange[1]) return;

    setPlotRange([xRange[0], xRange[1]]);
  };

  const layout: Partial<Layout> = {
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
    width: window.innerWidth - SCROLLBAR_WIDTH,
    height: (window.innerWidth - SCROLLBAR_WIDTH) / (1920 / 1080),
    hovermode: "closest",
    plot_bgcolor: "#222",
    paper_bgcolor: "#222",
    legend: { font: { color: "#fff" } },
  };

  return (
    <div id="output">
      <Plot
        data={plotData}
        layout={layout}
        onClick={handlePlotClick}
        onRelayout={handlePlotRelayout}
      />

      <div className="plot-controls">
        <div className="flex align-items-center">
          <Checkbox
            checked={colorByClass}
            onChange={(e) => handleColorByClassChange(e.checked === true)}
          />
          <label className="ml-2">Color by class</label>
        </div>

        <div className="flex align-items-center">
          <Checkbox
            checked={debugCoefficients}
            onChange={(e) => handleDebugCoefficientsChange(e.checked === true)}
          />
          <label className="ml-2">Display detailed coefficients</label>
        </div>

        {fight.faction === "Horde" && (
          <div className="flex align-items-center">
            <Checkbox
              checked={fight.tranquilAir}
              onChange={(e) => {
                fight.tranquilAir = e.checked === true;
                fight.process();
                // Let the parent component handle re-rendering
                // by triggering a re-selection of the enemy
                onTargetClicked(`${reportId};${fight.id};${enemy.key};`);
              }}
            />
            <label className="ml-2">Tranquil Air</label>
          </div>
        )}
      </div>
    </div>
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
}: {
  enemy: NPC;
  debugCoefficients: boolean;
  config: GameVersionConfig;
  colorByClass: boolean;
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
              .map(
                ({ value, label }: { value: number; label: string }) =>
                  `- ${label}: ${value.toFixed(2)}`
              )
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

    // Set color based on class if enabled
    if (colorByClass && unit.type && classColors[unit.type]) {
      pt.marker.color = classColors[unit.type];
    }

    // Override with custom color if set
    if (unit.global && unit.global.color && unit.global.color !== "#000000") {
      pt.marker.color = unit.global.color;
    }

    data.push(pt);
  }

  // Sort by max threat (highest first)
  data.sort((a, b) => Math.max(0, ...b.y) - Math.max(0, ...a.y));

  // Fill missing colors according to threat positions
  for (let i = 0; i < data.length; i++) {
    data[i].marker.color = data[i].marker.color || getColor(i);
  }

  return data;
}
