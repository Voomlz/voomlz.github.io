import * as era from "../../era/class/priest.js";

export const config = {
  Buff: {
    ...era.config.Buff,
  },
  Mods: {
    ...era.config.Mods,
  },
  Spell: {
    ...era.config.Spell,
  },
};

export const initialBuffs = {
  ...era.initialBuffs,
};

export const buffNames = {
  ...era.buffNames,
};

export const buffMultipliers = {
  ...era.buffMultipliers,
};

export const talents = {
  ...era.talents,
};

export const fixateBuffs = {
  ...era.fixateBuffs,
};

export const spellFunctions = {
  ...era.spellFunctions,
};

export const combatantImplications = (unit, buffs, talents) => {
  era.combatantImplications(unit, buffs, talents);
};

export const notableBuffs = {
  ...Object.values(config.Buff),
};

export const invulnerabilityBuffs = {};

export const auraImplications = {
  ...era.auraImplications,
};
