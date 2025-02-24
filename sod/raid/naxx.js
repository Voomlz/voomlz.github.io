import { getThreatCoefficient } from "../../era/base.js";
import * as era from "../../era/raid/naxx.js";

export {
  config,
  buffNames,
  spellFunctions,
  fixateBuffs,
  notableBuffs,
} from "../../era/raid/naxx.js";

// TODO: here is where all the seal stuff will go and updated multipliers/handlers

export const buffMultipliers = {
  [era.config.Buff.FungalBloom]: getThreatCoefficient(0),
};
