import { getThreatCoefficient } from "../../era/base.js";
import * as era from "../../era/raid/naxx.js";
import { SANCTIFIED_ITEMS } from "./naxx_sanctified_items.js";

export { config, spellFunctions, fixateBuffs } from "../../era/raid/naxx.js";

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
  /**
   * We can store simple data on the player's buffs object rather than use global variables.
   *
   * This is a collection of keys. They should not clash with other real buff Ids, so negative
   * numbers or strings are safe.
   */
  Store: {
    /** Placeholder buff spellId for the sanctified item count. */
    SanctifiedCount: "sanctifiedCount",
  },
  Set: {
    Min: 1905, // first set id
    Max: 1918, // last set id
  },
  ZoneID: 533,
};

export const buffMultipliers = {
  ...era.buffMultipliers,
  ...getSanctifiedRankMultipliers(),
};

export const buffNames = {
  ...era.buffNames,
  1220514: "Seal of the Dawn R1",
  1223367: "Seal of the Dawn R2",
  1223368: "Seal of the Dawn R3",
  1223370: "Seal of the Dawn R4",
  1223371: "Seal of the Dawn R5",
  1223372: "Seal of the Dawn R6",
  1223373: "Seal of the Dawn R7",
  1223374: "Seal of the Dawn R8",
  1223375: "Seal of the Dawn R9",
  1223376: "Seal of the Dawn R10",
};

export const notableBuffs = {
  ...era.notableBuffs,
  ...Object.keys(config.Buff),
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
 * ```
 */
function getSanctifiedRankMultipliers() {
  return Object.entries(config.Buff).reduce((buffMult, [key, rankAuraId]) => {
    buffMult[rankAuraId] = {
      /**
       * @param {import("../../era/base.js").SpellMap<boolean>} buffs
       * @param {import("../../era/base.js").SpellId} spellId
       * @param {import("../../era/threat/fight.js").Fight} fight
       * @returns {import("../../era/base.js").ThreatCoefficientFn}
       */
      coeff: (buffs, spellId, fight) => {
        if (fight.wclData.zoneID !== config.ZoneID) {
          return getThreatCoefficient(1);
        }
        const sanctifiedCount = buffs[config.Store.SanctifiedCount];
        if (sanctifiedCount && typeof sanctifiedCount === "number") {
          const coeff = 1 + config.Mod[key] * sanctifiedCount;
          return getThreatCoefficient(coeff);
        }
        return getThreatCoefficient(1);
      },
    };
    return buffMult;
  }, {});
}

export const combatantImplications = (unit, buffs, talents) => {
  let sanctifiedCount = unit.gear.filter((id) =>
    SANCTIFIED_ITEMS.has(id)
  ).length;

  if (hasSanctifiedSetBonus(unit.gear)) {
    sanctifiedCount += 2;
  }

  sanctifiedCount = Math.max(sanctifiedCount, 8);

  buffs[config.Store.SanctifiedCount] = sanctifiedCount;
};

function hasSanctifiedSetBonus(gear) {
  const invasionSets = gear
    .filter((g) => g.setID >= config.Set.Min && g.setID <= config.Set.Max)
    .map((g) => g.setID);

  const setItemCount = countBy(invasionSets);

  return Object.values(setItemCount).some((count) => count >= 2);
}

function countBy(array, getter) {
  return array.reduce((acc, item) => {
    const key = getter ? getter(item) : item;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}
