import {
  borders,
  getAdditiveThreatCoefficient,
  getThreatCoefficient,
  handler_castCanMiss,
  handler_damage,
  handler_heal,
  handler_markSourceOnMiss,
  handler_modDamage,
  handler_modDamagePlusThreat,
  handler_resourcechange,
  handler_resourcechangeCoeff,
  handler_taunt,
  handler_threatOnBuff,
  handler_threatOnDebuff,
  handler_threatOnHit,
  handler_zero,
  threatFunctions,
} from "../era/base.js";

export const config = {
  Stance: {
    Defensive: 71,
    Battle: 2457,
    Berserker: 2458,
    Gladiator: 412513,
  },
  Mods: {
    DefensiveStance: 1.3,
    Defiance: 0.03, // 3% per point up to 15%
    OtherStances: 0.8,
    GladiatorStance: 0.7,

    /** Base shield slam mod */
    ShieldSlam: 2.0,

    /** Base Revenge mod */
    Revenge: 2.25,

    /** 1.20 in defensive stance */
    T1_Tank_6pc: 1.2,

    /** 2.0x to Shield Slam */
    TAQ_Tank_4pc: 2.0,

    /** 1.5x to Thunder Clap with the rune */
    FuriousThunder: 1.5,

    /** 1.5x to Devastate only when in Def stance */
    RuneOfDevastate: 1.5,
  },
  Spell: {
    Taunt: 355,
    ChallengingShout: 1161,
    Devastate: 20243, // Original
    DevastateSoD: 403196, // SoD version
    ShieldSlamR1: 23922,
    ShieldSlamR2: 23923,
    ShieldSlamR3: 23924,
    ShieldSlamR4: 23925,
    ThunderClapR1: 6343,
    ThunderClapR2: 8198,
    ThunderClapR3: 8204,
    ThunderClapR4: 8205,
    ThunderClapR5: 11580,
    ThunderClapR6: 11581,
  },
  Tier: {
    T1_Tank: 1719,
    TAQ_Tank: 1857,
  },
  Buff: {
    T1_Tank_6pc: 457651,
    TAQ_Tank_4pc: 1214162,
    RuneOfDevastate: 403195,
  },
};

export const initialBuffs = {
  [config.Stance.Defensive]: 0, // Stances
  [config.Stance.Battle]: 0,
  [config.Stance.Berserker]: 0,
  [config.Stance.Gladiator]: 0,
  [config.Buff.T1_Tank_6pc]: 3, // inferred off
  [config.Buff.TAQ_Tank_4pc]: 3, // inferred off
  [config.Buff.RuneOfDevastate]: 0,
};

export const talents = {
  Defiance: {
    maxRank: 5,
    coeff: function (buffs, rank = 5) {
      if (!(config.Stance.Defensive in buffs)) return getThreatCoefficient(1);
      return getAdditiveThreatCoefficient(
        config.Mods.Defiance * rank,
        config.Mods.DefensiveStance
      );
    },
  },
  // TODO: move this to gear check
  "Furious Thunder (Rune)": {
    maxRank: 1,
    coeff: function (buffs, rank = "0", spellId) {
      const thunderClap = {
        [config.Spell.ThunderClapR1]: true,
        [config.Spell.ThunderClapR2]: true,
        [config.Spell.ThunderClapR3]: true,
        [config.Spell.ThunderClapR4]: true,
        [config.Spell.ThunderClapR5]: true,
        [config.Spell.ThunderClapR6]: true,
      };
      if (Number(rank) && spellId in thunderClap) {
        return getThreatCoefficient(config.Mods.FuriousThunder);
      }
      return getThreatCoefficient(1);
    },
  },
};

export const buffNames = {
  [config.Stance.Defensive]: "Defensive Stance",
  [config.Stance.Battle]: "Battle Stance",
  [config.Stance.Berserker]: "Berserker Stance",
  [config.Stance.Gladiator]: "Gladiator Stance",
  [config.Buff.T1_Tank_6pc]: "S03 - Item - T1 - Warrior - Tank 6P Bonus",
  [config.Buff.TAQ_Tank_4pc]: "S03 - Item - TAQ - Warrior - Tank 4P Bonus",
  [config.Buff.RuneOfDevastate]: "Rune of Devastate",
};

export const buffMultipliers = {
  [config.Stance.Defensive]: getThreatCoefficient(config.Mods.DefensiveStance),
  [config.Stance.Battle]: getThreatCoefficient(config.Mods.OtherStances),
  [config.Stance.Berserker]: getThreatCoefficient(config.Mods.OtherStances),
  [config.Stance.Gladiator]: getThreatCoefficient(config.Mods.GladiatorStance),
  [config.Buff.T1_Tank_6pc]: {
    coeff: (buffs, spellId) => {
      if (config.Stance.Defensive in buffs) {
        return getThreatCoefficient(config.Mods.T1_Tank_6pc);
      }
      return getThreatCoefficient(1);
    },
  },
  [config.Buff.TAQ_Tank_4pc]: {
    coeff: (buffs, spellId) => {
      const moddedSpells = {
        [config.Spell.ShieldSlamR1]: true,
        [config.Spell.ShieldSlamR2]: true,
        [config.Spell.ShieldSlamR3]: true,
        [config.Spell.ShieldSlamR4]: true,
      };
      if (spellId in moddedSpells) {
        return getThreatCoefficient(config.Mods.TAQ_Tank_4pc);
      }

      return getThreatCoefficient(1);
    },
  },
  [config.Buff.RuneOfDevastate]: {
    coeff: (buffs, spellId) => {
      const moddedSpells = {
        [config.Spell.Devastate]: true,
        [config.Spell.DevastateSoD]: true,
      };
      if (config.Stance.Defensive in buffs && spellId in moddedSpells) {
        return getThreatCoefficient(config.Mods.RuneOfDevastate);
      }

      return getThreatCoefficient(1);
    },
  },
};

