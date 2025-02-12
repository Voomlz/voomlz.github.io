import {
  getThreatCoefficient,
  handler_castCanMiss,
  handler_threatOnHit,
  handler_vanish,
} from "../era/base.js";

export const config = {
  Buff: {
    T1_Ranged_2pc: 456339, // Ferocity
  },
  Mods: {
    T1_Ranged_2pc: 2.0,
  },
  Spell: {
    FeignDeath: 5384,
    DistractingShotR1: 20736,
    DistractingShotR2: 14274,
    DistractingShotR3: 15629,
    DistractingShotR4: 15630,
    DistractingShotR5: 15631,
    DistractingShotR6: 15632,
    DisengageR1: 781,
    DisengageR2: 14272,
    DisengageR3: 14273,
  },
};

export const initialBuffs = {};

export const buffNames = {
  [config.Buff.T1_Ranged_2pc]: "Ferocity",
};

export const auraImplications = {};

export const buffMultipliers = {
  [config.Buff.T1_Ranged_2pc]: getThreatCoefficient(config.Mods.T1_Ranged_2pc),
};

export const talents = {};

export const fixateBuffs = {
  // TODO: pet growl if BM rune is active
};

export const spellFunctions = {
  [config.Spell.FeignDeath]: handler_vanish, // Feign Death
  [config.Spell.DistractingShotR1]: handler_threatOnHit(110), // Distracting Shot r1
  [config.Spell.DistractingShotR2]: handler_threatOnHit(160), // Distracting Shot r2
  [config.Spell.DistractingShotR3]: handler_threatOnHit(250), // Distracting Shot r3
  [config.Spell.DistractingShotR4]: handler_threatOnHit(350), // Distracting Shot r4
  [config.Spell.DistractingShotR5]: handler_threatOnHit(465), // Distracting Shot r5
  [config.Spell.DistractingShotR6]: handler_threatOnHit(600), // Distracting Shot r6
  [config.Spell.DisengageR1]: handler_castCanMiss(-140), // Disengage Rank 1
  [config.Spell.DisengageR2]: handler_castCanMiss(-280), // Disengage Rank 2
  [config.Spell.DisengageR3]: handler_castCanMiss(-405), // Disengage Rank 3
};

export const combatantImplications = (unit, buffs, talents) => {};

export const notableBuffs = {
  ...Object.values(config.Buff),
};

export const invulnerabilityBuffs = {};
