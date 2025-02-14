import { getThreatCoefficient, School, handler_damage } from "../era/base.js";

const config = {
  Buff: {
    IceBlock: 11958,
  },
  Mods: {},
  Spell: {},
};

export const initialBuffs = {};

export const buffNames = {};

export const buffMultipliers = {};

export const talents = {
  "Arcane Subtlety": {
    maxRank: 2,
    coeff: (_, rank = 2) =>
      getThreatCoefficient({ [School.Arcane]: 1 - 0.2 * rank }),
  },
  "Burning Soul": {
    maxRank: 2,
    coeff: (_, rank = 2) =>
      getThreatCoefficient({ [School.Fire]: 1 - 0.15 * rank }),
  },
  "Frost Channeling": {
    maxRank: 3,
    coeff: (_, rank = 3) =>
      getThreatCoefficient({ [School.Frost]: 1 - 0.1 * rank }),
  },
  "Burning Soul ForstFire": {
    maxRank: 2,
    coeff: (_, rank = 2, spellId) =>
      getThreatCoefficient(1 - 0.15 * rank * (spellId in { 401502: true })),
  },
  "Frost Channeling ForstFire": {
    maxRank: 3,
    coeff: (_, rank = 3, spellId) =>
      getThreatCoefficient(1 - 0.1 * rank * (spellId in { 401502: true })),
  },
};

export const fixateBuffs = {};

export const spellFunctions = {
  10181: handler_damage, // Frostbolt
};

export const combatantImplications = (unit, buffs, talents) => {};

export const notableBuffs = {
  ...Object.values(config.Buff),
};

export const invulnerabilityBuffs = {
  [config.Buff.IceBlock]: "Ice Block",
};

export const auraImplications = {};

export const aggroLossBuffs = {
  118: true,
  12824: true,
  12825: true,
  28272: true,
  28271: true,
  12826: true, // Polymorph
};
