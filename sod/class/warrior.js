import {
  getAdditiveThreatCoefficient,
  getThreatCoefficient,
  handler_modDamage,
  handler_zero,
} from "../../era/base.js";

import * as era from "../../era/class/warrior.js";

export const config = {
  Stance: {
    ...era.config.Stance,
    Gladiator: 412513,
  },
  Mods: {
    ...era.config.Mods,

    GladiatorStance: 0.7,

    /** Base shield slam mod */
    ShieldSlam: 2.0,

    /** 1.20 in defensive stance */
    T1_Tank_6pc: 1.2,

    /** 2.0x to Shield Slam */
    TAQ_Tank_4pc: 2.0,

    /** 1.5x to Thunder Clap with the rune */
    FuriousThunder: 1.5,

    /** 1.5x to Devastate only when in Def stance */
    RuneOfDevastate: 1.5,
  },
  Spell: {
    ...era.config.Spell,
    DevastateSoD: 403196, // SoD version
  },
  Tier: {
    T1_Tank: 1719,
    TAQ_Tank: 1857,
  },
  Buff: {
    ...era.config.Buff,
    T1_Tank_6pc: 457651,
    TAQ_Tank_4pc: 1214162,
    RuneOfDevastate: 403195,
  },
};

export const initialBuffs = {
  ...era.initialBuffs,
  [config.Stance.Gladiator]: 0,
  [config.Buff.T1_Tank_6pc]: 3, // inferred off
  [config.Buff.TAQ_Tank_4pc]: 3, // inferred off
  [config.Buff.RuneOfDevastate]: 0,
};

export const talents = {
  ...era.talents,
  Defiance: {
    maxRank: 5,
    // Updated from era
    coeff: function (buffs, rank = 5) {
      if (!(config.Stance.Defensive in buffs)) return getThreatCoefficient(1);
      return getAdditiveThreatCoefficient(
        config.Mods.Defiance * rank,
        config.Mods.DefensiveStance
      );
    },
  },
  // TODO: move this to gear check
  "Furious Thunder (Rune)": {
    maxRank: 1,
    coeff: function (buffs, rank = "0", spellId) {
      const thunderClap = {
        [config.Spell.ThunderClapR1]: true,
        [config.Spell.ThunderClapR2]: true,
        [config.Spell.ThunderClapR3]: true,
        [config.Spell.ThunderClapR4]: true,
        [config.Spell.ThunderClapR5]: true,
        [config.Spell.ThunderClapR6]: true,
      };
      if (Number(rank) && spellId in thunderClap) {
        return getThreatCoefficient(config.Mods.FuriousThunder);
      }
      return getThreatCoefficient(1);
    },
  },
};

export const buffNames = {
  ...era.buffNames,
  [config.Stance.Gladiator]: "Gladiator Stance",
  [config.Buff.T1_Tank_6pc]: "S03 - Item - T1 - Warrior - Tank 6P Bonus",
  [config.Buff.TAQ_Tank_4pc]: "S03 - Item - TAQ - Warrior - Tank 4P Bonus",
  [config.Buff.RuneOfDevastate]: "Rune of Devastate",
};

export const buffMultipliers = {
  ...era.buffMultipliers,
  [config.Stance.Gladiator]: getThreatCoefficient(config.Mods.GladiatorStance),
  [config.Buff.T1_Tank_6pc]: {
    coeff: (buffs, spellId) => {
      if (config.Stance.Defensive in buffs) {
        return getThreatCoefficient(config.Mods.T1_Tank_6pc);
      }
      return getThreatCoefficient(1);
    },
  },
  [config.Buff.TAQ_Tank_4pc]: {
    coeff: (buffs, spellId) => {
      const moddedSpells = {
        [config.Spell.ShieldSlamR1]: true,
        [config.Spell.ShieldSlamR2]: true,
        [config.Spell.ShieldSlamR3]: true,
        [config.Spell.ShieldSlamR4]: true,
      };
      if (spellId in moddedSpells) {
        return getThreatCoefficient(config.Mods.TAQ_Tank_4pc);
      }

      return getThreatCoefficient(1);
    },
  },
  [config.Buff.RuneOfDevastate]: {
    coeff: (buffs, spellId) => {
      const moddedSpells = {
        [config.Spell.Devastate]: true,
        [config.Spell.DevastateSoD]: true,
      };
      if (config.Stance.Defensive in buffs && spellId in moddedSpells) {
        return getThreatCoefficient(config.Mods.RuneOfDevastate);
      }

      return getThreatCoefficient(1);
    },
  },
};

export const fixateBuffs = {
  ...era.fixateBuffs,
};

export const notableBuffs = {
  ...Object.values(config.Buff),
};

const Battle = config.Stance.Battle;
const Berserker = config.Stance.Berserker;
const Defensive = config.Stance.Defensive;

export const auraImplications = {
  ...era.auraImplications,
  [config.Spell.DevastateSoD]: Defensive,
};

/**
 * Allows one to check the combatantInfo and infer buffs and talents.
 *
 * Here is a good place to check gear and apply Tier set bonus buffs. e.g. Check for 2pc gear, apply
 * the buff. Then, in buffMultipliers, you can apply global coefficients or to specific spells.
 */
export const combatantImplications = (unit, buffs, talents) => {
  era.combatantImplications(unit, buffs, talents);

  // Tier 1 6pc
  if (unit.gear.filter((g) => g.spellID === config.Tier.T1_Tank).length >= 6) {
    buffs[config.Buff.T1_Tank_6pc] = true;
  }
  // Tier 2.5 4pc
  if (unit.gear.filter((g) => g.spellID === config.Tier.TAQ_Tank).length >= 4) {
    buffs[config.Buff.TAQ_Tank_4pc] = true;
  }
};

export const spellFunctions = {
  ...era.spellFunctions,

  // Shield Slam
  [config.Spell.ShieldSlamR1]: handler_modDamage(config.Mods.ShieldSlam),
  [config.Spell.ShieldSlamR2]: handler_modDamage(config.Mods.ShieldSlam),
  [config.Spell.ShieldSlamR3]: handler_modDamage(config.Mods.ShieldSlam),
  [config.Spell.ShieldSlamR4]: handler_modDamage(config.Mods.ShieldSlam),
};
