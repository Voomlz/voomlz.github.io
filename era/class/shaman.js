import { getThreatCoefficient, handler_modDamage } from "../base.js";

export const config = {
  Mods: {
    EarthShock: 2.0,
    TranquilAirTotem: 0.8,
    HealingGrace: 0.05,
  },
  Buff: {
    TranquilAirTotem: 25909,
  },
  Spell: {
    EarthShockR1: 8042,
    EarthShockR2: 8044,
    EarthShockR3: 8045,
    EarthShockR4: 8046,
    EarthShockR5: 10412,
    EarthShockR6: 10413,
    EarthShockR7: 10414,
  },
};

export const initialBuffs = {};

export const buffNames = {
  [config.Buff.TranquilAirTotem]: "Tranquil Air Totem",
};

export const buffMultipliers = {
  [config.Buff.TranquilAirTotem]: getThreatCoefficient(
    config.Mods.TranquilAirTotem
  ),
};

export const HEALING_SPELLS = {
  8004: true,
  8008: true,
  8010: true,
  10466: true,
  10467: true,
  10468: true, // Lesser Healing Wave
  331: true,
  332: true,
  547: true,
  913: true,
  939: true,
  959: true,
  8005: true,
  10395: true,
  10396: true,
  25357: true, // Healing Wave
  1064: true,
  10622: true,
  10623: true, // Chain Heal
};

export const talents = {
  "Healing Grace": {
    maxRank: 3,
    coeff: (_, rank = 3, spellId) => {
      if (spellId in HEALING_SPELLS) {
        return getThreatCoefficient(1 - config.Mods.HealingGrace * rank);
      }
      return getThreatCoefficient(1);
    },
  },
};

export const fixateBuffs = {
  [config.Spell.EarthShockTaunt]: true,
};

export const spellFunctions = {
  [config.Spell.EarthShockR1]: handler_modDamage(config.Mods.EarthShock),
  [config.Spell.EarthShockR2]: handler_modDamage(config.Mods.EarthShock),
  [config.Spell.EarthShockR3]: handler_modDamage(config.Mods.EarthShock),
  [config.Spell.EarthShockR4]: handler_modDamage(config.Mods.EarthShock),
  [config.Spell.EarthShockR5]: handler_modDamage(config.Mods.EarthShock),
  [config.Spell.EarthShockR6]: handler_modDamage(config.Mods.EarthShock),
  [config.Spell.EarthShockR7]: handler_modDamage(config.Mods.EarthShock),
};

export const combatantImplications = (unit, buffs, talents) => {};

export const notableBuffs = {
  ...Object.values(config.Buff),
};

export const auraImplications = {};
