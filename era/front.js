import { Report } from "./threat/report.js";
import { Fight } from "./threat/fight.js";
import { NPC, ThreatTrace } from "./threat/unit.js";
import { classColors, getColor } from "./colors.js";

// import "https://cdn.plot.ly/plotly-latest.min.js";

let plotXRange = [-Infinity, Infinity];
let recolorPlot = () => {};
let colorByClass = true;

const SCROLLBAR_WIDTH = 16;

/**
 * @param {string} div
 */
function showAndHide(div) {
  const x = document.getElementById(div);
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
}

export function showAndHideDisclaimer() {
  showAndHide("disclaimer");
}

export function showAndHideChangelog() {
  showAndHide("changelog");
}
export function showAndHideTutorial() {
  showAndHide("tutorial");
}

/**
 * @param {import("./base.js").GameVersionConfig} config
 */
export function loadPage(config) {
  scroll(0, 0);

  const idParam = getParameterByName("id");
  const fightParam = getParameterByName("fightId");
  const enemyParam = getParameterByName("enemy");
  const targetParam = getParameterByName("target");

  if (idParam) {
    document.getElementById("reportSelect").value = idParam;
    selectReport(config).then(function () {
      if (fightParam) {
        const fightIndex = parseInt(fightParam) - 1;
        const el_fightSelect = document.getElementById("fightSelect");
        el_fightSelect.value = el_fightSelect.options[fightIndex].value;
        selectFight(config);
      }
    });
  }

  if (enemyParam) {
    document.getElementById("enemySelect").selectedIndex = enemyParam;
    selectEnemy(config);
  }

  if (targetParam) {
    let [reportId, fightId, enemyId, targetId] = targetParam.split(";");
    document.getElementById("targetSelect").selectedIndex = targetId;
    //selectTarget(config, targetId);
  }
}

function setParamAndReload() {
  let el_reportId = document.querySelector("#reportSelect").value;
  let i = document.querySelector("#fightSelect").selectedIndex;

  let el_fightSelect;
  if (i === -1) el_fightSelect = "";
  else el_fightSelect = document.querySelector("#fightSelect").options[i].value;

  i = document.querySelector("#enemySelect").selectedIndex;
  let el_enemySelect;
  if (i === -1) el_enemySelect = "";
  else el_enemySelect = document.querySelector("#enemySelect").options[i].value;

  i = document.querySelector("#targetSelect").selectedIndex;
  let el_targetSelect;
  if (i === -1) el_targetSelect = "";
  else
    el_targetSelect = document.querySelector("#targetSelect").options[i].value;

  const idParam = getParameterByName("id");
  const fightParam = getParameterByName("fight");
  const enemyParam = getParameterByName("enemy");
  const targetParam = getParameterByName("target");

  console.log("el_reportId " + el_reportId);
  console.log("el_fightSelect " + el_fightSelect);
  console.log("el_enemySelect " + el_enemySelect);
  console.log("el_targetSelect " + el_targetSelect);

  console.log("idParam " + idParam);
  console.log("fightParam " + fightParam);
  console.log("enemyParam " + enemyParam);
  console.log("targetParam " + targetParam);

  let b = el_reportId == idParam;
  let b1 = el_fightSelect == fightParam;
  let b2 = el_enemySelect == enemyParam;
  let b3 = el_targetSelect == targetParam;

  console.log("idParam " + b);
  console.log("fightParam " + b1);
  console.log("enemyParam " + b2);
  console.log("targetParam " + b3);

  console.log("idParam null " + idParam == null);
  console.log("fightParam null " + fightParam == null);
  console.log("enemyParam null " + enemyParam == null);
  console.log("targetParam null " + targetParam == null);

  if (
    (el_reportId == "" || el_reportId == idParam) &&
    (el_fightSelect == "" || el_fightSelect == fightParam) &&
    (el_enemySelect == "" || el_enemySelect == enemyParam) &&
    (el_targetSelect == "" || el_targetSelect == targetParam)
  ) {
    console.log("No change, don't reload");
    return;
  }

  let url = location.origin + location.pathname;

  if (el_reportId) {
    url = url + "?id=" + el_reportId;
  }
  if (el_fightSelect) {
    url = url + "&fight=" + el_fightSelect;
  }
  if (el_enemySelect) {
    url = url + "&enemy=" + el_enemySelect;
  }
  if (el_targetSelect) {
    url = url + "&target=" + el_targetSelect;
  }

  console.log("Reload : " + url);
  location.href = url;
}