export const fixateBuffs = {
  [config.Spell.Taunt]: true,
  [config.Spell.ChallengingShout]: true,
  694: true,
  7400: true,
  7402: true,
  20559: true,
  20560: true, // Mocking Blow
};

export const notableBuffs = {
  ...Object.values(config.Buff),
};

export const Battle = config.Stance.Battle;
export const Berserker = config.Stance.Berserker;
export const Defensive = config.Stance.Defensive;

export const auraImplications = {
  7384: Battle,
  7887: Battle,
  11584: Battle,
  11585: Battle, // Overpower
  100: Battle,
  6178: Battle,
  11578: Battle, // Charge
  6343: Battle,
  8198: Battle,
  8204: Battle,
  8205: Battle,
  11580: Battle,
  11581: Battle, // Thunderclap
  694: Battle,
  7400: Battle,
  7402: Battle,
  20559: Battle,
  20560: Battle, // Mocking Blow
  20230: Battle, // Retaliation
  12292: Battle, // Sweeping Strikes
  20252: Berserker,
  20617: Berserker,
  20616: Berserker, // Intercept
  1680: Berserker, // Whirlwind
  18499: Berserker, // Berserker Rage
  1719: Berserker, // Recklessness
  6552: Berserker,
  6554: Berserker, // Pummel
  355: Defensive, // Taunt
  676: Defensive, // Disarm
  6572: Defensive,
  6574: Defensive,
  7379: Defensive,
  11600: Defensive,
  11601: Defensive,
  25288: Defensive, // Revenge
  2565: Defensive, // Shield Block
  871: Defensive, // Shield Wall
  [config.Spell.DevastateSoD]: Defensive,
};

/**
 * Allows one to check the combatantInfo and infer buffs and talents.
 *
 * Here is a good place to check gear and apply Tier set bonus buffs. e.g. Check for 2pc gear, apply
 * the buff. Then, in buffMultipliers, you can apply global coefficients or to specific spells.
 */
export const combatantImplications = (unit, buffs, talents) => {
  // Tier 1 6pc
  if (unit.gear.filter((g) => g.spellID === config.Tier.T1_Tank).length >= 6) {
    buffs[config.Buff.T1_Tank_6pc] = true;
  }
  // Tier 2.5 4pc
  if (unit.gear.filter((g) => g.spellID === config.Tier.TAQ_Tank).length >= 4) {
    buffs[config.Buff.TAQ_Tank_4pc] = true;
  }
};

