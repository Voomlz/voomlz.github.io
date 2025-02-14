let DEBUGMODE = false;

const preferredSpellSchools = {
  Mage: School.Frost,
  Priest: School.Holy,
  Paladin: School.Holy,
  Warlock: School.Shadow,
  // Others will be defaulted to 1 = physical
};

const Items = {
  Enchant: {
    GlovesThreat: 25072,
    CloakSubtlety: 25084,
  },
  Buff: {
    EyeOfDiminution: 1219503,
  },
  Mods: {
    GlovesThreat: 1.02,
    CloakSubtlety: 1 - 0.02,

    /**
     * Reduces threat by 70% for 20 secs
     *
     * https://www.wowhead.com/classic/item=236302/eye-of-diminution
     */
    EyeOfDiminution: 0.3,
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
    [shaman.config.Buff.TranquilAirTotem]: 0,
  },
  Paladin: paladin.initialBuffs,
  Warrior: warrior.initialBuffs,
  Druid: druid.initialBuffs,
  Rogue: rogue.initialBuffs,
  Warlock: warlock.initialBuffs,
  Shaman: shaman.initialBuffs,
  Mage: mage.initialBuffs,
  Priest: priest.initialBuffs,
};

const buffNames = {
  ...warrior.buffNames,
  ...paladin.buffNames,
  ...druid.buffNames,
  ...rogue.buffNames,
  ...hunter.buffNames,
  ...warlock.buffNames,
  ...shaman.buffNames,
  ...mage.buffNames,
  ...priest.buffNames,
  [Items.Enchant.GlovesThreat]: "Enchant Gloves - Threat",
  [Items.Enchant.CloakSubtlety]: "Enchant Cloak - Subtlety",
  [Items.Buff.EyeOfDiminution]: "The Eye of Diminution",
};

const buffMultipliers = {
  ...warrior.buffMultipliers,
  ...paladin.buffMultipliers,
  ...druid.buffMultipliers,
  ...rogue.buffMultipliers,
  ...hunter.buffMultipliers,
  ...warlock.buffMultipliers,
  ...shaman.buffMultipliers,
  ...mage.buffMultipliers,
  ...priest.buffMultipliers,
  [Items.Enchant.GlovesThreat]: getThreatCoefficient(Items.Mods.GlovesThreat),
  [Items.Enchant.CloakSubtlety]: getThreatCoefficient(Items.Mods.CloakSubtlety),
  [Items.Buff.EyeOfDiminution]: getThreatCoefficient(
    Items.Mods.EyeOfDiminution
  ),
};

// The leaf elements are functions (buffs,rank) => threatCoefficient
const talents = {
  Warrior: warrior.talents,
  Paladin: paladin.talents,
  Druid: druid.talents,
  Rogue: rogue.talents,
  Warlock: warlock.talents,
  Shaman: shaman.talents,
  Mage: mage.talents,
  Priest: priest.talents,
};

// These make dots green-bordered
const invulnerabilityBuffs = {
  ...paladin.invulnerabilityBuffs,
  ...shaman.invulnerabilityBuffs,
  ...priest.invulnerabilityBuffs,
  ...mage.invulnerabilityBuffs,
  3169: "LIP", // Limited Invulnerability Potion
  6724: "Light of Elune",
  1213335: "Earthen Shroud", // Fetish of the Sand Reaver
};
// These make dots yellow-bordered
const aggroLossBuffs = {
  ...mage.aggroLossBuffs,
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
  ...warlock.fixateBuffs,
  ...shaman.fixateBuffs,
  29060: true, // Deathknight Understudy Taunt
};
// These make a dot in the graph on application and removal
// Also used for event filtering in fetchWCLreport
const notableBuffs = {
  ...warrior.notableBuffs,
  ...paladin.notableBuffs,
  ...druid.notableBuffs,
  ...rogue.notableBuffs,
  ...hunter.notableBuffs,
  ...warlock.notableBuffs,
  ...shaman.notableBuffs,
  ...mage.notableBuffs,
  ...priest.notableBuffs,
  23397: true, // Nefarian's warrior class call
  23398: true, // Druid class call
};
for (let k in buffMultipliers) notableBuffs[k] = true;
for (let k in invulnerabilityBuffs) notableBuffs[k] = true;
for (let k in aggroLossBuffs) notableBuffs[k] = true;
for (let k in fixateBuffs) notableBuffs[k] = true;

const auraImplications = {
  Warrior: warrior.auraImplications,
  Druid: druid.auraImplications,
  Rogue: rogue.auraImplications,
  Hunter: hunter.auraImplications,
  Warlock: warlock.auraImplications,
  Shaman: shaman.auraImplications,
  Mage: mage.auraImplications,
  Priest: priest.auraImplications,
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
  Hunter: hunter.combatantImplications,
  Warlock: warlock.combatantImplications,
  Shaman: shaman.combatantImplications,
  Mage: mage.combatantImplications,
  Priest: priest.combatantImplications,
};

const spellFunctions = {
  ...warrior.spellFunctions,
  ...paladin.spellFunctions,
  ...druid.spellFunctions,
  ...rogue.spellFunctions,
  ...hunter.spellFunctions,
  ...warlock.spellFunctions,
  ...shaman.spellFunctions,
  ...mage.spellFunctions,
  ...priest.spellFunctions,
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
