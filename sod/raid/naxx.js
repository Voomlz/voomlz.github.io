import { getThreatCoefficient } from "../../era/base.js";

const config = {
  Mod: {
    SealR1: 3.13 / 100,
    SealR2: 4.3 / 100,
    SealR3: 5.0 / 100,
    SealR4: 5.63 / 100,
    SealR5: 6.25 / 100,
    SealR6: 7.5 / 100,
    SealR7: 8.13 / 100,
    SealR8: 9.38 / 100,
    SealR9: 10.0 / 100,
    SealR10: 10.63 / 100,
  },
  Buff: {
    SealR1: 1220514,
    SealR2: 1223367,
    SealR3: 1223368,
    SealR4: 1223370,
    SealR5: 1223371,
    SealR6: 1223372,
    SealR7: 1223373,
    SealR8: 1223374,
    SealR9: 1223375,
    SealR10: 1223376,
  },
  Set: {
    Min: 1905, // first set id
    Max: 1918, // last set id
  },
};

const sanctifiedCount = 8; // TODO: implement sanctified item counting

export const buffMultipliers = {
  ...getSanctifiedRankMultipliers(),
};

export const notableBuffs = {
  ...Object.keys(buffMultipliers),
};

/**
 * Returns a map of Seal aura IDs to the threat multiplier for each rank. The multiplier is based on
 * the sanctified item count.
 *
 * e.g.
 *
 * ```ts
 * {
 *   [config.Buff.SealR1]: {
 *     coeff: (buffs, spellId) => {
 *       return getThreatCoefficient(1 + config.Mod.SealR1 * sanctifiedCount);
 *     },
 *   },
 * }
 */
function getSanctifiedRankMultipliers() {
  return Object.entries(config.Buff).reduce((acc, [key, auraId]) => {
    acc[auraId] = {
      coeff: (buffs, spellId) => {
        if (sanctifiedCount) {
          const coeff = 1 + config.Mod[key] * sanctifiedCount;
          return getThreatCoefficient(coeff);
        }
        return getThreatCoefficient(1);
      },
    };
    return acc;
  }, {});
}

export const combatantImplications = (unit, buffs, talents) => {
  // TODO: implement sanctified item counting
};

function hasSanctifiedSetBonus(gear) {
  const invasionSets = gear
    .filter((g) => g.setID >= config.Set.Min && g.setID <= config.Set.Max)
    .map((g) => g.setID);

  const setItemCount = countBy(invasionSets);

  return Object.values(setItemCount).some((count) => count >= 3);
}

function countBy(array, getter) {
  return array.reduce((acc, item) => {
    const key = getter ? getter(item) : item;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}
