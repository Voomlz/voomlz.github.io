import {
  getThreatCoefficient,
  handler_modDamage,
  School,
  getAdditiveThreatCoefficient,
} from "../../era/base.js";

import * as era from "../../era/class/druid.js";

export const config = {
  Form: {
    ...era.config.Form,
    Tree: 439733,
  },
  Mods: {
    ...era.config.Mods,
    Lacerate: 3.5,
    Swipe: 3.5, // changed from era
    T1_Tank_6pc: 0.2,
  },
  Buff: {
    ...era.config.Buff,
    T1_Tank_6pc: 456332,
  },
  Spell: {
    ...era.config.Spell,
    Starsurge: 417157,
    Starfall: 439753,
    WildGrowth: 408120,
    Lifebloom: 408124,
    LifebloomTick: 408245,
    Nourish: 408247,
    LivingSeed: 414683,
  },
};

export const initialBuffs = {
  ...era.initialBuffs,
};

export const buffNames = {
  ...era.buffNames,
  [config.Buff.T1_Tank_6pc]: "S03 - Item - T1 - Druid - Tank 6P Bonus",
};

export const buffMultipliers = {
  ...era.buffMultipliers,
  [config.Form.Moonkin]: getThreatCoefficient({
    [School.Arcane]: 0.7,
    [School.Nature]: 0.7,
  }),
  [config.Buff.T1_Tank_6pc]: getAdditiveThreatCoefficient(
    config.Mods.T1_Tank_6pc,
    config.Mods.DireBear
  ),
};

const HEALING_SPELLS = {
  8936: true,
  8938: true,
  8940: true,
  8941: true,
  9750: true,
  9856: true,
  9857: true,
  9858: true,
  26980: true,
  774: true,
  1058: true,
  1430: true,
  2090: true,
  2091: true,
  3627: true,
  8910: true,
  9839: true,
  9840: true,
  9841: true,
  25299: true,
  26981: true,
  26982: true,
  5185: true,
  5186: true,
  5187: true,
  5188: true,
  5189: true,
  6778: true,
  8903: true,
  9758: true,
  9888: true,
  9889: true,
  25297: true,
  26978: true,
  26979: true,
  740: true,
  8918: true,
  9862: true,
  9863: true,
  26983: true,
  [config.Spell.WildGrowth]: true,
  [config.Spell.Lifebloom]: true,
  [config.Spell.LifebloomTick]: true,
  [config.Spell.Nourish]: true,
  [config.Spell.LivingSeed]: true,
};
export const talents = {
  ...era.talents,
  // TODO: remove this, since we have better initial buff detection
  "Moonkin Form": {
    maxRank: 1,
    coeff: function (buffs) {
      if (!(config.Form.Moonkin in buffs)) return getThreatCoefficient(1);
      return getThreatCoefficient({
        [School.Arcane]: 0.7,
        [School.Nature]: 0.7,
      });
    },
  },
  Subtlety: {
    maxRank: 5,
    coeff: (_, rank = 5, spellId) => {
      if (spellId in HEALING_SPELLS) {
        return getThreatCoefficient(1 - rank * config.Mods.Subtlety);
      }
      return getThreatCoefficient(1);
    },
  },
};

export const fixateBuffs = {
  ...era.fixateBuffs,
};

const Cat = config.Form.Cat;
const Bear = config.Form.DireBear;
const Moonkin = config.Form.Moonkin;

export const auraImplications = {
  ...era.auraImplications,

  // TODO: probably can remove this now we have better initial buff detection

  // Moonkin Form - Since Starsurge and Starfall are Boomy skills, and take up Nourish and
  // Lifebloom slots, we can assume these abilities imply Moonkin form
  [config.Spell.Starsurge]: Moonkin,
  [config.Spell.Starfall]: Moonkin,
};

export const spellFunctions = {
  ...era.spellFunctions,

  /* Bear - See SoD Druid disc: https://discord.com/channels/253205420225724416/1186591609819762750/1310758667561467934 */
  // Mangle is 1.0x threat

  779: handler_modDamage(config.Mods.Swipe), // Swipe (Rank 1)
  780: handler_modDamage(config.Mods.Swipe), // Swipe (Rank 2)
  769: handler_modDamage(config.Mods.Swipe), // Swipe (Rank 3)
  9754: handler_modDamage(config.Mods.Swipe), // Swipe (Rank 4)
  9908: handler_modDamage(config.Mods.Swipe), // Swipe

  414644: handler_modDamage(config.Mods.Lacerate), // Lacerate (Initial)
  414647: handler_modDamage(config.Mods.Lacerate), // Lacerate (Dot?)
};

export const notableBuffs = {
  ...Object.values(config.Form),
  ...Object.values(config.Buff),
};

export const combatantImplications = (unit, buffs, talents) => {};
