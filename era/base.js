/*!
 * General constants and handlers for the base game.
 *
 * Override for specific game versions in a separate file.
 */

import { Fight } from "./threat/fight.js";
import { Unit } from "./threat/unit.js";

/**
 * @typedef {{
 *   coeff: TalentCoefficientFn;
 *   maxRank: number;
 *   rank?: number;
 * }} Talent;
 */

/**
 * @typedef {(buffs: SpellMap<boolean>, rank: any, spellId: SpellId) => ThreatCoefficientFn} TalentCoefficientFn
 */

/**
 * @typedef {(c: import("./threat/wcl.js").WCLCombatantInfoEvent, buffs: SpellMap<boolean>, talents: SpellMap<number>) => void} CombatantImplicationsFn
 */

/**
 * @typedef {(ev: any, fight: Fight) => void} ThreatHandlerFn
 */

/**
 * @typedef {(spellSchool?: number) => number} ThreatCoefficientFn
 */

/**
 * @typedef {{coeff: BuffMultiplierFn}} ThreatCoefficientObject
 */

/**
 * @typedef {(buffs: SpellMap<boolean>, spellId: SpellId | null, fight: Fight) => ThreatCoefficientFn} BuffMultiplierFn
 */

/**
 * @typedef {ThreatCoefficientFn | ThreatCoefficientObject} BuffMultiplier
 */

/**
 * @typedef {{ [key: string]: T }} ClassMap<T>
 * @template T
 */

/**
 * @typedef {{ [key: number]: T }} SpellMap<T>
 * @template T
 */

/**
 * @typedef {{
 *   aggroLossBuffs: SpellMap<boolean>;
 *   auraImplications: ClassMap<SpellMap<SpellId>>;
 *   baseThreatCoefficients: ClassMap<ThreatCoefficientFn>;
 *   buffMultipliers: SpellMap<BuffMultiplier>;
 *   buffNames: SpellMap<string>;
 *   combatantImplications: ClassMap<CombatantImplicationsFn>;
 *   invulnerabilityBuffs: SpellMap<string>;
 *   initialBuffs: ClassMap<SpellMap<number>>;
 *   notableBuffs: SpellMap<boolean>;
 *   fixateBuffs: SpellMap<boolean>;
 *   preferredSpellSchools: ClassMap<number>;
 *   spellFunctions: SpellMap<ThreatHandlerFn>;
 *   zeroThreatSpells: SpellId[];
 *   talents: ClassMap<Record<string, Talent>>;
 *   enableSplitHealingThreatOption?: boolean;
 * }} GameVersionConfig
 */

/**
 * @typedef {'Warrior' | 'Paladin' | 'Hunter' | 'Rogue' | 'Priest' | 'Shaman' | 'Mage' | 'Warlock' | 'Druid'} Class
 */

/**
 * @typedef {Class | 'All'} ClassWithAll
 */

/**
 * @typedef {number} SpellId
 */

/**
 * @typedef {{
 *   buffs: Record<string, number>;
 *   talents: Record<string, number>;
 * }} UnitSettings
 */

/**
 * @typedef {{
 *   tranquilAir?: boolean;
 *   units: Record<string, UnitSettings>;
 * }} ThreatSettings
 */

/** A random non clashing spellId to use for adding a handler to all events */
export const GLOBAL_SPELL_HANDLER_ID = -2000;

export const School = {
  Physical: 1,
  Holy: 2,
  Fire: 4,
  Nature: 8,
  Frost: 16,
  Shadow: 32,
  Arcane: 64,
};

export const InitialBuff = {
  Infer: 0,
  On: 1,
  Off: 2,
  InferredOn: 3,
  InferredOff: 4,
};

const PowerType = {
  Health: -2,
  Mana: 0,
  Rage: 1,
  Focus: 2,
  Energy: 3,
  ComboPoints: 4,
};

export const Faction = {
  Horde: 0,
  Alliance: 1,
};

/**
 * @typedef {[number, string | null]} Border
 * @constant
 */

/**
 * @type {{[key: string]: Border}} Borders
 */
