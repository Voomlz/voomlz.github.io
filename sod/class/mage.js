import {
  getThreatCoefficient,
  School,
  handler_damage,
} from "../../era/base.js";

import * as era from "../../era/class/mage.js";

const config = {
  Buff: {
    ...era.config.Buff,
  },
  Mods: {
    ...era.config.Mods,
  },
  Spell: {
    ...era.config.Spell,
    FrostfireBolt: 401502,
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

const FROSTFIRE_BOLT = { [config.Spell.FrostfireBolt]: true };

export const talents = {
  ...era.talents,
  "Burning Soul Frostfire": {
    maxRank: 2,
    coeff: (_, rank = 2, spellId) =>
      getThreatCoefficient(
        1 - config.Mods.BurningSoul * rank * (spellId in FROSTFIRE_BOLT)
      ),
  },
  "Frost Channeling Frostfire": {
    maxRank: 3,
    coeff: (_, rank = 3, spellId) =>
      getThreatCoefficient(
        1 - config.Mods.FrostChanneling * rank * (spellId in FROSTFIRE_BOLT)
      ),
  },
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

export const invulnerabilityBuffs = {
  ...era.invulnerabilityBuffs,
};

export const auraImplications = {
  ...era.auraImplications,
};

export const aggroLossBuffs = {
  ...era.aggroLossBuffs,
};
