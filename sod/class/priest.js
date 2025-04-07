import {
  gearHasTempEnchant,
  gearSetCount,
  getThreatCoefficient,
} from "../../era/base.js";
import * as era from "../../era/class/priest.js";

export const config = {
  Buff: {
    ...era.config.Buff,
    SE_DPS_4pc: 1226591,
  },
  Mods: {
    ...era.config.Mods,
    /** Your Mind Blast deals 50% reduced threat, and gains 20% damage increase from each stack of Mind Spike on the target. */
    SE_DPS_4pc: 0.5,
  },
  Spell: {
    ...era.config.Spell,
  },
  Tier: {
    SE_DPS: 1938, // Scarlet Enclave - Raiments of Revelation
  },
};

export const initialBuffs = {
  ...era.initialBuffs,
};

export const buffNames = {
  ...era.buffNames,
  [config.Buff.SE_DPS_4pc]:
    "S03 - Item - Scarlet Enclave - Priest - Shadow 4P Bonus",
};

const MIND_BLAST_IDS = {
  8092: true, // Mind Blast r1
  8102: true, // Mind Blast r2
  8103: true, // Mind Blast r3
  8104: true, // Mind Blast r4
  8105: true, // Mind Blast r5
  8106: true, // Mind Blast r6
  10945: true, // Mind Blast r7
  10946: true, // Mind Blast r8
  10947: true, // Mind Blast r9
};

export const buffMultipliers = {
  ...era.buffMultipliers,
  [config.Buff.SE_DPS_4pc]: {
    coeff: (buffs, spellId) => {
      if (spellId in MIND_BLAST_IDS) {
        return getThreatCoefficient(config.Buff.SE_DPS_4pc);
      }
      return getThreatCoefficient(1);
    },
  },
};

export const talents = {
  ...era.talents,
};

export const fixateBuffs = {
  ...era.fixateBuffs,
};

export const spellFunctions = {
  ...era.spellFunctions,
};

export const combatantImplications = (unit, buffs, talents) => {
  era.combatantImplications(unit, buffs, talents);

  if (gearSetCount(unit.gear, config.Tier.SE_DPS) >= 4) {
    buffs[config.Buff.SE_DPS_4pc] = true;
  }
};

export const notableBuffs = {
  ...Object.values(config.Buff),
};

export const invulnerabilityBuffs = {};

export const auraImplications = {
  ...era.auraImplications,
};