export const borders = {
  taunt: [3, "#ffa500"],
};

// Core threat calculation functions
/**
 * @param {number | { [key: number]: number }} values
 * @returns {ThreatCoefficientFn}
 */
export function getThreatCoefficient(values) {
  if (typeof values === "number") {
    values = { 0: values };
  }
  if (!(0 in values)) values[0] = 1;
  return function (spellSchool = 0) {
    if (spellSchool in values) return values[spellSchool];
    return values[0];
  };
}

/**
 * @param {number} value
 * @param {number} base
 * @returns {ThreatCoefficientFn}
 */
export function getAdditiveThreatCoefficient(value, base) {
  return getThreatCoefficient(additiveThreatCoeff(value, base));
}

/**
 * Returns the multiplicative threat coefficient from a base and an additive value
 * @param {number} value - The additive value to add to the base
 * @param {number} base - The base threat coefficient
 */
export function additiveThreatCoeff(value, base) {
  return (base + value) / base;
}

/**
 * @typedef {{value: number, label: string, bonus?: number}} CoefficientDebug
 */

/**
 * @typedef {{value: number; debug: CoefficientDebug[];}} ThreatCoefficient
 */

/**
 * @param {ThreatCoefficient} coeff
 * @param {number} value
 * @param {string} label
 * @param {number} [bonusThreat] Force display even if the coefficient is 1, because it may have a bonus
 * @returns {ThreatCoefficient}
 */
export function applyThreatCoefficient(coeff, value, label, bonusThreat) {
  return {
    value: coeff.value * value,
    debug: [...coeff.debug, { value, label, bonus: bonusThreat }],
  };
}

/** @type {ThreatCoefficient} */
export const BASE_COEFFICIENT = { value: 1, debug: [] };

