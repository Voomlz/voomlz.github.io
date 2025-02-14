import {
  borders,
  getThreatCoefficient,
  handler_castCanMiss,
  handler_damage,
  handler_heal,
  handler_markSourceOnMiss,
  handler_modDamage,
  handler_resourcechange,
  handler_taunt,
  handler_threatOnDebuff,
  handler_zero,
  School,
  threatFunctions,
} from "../era/base.js";

import { getAdditiveThreatCoefficient } from "../era/base.js";

export const config = {
  Form: {
    Bear: 5487,
    DireBear: 9634,
    Cat: 768,
    Tree: 439733,
    Moonkin: 24858,
  },
  Mods: {
    Cat: 0.71,
    DireBear: 1.3,
    FeralInstinct: 0.03,
    Lacerate: 3.5,
    Swipe: 3.5,
    T1_Tank_6pc: 0.2,
  },
  Buff: {
    T1_Tank_6pc: 456332,
  },
  Spell: {
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
  [config.Form.Bear]: 0,
  [config.Form.DireBear]: 0,
  [config.Form.Cat]: 0,
};

export const buffNames = {
  [config.Form.Bear]: "Bear Form",
  [config.Form.DireBear]: "Dire Bear Form",
  [config.Form.Cat]: "Cat Form",
  [config.Form.Tree]: "Tree Form",
  [config.Form.Moonkin]: "Moonkin Form",
  [config.Buff.T1_Tank_6pc]: "S03 - Item - T1 - Druid - Tank 6P Bonus",
};

export const buffMultipliers = {
  [config.Form.Bear]: getThreatCoefficient(config.Mods.DireBear),
  [config.Form.DireBear]: getThreatCoefficient(config.Mods.DireBear),
  [config.Buff.T1_Tank_6pc]: getAdditiveThreatCoefficient(
    config.Mods.T1_Tank_6pc,
    config.Mods.DireBear
  ),
  [config.Form.Moonkin]: getThreatCoefficient({
    [School.Arcane]: 0.7,
    [School.Nature]: 0.7,
  }),
  [config.Form.Cat]: getThreatCoefficient(config.Mods.Cat), // Cat Form
};

export const talents = {
  "Feral Instinct": {
    maxRank: 5,
    coeff: function (buffs, rank = 5) {
      if (!(config.Form.Bear in buffs) && !(config.Form.DireBear in buffs))
        return getThreatCoefficient(1);
      return getAdditiveThreatCoefficient(
        config.Mods.FeralInstinct * rank,
        config.Mods.DireBear
      );
    },
  },
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
    coeff: (_, rank = 5, spellId) =>
      getThreatCoefficient(
        1 -
          0.04 *
            rank *
            (spellId in
              {
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
              })
      ),
  },
};

export const fixateBuffs = {
  5209: true, // Challenging Roar
  6795: true, // Growl
};

const Cat = config.Form.Cat;
const Bear = config.Form.DireBear;
const Moonkin = config.Form.Moonkin;

export const auraImplications = {
  // Dire Bear Form
  6807: Bear,
  6808: Bear,
  6809: Bear,
  8972: Bear,
  9745: Bear,
  9880: Bear,
  9881: Bear, //Maul
  779: Bear,
  780: Bear,
  769: Bear,
  9754: Bear,
  9908: Bear, //Swipe
  414644: Bear, //Lacerate
  407995: Bear, //Mangle (Bear)
  99: Bear,
  1735: Bear,
  9490: Bear,
  9747: Bear,
  9898: Bear, //Demoralizing Roar
  6795: Bear, //Growl
  5229: Bear, //Enrage
  17057: Bear, //Furor
  8983: Bear, //Bash

  // Cat Form
  9850: Cat, //Claw
  407993: Cat, //Mangle (Cat)
  9830: Cat, //Shred
  9904: Cat, //Rake
  22829: Cat, //Ferocious Bite
  9867: Cat, //Ravage
  9896: Cat, //Rip
  9827: Cat, //Pounce
  9913: Cat, //Prowl
  9846: Cat,
  417045: Cat, //Tiger's Fury
  407988: Cat, //Savage Roar
  411128: Cat, //Swipe (Cat)
  1850: Cat,
  9821: Cat, //Dash

  // Moonkin Form - Since Starsurge and Starfall are Boomy skills, and take up Nourish and
  // Lifebloom slots, we can assume these abilities imply Moonkin form
  [config.Spell.Starsurge]: Moonkin,
  [config.Spell.Starfall]: Moonkin,
};

