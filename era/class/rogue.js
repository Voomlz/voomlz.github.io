import {
  getThreatCoefficient,
  handler_castCanMissNoCoefficient,
  handler_vanish,
} from "../base.js";

export const config = {
  Mods: {
    Base: 0.71,
  },
  Spell: {
    SinisterStrikeR7: 11293,
    SinisterStrikeR8: 11294,
  },
  Buff: {},
};

export const initialBuffs = {};

export const buffNames = {};

export const buffMultipliers = {};

export const talents = {};

export const fixateBuffs = {};

export const auraImplications = {};

export const spellFunctions = {
  // Rogue
  1856: handler_vanish,
  1857: handler_vanish, // Vanish
  1966: handler_castCanMissNoCoefficient(-150), // Feint r1
  6768: handler_castCanMissNoCoefficient(-240), // Feint r2
  8637: handler_castCanMissNoCoefficient(-390), // Feint r3
  11303: handler_castCanMissNoCoefficient(-600), // Feint r4
  25302: handler_castCanMissNoCoefficient(-800), // Feint r5
};

export const notableBuffs = {
  ...Object.values(config.Buff),
};

export const combatantImplications = (unit, buffs, talents) => {};

export const baseThreatCoefficient = getThreatCoefficient(config.Mods.Base);