// Core threat handling functions
export const threatFunctions = {
  /**
   * @param {{
   *   ev: import("./threat/wcl.js").WCLEvent;
   *   fight: Fight;
   *   amount: number;
   *   useThreatCoeffs?: boolean;
   *   multiplier?: number;
   *   debugLabel?: string;
   *   bonusThreat?: number;
   * }} params
   */
  sourceThreatenTarget({
    ev,
    fight,
    amount,
    useThreatCoeffs = true,
    multiplier = 1,
    debugLabel,
    bonusThreat = 0,
  }) {
    let source = fight.eventToUnit(ev, "source");
    let target = fight.eventToUnit(ev, "target");
    if (!source || !target) return;
    // dmg * mod + bonus threat needs special care:
    // (dmg * mod) + bonus
    // (dmg * initialCoeff * mod) + (bonus * initialCoeff)
    const initialCoeff = useThreatCoeffs
      ? source.threatCoeff(ev.ability)
      : BASE_COEFFICIENT;
    const abilityCoeff = applyThreatCoefficient(
      initialCoeff,
      multiplier,
      debugLabel ?? ev.ability.name,
      bonusThreat
    );
    target.addThreat(
      source.key,
      amount,
      ev.timestamp,
      ev.ability.name,
      abilityCoeff,
      bonusThreat * initialCoeff.value
    );
  },

  /**
   * Threaten all enemies of a unit
   *
   * @param {{
   *   ev: import("./threat/wcl.js").WCLEvent;
   *   unit: import("./threat/fight.js").UnitSpecifier;
   *   fight: Fight;
   *   amount: number;
   *   useThreatCoeffs?: boolean;
   *   multiplier?: number;
   *   debugLabel?: string;
   * }} params
   */
  unitThreatenEnemies({
    ev,
    unit,
    fight,
    amount,
    useThreatCoeffs = true,
    multiplier = 1,
    debugLabel,
  }) {
    let u = fight.eventToUnit(ev, unit);
    if (!u) return;
    let coeff = applyThreatCoefficient(
      useThreatCoeffs ? u.threatCoeff(ev.ability) : BASE_COEFFICIENT,
      multiplier,
      debugLabel ?? ev.ability.name
    );
    let [_, enemies] = fight.eventToFriendliesAndEnemies(ev, unit);
    for (let k in enemies) {
      enemies[k].addThreat(u.key, amount, ev.timestamp, ev.ability.name, coeff);
    }
  },

  /**
   * Threaten all enemies of a unit, splitting the threat between them
   *
   * @param {{
   *   ev: import("./threat/wcl.js").WCLEvent;
   *   unit: import("./threat/fight.js").UnitSpecifier;
   *   fight: Fight;
   *   amount: number;
   *   useThreatCoeffs?: boolean;
   *   multiplier?: number;
   *   debugLabel?: string;
   * }} params
   */
  unitThreatenEnemiesSplit({
    ev,
    unit,
    fight,
    amount,
    useThreatCoeffs = true,
    multiplier = 1,
    debugLabel,
  }) {
    let u = fight.eventToUnit(ev, unit);
    if (!u) return;
    let [_, enemies] = fight.eventToFriendliesAndEnemies(ev, unit);
    const aliveEnemies = Object.values(enemies).filter((e) => e.alive);
    const numEnemies = aliveEnemies.length;

    let coeff = applyThreatCoefficient(
      useThreatCoeffs ? u.threatCoeff(ev.ability) : BASE_COEFFICIENT,
      multiplier,
      debugLabel ?? ev.ability.name
    );

    if (numEnemies !== 1 && (globalThis.splitHealingThreatOption ?? true)) {
      coeff = applyThreatCoefficient(
        coeff,
        1 / numEnemies,
        `split between ${numEnemies} enemies`
      );
    }

    for (let e of aliveEnemies) {
      e.addThreat(u.key, amount, ev.timestamp, ev.ability.name, coeff);
    }
  },

  /**
   * @param {import("./threat/wcl.js").WCLEvent} ev
   * @param {import("./threat/fight.js").UnitSpecifier} unit
   * @param {Fight} fight
   * @param {string} text
   */
  unitLeaveCombat(ev, unit, fight, text) {
    let u = fight.eventToUnit(ev, unit);
    if (!u) return;
    for (let k in fight.units) {
      if (!("threat" in fight.units[k]) || !(u.key in fight.units[k].threat))
        continue;
      fight.units[k].setThreat(u.key, 0, ev.timestamp, text);
    }
  },

  /**
   * @param {Record<string, Unit>} sources
   * @param {Record<string, Unit>} targets
   * @param {number} time
   * @param {string} text
   */
  threatWipe(sources, targets, time, text) {
    for (let a in sources) {
      let source = sources[a];
      for (let targetKey in targets) {
        source.setThreat(targetKey, 0, time, text);
      }
    }
  },

  /**
   * @param {...ThreatHandlerFn} handlers
   * @returns {ThreatHandlerFn}
   */
  concat(...handlers) {
    return (ev, fight) => {
      for (let i = 0; i < handlers.length; ++i) {
        // handlers is from outer func
        handlers[i](ev, fight);
      }
    };
  },
};

export function handler_vanish(ev, fight) {
  if (ev.type !== "cast") return;
  threatFunctions.unitLeaveCombat(ev, "source", fight, ev.ability.name);
}
export function handler_mindcontrol(ev, fight) {
  // Event target resets threat on everything on debuff apply and deapply.
  // Not sure if this is the real behaviour...
  if (ev.type === "applydebuff") {
    threatFunctions.unitLeaveCombat(ev, "target", fight, ev.ability.name);
  } else if (ev.type === "removedebuff") {
    threatFunctions.unitLeaveCombat(
      ev,
      "target",
      fight,
      ev.ability.name + " fades"
    );
  }
}

export function handler_resourcechange(ev, fight) {
  if (ev.type !== "resourcechange") return;
  let diff = ev.resourceChange - ev.waste;
  // Not sure if threat should be given to "target" instead...
  threatFunctions.unitThreatenEnemiesSplit({
    ev,
    unit: "source",
    fight,
    amount: diff,
    useThreatCoeffs: false,
    multiplier: ev.resourceChangeType === PowerType.Mana ? 0.5 : 5,
  });
}
export function handler_resourcechangeCoeff(ev, fight) {
  if (ev.type !== "resourcechange") return;
  let diff = ev.resourceChange - ev.waste;
  // Not sure if threat should be given to "target" instead...
  threatFunctions.unitThreatenEnemiesSplit({
    ev,
    unit: "source",
    fight,
    amount: diff,
    multiplier: ev.resourceChangeType === PowerType.Mana ? 0.5 : 5,
  });
}