export const spellFunctions = {
  /* Forms */
  [config.Form.DireBear]: handler_zero, //(1.45, "Bear Form"),
  [config.Form.Cat]: handler_zero, //(0.71, "Cat Form"),

  /* Bear - See SoD Druid disc: https://discord.com/channels/253205420225724416/1186591609819762750/1310758667561467934 */
  // Mangle is 1.0x threat

  5209: handler_markSourceOnMiss(borders.taunt), // Challenging Roar
  6807: handler_modDamage(1.75, "Maul (Rank 1)"),
  6808: handler_modDamage(1.75, "Maul (Rank 2)"),
  6809: handler_modDamage(1.75, "Maul (Rank 3)"),
  8972: handler_modDamage(1.75, "Maul (Rank 4)"),
  9745: handler_modDamage(1.75, "Maul (Rank 5)"),
  9880: handler_modDamage(1.75, "Maul (Rank 6)"),
  9881: handler_modDamage(1.75, "Maul"),

  779: handler_modDamage(3.5, "Swipe (Rank 1)"),
  780: handler_modDamage(3.5, "Swipe (Rank 2)"),
  769: handler_modDamage(3.5, "Swipe (Rank 3)"),
  9754: handler_modDamage(3.5, "Swipe (Rank 4)"),
  9908: handler_modDamage(3.5, "Swipe"),

  414644: handler_modDamage(3.5), // Lacerate (Initial)
  414647: handler_modDamage(3.5), // Lacerate (Dot?)

  99: handler_threatOnDebuff(9, "Demoralizing Roar (Rank 1)"),
  1735: handler_threatOnDebuff(15, "Demoralizing Roar (Rank 2)"),
  9490: handler_threatOnDebuff(20, "Demoralizing Roar (Rank 3)"),
  9747: handler_threatOnDebuff(30, "Demoralizing Roar (Rank 4)"),
  9898: handler_threatOnDebuff(39, "Demoralizing Roar"),

  6795: threatFunctions.concat(
    handler_taunt,
    handler_markSourceOnMiss(borders.taunt)
  ), //("Growl"),
  5229: handler_resourcechange, //("Enrage"),
  17057: handler_resourcechange, //("Furor"),

  8983: handler_zero, //("Bash"), //TODO test bash threat

  /* Cat */
  9850: handler_damage, //("Claw"),
  9830: handler_damage, //("Shred"),
  9904: handler_damage, //("Rake"),
  22829: handler_damage, //("Ferocious Bite"),
  9867: handler_damage, //("Ravage"),
  9896: handler_damage, //("Rip"),
  9827: handler_damage, //("Pounce"),
  9913: handler_zero, //("Prowl"),
  9846: handler_zero, //("Tiger's Fury"),

  1850: handler_zero, //("Dash (Rank 1)"),
  9821: handler_zero, //("Dash"),

  8998: handler_castCanMiss(-240, "Cower (Rank 1)"),
  9000: handler_castCanMiss(-390, "Cower (Rank 2)"),
  9892: handler_castCanMiss(-600, "Cower"),

  /* Healing */
  //TODO

  /* Abilities */
  16857: handler_threatOnDebuff(108, "Faerie Fire (Feral)(Rank 1)"),
  17390: handler_threatOnDebuff(108, "Faerie Fire (Feral)(Rank 2)"),
  17391: handler_threatOnDebuff(108, "Faerie Fire (Feral)(Rank 3)"),
  17392: handler_threatOnDebuff(108, "Faerie Fire (Feral)"),

  770: handler_threatOnDebuff(108, "Faerie Fire (Rank 1)"),
  778: handler_threatOnDebuff(108, "Faerie Fire (Rank 2)"),
  9749: handler_threatOnDebuff(108, "Faerie Fire (Rank 3)"),
  9907: handler_threatOnDebuff(108, "Faerie Fire"),

  16870: handler_zero, //("Clearcasting"),
  29166: handler_zero, //("Innervate"),

  22842: handler_heal, //("Frienzed Regeneration (Rank 1)"),
  22895: handler_heal, //("Frienzed Regeneration (Rank 2)"),
  22896: handler_heal, //("Frienzed Regeneration"),

  24932: handler_zero, //("Leader of the Pack"),
};

export const notableBuffs = {
  ...Object.values(config.Form),
  ...Object.values(config.Buff),
};

export const combatantImplications = (unit, buffs, talents) => {};