export const spellFunctions = {
  [config.Stance.Defensive]: handler_zero, // Defensive Stance
  [config.Stance.Battle]: handler_zero, // Battle Stance
  [config.Stance.Berserker]: handler_zero, // Berserker Stance

  //Heroic Strike
  78: handler_threatOnHit(16, "Heroic Strike"),
  284: handler_threatOnHit(39, "Heroic Strike"),
  285: handler_threatOnHit(59, "Heroic Strike"),
  1608: handler_threatOnHit(78, "Heroic Strike"),
  11564: handler_threatOnHit(98, "Heroic Strike"),
  11565: handler_threatOnHit(118, "Heroic Strike"),
  11566: handler_threatOnHit(137, "Heroic Strike"),
  11567: handler_threatOnHit(145, "Heroic Strike"),
  25286: handler_threatOnHit(175, "Heroic Strike"), // (AQ)

  //Shield Slam
  [config.Spell.ShieldSlamR1]: handler_modDamage(config.Mods.ShieldSlam),
  [config.Spell.ShieldSlamR2]: handler_modDamage(config.Mods.ShieldSlam),
  [config.Spell.ShieldSlamR3]: handler_modDamage(config.Mods.ShieldSlam),
  [config.Spell.ShieldSlamR4]: handler_modDamage(config.Mods.ShieldSlam),

  // Shield Bash
  72: handler_modDamagePlusThreat(1.5, 36),
  1671: handler_modDamagePlusThreat(1.5, 96),
  1672: handler_modDamagePlusThreat(1.5, 96), // THREAT UNKNOWN

  //Revenge
  11601: handler_modDamagePlusThreat(config.Mods.Revenge, 243), //Rank 5
  25288: handler_modDamagePlusThreat(config.Mods.Revenge, 270), //Rank 6 (AQ)
  12798: handler_zero, //("Revenge Stun"),           //Revenge Stun

  //Cleave
  845: handler_threatOnHit(10, "Cleave"), //Rank 1
  7369: handler_threatOnHit(40, "Cleave"), //Rank 2
  11608: handler_threatOnHit(60, "Cleave"), //Rank 3
  11609: handler_threatOnHit(70, "Cleave"), //Rank 4
  20569: handler_threatOnHit(100, "Cleave"), //Rank 5

  //Whirlwind
  1680: handler_modDamage(1.25), //("Whirlwind"), //Whirlwind
  6343: handler_modDamage(2.5), // Thunder Clap r1
  8198: handler_modDamage(2.5), // Thunder Clap r2
  8204: handler_modDamage(2.5), // Thunder Clap r3
  8205: handler_modDamage(2.5), // Thunder Clap r4
  11580: handler_modDamage(2.5), // Thunder Clap r5
  11581: handler_modDamage(2.5), // Thunder Clap r6

  //Hamstring
  1715: handler_modDamagePlusThreat(1.25, 20), // R1
  7372: handler_threatOnHit(101), // R2, from outdated sheet
  7373: handler_threatOnHit(145, "Hamstring"),

  //Intercept
  20252: handler_modDamage(2), //Intercept
  20253: handler_zero, //("Intercept Stun"),         //Intercept Stun (Rank 1)
  20616: handler_modDamage(2), //Intercept (Rank 2)
  20614: handler_zero, //("Intercept Stun"),         //Intercept Stun (Rank 2)
  20617: handler_modDamage(2), //Intercept (Rank 3)
  20615: handler_zero, //("Intercept Stun"),         //Intercept Stun (Rank 3)

  //Execute
  20647: handler_modDamage(1.25, "Execute"),

  //Sunder Armor
  7386: handler_castCanMiss(45), // Rank 1
  11597: handler_castCanMiss(261, "Sunder Armor"), //Rank 5

  //Battleshout
  11551: handler_threatOnBuff(52, "Battle Shout"), //Rank 6
  25289: handler_threatOnBuff(60, "Battle Shout"), //Rank 7 (AQ)

  //Demo Shout
  11556: handler_threatOnDebuff(43, "Demoralizing Shout"),

  //Mocking Blow
  20560: threatFunctions.concat(
    handler_damage,
    handler_markSourceOnMiss(borders.taunt)
  ), //("Mocking Blow"),

  //Overpower
  11585: handler_damage, //("Overpower"),

  //Rend
  11574: handler_damage, //("Rend"),

  /* Zero threat abilities */
  355: threatFunctions.concat(
    handler_taunt,
    handler_markSourceOnMiss(borders.taunt)
  ), //("Taunt"), //Taunt

  1161: handler_markSourceOnMiss(borders.taunt), //("Challenging Shout"), //Challenging Shout
  2687: handler_resourcechangeCoeff, //("Bloodrage"), //Bloodrage (cast)
  29131: handler_resourcechange, //("Bloodrage"), //Bloodrage (buff)
  29478: handler_zero, //("Battlegear of Might"), //Battlegear of Might
  23602: handler_zero, //("Shield Specialization"), //Shield Specialization
  12964: handler_resourcechange, //("Unbridled Wrath"), //Unbridled Wrath
  11578: handler_zero, //("Charge"), //Charge
  7922: handler_zero, //("Charge Stun"), //Charge Stun
  18499: handler_zero, //("Berserker Rage"), //Berserker Rage
  12966: handler_zero, //("Flurry (Rank 1)"), //Flurry (Rank 1)
  12967: handler_zero, //("Flurry (Rank 2)"), //Flurry (Rank 2)
  12968: handler_zero, //("Flurry (Rank 3)"), //Flurry (Rank 3)
  12969: handler_zero, //("Flurry (Rank 4)"), //Flurry (Rank 4)
  12970: handler_zero, //("Flurry (Rank 5)"), //Flurry (Rank 5)
  12328: handler_zero, //("Death Wish"), //Death Wish
  871: handler_zero, //("Shield Wall"),
  1719: handler_zero, //("Recklessness"), //Recklessness
  12323: handler_zero, //("Piercing Howl"), //Piercing Howl
  14204: handler_zero, //("Enrage"), //Enrage
  12975: handler_zero, //("Last Stand (cast)"), //Last Stand (cast)
  12976: handler_zero, //("Last Stand (buff)"), //Last Stand (buff)
  2565: handler_zero, //("Shield Block"), //Shield Block

  /* Physical */
  12721: handler_damage, //("Deep Wounds"),
  6552: handler_threatOnHit(76, "Pummel (Rank 1)"), //TODO: Verify these values ingame
  6554: handler_threatOnHit(116, "Pummel (Rank 2)"),

  23881: handler_damage, //("Bloodthirst"), //Rank 1
  23892: handler_damage, //("Bloodthirst"), //Rank 2
  23893: handler_damage, //("Bloodthirst"), //Rank 3
  23894: handler_damage, //("Bloodthirst"), //Rank 4
  23888: handler_zero, //("Bloodthirst"),   //Buff
  23885: handler_zero, //("Bloodthirst"),   //Buff
  23891: handler_heal, // Bloodthirst heal buff
};