/**
 * @param {import("./threat/wcl.js").WCLEvent} ev
 * @param {import("./threat/fight.js").Fight} fight
 */
export function handler_basic(ev, fight) {
  switch (ev.type) {
    case "damage":
      let source = fight.eventToUnit(ev, "source");
      if (source) {
        if (
          ev.sourceIsFriendly &&
          source.handleMisdirectionDamage(ev.amount, ev, fight)
        ) {
        } else {
          threatFunctions.sourceThreatenTarget({
            ev,
            fight,
            amount: ev.amount + (ev.absorbed || 0),
          });
        }
      }
      break;
    case "heal":
      if (ev.sourceIsFriendly !== ev.targetIsFriendly) return;
      threatFunctions.unitThreatenEnemiesSplit({
        ev,
        unit: "source",
        fight,
        amount: ev.amount,
        multiplier: 0.5,
      });
      break;
    case "resourcechange":
      if (globalThis.DEBUGMODE) console.log("Unhandled resourcechange.", ev);
      handler_resourcechange(ev, fight);
      break;
    case "applybuff":
    case "refreshbuff":
    case "applybuffstack":
      if (globalThis.DEBUGMODE) console.log("Unhandled buff.", ev);
      if (ev.sourceIsFriendly !== ev.targetIsFriendly) return;
      threatFunctions.unitThreatenEnemiesSplit({
        ev,
        unit: "source",
        fight,
        amount: 60,
      });
      break;
    case "applydebuff":
    case "applydebuffstack":
    case "refreshdebuff":
      if (globalThis.DEBUGMODE) console.log("Unhandled buff.", ev);
      if (ev.sourceIsFriendly !== ev.targetIsFriendly) return;
      threatFunctions.sourceThreatenTarget({
        ev,
        fight,
        amount: 120,
      });
      break;
    case "death":
    case "combatantinfo":
    case "encounterstart":
    case "encounterend":
    case "begincast":
    case "removebuffstack":
    case "removedebuffstack":
    case "extraattacks":
      break;
    default:
      if (globalThis.DEBUGMODE) console.log("Unhandled event.", ev);
  }
}

export function handler_mark(ev, fight) {
  if (ev.type !== "cast") return;
  if ("target" in ev && ev.target.id === -1) return; // Target is environment
  let a = fight.eventToUnit(ev, "source");
  let b = fight.eventToUnit(ev, "target");
  if (!a || !b) return;
  if (ev.ability.guid === 1) {
    a.lastTarget = b;
  }
  a.targetAttack(b.key, ev.timestamp, ev.ability.name);
  if (ev.ability.guid === 1 || ev.ability.guid < 0) {
    a.target = b;
  }
}

export function handler_markSourceOnMiss(border) {
  return (ev, fight) => {
    if (ev.type !== "damage") return;
    if (ev.hitType !== 0 && ev.hitType <= 6) return;
    let a = fight.eventToUnit(ev, "source");
    let b = fight.eventToUnit(ev, "target");
    if (!a || !b) return;
    b.addMark(a.key, ev.timestamp, "Missed " + ev.ability.name, border);
  };
}

export function handler_markSourceOnDebuff(border) {
  return (ev, fight) => {
    if (!["applydebuff", "applydebuffstack", "refreshdebuff"].includes(ev.type))
      return;
    let a = fight.eventToUnit(ev, "source");
    let b = fight.eventToUnit(ev, "target");
    if (!a || !b) return;
    let s = ev.ability.name;
    //if (ev.type === "removedebuff") s += " fades";
    b.addMark(a.key, ev.timestamp, s, border);
  };
}

