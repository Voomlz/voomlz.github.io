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
  getAdditiveThreatCoefficient,
} from "../base.js";

export const config = {
  Form: {
    Bear: 5487,
    DireBear: 9634,
    Cat: 768,
    Moonkin: 24858,
  },
  Mods: {
    Cat: 0.71,
    DireBear: 1.3,
    FeralInstinct: 0.03,
    Subtlety: 0.04,
    Maul: 1.75,
    Swipe: 1.75,
  },
  Buff: {},
  Spell: {},
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
  [config.Form.Moonkin]: "Moonkin Form",
};

export const buffMultipliers = {
  [config.Form.Bear]: getThreatCoefficient(config.Mods.DireBear),
  [config.Form.DireBear]: getThreatCoefficient(config.Mods.DireBear),
  [config.Form.Cat]: getThreatCoefficient(config.Mods.Cat),
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
  9830: Cat, //Shred
  9904: Cat, //Rake
  22829: Cat, //Ferocious Bite
  9867: Cat, //Ravage
  9896: Cat, //Rip
  9827: Cat, //Pounce
  9913: Cat, //Prowl
  9846: Cat, //Tiger's Fury
  1850: Cat,
  9821: Cat, //Dash
};

export const spellFunctions = {
  // Forms
  [config.Form.DireBear]: handler_zero,
  [config.Form.Cat]: handler_zero,

  5209: handler_markSourceOnMiss(borders.taunt), // Challenging Roar
  6807: handler_modDamage(config.Mods.Maul), // Maul (Rank 1)
  6808: handler_modDamage(config.Mods.Maul), // Maul (Rank 2)
  6809: handler_modDamage(config.Mods.Maul), // Maul (Rank 3)
  8972: handler_modDamage(config.Mods.Maul), // Maul (Rank 4)
  9745: handler_modDamage(config.Mods.Maul), // Maul (Rank 5)
  9880: handler_modDamage(config.Mods.Maul), // Maul (Rank 6)
  9881: handler_modDamage(config.Mods.Maul), // Maul

  779: handler_modDamage(config.Mods.Swipe), // Swipe (Rank 1)
  780: handler_modDamage(config.Mods.Swipe), // Swipe (Rank 2)
  769: handler_modDamage(config.Mods.Swipe), // Swipe (Rank 3)
  9754: handler_modDamage(config.Mods.Swipe), // Swipe (Rank 4)
  9908: handler_modDamage(config.Mods.Swipe), // Swipe

  99: handler_threatOnDebuff(9), // Demoralizing Roar (Rank 1)
  1735: handler_threatOnDebuff(15), // Demoralizing Roar (Rank 2)
  9490: handler_threatOnDebuff(20), // Demoralizing Roar (Rank 3)
  9747: handler_threatOnDebuff(30), // Demoralizing Roar (Rank 4)
  9898: handler_threatOnDebuff(39), // Demoralizing Roar (Rank 5)

  6795: threatFunctions.concat(
    handler_taunt,
    handler_markSourceOnMiss(borders.taunt)
  ), // Growl
  5229: handler_resourcechange, // Enrage
  17057: handler_resourcechange, // Furor

  //TODO test bash threat
  8983: handler_zero, // Bash

  /* Cat */
  9850: handler_damage, // Claw
  9830: handler_damage, // Shred
  9904: handler_damage, // Rake
  22829: handler_damage, // Ferocious Bite
  9867: handler_damage, // Ravage
  9896: handler_damage, // Rip
  9827: handler_damage, // Pounce
  9913: handler_zero, // Prowl
  9846: handler_zero, // Tiger's Fury

  1850: handler_zero, // Dash (Rank 1)
  9821: handler_zero, // Dash

  8998: handler_castCanMiss(-240), // Cower (Rank 1)
  9000: handler_castCanMiss(-390), // Cower (Rank 2)
  9892: handler_castCanMiss(-600), // Cower (Rank 3)

  /* Healing */
  //TODO

  /* Abilities */
  16857: handler_threatOnDebuff(108), // Faerie Fire (Feral)(Rank 1)
  17390: handler_threatOnDebuff(108), // Faerie Fire (Feral)(Rank 2)
  17391: handler_threatOnDebuff(108), // Faerie Fire (Feral)(Rank 3)
  17392: handler_threatOnDebuff(108), // Faerie Fire (Feral)

  770: handler_threatOnDebuff(108), // Faerie Fire (Rank 1)
  778: handler_threatOnDebuff(108), // Faerie Fire (Rank 2)
  9749: handler_threatOnDebuff(108), // Faerie Fire (Rank 3)
  9907: handler_threatOnDebuff(108), // Faerie Fire

  16870: handler_zero, // Clearcasting
  29166: handler_zero, // Innervate

  22842: handler_heal, // Frienzed Regeneration (Rank 1)
  22895: handler_heal, // Frienzed Regeneration (Rank 2)
  22896: handler_heal, // Frienzed Regeneration

  24932: handler_zero, // Leader of the Pack
};

export const notableBuffs = {
  ...Object.values(config.Form),
  ...Object.values(config.Buff),
};

export const combatantImplications = (unit, buffs, talents) => {};
