import * as config from "./spells.js";
import {
  loadPage,
  selectReport,
  selectFight,
  selectEnemy,
  selectTarget,
  showAndHideDisclaimer,
  showAndHideChangelog,
  showAndHideTutorial,
} from "../era/front.js";

globalThis.DEBUGMODE = false;

globalThis.loadPage = () => loadPage(config);
globalThis.selectReport = () => selectReport(config);
globalThis.selectFight = (/** @type {number=} */ index) =>
  selectFight(config, index);
globalThis.selectEnemy = () => selectEnemy(config);
globalThis.selectTarget = (/** @type {string=} */ target) =>
  selectTarget(config, target);
globalThis.showAndHideDisclaimer = showAndHideDisclaimer;
globalThis.showAndHideChangelog = showAndHideChangelog;
globalThis.showAndHideTutorial = showAndHideTutorial;

document.addEventListener("DOMContentLoaded", function () {
  loadPage(config);
});