/** A zero threat spell that should be ignored in the graph */
export function handler_zero() {}

/** A zero threat spell that should be shown in the graph (e.g. stances/forms) */
export function handler_zero_important() {}

export function handler_castCanMiss(threatValue) {
  return (ev, fight) => {
    let t = ev.type;
    if (t === "cast") {
      threatFunctions.sourceThreatenTarget({ ev, fight, amount: threatValue });
    } else if (t === "damage") {
      threatFunctions.sourceThreatenTarget({ ev, fight, amount: -threatValue });
    }
  };
}

export function handler_castCanMissNoCoefficient(threatValue) {
  return (ev, fight) => {
    let t = ev.type;
    if (t === "cast") {
      threatFunctions.sourceThreatenTarget({
        ev,
        fight,
        amount: threatValue,
        useThreatCoeffs: false,
      });
    } else if (t === "damage") {
      threatFunctions.sourceThreatenTarget({
        ev,
        fight,
        amount: -threatValue,
        useThreatCoeffs: false,
      });
    }
  };
}

export function handler_modDamage(multiplier) {
  return (ev, fight) => {
    if (ev.type !== "damage") return;
    threatFunctions.sourceThreatenTarget({
      ev,
      fight,
      amount: ev.amount + (ev.absorbed || 0),
      multiplier,
    });
  };
}
export function handler_modHeal(multiplier) {
  return (ev, fight) => {
    if (ev.type !== "heal") return;
    threatFunctions.unitThreatenEnemiesSplit({
      ev,
      unit: "source",
      fight,
      amount: ev.amount,
      multiplier: multiplier * 0.5,
      debugLabel: `modHeal (${multiplier} * 0.5)`,
    });
  };
}

export function handler_modDamagePlusThreat(multiplier, bonus) {
  return (ev, fight) => {
    if (ev.type !== "damage" || ev.hitType > 6 || ev.hitType === 0) return;
    threatFunctions.sourceThreatenTarget({
      ev,
      fight,
      amount: ev.amount + (ev.absorbed || 0),
      multiplier,
      bonusThreat: bonus,
    });
  };
}

export function handler_damage(ev, fight) {
  if (ev.type !== "damage") return;
  threatFunctions.sourceThreatenTarget({
    ev,
    fight,
    amount: ev.amount + (ev.absorbed || 0),
  });
}

export function handler_heal(ev, fight) {
  if (ev.type !== "heal") return;
  threatFunctions.unitThreatenEnemiesSplit({
    ev,
    unit: "source",
    fight,
    amount: ev.amount,
    multiplier: 0.5,
  });
}

export function handler_threatOnHit(threatValue) {
  return (ev, fight) => {
    if (ev.type !== "damage" || ev.hitType > 6 || ev.hitType === 0) return;
    threatFunctions.sourceThreatenTarget({
      ev,
      fight,
      amount: ev.amount + (ev.absorbed || 0),
      bonusThreat: threatValue,
    });
  };
}

