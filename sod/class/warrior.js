import {
  gearHasTempEnchant,
  gearSetCount,
  getThreatCoefficient,
  handler_modDamagePlusThreat,
  handler_zero_important,
  threatFunctions,
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

    /** 10% to defensive stance */
    T1_Tank_6pc: 1.1, // TODO: confirm if this is additive or multiplicative

    /** Shield Slam from 2.0 mod to 3.0 mod */
    TAQ_Tank_4pc: 1.5,

    /** Gladiator Stance no longer reduces your Armor or Threat, and instead increases threat by 30% */
    SE_Tank_6pc: 1.3,

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
    SE_Tank: 1933, // https://www.wowhead.com/classic-ptr/item-set=1933/lightbreakers-battlegear
  },
  Enchant: {
    SouOfEnmity: 7678, // T1_Tank_6pc
    SoulOfTheSentinel: 7683, // TAQ_Tank_4pc
  },
  Buff: {
    ...era.config.Buff,
    T1_Tank_6pc: 457651,
    TAQ_Tank_4pc: 1214162,
    SE_Tank_6pc: 1227245,
    RuneOfDevastate: 403195,
    RuneOfFuriousThunder: 403219,
  },
  Rune: {
    Devastate: 6800,
    FuriousThunder: 6801,
  },
};

export const initialBuffs = {
  ...era.initialBuffs,
  [config.Stance.Gladiator]: 0,
  [config.Buff.T1_Tank_6pc]: 3, // inferred off
  [config.Buff.TAQ_Tank_4pc]: 3, // inferred off
  [config.Buff.RuneOfDevastate]: 0,
  [config.Buff.RuneOfFuriousThunder]: 0,
};

export const talents = {
  ...era.talents,
};

export const buffNames = {
  ...era.buffNames,
  [config.Stance.Gladiator]: "Gladiator Stance",
  [config.Buff.T1_Tank_6pc]: "S03 - Item - T1 - Warrior - Tank 6P Bonus",
  [config.Buff.TAQ_Tank_4pc]: "S03 - Item - TAQ - Warrior - Tank 4P Bonus",
  [config.Buff.SE_Tank_6pc]:
    "S03 - Item - Scarlet Enclave - Warrior - Protection 6P Bonus",
  [config.Buff.RuneOfDevastate]: "Rune of Devastate",
  [config.Buff.RuneOfFuriousThunder]: "Rune of Furious Thunder",
};

export const buffMultipliers = {
  ...era.buffMultipliers,
  [config.Stance.Gladiator]: {
    coeff: (buffs) => {
      if (config.Buff.SE_Tank_6pc in buffs) {
        return getThreatCoefficient(config.Mods.SE_Tank_6pc);
      }

      return getThreatCoefficient(config.Mods.GladiatorStance);
    },
  },
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
  [config.Buff.RuneOfFuriousThunder]: {
    coeff: (buffs, spellId) => {
      const thunderClap = {
        [config.Spell.ThunderClapR1]: true,
        [config.Spell.ThunderClapR2]: true,
        [config.Spell.ThunderClapR3]: true,
        [config.Spell.ThunderClapR4]: true,
        [config.Spell.ThunderClapR5]: true,
        [config.Spell.ThunderClapR6]: true,
      };
      if (spellId in thunderClap) {
        return getThreatCoefficient(config.Mods.FuriousThunder);
      }
      return getThreatCoefficient(1);
    },
  },
};

export const fixateBuffs = {
  ...era.fixateBuffs,
};

export const notableBuffs = {
  ...Object.values(config.Stance),
  ...Object.values(config.Buff),
};

const Battle = config.Stance.Battle;
const Berserker = config.Stance.Berserker;
const Defensive = config.Stance.Defensive;

export const auraImplications = {
  // Stance Dancing causes confusion with SoD, and there are more spells allowed across stances.
  // so for now, prefer to rely on specific buff info and casts
  // ...era.auraImplications,
};

/**
 * Allows one to check the combatantInfo and infer buffs and talents.
 *
 * Here is a good place to check gear and apply Tier set bonus buffs. e.g. Check for 2pc gear, apply
 * the buff. Then, in buffMultipliers, you can apply global coefficients or to specific spells.
 */
export const combatantImplications = (unit, buffs, talents) => {
  // Tier 1 6pc
  if (
    gearSetCount(unit.gear, config.Tier.T1_Tank) >= 6 ||
    gearHasTempEnchant(unit.gear, config.Enchant.SouOfEnmity)
  ) {
    buffs[config.Buff.T1_Tank_6pc] = true;
  }
  // Tier 2.5 4pc
  if (
    gearSetCount(unit.gear, config.Tier.TAQ_Tank) >= 4 ||
    gearHasTempEnchant(unit.gear, config.Enchant.SoulOfTheSentinel)
  ) {
    buffs[config.Buff.TAQ_Tank_4pc] = true;
  }

  // Scarlet Enclave Tank 6pc
  if (gearSetCount(unit.gear, config.Tier.SE_Tank) >= 6) {
    buffs[config.Buff.SE_Tank_6pc] = true;
  }

  if (gearHasTempEnchant(unit.gear, config.Rune.Devastate)) {
    buffs[config.Buff.RuneOfDevastate] = true;
  }

  if (gearHasTempEnchant(unit.gear, config.Rune.FuriousThunder)) {
    buffs[config.Buff.RuneOfFuriousThunder] = true;
  }
};

export const spellFunctions = {
  ...era.spellFunctions,
  [config.Stance.Gladiator]: handler_zero_important,

  //Shield Slam
  [config.Spell.ShieldSlamR1]: handler_modDamagePlusThreat(
    config.Mods.ShieldSlam,
    178
  ),
  [config.Spell.ShieldSlamR2]: handler_modDamagePlusThreat(
    config.Mods.ShieldSlam,
    203
  ),
  [config.Spell.ShieldSlamR3]: handler_modDamagePlusThreat(
    config.Mods.ShieldSlam,
    229
  ),
  [config.Spell.ShieldSlamR4]: handler_modDamagePlusThreat(
    config.Mods.ShieldSlam,
    254
  ),
};
