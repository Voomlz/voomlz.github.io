import {
  borders,
  getThreatCoefficient,
  handler_castCanMissNoCoefficient,
  handler_markSourceOnMiss,
  handler_modDamage,
  handler_taunt,
  handler_vanish,
  threatFunctions,
} from "../era/base.js";

export const config = {
  Mods: {
    Base: 0.71,
    JustAFleshWound: 1.855, // taken from compendium
    MainGauche: 1.51,
    T1_Tank_2pc: 2.0,
    UnfairAdvantage: 1.5,
  },
  Spell: {
    Blunderbuss: 436564,
    CrimsonTempest: 412096,
    FanOfKnives: 409240,
    PoisonedKnife: 425012,
    SinisterStrikeR7: 11293,
    SinisterStrikeR8: 11294,
    Tease: 410412,
    UnfairAdvantage: 432274,
    MainGauche: 424919,
  },
  Buff: {
    JustAFleshWound: 400014,
    MainGauche: 462752,
    BladeDance: 400012,
    T1_Tank_2pc: 457349,
  },
};

export const initialBuffs = {
  [config.Buff.JustAFleshWound]: 0,
  [config.Buff.T1_Tank_2pc]: 3,
};

export const buffNames = {
  [config.Buff.JustAFleshWound]: "Just a Flesh Wound",
  [config.Buff.MainGauche]: "Main Gauche",
  [config.Buff.T1_Tank_2pc]: "S03 - Item - T1 - Rogue - Tank 2P Bonus",
};

export const buffMultipliers = {
  [config.Buff.JustAFleshWound]: getThreatCoefficient(
    config.Mods.JustAFleshWound
  ),
  [config.Buff.MainGauche]: {
    coeff: (buffs, spellId) => {
      const moddedSpells = {
        // TODO: lower ranks
        [config.Spell.SinisterStrikeR7]: true,
        [config.Spell.SinisterStrikeR8]: true,
        [config.Spell.PoisonedKnife]: true,
      };
      if (spellId in moddedSpells) {
        return getThreatCoefficient(config.Mods.MainGauche);
      }

      return getThreatCoefficient(1);
    },
  },
  [config.Buff.T1_Tank_2pc]: {
    coeff: (buffs, spellId) => {
      const moddedSpells = {
        [config.Spell.CrimsonTempest]: true,
        [config.Spell.Blunderbuss]: true,
        [config.Spell.FanOfKnives]: true,
      };
      if (
        config.Buff.BladeDance in buffs &&
        config.Buff.JustAFleshWound in buffs &&
        spellId in moddedSpells
      ) {
        return getThreatCoefficient(config.Mods.T1_Tank_2pc);
      }
      return getThreatCoefficient(1);
    },
  },
};

export const talents = {};

export const fixateBuffs = {
  [config.Spell.Tease]: true,
};

export const auraImplications = {
  [config.Spell.MainGauche]: config.Buff.JustAFleshWound,
};

export const spellFunctions = {
  // Rogue
  1856: handler_vanish,
  1857: handler_vanish, // Vanish
  1966: handler_castCanMissNoCoefficient(-150), // Feint r1
  6768: handler_castCanMissNoCoefficient(-240), // Feint r2
  8637: handler_castCanMissNoCoefficient(-390), // Feint r3
  11303: handler_castCanMissNoCoefficient(-600), // Feint r4
  25302: handler_castCanMissNoCoefficient(-800), // Feint r5

  // Rogue: SoD. Info from the compendium: https://docs.google.com/document/d/1BCCkILiz9U-VcX7489WGam2cK_Dm8InahnpQ3bS-UxA/edit?usp=sharing
  [config.Spell.Tease]: threatFunctions.concat(
    handler_taunt,
    handler_markSourceOnMiss(borders.taunt)
  ),
  [config.Spell.UnfairAdvantage]: handler_modDamage(
    config.Mods.UnfairAdvantage
  ),
};

export const notableBuffs = {
  ...Object.values(config.Buff),
};

export const combatantImplications = (unit, buffs, talents) => {};

export const baseThreatCoefficient = getThreatCoefficient(config.Mods.Base);
