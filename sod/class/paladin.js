import {
  additiveThreatCoeff,
  borders,
  getThreatCoefficient,
  handler_damage,
  handler_markSourceOnMiss,
  handler_modDamage,
  handler_modHeal,
  handler_taunt,
  handler_threatOnBuff,
  handler_zero,
  School,
  threatFunctions,
} from "../../era/base.js";

import * as era from "../../era/class/paladin.js";

export const config = {
  /**
   * From the Light Club disc:
   * - Hand of Reckoning rune applies a 1.5 baseline tank threat multiplier to all threat
   * - Holy threat without imp. RF with HoR is 2.23 (1.6 * 1.5 is 2.4 so it's not applied consitently)
   * - Holy threat with imp. RF and HoR is 2.85 (= 1.9 * 1.5)
   */
  Mods: {
    ...era.config.Mods,
    /** Total Imp RF buff is 1.9 - 1.6 / 3 */
    ImpRf: (1.9 - 1.6) / 3,
    /** A 1.5 modifier to all attacks (2.85 = 1.9 (ImpRf) * 1.5) */
    HandOfReckoning: 1.5,

    /** 6% per rank to physical and holy damage, only when RF is not up */
    Vengeance: 0.06,
  },
  Buff: {
    ...era.config.Buff,
    EngraveHandOfReckoning: 410001,
  },
  Rune: {
    HandOfReckoning: 6844,
  },
  Spell: {
    HandOfReckoning: 407631,
  },
};

export const initialBuffs = {
  ...era.initialBuffs,
};

export const buffNames = {
  ...era.buffNames,
  [config.Buff.EngraveHandOfReckoning]: "Engrave Gloves - Hand of Reckoning",
};

export const buffMultipliers = {
  ...era.buffMultipliers,
  [config.Buff.EngraveHandOfReckoning]: {
    coeff(buffs, spellId) {
      if (config.Buff.RighteousFury in buffs) {
        return getThreatCoefficient(config.Mods.HandOfReckoning);
      }
      return getThreatCoefficient(1.0);
    },
  },
};

export const talents = {
  ...era.talents,
  "Improved Righteous Fury": {
    maxRank: 3,
    coeff: function (buffs, rank = 3) {
      if (config.Buff.RighteousFury in buffs) {
        return getThreatCoefficient({
          [School.Holy]: additiveThreatCoeff(
            rank * config.Mods.ImpRf,
            config.Mods.RighteousFury
          ),
        });
      }
      return getThreatCoefficient(1);
    },
  },
  Vengeance: {
    maxRank: 5,
    coeff: function (buffs, rank = 5) {
      if (config.Buff.RighteousFury in buffs) {
        return getThreatCoefficient(1);
      }
      const mod = 1 - rank * config.Mods.Vengeance;
      return getThreatCoefficient({
        [School.Physical]: mod,
        [School.Holy]: mod,
      });
    },
  },
};

export const fixateBuffs = {
  ...era.fixateBuffs,
  [config.Spell.HandOfReckoning]: true,
};

export const spellFunctions = {
  ...era.spellFunctions,
  [config.Spell.HandOfReckoning]: threatFunctions.concat(
    handler_taunt,
    handler_markSourceOnMiss(borders.taunt)
  ),
};

export const auraImplications = {
  ...era.auraImplications,
};

export const combatantImplications = (unit, buffs, talents) => {
  era.combatantImplications(unit, buffs, talents);

  if (
    unit.gear.some((g) => g.temporaryEnchant === config.Rune.HandOfReckoning)
  ) {
    buffs[config.Buff.EngraveHandOfReckoning] = true;
  }
};

export const notableBuffs = {
  ...Object.values(config.Buff),
};

export const invulnerabilityBuffs = {
  ...era.invulnerabilityBuffs,
};
