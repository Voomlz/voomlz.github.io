import {
  getThreatCoefficient,
  handler_damage,
  handler_modDamage,
  handler_threatOnDebuff,
  handler_threatOnDebuffOrDamage,
  handler_zero,
} from "../../era/base.js";

import * as era from "../../era/class/warlock.js";

export const config = {
  Buff: {
    ...era.config.Buff,
    Metamorphosis: 403789,
    MasterDemonologist: 23836,
  },
  Mods: {
    ...era.config.Mods,
    Metamorphosis: 1.77,

    /**
     * Up to 20% more threat if imp and metamorphosis are active.
     * Without Metamorphosis, acts as a threat reduction.
     */
    MasterDemonologist: 0.04,
  },
  Spell: {
    ...era.config.Spell,
    Menace: 403828,
    DemonicHowl: 412789,
  },
};

export const initialBuffs = {
  ...era.initialBuffs,
  [config.Buff.Metamorphosis]: 0,
};

export const buffNames = {
  ...era.buffNames,
  [config.Buff.Metamorphosis]: "Metamorphosis",
  [config.Buff.MasterDemonologist]: "Master Demonologist",
};

export const buffMultipliers = {
  ...era.buffMultipliers,
  [config.Buff.Metamorphosis]: getThreatCoefficient(config.Mods.Metamorphosis),
};

export const auraImplications = {
  ...era.auraImplications,
  [config.Spell.Menace]: config.Buff.Metamorphosis,
  [config.Spell.DemonicHowl]: config.Buff.Metamorphosis,
};

export const talents = {
  ...era.talents,
  "Master Demonologist": {
    maxRank: 5,
    coeff: function (buffs, rank = 5) {
      if (config.Buff.MasterDemonologist in buffs) {
        // increased with Metamorphosis
        if (config.Buff.Metamorphosis in buffs) {
          const increase = 1 + rank * config.Mods.MasterDemonologist;
          return getThreatCoefficient(increase);
        }
        // reduction otherwise
        const reduction = 1 - rank * config.Mods.MasterDemonologist;
        return getThreatCoefficient(reduction);
      }

      return getThreatCoefficient(1);
    },
  },
};

export const fixateBuffs = {
  ...era.fixateBuffs,
  [config.Spell.Menace]: true,
  [config.Spell.DemonicHowl]: true,
};

export const spellFunctions = {
  ...era.spellFunctions,
};

export const combatantImplications = (unit, buffs, talents) => {
  era.combatantImplications(unit, buffs, talents);
};

export const notableBuffs = {
  ...Object.values(config.Buff),
};

export const invulnerabilityBuffs = {};
