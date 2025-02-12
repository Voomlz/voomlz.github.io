import {
  getThreatCoefficient,
  School,
  handler_zero,
  handler_threatOnHit,
} from "../era/base.js";

export const config = {
  Buff: {},
  Mods: {},
  Spell: {},
};

export const initialBuffs = {};

export const buffNames = {};

export const buffMultipliers = {};

export const talents = {
  "Silent Resolve": {
    maxRank: 5,
    coeff: (_, rank = 5) => getThreatCoefficient(1 - 0.04 * rank),
  },
  "Shadow Affinity": {
    maxRank: 3,
    coeff: (_, rank = 3) =>
      getThreatCoefficient({
        [School.Shadow]: 1 - Math.floor((rank * 25) / 3) / 100,
      }),
  },
};

export const fixateBuffs = {};

export const spellFunctions = {
  6788: handler_zero, // Weakened Soul
  8092: handler_threatOnHit(40), // Mind Blast r1
  8102: handler_threatOnHit(77), // Mind Blast r2
  8103: handler_threatOnHit(121), // Mind Blast r3
  8104: handler_threatOnHit(180), // Mind Blast r4
  8105: handler_threatOnHit(236), // Mind Blast r5
  8106: handler_threatOnHit(303), // Mind Blast r6
  10945: handler_threatOnHit(380), // Mind Blast r7
  10946: handler_threatOnHit(460), // Mind Blast r8
  10947: handler_threatOnHit(540), // Mind Blast r9
  15237: handler_zero, // Holy Nova r1
  15430: handler_zero, // Holy Nova r2
  15431: handler_zero, // Holy Nova r3
  27799: handler_zero, // Holy Nova r4
  27800: handler_zero, // Holy Nova r5
  27801: handler_zero, // Holy Nova r6
  23455: handler_zero, // Holy Nova r1
  23458: handler_zero, // Holy Nova r2
  23459: handler_zero, // Holy Nova r3
  27803: handler_zero, // Holy Nova r4
  27804: handler_zero, // Holy Nova r5
  27805: handler_zero, // Holy Nova r6
};

export const combatantImplications = (unit, buffs, talents) => {};

export const notableBuffs = {
  ...Object.values(config.Buff),
};

export const invulnerabilityBuffs = {};

export const auraImplications = {};
