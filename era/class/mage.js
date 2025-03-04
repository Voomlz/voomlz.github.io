import { getThreatCoefficient, School, handler_damage } from "../base.js";

export const config = {
  Buff: {
    IceBlock: 11958,
  },
  Mods: {
    BurningSoul: 0.15,
    FrostChanneling: 0.1,
    ArcaneSubtlety: 0.2,
  },
  Spell: {},
};

export const initialBuffs = {};

export const buffNames = {};

export const buffMultipliers = {};

export const talents = {
  "Arcane Subtlety": {
    maxRank: 2,
    coeff: (_, rank = 2) =>
      getThreatCoefficient({
        [School.Arcane]: 1 - config.Mods.ArcaneSubtlety * rank,
      }),
  },
  "Burning Soul": {
    maxRank: 2,
    coeff: (_, rank = 2) =>
      getThreatCoefficient({
        [School.Fire]: 1 - config.Mods.BurningSoul * rank,
      }),
  },
  "Frost Channeling": {
    maxRank: 3,
    coeff: (_, rank = 3) =>
      getThreatCoefficient({
        [School.Frost]: 1 - config.Mods.FrostChanneling * rank,
      }),
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