function redirectToThreat() {
  location.href = location.origin + location.pathname + "/threat";
}
/**
 * @param {string} e
 */
function printError(e) {
  console.log(e);
  alert("Error:\n" + e + "\n\nRefresh the page to start again.");
}

/**
 * @type {Record<string, Report>}
 */
const reports = {};

/**
 * @param {import("./base.js").GameVersionConfig} config
 */
export function selectReport(config) {
  let el = document.querySelector("#reportSelect");
  let el_fightSelect = document.querySelector("#fightSelect");
  el_fightSelect.innerHTML = "";
  let reportId = el.value;
  let urlmatch = reportId.match(
    /https:\/\/(?:[a-z]+\.)?(?:classic\.|www\.)?warcraftlogs\.com\/reports\/((?:a:)?\w+)/
  );
  if (urlmatch) reportId = urlmatch[1];
  if (!reportId || (reportId.length !== 16 && reportId.length !== 18)) {
    el.style.borderColor = "red";
    return;
  }
  el.style.borderColor = null;
  if (!(reportId in reports)) console.log({ config });
  reports[reportId] = new Report(
    /** @type {import("./base.js").GameVersionConfig} */ (config),
    reportId
  );
  enableInput(false);
  return reports[reportId]
    .fetch()
    .then(() => {
      const fights = Object.values(reports[reportId].fights);

      fights.sort((a, b) => encounterSort(a) - encounterSort(b));

      let lastEncounterId = 0;
      for (const f of fights) {
        if (encounterSort(f) >= TRASH_ID && lastEncounterId < TRASH_ID) {
          const option = document.createElement("option");
          option.textContent = "--- TRASH ---";
          option.disabled = true;
          el_fightSelect.appendChild(option);
        }

        const option = document.createElement("option");
        option.value = reportId + ";" + f.id;
        option.textContent = f.name + " - " + f.id;

        el_fightSelect.appendChild(option);

        lastEncounterId = encounterSort(f);
      }

      enableInput(true);
    })
    .catch(printError);
}
const TRASH_ID = 9999999;
function encounterSort({ encounter, id }) {
  return encounter === 0 ? TRASH_ID + id : encounter + id;
}
/**
 * @param {import("./base.js").GameVersionConfig} config
 * @param {number} [index]
 */
export function selectFight(config, index) {
  let el = document.querySelector("#fightSelect");
  let el_enemySelect = document.querySelector("#enemySelect");
  let i;
  if (index) i = index;
  else i = el.selectedIndex;
  if (i === -1) return;
  let s = el.options[i].value;
  let [reportId, fightId] = s.split(";");
  let f = reports[reportId].fights[fightId];
  enableInput(false);
  f.fetch()
    .then(() => {
      f.process();
      let j = el_enemySelect.selectedIndex;
      let prevSelection = "";
      if (j !== -1) prevSelection = el_enemySelect.options[j].value;
      j = 0;
      el_enemySelect.innerHTML = "";

      const sortedEnemies = Object.keys(f.enemies).map((k) => f.enemies[k]);

      sortedEnemies.sort(
        (a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name)
      );

      for (let enemy of sortedEnemies) {
        let el_u = document.createElement("option");
        el_u.value = reportId + ";" + fightId + ";" + enemy.key;
        el_u.textContent = enemy.name + " - " + enemy.key;
        el_enemySelect.appendChild(el_u);
        if (el_u.value === prevSelection) el_enemySelect.selectedIndex = j;
        j += 1;
      }
      selectEnemy(config);
      enableInput(true);
    })
    .catch(printError);
}

/**
 * @param {import("./base.js").GameVersionConfig} config
 */
