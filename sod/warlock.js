import {
  getThreatCoefficient,
  handler_damage,
  handler_modDamage,
  handler_threatOnDebuff,
  handler_threatOnDebuffOrDamage,
  handler_zero,
} from "../era/base.js";

export const config = {
  Buff: {
    Metamorphosis: 403789,
    MasterDemonologist: 23836,
  },
  Mods: {
    Metamorphosis: 1.77,
    SearingPain: 2.0,

    /**
     * Up to 20% more threat if imp and metamorphosis are active.
     * Without Metamorphosis, acts as a threat reduction.
     */
    MasterDemonologist: 0.04,
  },
  Spell: {
    Menace: 403828,
    DemonicHowl: 412789,
  },
};

export const initialBuffs = {
  [config.Buff.Metamorphosis]: 0,
};

export const buffNames = {
  [config.Buff.Metamorphosis]: "Metamorphosis",
  [config.Buff.MasterDemonologist]: "Master Demonologist",
};

export const buffMultipliers = {
  [config.Buff.Metamorphosis]: getThreatCoefficient(config.Mods.Metamorphosis),
};

export const auraImplications = {
  Menace: config.Buff.Metamorphosis,
  DemonicHowl: config.Buff.Metamorphosis,
};

export const talents = {
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
  [config.Spell.Menace]: true,
  [config.Spell.DemonicHowl]: true,
};

export const spellFunctions = {
  18288: handler_zero, // Amplify Curse
  603: handler_threatOnDebuffOrDamage(120), // Curse of Doom
  18223: handler_zero, // Curse of Exhaustion
  704: handler_threatOnDebuff(2 * 14), // CoR r1
  7658: handler_threatOnDebuff(2 * 28), // CoR r2
  7659: handler_threatOnDebuff(2 * 42), // CoR r3
  11717: handler_threatOnDebuff(2 * 56), // CoR r4
  17862: handler_threatOnDebuff(2 * 44), // CoS r1
  17937: handler_threatOnDebuff(2 * 56), // CoS r2
  1714: handler_threatOnDebuff(2 * 26), // CoT r1
  11719: handler_threatOnDebuff(2 * 50), // CoT r2
  702: handler_threatOnDebuff(2 * 4), // CoW r1
  1108: handler_threatOnDebuff(2 * 12), // CoW r2
  6205: handler_threatOnDebuff(2 * 22), // CoW r3
  7646: handler_threatOnDebuff(2 * 32), // CoW r4
  11707: handler_threatOnDebuff(2 * 42), // CoW r5
  11708: handler_threatOnDebuff(2 * 52), // CoW r6
  1490: handler_threatOnDebuff(2 * 32), // CotE r1
  11721: handler_threatOnDebuff(2 * 46), // CotE r2
  11722: handler_threatOnDebuff(2 * 60), // CotE r3
  1454: handler_zero, // Life Tap r1
  1455: handler_zero, // Life Tap r2
  1456: handler_zero, // Life Tap r3
  11687: handler_zero, // Life Tap r4
  11688: handler_zero, // Life Tap r5
  11689: handler_zero, // Life Tap r6
  31818: handler_zero, // Life Tap script
  5138: handler_zero, // Drain Mana r1
  6226: handler_zero, // Drain Mana r2
  11703: handler_zero, // Drain Mana r3
  11704: handler_zero, // Drain Mana r4
  689: handler_damage, // Drain Life r1
  699: handler_damage, // Drain Life r2
  709: handler_damage, // Drain Life r3
  7651: handler_damage, // Drain Life r4
  11699: handler_damage, // Drain Life r5
  11700: handler_damage, // Drain Life r6
  18265: handler_threatOnDebuffOrDamage(2 * 30), // Siphon Life r1
  18879: handler_threatOnDebuffOrDamage(2 * 38), // Siphon Life r2
  18880: handler_threatOnDebuffOrDamage(2 * 48), // Siphon Life r3
  18881: handler_threatOnDebuffOrDamage(2 * 58), // Siphon Life r4
  710: handler_threatOnDebuff(2 * 28), // Banish r1
  18647: handler_threatOnDebuff(2 * 48), // Banish r2
  5782: handler_threatOnDebuff(2 * 8), // Fear r1
  6213: handler_threatOnDebuff(2 * 32), // Fear r2
  6215: handler_threatOnDebuff(2 * 56), // Fear r3
  172: handler_damage, // Corruption r1
  6222: handler_damage, // Corruption r2
  6223: handler_damage, // Corruption r3
  7648: handler_damage, // Corruption r4
  11671: handler_damage, // Corruption r5
  11672: handler_damage, // Corruption r6
  25311: handler_damage, // Corruption r7
  980: handler_damage, // CoA r1
  1014: handler_damage, // CoA r2
  6217: handler_damage, // CoA r3
  11711: handler_damage, // CoA r4
  11712: handler_damage, // CoA r5
  11713: handler_damage, // CoA r6
  6789: handler_damage, // Death Coil r1
  17925: handler_damage, // Death Coil r2
  17926: handler_damage, // Death Coil r3
  1120: handler_damage, // Drain Soul r1
  8288: handler_damage, // Drain Soul r2
  8289: handler_damage, // Drain Soul r3
  11675: handler_damage, // Drain Soul r4
  5484: handler_threatOnDebuff(2 * 40), // Howl of Terror r1
  17928: handler_threatOnDebuff(2 * 54), // Howl of Terror r2
  5676: handler_modDamage(config.Mods.SearingPain), // Searing Pain r1
  17919: handler_modDamage(config.Mods.SearingPain), // Searing Pain r2
  17920: handler_modDamage(config.Mods.SearingPain), // Searing Pain r3
  17921: handler_modDamage(config.Mods.SearingPain), // Searing Pain r4
  17922: handler_modDamage(config.Mods.SearingPain), // Searing Pain r5
  17923: handler_modDamage(config.Mods.SearingPain), // Searing Pain r6
};

export const combatantImplications = (unit, buffs, talents) => {};

export const notableBuffs = {
  ...Object.values(config.Buff),
};

export const invulnerabilityBuffs = {};
