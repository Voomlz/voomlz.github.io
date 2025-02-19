import {
  getThreatCoefficient,
  handler_bossDropThreatOnCast,
  handler_bossDropThreatOnDebuff,
  handler_bossDropThreatOnHit,
  handler_bossPartialThreatWipeOnCast,
  handler_bossThreatWipeOnCast,
  handler_damage,
  handler_hatefulstrike,
  handler_magneticPull,
  handler_taunt,
  handler_threatOnDebuff,
  handler_timelapse,
  handler_vanish,
  handler_zero,
  threatFunctions,
} from "./base.js";

import * as druid from "./class/druid.js";
import * as hunter from "./class/hunter.js";
import * as mage from "./class/mage.js";
import * as paladin from "./class/paladin.js";
import * as priest from "./class/priest.js";
import * as rogue from "./class/rogue.js";
import * as shaman from "./class/shaman.js";
import * as warlock from "./class/warlock.js";
import * as warrior from "./class/warrior.js";

export const preferredSpellSchools = {
  Mage: 16, // Frost
  Priest: 2, // Holy
  Paladin: 2, // Holy
  Warlock: 32, // Shadow
  // Others will be defaulted to 1 = physical
};

export const baseThreatCoefficients = {
  Rogue: rogue.baseThreatCoefficient,
  // Others will be defaulted to 1
};

/** Sets certain buffs to always show as toggles per class */
export const initialBuffs = {
  All: {
    [paladin.config.Buff.Salv]: 0,
    [paladin.config.Buff.GreaterSalv]: 0,
    [shaman.config.Buff.TranquilAirTotem]: 0,
  },
  Druid: druid.initialBuffs,
  Hunter: hunter.initialBuffs,
  Mage: mage.initialBuffs,
  Paladin: paladin.initialBuffs,
  Priest: priest.initialBuffs,
  Rogue: rogue.initialBuffs,
  Shaman: shaman.initialBuffs,
  Warlock: warlock.initialBuffs,
  Warrior: warrior.initialBuffs,
};

export const buffNames = {
  ...druid.buffNames,
  ...hunter.buffNames,
  ...mage.buffNames,
  ...paladin.buffNames,
  ...priest.buffNames,
  ...rogue.buffNames,
  ...shaman.buffNames,
  ...warlock.buffNames,
  ...warrior.buffNames,
};

export const buffMultipliers = {
  ...druid.buffMultipliers,
  ...hunter.buffMultipliers,
  ...mage.buffMultipliers,
  ...paladin.buffMultipliers,
  ...priest.buffMultipliers,
  ...rogue.buffMultipliers,
  ...shaman.buffMultipliers,
  ...warlock.buffMultipliers,
  ...warrior.buffMultipliers,

  26400: getThreatCoefficient(0.3), // Fetish of the Sand Reaver
  //29232: getThreatCoefficient(0), 		// Fungal Bloom
};

// The leaf elements are functions (buffs,rank) => threatCoefficient
export const talents = {
  Druid: druid.talents,
  Hunter: hunter.talents,
  Mage: mage.talents,
  Paladin: paladin.talents,
  Priest: priest.talents,
  Rogue: rogue.talents,
  Shaman: shaman.talents,
  Warlock: warlock.talents,
  Warrior: warrior.talents,
};