export function selectEnemy(config) {
  try {
    let el = document.querySelector("#enemySelect");
    let i = el.selectedIndex;
    if (i === -1) return;
    let enemyKey = el.options[i].value;
    let [reportId, fightId, enemyId] = enemyKey.split(";");
    let fight = reports[reportId].fights[fightId];
    let enemy = fight.enemies[enemyId];
    plot(config, reportId, fight, enemy);
    let el_targetSelect = document.querySelector("#targetSelect");
    let j = el_targetSelect.selectedIndex;
    let prevSelection = ""; // Select the same entry in newly generated dropdown
    if (j !== -1)
      prevSelection = el_targetSelect.options[j].value.split(";")[3];
    el_targetSelect.innerHTML = "";
    j = 0;
    const sortedTargets = Object.keys(enemy.threat).map(
      (k) => enemy.threat[k].target
    );

    sortedTargets.sort((a, b) => a.name.localeCompare(b.name));

    for (let target of sortedTargets) {
      let el_u = document.createElement("option");
      el_u.value = enemyKey + ";" + target.key;
      el_u.textContent = target.name + " - " + target.key;
      el_targetSelect.appendChild(el_u);
      if (target.key === prevSelection) el_targetSelect.selectedIndex = j;
      j += 1;
    }
    selectTarget(config);
  } catch (e) {
    printError(e);
  }
}

/**
 * @param {import("./base.js").GameVersionConfig} config
 * @param {string | undefined} [target]
 */
export function selectTarget(config, target) {
  try {
    let el = document.querySelector("#targetSelect");
    let el_out = document.querySelector("#threatTableContainer");
    el_out.innerHTML = "";
    if (!target) {
      let i = el.selectedIndex;
      if (i === -1) return;
      target = el.options[i].value;
    } else {
      for (let i = 0; i < el.options.length; ++i) {
        if (el.options[i].value === target) {
          el.selectedIndex = i;
          break;
        }
      }
    }
    let [reportId, fightId, enemyId, targetId] = target.split(";");
    const trace =
      reports[reportId].fights[fightId].enemies[enemyId].threat[targetId];
    tabulate(config, el_out, trace);
  } catch (e) {
    printError(e);
  }
}
function enableInput(enable = true) {
  let a = ["input", "button", "select"].map((s) =>
    document.querySelectorAll(s)
  );
  for (let b of a) {
    for (let el of b) {
      el.disabled = !enable;
    }
  }
}

/**
 * @param {Element | null} el_out
 * @param {boolean} checked
 * @param {string | null} text
 * @param {{ (x: any): void; (x: any): void; (arg0: boolean): any; }} callback
 */
export function createCheckbox(el_out, checked, text, callback) {
  let el_checkbox = document.createElement("input");
  let el_label = document.createElement("label");
  el_checkbox.type = "checkbox";
  el_checkbox.className = "checkbox";
  el_checkbox.checked = checked;
  el_checkbox.onchange = () => callback(el_checkbox.checked);
  el_label.textContent = text;
  el_out.appendChild(el_checkbox);
  el_out.appendChild(el_label);
}
/**
 * @param {string} name
 */
