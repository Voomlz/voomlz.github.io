let DEBUGMODE = false;

const preferredSpellSchools = {
  Mage: School.Frost,
  Priest: School.Holy,
  Paladin: School.Holy,
  Warlock: School.Shadow,
  // Others will be defaulted to 1 = physical
};

const Paladin = {
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

const Rogue = {
  Mods: {
    Base: 0.71,
    JustAFleshWound: 1.855, // taken from compendium
    MainGauche: 1.51,
    T1_Tank_2pc: 2.0,
    UnfairAdvantage: 1.5,
  },
  Spell: {
    Blunderbuss: 436564,
    CrimsonTempest: 412096,
    FanOfKnives: 409240,
    PoisonedKnife: 425012,
    SinisterStrikeR7: 11293,
    SinisterStrikeR8: 11294,
    Tease: 410412,
    UnfairAdvantage: 432274,
    MainGauche: 424919,
  },
  Buff: {
    JustAFleshWound: 400014,
    MainGauche: 462752,
    BladeDance: 400012,
    T1_Tank_2pc: 457349,
  },
};

const Druid = {
  Form: {
    Bear: 5487,
    DireBear: 9634,
    Cat: 768,
    Tree: 439733,
    Moonkin: 24858,
  },
  Mods: {
    Cat: 0.71,
    DireBear: 1.3,
    FeralInstinct: 0.03,
    Lacerate: 3.5,
    Swipe: 3.5,
    T1_Tank_6pc: 0.2,
  },
  Buff: {
    T1_Tank_6pc: 456332,
  },
  Spell: {
    Starsurge: 417157,
    Starfall: 439753,
    WildGrowth: 408120,
    Lifebloom: 408124,
    LifebloomTick: 408245,
    Nourish: 408247,
    LivingSeed: 414683,
  },
};

const Hunter = {
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

const Items = {
  Enchant: {
    GlovesThreat: 25072,
    CloakSubtlety: 25084,
  },
  Mods: {
    GlovesThreat: 1.02,
    CloakSubtlety: 1 - 0.02,
  },
};

const baseThreatCoefficients = {
  Rogue: getThreatCoefficient(Rogue.Mods.Base),
  // Others will be defaulted to 1
};

/** Sets certain buffs to always show as toggles per class */
const initialBuffs = {
  All: {
    [Paladin.Buff.Salv]: 0,
    [Paladin.Buff.GreaterSalv]: 0,
    25909: 0,
  },
  Paladin: {
    [Paladin.Buff.RighteousFury]: 0,
  },
  Warrior: warrior.initialBuffs,
  Druid: {
    [Druid.Form.Bear]: 0, // Forms
    [Druid.Form.DireBear]: 0,
    [Druid.Form.Cat]: 0,
  },
  Rogue: {
    [Rogue.Buff.JustAFleshWound]: 0,
    [Rogue.Buff.T1_Tank_2pc]: 3,
  },
};

const buffNames = {
  ...warrior.buffNames,

  [Paladin.Buff.Salv]: "Blessing of Salvation",
  [Paladin.Buff.GreaterSalv]: "Greater Blessing of Salvation",
  [Paladin.Buff.RighteousFury]: "Righteous Fury",
  [Paladin.Buff.EngraveHandOfReckoning]: "Engrave Gloves - Hand of Reckoning",
  25909: "Tranquil Air Totem",

  [Druid.Form.Bear]: "Bear Form",
  [Druid.Form.DireBear]: "Dire Bear Form",
  [Druid.Form.Cat]: "Cat Form",
  [Hunter.Buff.T1_Ranged_2pc]: "Ferocity",
  [Druid.Form.Moonkin]: "Moonkin Form",

  [Rogue.Buff.JustAFleshWound]: "Just a Flesh Wound",
  [Rogue.Buff.MainGauche]: "Main Gauche",
  [Rogue.Buff.T1_Tank_2pc]: "S03 - Item - T1 - Rogue - Tank 2P Bonus",

  [Items.Enchant.GlovesThreat]: "Enchant Gloves - Threat",
  [Items.Enchant.CloakSubtlety]: "Enchant Cloak - Subtlety",
};

const buffMultipliers = {
  ...warrior.buffMultipliers,
  [Paladin.Buff.Salv]: getThreatCoefficient(Paladin.Mods.Salvation), // BoS
  [Paladin.Buff.GreaterSalv]: getThreatCoefficient(Paladin.Mods.Salvation), // GBoS
  [Paladin.Buff.RighteousFury]: getThreatCoefficient({
    [School.Holy]: Paladin.Mods.RighteousFury,
  }),
  [Paladin.Buff.EngraveHandOfReckoning]: {
    coeff(buffs, spellId) {
      if (Paladin.Buff.RighteousFury in buffs) {
        // This is applied to all schools incl holy, meaning physical is 1.5, but RF gets buffed from
        // 1.9 (Imp RF) to 2.85.
        return getThreatCoefficient(Paladin.Mods.HandOfReckoning);
      }
      return getThreatCoefficient(1.0);
    },
  },

  25909: getThreatCoefficient(0.8), // Tranquil Air Totem Aura

  [Druid.Form.Bear]: getThreatCoefficient(Druid.Mods.DireBear),
  [Druid.Form.DireBear]: getThreatCoefficient(Druid.Mods.DireBear),
  [Druid.Buff.T1_Tank_6pc]: getAdditiveThreatCoefficient(
    Druid.Mods.T1_Tank_6pc,
    Druid.Mods.DireBear
  ),
  [Druid.Form.Moonkin]: getThreatCoefficient({
    [School.Arcane]: 0.7,
    [School.Nature]: 0.7,
  }),
  [Druid.Form.Cat]: getThreatCoefficient(Druid.Mods.Cat), // Cat Form

  [Hunter.Buff.T1_Ranged_2pc]: getThreatCoefficient(Hunter.Mods.T1_Ranged_2pc),

  [Rogue.Buff.JustAFleshWound]: getThreatCoefficient(
    Rogue.Mods.JustAFleshWound
  ),
  [Rogue.Buff.MainGauche]: {
    coeff: (buffs, spellId) => {
      const moddedSpells = {
        // TODO: lower ranks
        [Rogue.Spell.SinisterStrikeR7]: true,
        [Rogue.Spell.SinisterStrikeR8]: true,
        [Rogue.Spell.PoisonedKnife]: true,
      };
      if (spellId in moddedSpells) {
        return getThreatCoefficient(Rogue.Mods.MainGauche);
      }

      return getThreatCoefficient(1);
    },
  },
  [Rogue.Buff.T1_Tank_2pc]: {
    coeff: (buffs, spellId) => {
      const moddedSpells = {
        [Rogue.Spell.CrimsonTempest]: true,
        [Rogue.Spell.Blunderbuss]: true,
        [Rogue.Spell.FanOfKnives]: true,
      };
      if (
        Rogue.Buff.BladeDance in buffs &&
        Rogue.Buff.JustAFleshWound in buffs &&
        spellId in moddedSpells
      ) {
        return getThreatCoefficient(Rogue.Mods.T1_Tank_2pc);
      }
      return getThreatCoefficient(1);
    },
  },

  [Items.Enchant.GlovesThreat]: getThreatCoefficient(Items.Mods.GlovesThreat),
  [Items.Enchant.CloakSubtlety]: getThreatCoefficient(Items.Mods.CloakSubtlety),
};

// The leaf elements are functions (buffs,rank) => threatCoefficient
const talents = {
  Warrior: warrior.talents,
  Druid: {
    "Feral Instinct": {
      maxRank: 5,
      coeff: function (buffs, rank = 5) {
        if (!(Druid.Form.Bear in buffs) && !(Druid.Form.DireBear in buffs))
          return getThreatCoefficient(1);
        return getAdditiveThreatCoefficient(
          Druid.Mods.FeralInstinct * rank,
          Druid.Mods.DireBear
        );
      },
    },
    "Moonkin Form": {
      maxRank: 1,
      coeff: function (buffs) {
        if (!(Druid.Form.Moonkin in buffs)) return getThreatCoefficient(1);
        return getThreatCoefficient({
          [School.Arcane]: 0.7,
          [School.Nature]: 0.7,
        });
      },
    },
    Subtlety: {
      maxRank: 5,
      coeff: (_, rank = 5, spellId) =>
        getThreatCoefficient(
          1 -
            0.04 *
              rank *
              (spellId in
                {
                  8936: true,
                  8938: true,
                  8940: true,
                  8941: true,
                  9750: true,
                  9856: true,
                  9857: true,
                  9858: true,
                  26980: true,
                  774: true,
                  1058: true,
                  1430: true,
                  2090: true,
                  2091: true,
                  3627: true,
                  8910: true,
                  9839: true,
                  9840: true,
                  9841: true,
                  25299: true,
                  26981: true,
                  26982: true,
                  26982: true,
                  5185: true,
                  5186: true,
                  5187: true,
                  5188: true,
                  5189: true,
                  6778: true,
                  8903: true,
                  9758: true,
                  9888: true,
                  9889: true,
                  25297: true,
                  26978: true,
                  26979: true,
                  740: true,
                  8918: true,
                  9862: true,
                  9863: true,
                  26983: true,
                  [Druid.Spell.WildGrowth]: true,
                  [Druid.Spell.Lifebloom]: true,
                  [Druid.Spell.LifebloomTick]: true,
                  [Druid.Spell.Nourish]: true,
                  [Druid.Spell.LivingSeed]: true,
                })
        ),
    },
  },
  Mage: {
    "Arcane Subtlety": {
      maxRank: 2,
      coeff: (_, rank = 2) =>
        getThreatCoefficient({ [School.Arcane]: 1 - 0.2 * rank }),
    },
    "Burning Soul": {
      maxRank: 2,
      coeff: (_, rank = 2) =>
        getThreatCoefficient({ [School.Fire]: 1 - 0.15 * rank }),
    },
    "Frost Channeling": {
      maxRank: 3,
      coeff: (_, rank = 3) =>
        getThreatCoefficient({ [School.Frost]: 1 - 0.1 * rank }),
    },
  },

  Paladin: {
    "Improved Righteous Fury": {
      maxRank: 3,
      coeff: function (buffs, rank = 3) {
        if (Paladin.Buff.RighteousFury in buffs) {
          return getThreatCoefficient({
            [School.Holy]:
              (1 + rank * Paladin.Mods.ImpRf) / Paladin.Mods.RighteousFury,
          });
        }
        return getThreatCoefficient(1);
      },
    },
  },

  /*
	Tank Rune + Imp RF = 2.85 HOLY CO-EFFICIENT
	Tank Rune = Damage 1.5x NON HOLY
	Tank Rune = 2.23 without Imp RF Talent.

	OLD VALUES:
	1.0x non-holy
	1.6x holy RF non-Imp
	1.9x holy Imp RF
	*/

  Priest: {
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
  },
  Shaman: {
    "Healing Grace": {
      maxRank: 3,
      coeff: (_, rank = 3, spellId) =>
        getThreatCoefficient(
          1 -
            0.05 *
              rank *
              (spellId in
                {
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
                })
        ),
    },
  },
};

// These make dots green-bordered
const invulnerabilityBuffs = {
  498: "Divine Protection",
  5573: "Divine Protection",
  642: "Divine Shield",
  1020: "Divine Shield",
  1022: "Blessing of Protection",
  5599: "Blessing of Protection",
  10278: "Blessing of Protection",
  11958: "Ice Block",
  3169: "LIP", // Limited Invulnerability Potion
  19752: "Divine Intervention",
  6724: "Light of Elune",
};
// These make dots yellow-bordered
const aggroLossBuffs = {
  118: true,
  12824: true,
  12825: true,
  28272: true,
  28271: true,
  12826: true, // Mages' Polymorph
  23023: true, // Razorgore Conflagrate
  23310: true,
  23311: true,
  23312: true, // Chromaggus Time Lapse
  22289: true, // Brood Power: Green
  20604: true, // Lucifron Dominate Mind
  24327: true, // Hakkar's Cause Insanity
  23603: true, // Nefarian: Wild Polymorph
  26580: true, // Princess Yauj: Fear
};
// These make dots orange
const fixateBuffs = {
  355: true, // Taunt
  407631: true, // Hand of Reckoning
  1161: true, // Challenging Shout
  5209: true, // Challenging Roar
  6795: true, // Growl
  694: true,
  7400: true,
  7402: true,
  20559: true,
  20560: true, // Mocking Blow
  29060: true, // Deathknight Understudy Taunt
  [Rogue.Spell.Tease]: true,
};
// These make a dot in the graph on application and removal
// Also used for event filtering in fetchWCLreport
const notableBuffs = {
  ...warrior.notableBuffs,
  23397: true, // Nefarian's warrior class call
  23398: true, // Druid class call
};
for (let k in buffMultipliers) notableBuffs[k] = true;
for (let k in invulnerabilityBuffs) notableBuffs[k] = true;
for (let k in aggroLossBuffs) notableBuffs[k] = true;
for (let k in fixateBuffs) notableBuffs[k] = true;
for (let id of Object.values(Rogue.Buff)) notableBuffs[id] = true;
for (let id of Object.values(Druid.Buff)) notableBuffs[id] = true;
for (let id of Object.values(Hunter.Buff)) notableBuffs[id] = true;
for (let id of Object.values(Paladin.Buff)) notableBuffs[id] = true;

const Cat = Druid.Form.Cat;
const Bear = Druid.Form.DireBear;
const Moonkin = Druid.Form.Moonkin;

const auraImplications = {
  Warrior: warrior.auraImplications,
  Druid: {
    // Dire Bear Form
    6807: Bear,
    6808: Bear,
    6809: Bear,
    8972: Bear,
    9745: Bear,
    9880: Bear,
    9881: Bear, //Maul
    779: Bear,
    780: Bear,
    769: Bear,
    9754: Bear,
    9908: Bear, //Swipe
    414644: Bear,
    414644: Bear, //Lacerate
    407995: Bear, //Mangle (Bear)
    99: Bear,
    1735: Bear,
    9490: Bear,
    9747: Bear,
    9898: Bear, //Demoralizing Roar
    6795: Bear, //Growl
    5229: Bear, //Enrage
    17057: Bear, //Furor
    8983: Bear, //Bash

    // Cat Form
    9850: Cat, //Claw
    407993: Cat, //Mangle (Cat)
    9830: Cat, //Shred
    9904: Cat, //Rake
    22829: Cat, //Ferocious Bite
    9867: Cat, //Ravage
    9896: Cat, //Rip
    9827: Cat, //Pounce
    9913: Cat, //Prowl
    9846: Cat,
    417045: Cat, //Tiger's Fury
    407988: Cat, //Savage Roar
    411128: Cat, //Swipe (Cat)
    1850: Cat,
    9821: Cat, //Dash

    // Moonkin Form - Since Starsurge and Starfall are Boomy skills, and take up Nourish and
    // Lifebloom slots, we can assume these abilities imply Moonkin form
    [Druid.Spell.Starsurge]: Moonkin,
    [Druid.Spell.Starfall]: Moonkin,
  },
  Rogue: {
    [Rogue.Spell.MainGauche]: Rogue.Buff.JustAFleshWound,
  },
};

/**
 * Allows one to check the combatantInfo and infer buffs and talents.
 *
 * Here is a good place to check gear and apply Tier set bonus buffs. e.g. Check for 2pc gear, apply
 * the buff. Then, in buffMultipliers, you can apply global coefficients or to specific spells.
 */
const combatantImplications = {
  All: (unit, buffs) => {
    if (
      unit.gear.some((g) => g.permanentEnchant === Items.Enchant.GlovesThreat)
    ) {
      // console.log('applying gloves threat enchant');
      buffs[Items.Enchant.GlovesThreat] = true;
    }

    if (
      unit.gear.some((g) => g.permanentEnchant === Items.Enchant.CloakSubtlety)
    ) {
      // console.log('applying cloak Subtlety enchant');
      buffs[Items.Enchant.CloakSubtlety] = true;
    }
  },
  Warrior: warrior.combatantImplications,
  Paladin: (unit, buffs, talents) => {
    if (
      unit.gear.some((g) => g.temporaryEnchant === Paladin.Rune.HandOfReckoning)
    ) {
      buffs[Paladin.Buff.EngraveHandOfReckoning] = true;
    }
  },
};

const spellFunctions = {
  18670: handler_bossDropThreatOnHit(0.5), // Broodlord Knock Away
  23339: handler_bossDropThreatOnHit(0.5), // BWL Wing Buffet
  18392: handler_bossDropThreatOnCast(0), // Onyxia Fireball
  19633: handler_bossDropThreatOnHit(0.75), // Onyxia Knock Away
  20534: handler_bossDropThreatOnCast(0), // Majordomo Teleport
  20566: handler_bossThreatWipeOnCast, // Wrath of Ragnaros
  23138: handler_bossThreatWipeOnCast, // Gate of Shazzrah
  22289: handler_bossDropThreatOnDebuff(0.5), // Brood Power: Green
  24408: handler_bossThreatWipeOnCast, // Bloodlord Mandokir's Charge
  24690: handler_bossDropThreatOnDebuff(0), // Hakkar's Aspect of Arlokk
  //20604: handler_mindcontrol, // Lucifron Dominate Mind
  "-1": handler_bossThreatWipeOnCast, // Custom threat drop, currently for High Priestess Arlokk
  23310: handler_timelapse,
  23311: handler_timelapse,
  23312: handler_timelapse,
  800: function (ev, fight) {
    // Twin Emperors' Twin Teleport
    if (ev.type !== "applybuff") return;
    let u = fight.eventToUnit(ev, "source");
    for (let k in u.threat) {
      u.setThreat(k, 0, ev.timestamp, ev.ability.name);
    }
  },
  26102: handler_bossDropThreatOnHit(0), // Ouro's Sand Blast
  26580: handler_bossDropThreatOnHit(0), // Yauj's Fear
  26561: handler_bossThreatWipeOnCast, // Vem's Berserker Charge
  11130: handler_bossDropThreatOnHit(0.5), // Qiraji Champion's Knock Away, need to confirm pct
  28408: handler_bossThreatWipeOnCast, // Kel'Thuzad's Chains of Kel'Thuzad
  29060: handler_taunt, // Deathknight Understudy Taunt
  28835: handler_bossPartialThreatWipeOnCast(0.5), // Mark of Zeliek
  28834: handler_bossPartialThreatWipeOnCast(0.5), // Mark of Mograine
  28833: handler_bossPartialThreatWipeOnCast(0.5), // Mark of Blaumeux
  28832: handler_bossPartialThreatWipeOnCast(0.5), // Mark of Korth'azz
  29210: handler_bossThreatWipeOnCast, // Noth's blink
  29211: handler_bossThreatWipeOnCast, // Noth's blink new id?
  28308: handler_hatefulstrike(800), // Patchwerk's hateful strike
  28339: handler_magneticPull(), // Feungen, exchange tanks
  28338: handler_magneticPull(), // Stalagg, exchange tanks

  17624: handler_vanish, // Flask of Petrification

  // Paladin
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

  // Mage
  10181: handler_damage, // Frostbolt

  // Rogue
  1856: handler_vanish,
  1857: handler_vanish, // Vanish
  1966: handler_castCanMissNoCoefficient(-150), // Feint r1
  6768: handler_castCanMissNoCoefficient(-240), // Feint r2
  8637: handler_castCanMissNoCoefficient(-390), // Feint r3
  11303: handler_castCanMissNoCoefficient(-600), // Feint r4
  25302: handler_castCanMissNoCoefficient(-800), // Feint r5

  // Rogue: SoD. Info from the compendium: https://docs.google.com/document/d/1BCCkILiz9U-VcX7489WGam2cK_Dm8InahnpQ3bS-UxA/edit?usp=sharing
  [Rogue.Spell.Tease]: threatFunctions.concat(
    handler_taunt,
    handler_markSourceOnMiss(borders.taunt)
  ),
  [Rogue.Spell.UnfairAdvantage]: handler_modDamage(Rogue.Mods.UnfairAdvantage),

  // Priest
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

  // Hunter
  [Hunter.Spell.FeignDeath]: handler_vanish, // Feign Death
  [Hunter.Spell.DistractingShotR1]: handler_threatOnHit(110), // Distracting Shot r1
  [Hunter.Spell.DistractingShotR2]: handler_threatOnHit(160), // Distracting Shot r2
  [Hunter.Spell.DistractingShotR3]: handler_threatOnHit(250), // Distracting Shot r3
  [Hunter.Spell.DistractingShotR4]: handler_threatOnHit(350), // Distracting Shot r4
  [Hunter.Spell.DistractingShotR5]: handler_threatOnHit(465), // Distracting Shot r5
  [Hunter.Spell.DistractingShotR6]: handler_threatOnHit(600), // Distracting Shot r6
  [Hunter.Spell.DisengageR1]: handler_castCanMiss(-140), // Disengage Rank 1
  [Hunter.Spell.DisengageR2]: handler_castCanMiss(-280), // Disengage Rank 2
  [Hunter.Spell.DisengageR3]: handler_castCanMiss(-405), // Disengage Rank 3

  // Warlock
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
  5676: handler_modDamage(2), // Searing Pain r1
  17919: handler_modDamage(2), // Searing Pain r2
  17920: handler_modDamage(2), // Searing Pain r3
  17921: handler_modDamage(2), // Searing Pain r4
  17922: handler_modDamage(2), // Searing Pain r5
  17923: handler_modDamage(2), // Searing Pain r6

  // Shaman
  8042: handler_modDamage(2), // Earth Shock r1
  8044: handler_modDamage(2), // Earth Shock r2
  8045: handler_modDamage(2), // Earth Shock r3
  8046: handler_modDamage(2), // Earth Shock r4
  10412: handler_modDamage(2), // Earth Shock r5
  10413: handler_modDamage(2), // Earth Shock r6
  10414: handler_modDamage(2), // Earth Shock r7

  // From ResultsMayVary https://resultsmayvary.github.io/ClassicThreatPerSecond/
  1: handler_damage,
  /* Consumables */
  11374: handler_threatOnDebuff(90), // Gift of Arthas
  /* Damage/Weapon Procs */
  20007: handler_zero, // Heroic Strength (Crusader)
  18138: handler_damage, // Shadow Bolt (Deathbringer Proc)
  24388: handler_damage, // Brain Damage (Lobotomizer Proc)
  23267: handler_damage, // Firebolt (Perdition's Proc)
  18833: handler_damage, // Firebolt (Alcor's Proc)

  21992: threatFunctions.concat(handler_damage, handler_threatOnDebuff(90)), // Thunderfury
  27648: handler_threatOnDebuff(145), // Thunderfury
  467271: handler_modDamage(2.25), // Dragonbreath (Dragonbreath Hand Cannon)

  /* Thorn Effects */
  9910: handler_damage, // Thorns (Rank 6)
  17275: handler_damage, // Heart of the Scale
  22600: handler_damage, // Force Reactive
  11350: handler_zero, // Oil of Immolation (buff)
  11351: handler_damage, // Oil of Immolation (dmg)

  // Razorbramble/Razorspike gear
  1213816: handler_modDamage(2), // Damage Shield Dmg +80
  1213813: handler_modDamage(2), // Damage Shield Dmg +100

  /* Explosives */
  13241: handler_damage, //("Goblin Sapper Charge"), //Goblin Sapper Charge

  /* Zero Threat Abilities */
  10610: handler_zero, //("Windfury Totem"), //Windfury Totem
  20572: handler_zero, //("Blood Fury"), //Blood Fury
  26296: handler_zero, //("Berserking (Troll racial)"), //Berserking (Troll racial)
  26635: handler_zero, //("Berserking (Troll racial)"), //Berserking (Troll racial)
  22850: handler_zero, //("Sanctuary"), //Sanctuary
  9515: handler_zero, //("Summon Tracking Hound"), //Summon Tracking Hound

  /* Consumable Buffs (zero-threat) */
  10667: handler_zero, //("Rage of Ages"), //Rage of Ages
  25804: handler_zero, //("Rumsey Rum Black Label"), //Rumsey Rum Black Label
  17038: handler_zero, //("Winterfall Firewater"), //Winterfall Firewater
  8220: handler_zero, //("Savory Deviate Delight (Flip Out)"), //Savory Deviate Delight (Flip Out)
  17543: handler_zero, //("Fire Protection"), //Fire Protection
  17548: handler_zero, //("Greater Shadow Protection Potion"), //Greater Shadow Protection Potion
  18125: handler_zero, //("Blessed Sunfruit"), //Blessed Sunfruit
  17538: handler_zero, //("Elixir of the Mongoose"), //Elixir of the Mongoose
  11359: handler_zero, //("Restorative Potion (Restoration) Buff"), //Restorative Potion (Restoration) Buff
  23396: handler_zero, //("Restorative Potion (Restoration) Dispel"), //Restorative Potion (Restoration) Dispel

  /* Consumable */
  6613: handler_zero, //("Great Rage Potion"), //Great Rage Potion
  17528: handler_zero, //("Mighty Rage Potion"), //Mighty Rage Potion

  /* Forms */
  [Druid.Form.DireBear]: handler_zero, //(1.45, "Bear Form"),
  [Druid.Form.Cat]: handler_zero, //(0.71, "Cat Form"),

  /* Bear - See SoD Druid disc: https://discord.com/channels/253205420225724416/1186591609819762750/1310758667561467934 */
  // Mangle is 1.0x threat

  5209: handler_markSourceOnMiss(borders.taunt), // Challenging Roar
  6807: handler_modDamage(1.75, "Maul (Rank 1)"),
  6808: handler_modDamage(1.75, "Maul (Rank 2)"),
  6809: handler_modDamage(1.75, "Maul (Rank 3)"),
  8972: handler_modDamage(1.75, "Maul (Rank 4)"),
  9745: handler_modDamage(1.75, "Maul (Rank 5)"),
  9880: handler_modDamage(1.75, "Maul (Rank 6)"),
  9881: handler_modDamage(1.75, "Maul"),

  779: handler_modDamage(3.5, "Swipe (Rank 1)"),
  780: handler_modDamage(3.5, "Swipe (Rank 2)"),
  769: handler_modDamage(3.5, "Swipe (Rank 3)"),
  9754: handler_modDamage(3.5, "Swipe (Rank 4)"),
  9908: handler_modDamage(3.5, "Swipe"),

  414644: handler_modDamage(3.5), // Lacerate (Initial)
  414647: handler_modDamage(3.5), // Lacerate (Dot?)

  99: handler_threatOnDebuff(9, "Demoralizing Roar (Rank 1)"),
  1735: handler_threatOnDebuff(15, "Demoralizing Roar (Rank 2)"),
  9490: handler_threatOnDebuff(20, "Demoralizing Roar (Rank 3)"),
  9747: handler_threatOnDebuff(30, "Demoralizing Roar (Rank 4)"),
  9898: handler_threatOnDebuff(39, "Demoralizing Roar"),

  6795: threatFunctions.concat(
    handler_taunt,
    handler_markSourceOnMiss(borders.taunt)
  ), //("Growl"),
  5229: handler_resourcechange, //("Enrage"),
  17057: handler_resourcechange, //("Furor"),

  8983: handler_zero, //("Bash"), //TODO test bash threat

  /* Cat */
  9850: handler_damage, //("Claw"),
  9830: handler_damage, //("Shred"),
  9904: handler_damage, //("Rake"),
  22829: handler_damage, //("Ferocious Bite"),
  9867: handler_damage, //("Ravage"),
  9896: handler_damage, //("Rip"),
  9827: handler_damage, //("Pounce"),
  9913: handler_zero, //("Prowl"),
  9846: handler_zero, //("Tiger's Fury"),

  1850: handler_zero, //("Dash (Rank 1)"),
  9821: handler_zero, //("Dash"),

  8998: handler_castCanMiss(-240, "Cower (Rank 1)"),
  9000: handler_castCanMiss(-390, "Cower (Rank 2)"),
  9892: handler_castCanMiss(-600, "Cower"),

  /* Healing */
  //TODO

  /* Abilities */
  16857: handler_threatOnDebuff(108, "Faerie Fire (Feral)(Rank 1)"),
  17390: handler_threatOnDebuff(108, "Faerie Fire (Feral)(Rank 2)"),
  17391: handler_threatOnDebuff(108, "Faerie Fire (Feral)(Rank 3)"),
  17392: handler_threatOnDebuff(108, "Faerie Fire (Feral)"),

  770: handler_threatOnDebuff(108, "Faerie Fire (Rank 1)"),
  778: handler_threatOnDebuff(108, "Faerie Fire (Rank 2)"),
  9749: handler_threatOnDebuff(108, "Faerie Fire (Rank 3)"),
  9907: handler_threatOnDebuff(108, "Faerie Fire"),

  16870: handler_zero, //("Clearcasting"),
  29166: handler_zero, //("Innervate"),

  22842: handler_heal, //("Frienzed Regeneration (Rank 1)"),
  22895: handler_heal, //("Frienzed Regeneration (Rank 2)"),
  22896: handler_heal, //("Frienzed Regeneration"),

  24932: handler_zero, //("Leader of the Pack"),

  /* Items */
  13494: handler_zero, //("Manual Crowd Pummeler"),
};

let zeroThreatSpells = [];
for (let i in spellFunctions) {
  if (i >= 0 && spellFunctions[i] === handler_zero) {
    zeroThreatSpells.push(i);
  }
}
