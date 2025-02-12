import {
  getThreatCoefficient,
  handler_damage,
  handler_modDamage,
  handler_modHeal,
  handler_threatOnBuff,
  handler_zero,
  School,
  threatFunctions,
} from "../era/base.js";

export const config = {
  /**
   * From the Light Club disc:
   * - Hand of Reckoning rune applies a 1.5 baseline tank threat multiplier to all threat
   * - Holy threat without imp. RF with HoR is 2.23 (1.6 * 1.5 is 2.4 so it's not applied consitently)
   * - Holy threat with imp. RF and HoR is 2.85 (= 1.9 * 1.5)
   */
  Mods: {
    Salvation: 0.7,
    RighteousFury: 1.6,
    /** Total Imp RF buff is 1.9 - 1.6 / 3 */
    ImpRf: (1.9 - 1.6) / 3,
    /** A 1.5 modifier to all attacks (2.85 = 1.9 (ImpRf) * 1.5) */
    HandOfReckoning: 1.5,

    /** 6% per rank to physical and holy damage, only when RF is not up */
    Vengeance: 0.06,
  },
  Buff: {
    Salv: 1038,
    GreaterSalv: 25895,
    RighteousFury: 25780,
    EngraveHandOfReckoning: 410001,
  },
  Rune: {
    HandOfReckoning: 6844,
  },
};

export const initialBuffs = {
  [config.Buff.RighteousFury]: 0,
};

export const buffNames = {
  [config.Buff.Salv]: "Blessing of Salvation",
  [config.Buff.GreaterSalv]: "Greater Blessing of Salvation",
  [config.Buff.RighteousFury]: "Righteous Fury",
  [config.Buff.EngraveHandOfReckoning]: "Engrave Gloves - Hand of Reckoning",
};

export const buffMultipliers = {
  [config.Buff.Salv]: getThreatCoefficient(config.Mods.Salvation),
  [config.Buff.GreaterSalv]: getThreatCoefficient(config.Mods.Salvation),
  [config.Buff.RighteousFury]: getThreatCoefficient({
    [School.Holy]: config.Mods.RighteousFury,
  }),
  [config.Buff.EngraveHandOfReckoning]: {
    coeff(buffs, spellId) {
      if (config.Buff.RighteousFury in buffs) {
        return getThreatCoefficient(config.Mods.HandOfReckoning);
      }
      return getThreatCoefficient(1.0);
    },
  },
};

export const talents = {
  "Improved Righteous Fury": {
    maxRank: 3,
    coeff: function (buffs, rank = 3) {
      if (config.Buff.RighteousFury in buffs) {
        return getThreatCoefficient({
          [School.Holy]:
            (1 + rank * config.Mods.ImpRf) / config.Mods.RighteousFury,
        });
      }
      return getThreatCoefficient(1);
    },
  },
  Vengeance: {
    maxRank: 5,
    coeff: function (buffs, rank = 5) {
      if (config.Buff.RighteousFury in buffs) {
        return getThreatCoefficient(1);
      }
      const mod = 1 - rank * config.Mods.Vengeance;
      return getThreatCoefficient({
        [School.Pysical]: mod,
        [School.Holy]: mod,
      });
    },
  },
};

export const fixateBuffs = {
  407631: true, // Hand of Reckoning
};