function getParameterByName(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

let plotData = [];

/**
 * @param {import("./base.js").GameVersionConfig} config
 * @param {string} reportId
 * @param {Fight} fight
 * @param {NPC} enemy
 */
function plot(config, reportId, fight, enemy) {
  let el_div = document.querySelector("#output");
  el_div.innerHTML = "";
  plotData = [];
  for (let unitId in enemy.threat) {
    let unitInfo = enemy.threat[unitId];
    let u = enemy.fightUnits[unitId];
    let t = [],
      texts = [];
    for (let i = 0; i < unitInfo.time.length; ++i) {
      let threatDiff = unitInfo.threat[i] - (unitInfo.threat[i - 1] || 0);
      t.push((unitInfo.time[i] - fight.start) / 1000);
      let text = `${unitInfo.text[i]}<br>Time: ${
        t[i]
      }<br>Threat: ${threatDiff.toFixed(1)}<br>Total: ${unitInfo.threat[
        i
      ].toFixed(1)}`;
      if (unitInfo.coeff[i] !== null)
        text += "<br>Coeff: " + unitInfo.coeff[i].toFixed(2);
      if (unitInfo.fixateHistory[i])
        text += "<br>Fixate: " + unitInfo.fixateHistory[i];
      if (unitInfo.invulnerabilityHistory[i].length)
        text +=
          "<br>Invulnerability: " +
          unitInfo.invulnerabilityHistory[i]
            .map(
              (/** @type {string | number} */ x) =>
                config.invulnerabilityBuffs[x]
            )
            .join("+");
      texts.push(text);
    }
    let trace = {
      unitKey: u.key,
      x: t,
      y: unitInfo.threat,
      text: texts,
      type: "scatter",
      mode: "lines+markers",
      name: u.name + " " + u.initialCoeff.toFixed(2),
      hoverinfo: "name+text",
      line: { shape: "hv" },
      marker: {
        line: { width: unitInfo.borderWidth, color: unitInfo.borderColor },
      },
    };
    plotData.push(trace);
    if (colorByClass) trace.marker.color = classColors[u.type];
    if (u.global && u.global.color && u.global.color !== "#000000")
      trace.marker.color = u.global.color;
  }
  plotData.sort(
    (/** @type {{ y: any; }} */ a, /** @type {{ y: any; }} */ b) =>
      Math.max(0, ...b.y) - Math.max(0, ...a.y)
  );
  // Fill missing colors according to threat positions
  for (let i = 0; i < plotData.length; ++i) {
    plotData[i].marker.color = plotData[i].marker.color || getColor(i);
  }
  let el_plot = document.createElement("div");
  el_div.appendChild(el_plot);
  recolorPlot = () => {
    let colors = [];
    for (let i = 0; i < plotData.length; ++i) {
      let u = enemy.fight.units[plotData[i].unitKey];
      if (u.global && u.global.color) {
        colors.push(u.global.color);
      } else if (colorByClass) {
        colors.push(classColors[u.type]);
      } else {
        colors.push(getColor(i));
      }
    }
    globalThis.Plotly.restyle(el_plot, { "marker.color": colors });
  };
  createCheckbox(
    el_div,
    colorByClass,
    "Color by class",
    (/** @type {any} */ x) => {
      colorByClass = x;
      recolorPlot();
    }
  );
  if (fight.faction == "Horde")
    createCheckbox(
      el_div,
      fight.tranquilAir,
      "Tranquil Air",
      (/** @type {any} */ x) => {
        fight.tranquilAir = x;
        fight.process();
        selectEnemy(config);
      }
    );
  plotXRange = [0, (fight.end - fight.start) / 1000];
  globalThis.Plotly.newPlot(el_plot, plotData, {
    title: `Threat - ${enemy.name}`,
    titlefont: { color: "#fff" },
    xaxis: {
      title: "Time (s)",
      titlefont: { color: "#fff" },
      tickcolor: "#666",
      tickfont: { color: "#fff" },
      rangemode: "tozero",
      gridcolor: "#666",
      linecolor: "#999",
      range: plotXRange.slice(),
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
  });
  el_plot.on("plotly_click", (/** @type {{ points: string | any[]; }} */ e) => {
    if (e.points.length === 0) return;
    selectTarget(
      config,
      reportId +
        ";" +
        fight.id +
        ";" +
        enemy.key +
        ";" +
        e.points[0].data.unitKey
    );
  });
  el_plot.on("plotly_relayout", (/** @type {{ [x: string]: any; }} */ e) => {
    let range = [e["xaxis.range[0]"], e["xaxis.range[1]"]];
    if (range[0] === undefined || range[1] === undefined) return;
    if (range[0] === plotXRange[0] && range[1] === plotXRange[1]) return;
    plotXRange = range;
    selectTarget(config);
  });
}

/**
 * @param {HTMLDivElement} el_div
 * @param {ThreatTrace} trace
 */
function tabulateThreat(el_div, trace) {
  let el_table = document.createElement("table");

  function addRow(texts) {
    let el_tr = document.createElement("tr");
    for (let i = 0; i < texts.length; ++i) {
      let el_td = document.createElement("td");
      if (typeof texts[i] === "number") {
        el_td.textContent = texts[i].toFixed(2);
        el_td.align = "right";
      } else {
        el_td.textContent = texts[i];
      }
      el_tr.appendChild(el_td);
    }
    el_table.appendChild(el_tr);
  }

  let rangeWidth = plotXRange[1] - plotXRange[0];
  el_table.innerHTML = `<tr><th>Ability</th><th title="Over the currently zoomed x range.">Threat (*)</th><th>Per ${rangeWidth.toFixed(
    2
  )} seconds</th></tr>`;
  let a = trace.threatBySkill(plotXRange);
  let keys = Object.keys(a);
  keys.sort((x, y) => a[y] - a[x]);
  let totalThreat = 0;
  for (let i = 0; i < keys.length; ++i) {
    let k = keys[i];
    totalThreat += a[k];
    addRow([k, a[k], a[k] / rangeWidth]);
  }
  addRow(["Total", totalThreat, totalThreat / rangeWidth]);
  el_div.appendChild(el_table);
}

/**
 * @param {import("./base.js").GameVersionConfig} config
 * @param {HTMLDivElement} el_div
 * @param {ThreatTrace} trace
 */
function tabulate(config, el_div, trace) {
  el_div.innerHTML =
    trace.target.name +
    " - Started fight with threat coeff " +
    parseFloat(trace.target.initialCoeff.toFixed(4));
  // Color
  if ("global" in trace.target) {
    let el_color = document.createElement("input");
    el_color.type = "color";
    el_color.title = "Change trace color";
    el_color.className = "colorPicker";
    for (let t of plotData) {
      if (t.unitKey !== trace.target.key) continue;
      el_color.value = t.marker.color;
      break;
    }
    el_color.onchange = () => {
      trace.target.global.color = el_color.value;
      recolorPlot();
    };
    el_div.insertBefore(el_color, el_div.firstChild);
  }
  // Threat values
  tabulateThreat(el_div, trace);
  // Buff table
  if (!("global" in trace.target)) return;
  let el_table = document.createElement("table");
  el_table.innerHTML =
    '<tr><th>Buff</th><th title="Fetch fight again to recompute">On/off at start (*)</th></tr>';
  let a = trace.target.global.initialBuffs;
  for (let k in a) {
    let els = [
      "tr",
      "td",
      "td",
      "select",
      "option",
      "option",
      "option",
      "option",
      "option",
    ].map((s) => document.createElement(s));
    const coefficient =
      typeof config.buffMultipliers[k] === "function"
        ? config.buffMultipliers[k](trace.target.spellSchool)
        : "";
    els[1].textContent = config.buffNames[k] + " " + coefficient;
    els[4].textContent = "Infer";
    els[5].textContent = "On";
    els[6].textContent = "Off";
    els[7].textContent = "Inferred on";
    els[8].textContent = "Inferred off";
    for (let i = 4; i < 9; ++i) els[3].appendChild(els[i]);
    els[2].appendChild(els[3]);
    els[0].appendChild(els[1]);
    els[0].appendChild(els[2]);
    els[3].selectedIndex = a[k];
    els[3].onchange = () => (a[k] = els[3].selectedIndex);
    el_table.appendChild(els[0]);
  }
  el_div.appendChild(el_table);
  // Talent table
  el_table = document.createElement("table");
  el_table.innerHTML =
    '<tr><th>Talent name</th><th title="Fetch fight again to recompute">Rank (*)</th></tr>';
  let talents = trace.target.global.talents;
  for (let talentName in talents) {
    let t = talents[talentName];
    let els = ["tr", "td", "td", "input"].map((s) => document.createElement(s));
    els[0].appendChild(els[1]);
    els[0].appendChild(els[2]);
    els[1].textContent = talentName;
    els[2].appendChild(els[3]);
    els[2].appendChild(document.createTextNode(" / " + t.maxRank));
    els[3].type = "number";
    els[3].min = 0;
    els[3].max = t.maxRank;
    els[3].value = t.rank;
    els[3].className = "talent";
    els[3].onchange = () => (t.rank = els[3].value);
    el_table.appendChild(els[0]);
  }
  el_div.appendChild(el_table);
}
