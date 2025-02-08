let DEBUGMODE = false;

const preferredSpellSchools = {
  Mage: School.Frost,
  Priest: School.Holy,
  Paladin: School.Holy,
  Warlock: School.Shadow,
  // Others will be defaulted to 1 = physical
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
  Rogue: rogue.baseThreatCoefficient,
  // Others will be defaulted to 1
};

/** Sets certain buffs to always show as toggles per class */
const initialBuffs = {
  All: {
    [paladin.config.Buff.Salv]: 0,
    [paladin.config.Buff.GreaterSalv]: 0,
    25909: 0,
  },
  Paladin: paladin.initialBuffs,
  Warrior: warrior.initialBuffs,
  Druid: druid.initialBuffs,
  Rogue: rogue.initialBuffs,
};

const buffNames = {
  ...warrior.buffNames,
  ...paladin.buffNames,
  ...druid.buffNames,
  ...rogue.buffNames,
  25909: "Tranquil Air Totem",

  [Hunter.Buff.T1_Ranged_2pc]: "Ferocity",

  [Items.Enchant.GlovesThreat]: "Enchant Gloves - Threat",
  [Items.Enchant.CloakSubtlety]: "Enchant Cloak - Subtlety",
};

const buffMultipliers = {
  ...warrior.buffMultipliers,
  ...paladin.buffMultipliers,
  ...druid.buffMultipliers,
  ...rogue.buffMultipliers,

  25909: getThreatCoefficient(0.8), // Tranquil Air Totem Aura

  [Hunter.Buff.T1_Ranged_2pc]: getThreatCoefficient(Hunter.Mods.T1_Ranged_2pc),

  [Items.Enchant.GlovesThreat]: getThreatCoefficient(Items.Mods.GlovesThreat),
  [Items.Enchant.CloakSubtlety]: getThreatCoefficient(Items.Mods.CloakSubtlety),
};

// The leaf elements are functions (buffs,rank) => threatCoefficient
const talents = {
  Warrior: warrior.talents,
  Paladin: paladin.talents,
  Druid: druid.talents,
  Rogue: rogue.talents,
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
  ...paladin.invulnerabilityBuffs,
  11958: "Ice Block",
  3169: "LIP", // Limited Invulnerability Potion
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
  ...warrior.fixateBuffs,
  ...paladin.fixateBuffs,
  ...druid.fixateBuffs,
  ...rogue.fixateBuffs,
  29060: true, // Deathknight Understudy Taunt
};
// These make a dot in the graph on application and removal
// Also used for event filtering in fetchWCLreport
const notableBuffs = {
  ...warrior.notableBuffs,
  ...paladin.notableBuffs,
  ...druid.notableBuffs,
  ...rogue.notableBuffs,
  23397: true, // Nefarian's warrior class call
  23398: true, // Druid class call
};
for (let k in buffMultipliers) notableBuffs[k] = true;
for (let k in invulnerabilityBuffs) notableBuffs[k] = true;
for (let k in aggroLossBuffs) notableBuffs[k] = true;
for (let k in fixateBuffs) notableBuffs[k] = true;
for (let id of Object.values(Hunter.Buff)) notableBuffs[id] = true;

const auraImplications = {
  Warrior: warrior.auraImplications,
  Druid: druid.auraImplications,
  Rogue: rogue.auraImplications,
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
  Paladin: paladin.combatantImplications,
  Druid: druid.combatantImplications,
  Rogue: rogue.combatantImplications,
};

const spellFunctions = {
  ...warrior.spellFunctions,
  ...paladin.spellFunctions,
  ...druid.spellFunctions,
  ...rogue.spellFunctions,
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

  // Mage
  10181: handler_damage, // Frostbolt

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

  /* Items */
  13494: handler_zero, //("Manual Crowd Pummeler"),
};

let zeroThreatSpells = [];
for (let i in spellFunctions) {
  if (i >= 0 && spellFunctions[i] === handler_zero) {
    zeroThreatSpells.push(i);
  }
}