// These make dots green-bordered
export const invulnerabilityBuffs = {
  // ...druid.invulnerabilityBuffs,
  // ...hunter.invulnerabilityBuffs,
  ...mage.invulnerabilityBuffs,
  ...paladin.invulnerabilityBuffs,
  // ...priest.invulnerabilityBuffs,
  // ...rogue.invulnerabilityBuffs,
  // ...shaman.invulnerabilityBuffs,
  // ...warlock.invulnerabilityBuffs,
  // ...warrior.invulnerabilityBuffs,

  3169: "LIP", // Limited Invulnerability Potion
  6724: "Light of Elune",
};
// These make dots yellow-bordered
export const aggroLossBuffs = {
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
export const fixateBuffs = {
  ...druid.fixateBuffs,
  // ...hunter.fixateBuffs,
  // ...mage.fixateBuffs,
  // ...paladin.fixateBuffs,
  // ...priest.fixateBuffs,
  // ...rogue.fixateBuffs,
  // ...shaman.fixateBuffs,
  // ...warlock.fixateBuffs,
  ...warrior.fixateBuffs,

  29060: true, // Deathknight Understudy Taunt
};
// These make a dot in the graph on application and removal
// Also used for event filtering in fetchWCLreport
export const notableBuffs = {
  ...druid.notableBuffs,
  ...hunter.notableBuffs,
  ...mage.notableBuffs,
  ...paladin.notableBuffs,
  ...priest.notableBuffs,
  ...rogue.notableBuffs,
  ...shaman.notableBuffs,
  ...warlock.notableBuffs,
  ...warrior.notableBuffs,

  23397: true, // Nefarian's warrior class call
  23398: true, // Druid class call
  29232: true, // Fungal Bloom
};
for (let k in buffMultipliers) notableBuffs[k] = true;
for (let k in invulnerabilityBuffs) notableBuffs[k] = true;
for (let k in aggroLossBuffs) notableBuffs[k] = true;
for (let k in fixateBuffs) notableBuffs[k] = true;

export const auraImplications = {
  Druid: druid.auraImplications,
  Hunter: hunter.auraImplications,
  Mage: mage.auraImplications,
  Paladin: paladin.auraImplications,
  Priest: priest.auraImplications,
  Rogue: rogue.auraImplications,
  Shaman: shaman.auraImplications,
  Warlock: warlock.auraImplications,
  Warrior: warrior.auraImplications,
};

/**
 * Allows one to check the combatantInfo and infer buffs and talents.
 *
 * Here is a good place to check gear and apply Tier set bonus buffs. e.g. Check for 2pc gear, apply
 * the buff. Then, in buffMultipliers, you can apply global coefficients or to specific spells.
 */
export const combatantImplications = {
  All: (info, buffs, talents) => {
    // set via buffs[id] = true;
  },
  Druid: druid.combatantImplications,
  Hunter: hunter.combatantImplications,
  Mage: mage.combatantImplications,
  Paladin: paladin.combatantImplications,
  Priest: priest.combatantImplications,
  Rogue: rogue.combatantImplications,
  Shaman: shaman.combatantImplications,
  Warlock: warlock.combatantImplications,
  Warrior: warrior.combatantImplications,
};

export const spellFunctions = {
  ...druid.spellFunctions,
  ...hunter.spellFunctions,
  ...mage.spellFunctions,
  ...paladin.spellFunctions,
  ...priest.spellFunctions,
  ...rogue.spellFunctions,
  ...shaman.spellFunctions,
  ...warlock.spellFunctions,
  ...warrior.spellFunctions,

  18670: handler_bossDropThreatOnHit(0.5), // Broodlord Knock Away
  23339: handler_bossDropThreatOnHit(0.5), // BWL Wing Buffet
  // Nefarian's warrior class call, force Berserker Stance
  23397: (ev, fight) => {
    const target = fight.eventToUnit(ev, "target");
    if (ev.type === "applydebuff") {
      delete target.buffs[71];
      delete target.buffs[2457];
      target.buffs[2458] = true; // Berserker stance
    }

    if (ev.type === "removedebuff") {
      delete target.buffs[2458];
    }
  },
  // Nefarian's Druid class call, force Cat form
  23398: (ev, fight) => {
    const target = fight.eventToUnit(ev, "target");
    if (ev.type === "applydebuff") {
      delete target.buffs[5487]; // Bear form
      delete target.buffs[9634]; // Dire Bear form
      target.buffs[768] = true; // Cat form
    }

    if (ev.type === "removedebuff") {
      delete target.buffs[768];
    }
  },

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
  20007: handler_zero, //("Heroic Strength (Crusader)"),
  18138: handler_damage, //("Shadow Bolt (Deathbringer Proc)"),
  24388: handler_damage, //("Brain Damage (Lobotomizer Proc)"),
  23267: handler_damage, //("Firebolt (Perdition's Proc)"),
  18833: handler_damage, //("Firebolt (Alcor's Proc)"),

  21992: threatFunctions.concat(handler_damage, handler_threatOnDebuff(90)), // Thunderfury
  27648: handler_threatOnDebuff(145), // Thunderfury

  /* Thorn Effects */
  9910: handler_damage, //("Thorns"),  //Thorns (Rank 6)
  17275: handler_damage, //("Heart of the Scale"), //Heart of the Scale
  22600: handler_damage, //("Force Reactive Disk"), //Force Reactive
  11350: handler_zero, //("Oil of Immolation"),   //Oil of Immolation (buff)
  11351: handler_damage, //("Oil of Immolation"), //Oil of Immolation (dmg)

  /* Explosives */
  13241: handler_damage, //("Goblin Sapper Charge"), //Goblin Sapper Charge

  /* Zero Threat Abilities */
  71: handler_zero, // Defensive Stance
  2457: handler_zero, // Battle Stance
  2458: handler_zero, // Berserker Stance
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

export const zeroThreatSpells = [];
for (let i in spellFunctions) {
  if (i >= 0 && spellFunctions[i] === handler_zero) {
    zeroThreatSpells.push(i);
  }
}