export const spellFunctions = {
  25898: handler_threatOnBuff(60), // GBoK
  25890: handler_threatOnBuff(60), // GBoL
  25916: handler_threatOnBuff(60), // GBoM
  25895: handler_threatOnBuff(60), // GBoS
  25899: handler_threatOnBuff(60), // GBoSanc
  25894: handler_threatOnBuff(54), // GBoW
  25918: handler_threatOnBuff(60), // GBoW
  19742: handler_threatOnBuff(14), // BoW
  19850: handler_threatOnBuff(24), // BoW
  19852: handler_threatOnBuff(34), // BoW
  19853: handler_threatOnBuff(44), // BoW
  19854: handler_threatOnBuff(54), // BoW
  25290: handler_threatOnBuff(60), // BoW
  20293: threatFunctions.concat(handler_threatOnBuff(58), handler_damage), // Seal of Righteousness r8
  20286: handler_damage, // Judgement of Righteousness
  26573: handler_damage, // Consecration r1
  20116: handler_damage, // Consecration r2
  20922: handler_damage, // Consecration r3
  20923: handler_damage, // Consecration r4
  20924: handler_damage, // Consecration r5
  24239: handler_damage, // Hammer of Wrath
  20925: handler_modDamage(1.2), // Holy Shield r1
  20927: handler_modDamage(1.2), // Holy Shield r2
  20928: handler_modDamage(1.2), // Holy Shield r3
  465: handler_zero, // Devotion Aura r1
  10290: handler_zero, // Devotion Aura r2
  643: handler_zero, // Devotion Aura r3
  10291: handler_zero, // Devotion Aura r4
  1032: handler_zero, // Devotion Aura r5
  10292: handler_zero, // Devotion Aura r6
  10293: handler_zero, // Devotion Aura r7
  19746: handler_zero, // Concentration Aura
  19891: handler_zero, // Fire Resistance Aura r1
  19899: handler_zero, // Fire Resistance Aura r2
  19900: handler_zero, // Fire Resistance Aura r3
  19888: handler_zero, // Frost Resistance Aura r1
  19897: handler_zero, // Frost Resistance Aura r2
  19898: handler_zero, // Frost Resistance Aura r3
  19876: handler_zero, // Shadow Resistance Aura r1
  19895: handler_zero, // Shadow Resistance Aura r2
  19896: handler_zero, // Shadow Resistance Aura r3
  7294: handler_damage, // Retribution Aura r1
  10298: handler_damage, // Retribution Aura r2
  10299: handler_damage, // Retribution Aura r3
  10300: handler_damage, // Retribution Aura r4
  10301: handler_damage, // Retribution Aura r5
  20218: handler_zero, // Sanctity Aura
  // Paladin heals have .25 coefficient. Sources:
  // cha#0438 2018-12-04 https://discordapp.com/channels/383596811517952002/456930992557654037/519502645858271243
  //     [15:17] chaboi: but there is a grain of truth in that shitpost since paladin healing threat did get specifically nerfed by blizzard early on so they wouldnt be able to tank dungeons via just healing themselves
  //     [15:18] chaboi: which is why paladin healing threat is 0.5, which is much lower than the other healers even if they talent into threat reduc
  // 4man Onyxia https://classic.warcraftlogs.com/reports/TFqN9Z1HCxnLPypG
  //     Paladin doesn't pull threat when he should at usual .5 heal coefficient.
  635: handler_modHeal(0.5), // Holy Light r1
  639: handler_modHeal(0.5), // Holy Light r2
  647: handler_modHeal(0.5), // Holy Light r3
  1026: handler_modHeal(0.5), // Holy Light r4
  1042: handler_modHeal(0.5), // Holy Light r5
  3472: handler_modHeal(0.5), // Holy Light r6
  10328: handler_modHeal(0.5), // Holy Light r7
  10329: handler_modHeal(0.5), // Holy Light r8
  25292: handler_modHeal(0.5), // Holy Light r9
  19750: handler_modHeal(0.5), // Flash of Light r1
  19939: handler_modHeal(0.5), // Flash of Light r2
  19940: handler_modHeal(0.5), // Flash of Light r3
  19941: handler_modHeal(0.5), // Flash of Light r4
  19942: handler_modHeal(0.5), // Flash of Light r5
  19943: handler_modHeal(0.5), // Flash of Light r6
  //633: handler_modHeal(.5), // Lay on Hands r1 - Generates a total threat of heal * .5 instead of heal * .25
  //2800: handler_modHeal(.5), // Lay on Hands r2
  //10310: handler_modHeal(.5), // Lay on Hands r3
  25914: handler_modHeal(0.5), // Holy Shock r1
  25913: handler_modHeal(0.5), // Holy Shock r2
  25903: handler_modHeal(0.5), // Holy Shock r3
  19968: handler_modHeal(0.5), // Holy Light that appears in logs
  19993: handler_modHeal(0.5), // Flash of Light that appears in logs
};

export const combatantImplications = (unit, buffs, talents) => {
  if (
    unit.gear.some((g) => g.temporaryEnchant === config.Rune.HandOfReckoning)
  ) {
    buffs[config.Buff.EngraveHandOfReckoning] = true;
  }
};

export const notableBuffs = {
  ...Object.values(config.Buff),
};

export const invulnerabilityBuffs = {
  498: "Divine Protection",
  5573: "Divine Protection",
  642: "Divine Shield",
  1020: "Divine Shield",
  1022: "Blessing of Protection",
  5599: "Blessing of Protection",
  10278: "Blessing of Protection",
  19752: "Divine Intervention",
};