export function handler_bossDropThreatOnHit(pct) {
  return (ev, fight) => {
    // hitType 0=miss, 7=dodge, 8=parry, 10 = immune, 14=resist, ...
    // https://discordapp.com/channels/383596811517952002/673932163736928256/714590608819486740
    // [00:27] ResultsMayVary: Just to expand on this. Spell threat drops (resists) cause threat loss. Physical misses (dodges/parries) do not cause threat drops.
    if (
      ev.type !== "damage" ||
      (ev.hitType > 6 && ev.hitType !== 10 && ev.hitType !== 14) ||
      ev.hitType === 0
    )
      return;
    let a = fight.eventToUnit(ev, "source");
    let b = fight.eventToUnit(ev, "target");
    if (!a || !b) return;
    a.checkTargetExists(b.key, ev.timestamp);
    a.setThreat(
      b.key,
      a.threat[b.key].currentThreat * pct,
      ev.timestamp,
      ev.ability.name
    );
  };
}
export function handler_bossDropThreatOnDebuff(pct) {
  return (ev, fight) => {
    if (ev.type !== "applydebuff") return;
    let a = fight.eventToUnit(ev, "source");
    let b = fight.eventToUnit(ev, "target");
    if (!a || !b) return;
    a.checkTargetExists(b.key, ev.timestamp);
    a.setThreat(
      b.key,
      a.threat[b.key].currentThreat * pct,
      ev.timestamp,
      ev.ability.name
    );
  };
}
export function handler_bossDropThreatOnCast(pct) {
  return (ev, fight) => {
    if (ev.type !== "cast") return;
    let a = fight.eventToUnit(ev, "source");
    let b = fight.eventToUnit(ev, "target");
    if (!a || !b) return;
    a.checkTargetExists(b.key, ev.timestamp);
    a.setThreat(
      b.key,
      a.threat[b.key].currentThreat * pct,
      ev.timestamp,
      ev.ability.name
    );
  };
}
export function handler_bossThreatWipeOnCast(ev, fight) {
  if (ev.type !== "cast") return;
  let u = fight.eventToUnit(ev, "source");
  if (!u) return;
  for (let k in u.threat) {
    u.setThreat(k, 0, ev.timestamp, ev.ability.name);
  }
}
export function handler_bossPartialThreatWipeOnCast(pct) {
  return (ev, fight) => {
    if (ev.type !== "cast") return;
    let u = fight.eventToUnit(ev, "source");
    if (!u) return;
    for (let k in u.threat) {
      u.setThreat(
        k,
        u.threat[k].currentThreat * pct,
        ev.timestamp,
        ev.ability.name
      );
    }
  };
}

export function handler_threatOnDebuff(threatValue) {
  return (ev, fight) => {
    let t = ev.type;
    if (t !== "applydebuff" && t !== "refreshdebuff") return;
    threatFunctions.sourceThreatenTarget({
      ev,
      fight,
      amount: threatValue,
    });
  };
}

export function handler_threatOnDebuffOrDamage(threatValue) {
  return (ev, fight) => {
    let t = ev.type;
    if (t === "applydebuff") {
      threatFunctions.sourceThreatenTarget({
        ev,
        fight,
        amount: threatValue,
      });
    } else if (t === "damage") {
      threatFunctions.sourceThreatenTarget({
        ev,
        fight,
        amount: ev.amount + (ev.absorbed || 0),
      });
    }
  };
}

export function handler_threatOnBuff(threatValue) {
  return (ev, fight) => {
    let t = ev.type;
    if (t !== "applybuff" && t !== "refreshbuff") return;
    threatFunctions.unitThreatenEnemiesSplit({
      ev,
      unit: "source",
      fight,
      amount: threatValue,
    });
  };
}

export function handler_taunt(ev, fight) {
  if (ev.type !== "applydebuff") return;
  let u = fight.eventToUnit(ev, "target");
  let v = fight.eventToUnit(ev, "source");
  if (!u || !v) return;
  if (!("threat" in u)) return;
  let maxThreat = 0;
  for (let k in u.threat) {
    maxThreat = Math.max(maxThreat, u.threat[k].currentThreat);
  }
  u.setThreat(v.key, maxThreat, ev.timestamp, ev.ability.name);
  u.target = v;
}

export function handler_timelapse(ev, fight) {
  if (ev.type !== "applydebuff") return;
  let u = fight.eventToUnit(ev, "source");
  let v = fight.eventToUnit(ev, "target");
  if (!u || !v) return;
  u.setThreat(
    v.key,
    u.threat[v.key].currentThreat * v.threatCoeff().value,
    ev.timestamp,
    ev.ability.name
  );
}

/**
 * Counts the number of gear items with a given set ID
 *
 * @param {import("../era/threat/wcl").WCLCombatantGear[]} gear
 * @param {number} setId
 */
export function gearSetCount(gear, setId) {
  return gear.filter((g) => g.setID === setId).length;
}

/**
 * @param {import("../era/threat/wcl").WCLCombatantGear[]} gear
 * @param {number} id
 */
export function gearHasTempEnchant(gear, id) {
  return gear.some((g) => g.temporaryEnchant === id);
}
