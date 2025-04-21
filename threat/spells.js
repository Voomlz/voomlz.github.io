import {
  applyThreatCoefficient,
  borders,
  gearSetCount,
  getThreatCoefficient,
  GLOBAL_SPELL_HANDLER_ID,
  handler_bossDropThreatOnHit,
  handler_bossThreatWipeOnCast,
  handler_castCanMiss,
  handler_damage,
  handler_markSourceOnMiss,
  handler_modDamage,
  handler_modDamagePlusThreat,
  handler_modHeal,
  handler_resourcechange,
  handler_threatOnBuff,
  handler_threatOnDebuff,
  handler_threatOnHit,
  handler_vanish,
  handler_zero,
  threatFunctions,
} from "../era/base.js";

export {
  preferredSpellSchools,
  aggroLossBuffs,
  baseThreatCoefficients,
  invulnerabilityBuffs,
} from "../era/spells.js";

import * as era from "../era/spells.js";
import { Fight } from "../era/threat/fight.js";

const Druid = {
  Mod: {
    /** Same as original handler_mangleModDamage */
    Mangle: 1 + (1.5 - 1.15) / 1.15,
    T6_2pc: 1.5,
  },
  Buff: {
    T6_2pc: 38447,
  },
  Tier: {
    T6: 676,
  },
};

export const buffNames = {
  ...era.buffNames,
  35079: "Misdirection",
  2613: "Enchant : Threat on gloves",
  2621: "Enchant : Subtlety",
  40618: "Insignificance",
  [Druid.Buff.T6_2pc]: "Improved Mangle (T6 2pc)",
};

export const initialBuffs = {
  ...era.initialBuffs,
  All: {
    ...era.initialBuffs.All,
    2613: 0,
    2621: 0,
  },
};

export const buffMultipliers = {
  ...era.buffMultipliers,
  40618: getThreatCoefficient(0), // Gurtogg Insignificance
  2613: getThreatCoefficient(1.02), // gloves enchants
  2621: getThreatCoefficient(0.98), // subtlety enchants

  [Druid.Buff.T6_2pc]: {
    coeff: (buffs, spellId) => {
      const mangleSpells = {
        33878: true,
        33986: true,
        33987: true,
      };

      if (spellId in mangleSpells) {
        return getThreatCoefficient(Druid.Mod.T6_2pc / Druid.Mod.Mangle);
      }
      // without T6, use the regular mangle mod
      return getThreatCoefficient(1);
    },
  },
};

export const talents = {
  Warrior: {
    Defiance: {
      maxRank: 3,
      coeff: function (buffs, rank = 3) {
        if (!(71 in buffs)) return getThreatCoefficient(1);
        return getThreatCoefficient(1 + 0.05 * rank);
      },
    },
    "Improved Berserker Stance": {
      maxRank: 5,
      coeff: function (buffs, rank = 5) {
        if (!(2458 in buffs)) return getThreatCoefficient(1);
        return getThreatCoefficient(1 - 0.02 * rank);
      },
    },
    "Tactical Mastery": {
      maxRank: 3,
      coeff: function (buffs, rank = 3, spellId) {
        if (!(71 in buffs)) return getThreatCoefficient(1);
        return getThreatCoefficient(
          1 +
            0.21 *
              rank *
              (spellId in
                {
                  23881: true,
                  23892: true,
                  23893: true,
                  23894: true,
                  23888: true,
                  23885: true,
                  23891: true, // Bloodthirst
                  12294: true,
                  21551: true,
                  21552: true,
                  21553: true,
                  25248: true,
                  30330: true, // Mortal Strike
                })
        );
      },
    },
  },
  Druid: {
    "Feral Instinct": {
      maxRank: 3,
      coeff: function (buffs, rank = 3) {
        if (!(5487 in buffs) && !(9634 in buffs))
          return getThreatCoefficient(1);
        return getThreatCoefficient((1.3 + 0.05 * rank) / 1.3);
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
                })
        ),
    },
  },
  Mage: {
    "Arcane Subtlety": {
      maxRank: 2,
      coeff: (_, rank = 2) => getThreatCoefficient({ 64: 1 - 0.2 * rank }),
    },
    "Burning Soul": {
      maxRank: 2,
      coeff: (_, rank = 2) => getThreatCoefficient({ 4: 1 - 0.05 * rank }),
    },
    "Frost Channeling": {
      maxRank: 3,
      coeff: (_, rank = 3) => getThreatCoefficient({ 16: 1 - 0.033333 * rank }),
    },
  },
  Paladin: {
    "Improved Righteous Fury": {
      maxRank: 3,
      coeff: function (buffs, rank = 3) {
        if (!(25780 in buffs)) return getThreatCoefficient(1);
        let amp = 1 + Math.floor((rank * 50) / 3) / 100;
        return getThreatCoefficient({ 2: (1 + 0.6 * amp) / 1.6 });
      },
    },
    Fanaticism: {
      maxRank: 5,
      coeff: function (buffs, rank = 0) {
        // Not modifying when righteous fury is up
        if (25780 in buffs) return getThreatCoefficient(1);
        return getThreatCoefficient(1 - 0.06 * rank);
      },
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
        getThreatCoefficient({ 32: 1 - Math.floor((rank * 25) / 3) / 100 }),
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
    "Spirit Weapons": {
      maxRank: 1,
      // Only for melee (1) attacks
      coeff: (_, rank = 1) => getThreatCoefficient({ 1: 1 - 0.3 * rank }),
    },
    "Elemental Precision (fire)": {
      maxRank: 3,
      // Fire (4), Nature (8), Frost (16)
      // TODO use for all schools
      coeff: (_, rank = 3) => getThreatCoefficient({ 4: 1 - 0.033333 * rank }),
    },
    "Elemental Precision (nature)": {
      maxRank: 3,
      // Fire (4), Nature (8), Frost (16)
      // TODO use for all schools
      coeff: (_, rank = 3) => getThreatCoefficient({ 8: 1 - 0.033333 * rank }),
    },
    "Elemental Precision (frost)": {
      maxRank: 3,
      // Fire (4), Nature (8), Frost (16)
      // TODO use for all schools
      coeff: (_, rank = 3) => getThreatCoefficient({ 16: 1 - 0.033333 * rank }),
    },
  },
  Warlock: {
    "Destructive Reach": {
      maxRank: 2,
      coeff: (_, rank = 2) => getThreatCoefficient(1 - 0.05 * rank),
    },
  },
};

export const fixateBuffs = {
  ...era.fixateBuffs,
  40604: true, // Gurtogg Fel Rage
};

export const notableBuffs = {
  ...era.notableBuffs,
  ...buffNames,
  ...buffMultipliers,
};

export const auraImplications = {
  ...era.auraImplications,
  Warrior: {
    7384: 2457,
    7887: 2457,
    11584: 2457,
    11585: 2457, //Overpower
    100: 2457,
    6178: 2457,
    11578: 2457, //Charge
    // 6343: 2457, 8198: 2457, 8204: 2457, 8205: 2457, 11580: 2457, 11581: 2457, //Thunderclap now usable in def stance
    694: 2457,
    7400: 2457,
    7402: 2457,
    20559: 2457,
    20560: 2457, //Mocking Blow
    20230: 2457, //Retaliation
    // 12292: 2457, //Sweeping Strikes now usable in berserker stance
    20252: 2458,
    20617: 2458,
    20616: 2458, //Intercept
    1680: 2458, //Whirlwind
    18499: 2458, //Berserker Rage
    1719: 2458, //Recklessness
    6552: 2458,
    6554: 2458, //Pummel
    355: 71, //Taunt
    676: 71, //Disarm
    6572: 71,
    6574: 71,
    7379: 71,
    11600: 71,
    11601: 71,
    25288: 71,
    25269: 71,
    30357: 71, //Revenge
    2565: 71, //Shield Block
    871: 71, //Shield Wall
    23922: 71,
    23923: 71,
    23924: 71,
    23925: 71,
    25258: 71,
    30356: 71, // Shield slam
  },
  Druid: {
    // intentionally blank, to undo all the era druid implications
  },
  Paladin: {
    27179: 25780, // Holy shield r4 -> Righteous Fury
  },
};

/**
 * Modded: threatens the heal target, but also does not apply ability coefficient unless it's a paladin
 *
 *
 * @param {{
 *   ev: import("../era/threat/wcl.js").WCLEvent;
 *   unit: import("../era/threat/fight.js").UnitSpecifier;
 *   fight: Fight;
 *   amount: number;
 *   multiplier?: number;
 * }} params
 */
function unitThreatenEnemiesSplitOnHealRedirect({
  ev,
  unit,
  fight,
  amount,
  multiplier = 1,
}) {
  let u = fight.eventToUnit(ev, unit);
  if (!u) return;

  let coeff = applyThreatCoefficient(
    u.type === "Paladin" ? u.threatCoeff(ev.ability) : u.threatCoeff(),
    multiplier,
    ev.ability.name
  );

  let [_, enemies] = fight.eventToFriendliesAndEnemies(ev, unit);
  const aliveEnemies = Object.values(enemies).filter((e) => e.alive);
  const numEnemies = aliveEnemies.length;

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
}

let lastSunderEvent;

function handler_sunderArmor(threatValue) {
  return (ev, fight) => {
    if (ev.type === "cast") {
      threatFunctions.sourceThreatenTarget({ ev, fight, amount: threatValue });
      return;
    }

    if (ev.type === "applydebuffstack") {
      lastSunderEvent = ev;
    }
  };
}

function handler_devastate(devastateValue, sunderValue) {
  return (ev, fight) => {
    if (ev.type !== "damage" || ev.hitType > 6 || ev.hitType === 0) return;
    threatFunctions.sourceThreatenTarget({
      ev,
      fight,
      amount: ev.amount + (ev.absorbed || 0),
      bonusThreat: devastateValue,
    });

    // Little hack to manage the case where we have multiple warrior sundering.
    // In WCL, only one will be considered as source of all sunder debuff on one target.

    if (lastSunderEvent) {
      if (lastSunderEvent.timestamp === ev.timestamp) {
        let source = fight.eventToUnit(ev, "source");
        let target = fight.eventToUnit(ev, "target");
        if (!source) return;
        if (!target) return;
        target.addThreat(
          source.key,
          sunderValue,
          ev.timestamp,
          lastSunderEvent.ability.name + " (Devastate)",
          source.threatCoeff(lastSunderEvent.ability)
        );
      }
    }
  };
}

function handler_threatAsTargetHealed(ev, fight) {
  if (ev.type === "cast") return;
  unitThreatenEnemiesSplitOnHealRedirect({
    ev,
    unit: "target",
    fight,
    amount: ev.amount,
    multiplier: 0.5,
  });
}

let lastSpellReflectEvent;

function handler_spellReflectCast(ev) {
  lastSpellReflectEvent = ev;
}

function handler_selfDamageOnSpellReflect() {
  return (ev, fight) => {
    if (ev.targetIsFriendly === false) {
      let a = fight.eventToUnit(ev, "source");
      let b = fight.eventToUnit(ev, "target");
      if (!a || !b) return;

      if (lastSpellReflectEvent) {
        if (ev.timestamp - lastSpellReflectEvent.timestamp < 5000) {
          let source = fight.eventToUnit(lastSpellReflectEvent, "source");
          let target = fight.eventToUnit(ev, "target");

          target.addThreat(
            source.key,
            ev.amount,
            ev.timestamp,
            ev.ability.name + " (Spell Reflect)",
            source.threatCoeff(ev.ability)
          );
        }
      }
    }
  };
}

function handler_hatefulstrike(mainTankThreat, offTankThreat) {
  return (ev, fight) => {
    if (document.getElementById("gruul-hurtfull") === null) return;
    if (document.getElementById("gruul-hurtfull").checked === false) return;

    let threatVal = document.getElementById("gruul-hurtfull-value").value;
    if (threatVal) mainTankThreat = threatVal;

    // hitType 0=miss, 7=dodge, 8=parry, 10 = immune, 14=resist, ...
    if (
      ev.type !== "damage" ||
      /*(ev.hitType > 6 && ev.hitType !== 10 && ev.hitType !== 14) || */ ev.hitType ===
        0
    )
      return;
    let a = fight.eventToUnit(ev, "source");
    let b = fight.eventToUnit(ev, "target");
    if (!a || !b) return;
    a.addThreat(a.target.key, mainTankThreat, ev.timestamp, ev.ability.name, 1);
    a.addThreat(b.key, offTankThreat, ev.timestamp, ev.ability.name, 1);
  };
}

function handler_hydrossThreatWipeOnCast(ev, fight) {
  if (ev.type !== "cast") return;
  let u = fight.eventToUnit(ev, "source");

  let [enemies, _] = fight.eventToFriendliesAndEnemies(ev, u);

  for (let i in enemies) {
    if (enemies[i].alive) {
      for (let k in enemies[i].threat) {
        enemies[i].setThreat(k, 0, ev.timestamp, "Change phase");
      }
    }
  }
}

function handler_leotherasWhirlwind(ev, fight) {
  if (ev.type !== "applybuff" && ev.type !== "removebuff") return;
  let u = fight.eventToUnit(ev, "source");

  let [enemies, _] = fight.eventToFriendliesAndEnemies(ev, u);

  for (let i in enemies) {
    if (enemies[i].alive) {
      for (let k in enemies[i].threat) {
        enemies[i].setThreat(k, 0, ev.timestamp, "Whirlwind threat reset");
      }
    }
  }
}

function handler_VashjBarrier(ev, fight) {
  if (ev.type !== "applybuff" && ev.type !== "removebuff") return;
  let t = fight.eventToUnit(ev, "target");

  for (let k in t.threat) {
    t.setThreat(k, 0, ev.timestamp, "Barrier threat reset");
  }
}

/** @type {number | null} */
let nightBaneNextLanding;

/**
 * Global handler (runs on every event) for Nightbane. After a certain delay it wipes all threat on
 * all players/friendlies. It uses the first cast event after the delay to determine that Nightbane
 * has landed (is now targetable).
 *
 * @param {import("../era/threat/wcl.js").WCLEvent} ev
 * @param {import("../era/threat/fight.js").Fight} fight
 */
function handler_global_nightbaneLanding(ev, fight) {
  if (nightBaneNextLanding) {
    if (ev.sourceIsFriendly && !ev.targetIsFriendly) {
      if (ev.timestamp > nightBaneNextLanding) {
        let enemy =
          /** @type {import("../era/threat/unit.js").NPC | undefined} */ (
            fight.eventToUnit(ev, "target")
          );
        if (!enemy) return;
        for (let playerKey in enemy.threat) {
          enemy.setThreat(
            playerKey,
            0,
            nightBaneNextLanding,
            "Landing Threat Wipe"
          );
        }
        nightBaneNextLanding = null;
      }
    }
  }
}

function handler_nightbaneThreatWipeOnCast(delay) {
  /**
   * @param {import("../era/threat/wcl.js").WCLEvent} ev
   * @param {import("../era/threat/fight.js").Fight} fight
   */
  return (ev, fight) => {
    if (ev.type !== "cast") return;
    let u = fight.eventToUnit(ev, "source");
    nightBaneNextLanding = ev.timestamp + delay;
    if (!u) return;
    for (let k in u.threat) {
      u.setThreat(k, 0, ev.timestamp, ev.ability.name);
    }
  };
}

function handler_illidanEndP2ThreatWipeOnCast(ev, fight) {
  if (ev.type !== "cast") return;
  let u = fight.eventToUnit(ev, "source");

  let [enemies, _] = fight.eventToFriendliesAndEnemies(ev, u);

  for (let i in enemies) {
    if (enemies[i].alive) {
      for (let k in enemies[i].threat) {
        enemies[i].setThreat(k, 0, ev.timestamp, "Change phase");
      }
    }
  }
}

function handler_partialThreatWipeOnCast(pct) {
  return (ev, fight) => {
    if (ev.type !== "cast") return;
    let u = fight.eventToUnit(ev, "source");
    if (!u) return;
    let [_, enemies] = fight.eventToFriendliesAndEnemies(ev, "source");
    for (let k in enemies) {
      // Double check if units are still valid
      if (enemies[k].threat) {
        if (enemies[k].threat[u.key]) {
          enemies[k].setThreat(
            u.key,
            enemies[k].threat[u.key].currentThreat * pct,
            ev.timestamp,
            ev.ability.name
          );
        }
      }
    }
  };
}

function handler_partialThreatWipeOnEvent(pct) {
  return (ev, fight) => {
    if (ev.type !== "applybuff" && ev.type !== "removebuff") return;
    let u = fight.eventToUnit(ev, "source");
    if (!u) return;

    let [_, enemies] = fight.eventToFriendliesAndEnemies(ev, "source");

    for (let k in enemies) {
      if (enemies[k].threat) {
        if (enemies[k].threat[u.key]) {
          if (ev.type === "applybuff") {
            u.setLastInvisibility(ev.timestamp);
            enemies[k].setThreat(
              u.key,
              enemies[k].threat[u.key].currentThreat * (1 - pct),
              ev.timestamp,
              ev.ability.name
            );
          } else if (ev.type === "removebuff") {
            let timeElapsed = ev.timestamp - u.lastInvisibility;
            let nbSecondElapsed = Math.floor(timeElapsed / 1000);
            let currentThreat = enemies[k].threat[u.key].currentThreat;

            // scale up by x%
            currentThreat = currentThreat * (1 + pct / (1 - pct));
            // Then remove threat for the amount of time spent in invis
            currentThreat = nbSecondElapsed * (1 - nbSecondElapsed * pct);

            enemies[k].setThreat(
              u.key,
              currentThreat,
              ev.timestamp,
              ev.ability.name
            );
          }
        }
      }
    }
  };
}

// https://zidnae.gitlab.io/tbc-armor-penetration-calc/tbc_bear_tc.html
function handler_lacerate(bonusThreat, tickMultiplier) {
  return (ev, fight) => {
    // miss dodge ect
    if (ev.type !== "damage" || ev.hitType > 6 || ev.hitType === 0) return;

    if (ev.tick) {
      threatFunctions.sourceThreatenTarget({
        ev,
        fight,
        amount: ev.amount + (ev.absorbed || 0),
        multiplier: tickMultiplier,
      });
      return;
    }
    threatFunctions.sourceThreatenTarget({
      ev,
      fight,
      amount: ev.amount + (ev.absorbed || 0),
      bonusThreat: bonusThreat,
    });
  };
}

// From my testing, battle and commanding shout aren't splitting threat on tbc anymore
// Also used for pet food bug
function handler_threatOnBuffUnsplit(threatValue, useCoeff) {
  return (ev, fight) => {
    let t = ev.type;
    if (t !== "applybuff" && t !== "refreshbuff") return;
    threatFunctions.unitThreatenEnemies({
      ev,
      unit: "source",
      fight,
      amount: threatValue,
      useThreatCoeffs: useCoeff,
    });
  };
}

/**
 *
 * @param {import("../era/threat/wcl.js").WCLEvent} ev
 * @param {import("../era/threat/fight.js").Fight} fight
 * @returns
 */
function handler_righteousDefense(ev, fight) {
  let target = fight.eventToUnit(ev, "target");
  let source = fight.eventToUnit(ev, "source");

  if (!target || !source) return;

  let maxThreat = 0;

  let [enemies, _] = fight.eventToFriendliesAndEnemies(ev, source);
  for (let j in enemies) {
    if (enemies[j].alive === false || enemies[j].lastTarget == null) {
      continue;
    }
    if (
      enemies[j].lastTarget.global != null &&
      enemies[j].threat[enemies[j].lastTarget.global.id] != null
    ) {
      maxThreat = Math.max(
        maxThreat,
        enemies[j].threat[enemies[j].lastTarget.global.id].currentThreat
      );
    }
    if (maxThreat !== 0) {
      enemies[j].setThreat(
        source.key,
        maxThreat,
        ev.timestamp,
        ev.ability.name
      );
      enemies[j].target = source;
    }
  }
}

export const spellFunctions = {
  ...era.spellFunctions,

  [GLOBAL_SPELL_HANDLER_ID]: threatFunctions.concat(
    handler_global_nightbaneLanding
  ),

  10101: handler_bossDropThreatOnHit(0.5), // Knock Away variants
  18813: handler_bossDropThreatOnHit(0.5),
  18945: handler_bossDropThreatOnHit(0.5),
  20686: handler_bossDropThreatOnHit(0.5),
  23382: handler_bossDropThreatOnHit(0.5),
  30121: handler_bossDropThreatOnHit(0.5),
  32077: handler_bossDropThreatOnHit(0.5),
  32959: handler_bossDropThreatOnHit(0.5),
  37597: handler_bossDropThreatOnHit(0.5),

  25778: handler_bossDropThreatOnHit(0.75), // Void Reaver, Fathom Lurker, Fathom Sporebat, Underbog Lord, Knock Away
  31389: handler_bossDropThreatOnHit(0.75), // Knock Away Generic
  37102: handler_bossDropThreatOnHit(0.75), // Crystalcore Devastator (TK) Knock Away
  30013: handler_bossThreatWipeOnCast, // Disarm (etheral thief in kara) removes threat

  33237: handler_bossThreatWipeOnCast, // Kiggler the Crazed arcane explosion - HKM fight
  //37676: handler_nightbaneThreatWipeOnCast((43 * 1000)), // Leotheras demon form
  37098: handler_nightbaneThreatWipeOnCast(43 * 1000), // Nightbane's Rain of Bones. delay : 43 sec is the timer according to DBM

  /*  SSC */
  25035: handler_hydrossThreatWipeOnCast, // Hydross invoc spawns
  37640: handler_leotherasWhirlwind, // Leotheras WW
  38112: handler_VashjBarrier, // Vashj Barrier

  /* BT */
  41470: handler_selfDamageOnSpellReflect, // Council, for spell reflect
  40486: handler_bossDropThreatOnHit(0.75), // Gurtog Bloodboil
  40597: handler_bossDropThreatOnHit(0.75), // Gurtog Bloodboil - Eject

  40618: handler_zero, // Gurtog Bloodboil insignificance
  41476: handler_bossThreatWipeOnCast, // Veras (Council)
  39635: handler_bossThreatWipeOnCast, // Illidan Throw glaive (P2)
  39873: handler_illidanEndP2ThreatWipeOnCast, // Illidan Glaive return (End of P2)
  // 40683: handler_bossThreatWipeOnCast, // Illidan enrage
  40647: handler_bossThreatWipeOnCast, // Illidan Shadow prison

  // testing if it works like Patchwerk ? Only on off tank?
  33813: handler_hatefulstrike(1500, 0), // Gruul's hurtfulstrike
  28308: handler_hatefulstrike(1000, 2000), // Patchwerk's hateful strike

  // Trinkets
  35163: handler_zero, // Blessing of the Silver Crescent
  34106: handler_zero, // Arpen from bloodfurnance
  35166: handler_zero, // Bloodlust brooch
  28866: handler_zero, // Kiss of the spider
  26480: handler_zero, // Badge of the Swarmguard
  26481: handler_zero, // Badge of the Swarmguard - arpen
  33649: handler_zero, // Hourglass of the Unraveller - GT2 trinket
  51955: handler_zero, // Dire Drunkard

  // Gear proc
  21165: handler_zero, // Blacksmith mace

  // Enchant proc
  28093: handler_zero, // Lightning speed - mongoose weapon

  27145: handler_threatOnBuff(69), // GBoL r2
  27144: handler_threatOnBuff(69), // BoL r4
  25782: handler_threatOnBuff(60), // GBoM
  27141: handler_threatOnBuff(70), // GBoM r 3
  27140: handler_threatOnBuff(70), // BoM r 8
  27169: handler_threatOnBuff(70), // GBoSanc r 2
  27143: handler_threatOnBuff(70), // GBoW r3

  27142: handler_threatOnBuff(70), // BoW r 7

  27155: threatFunctions.concat(handler_threatOnBuff(58), handler_damage), // Seal of Righteousness r9

  20925: handler_modDamage(1.35), // Holy Shield r1
  20927: handler_modDamage(1.35), // Holy Shield r2
  20928: handler_modDamage(1.35), // Holy Shield r3
  27179: handler_modDamage(1.35), // Holy Shield r4

  31935: handler_modDamage(1.3), // Avenger shield r1
  32699: handler_modDamage(1.3), // Avenger shield r2
  32700: handler_modDamage(1.3), // Avenger shield r3

  31789: threatFunctions.concat(
    handler_righteousDefense,
    handler_markSourceOnMiss(borders.taunt)
  ), // Righteous Defense

  20268: handler_zero, // Mana from judgement of wisdom r1
  20352: handler_zero, // Mana from judgement of wisdom r2
  20353: handler_zero, // Mana from judgement of wisdom r3
  27165: handler_zero, // Mana from judgement of wisdom r4

  27135: handler_modHeal(0.5), // Holy Light r10
  27136: handler_modHeal(0.5), // Holy Light r11

  27137: handler_modHeal(0.5), // Flash of Light r7

  //27154: handler_modHeal(.5), // Lay on Hands r4

  // Mage

  66: handler_partialThreatWipeOnEvent(0.2), // invisibility : 20% per second of buff

  // Rogue
  26889: handler_vanish, // Vanish

  // Priest

  // mind blast no longer increase threat in tbc
  // https://wowwiki-archive.fandom.com/wiki/Mind_Blast
  8092: handler_damage, // Mind Blast r1
  8102: handler_damage, // Mind Blast r2
  8103: handler_damage, // Mind Blast r3
  8104: handler_damage, // Mind Blast r4
  8105: handler_damage, // Mind Blast r5
  8106: handler_damage, // Mind Blast r6
  10945: handler_damage, // Mind Blast r7
  10946: handler_damage, // Mind Blast r8
  10947: handler_damage, // Mind Blast r9
  25372: handler_damage, // Mind Blast r10
  25375: handler_damage, // Mind Blast r11

  // Warlock

  //29858: handler_bossDropThreatOnCast(0.5),// Soulshatter
  29858: handler_partialThreatWipeOnCast(0.5), // Soulshatter

  //hunter
  // 43771: handler_threatOnBuffUnsplit(5000, false, "Pet Feeding"), // Pet food (bugged?) in current tbc - 20 str
  // 33272: handler_threatOnBuffUnsplit(5000, false, "Pet Feeding"), // Pet food (bugged?) in current tbc - Sporeggar
  // Bug fixed https://tbc.wowhead.com/news/burning-crusade-classic-hotfixes-for-october-4th-2021-kiblers-bits-threat-324414

  // Shaman

  8042: handler_modDamage(1), // Earth Shock r1
  8044: handler_modDamage(1), // Earth Shock r2
  8045: handler_modDamage(1), // Earth Shock r3
  8046: handler_modDamage(1), // Earth Shock r4
  10412: handler_modDamage(1), // Earth Shock r5
  10413: handler_modDamage(1), // Earth Shock r6
  10414: handler_modDamage(1), // Earth Shock r7
  25454: handler_modDamage(1), // Earth Shock r8

  8056: handler_modDamage(2), // Frost Shock r1
  8058: handler_modDamage(2), // Frost Shock r2
  10472: handler_modDamage(2), // Frost Shock r3
  10473: handler_modDamage(2), // Frost Shock r4
  25464: handler_modDamage(2), // Frost Shock r5

  16246: handler_zero, // Clearcasting
  8516: handler_zero, // Windfury Attack (buff only) R1
  10608: handler_zero, // Windfury Attack (buff only) R2
  10610: handler_zero, // Windfury Attack (buff only) R3
  25584: handler_zero, // Windfury Attack (buff only)
  30802: handler_zero, // Unleashed rage
  30807: handler_zero, // Unleashed rage
  30823: handler_zero, // Shamanistic Rage - cast
  30824: handler_resourcechange, // Shamanistic Rage - buff
  // 43339: handler_zero, // Focused
  16280: handler_zero, // Flurry

  24398: handler_zero, // Water Shield cast R1
  33736: handler_zero, // Water shield cast R2

  23575: handler_zero, // Water shield mana R2
  33737: handler_zero, // Water shield mana R2

  39104: handler_resourcechange, // Totem recall

  // Lightning Bolt from https://tbc.wowhead.com/spell=30681/lightning-overload makes 0 threat
  45284: handler_zero, // Rank 1
  45286: handler_zero, // Rank 2
  45287: handler_zero, // Rank 3
  45288: handler_zero, // Rank 4
  45289: handler_zero, // Rank 5
  45290: handler_zero, // Rank 6
  45291: handler_zero, // Rank 7
  45292: handler_zero, // Rank 8
  45293: handler_zero, // Rank 9
  45294: handler_zero, // Rank 10
  45295: handler_zero, // Rank 11
  45296: handler_zero, // Rank 12

  // Chain lightnings
  45297: handler_zero, // Rank 1
  45298: handler_zero, // Rank 2
  45299: handler_zero, // Rank 3
  45300: handler_zero, // Rank 4
  45301: handler_zero, // Rank 5
  45302: handler_zero, // Rank 6*

  // Elemental mastery
  16166: handler_zero, // Rank 6

  21992: handler_modDamagePlusThreat(0.5, 63), // Thunderfury
  27648: handler_zero,

  26992: handler_damage, //("Thorns"),  //Thorns (Rank 7)

  30486: handler_damage, //Super Sapper Charge
  39965: handler_damage, //Frost Grenades
  30217: handler_damage, //Adamantite Grenade
  30461: handler_damage, //The Bigger One
  19821: handler_damage, //Arcane Bomb
  30216: handler_damage, //Fel Iron Bomb
  46567: handler_damage, //Rocket Launch
  // TODO : Need to double check if slow/stun effects add threat modifier on some explosives

  28508: handler_zero, // Destruction pot
  28507: handler_zero, // Haste pot
  22838: handler_zero, // Haste pot
  29529: handler_zero, // Drums of battle
  35476: handler_zero, // Drums of battle
  185848: handler_zero, // Greater Drums of battle

  32182: handler_zero, // Heroism
  2825: handler_zero, // Bloodlust

  //TODO : Add tactical mastery talent threat modifier

  25286: handler_threatOnHit(173, "Heroic Strike"), // (AQ)Rank 9
  29707: handler_threatOnHit(194, "Heroic Strike"), // Rank 10
  30324: handler_threatOnHit(220, "Heroic Strike"), // Unused rank ?

  23925: handler_threatOnHit(254, "Shield Slam (Rank 4)"), //Rank 4
  25258: handler_threatOnHit(278, "Shield Slam (Rank 5)"), //Rank 5
  30356: handler_threatOnHit(305, "Shield Slam"), //Rank 6

  //Devastate
  20243: handler_devastate(100, 301.5, "devastate (Rank 1)"), //Rank 1
  30016: handler_devastate(100, 301.5, "devastate (Rank 2)"), //Rank 2
  30022: handler_devastate(100, 301.5, "devastate (Rank 3)"), //Rank 3

  // CF https://github.com/magey/tbc-warrior/wiki/Threat-Values

  1672: handler_modDamagePlusThreat(1.5, 156),
  29704: handler_modDamagePlusThreat(1.5, 192),

  //Revenge
  11601: handler_threatOnHit(150), //Rank 5
  25288: handler_threatOnHit(175), //Rank 6 (AQ)
  25269: handler_threatOnHit(185), //Rank 7 -- approx
  30357: handler_threatOnHit(200), //Rank 8
  12798: handler_threatOnHit(20), //("Revenge Stun"),           //Revenge Stun - now +20 threat on tbcc, boss are imumune more often than not

  25231: handler_threatOnHit(125, "Cleave"), //Rank 6

  // Thunderclap
  6343: handler_modDamage(1.75), // Thunder Clap r1
  8198: handler_modDamage(1.75), // Thunder Clap r2
  8204: handler_modDamage(1.75), // Thunder Clap r3
  8205: handler_modDamage(1.75), // Thunder Clap r4
  11580: handler_modDamage(1.75), // Thunder Clap r5
  11581: handler_modDamage(1.75), // Thunder Clap r6

  25236: handler_modDamage(1.25, "Execute"), // rank 7

  /* Abilities */
  //Sunder Armor
  7386: handler_sunderArmor(45), // Rank 1
  11597: handler_sunderArmor(261, "Sunder Armor"), //Rank 5
  25225: handler_sunderArmor(301.5, "Sunder Armor"), //Rank 6

  //Battleshout
  11551: handler_threatOnBuffUnsplit(52, true, "Battle Shout"), //Rank 6
  25289: handler_threatOnBuffUnsplit(60, true, "Battle Shout"), //Rank 7 (AQ)
  2048: handler_threatOnBuffUnsplit(69, true, "Battle Shout"), //Rank 8

  //Demo Shout
  11556: handler_threatOnDebuff(43, "Demoralizing Shout"),
  25203: handler_threatOnDebuff(56, "Demoralizing Shout"), //Rank 7

  // Commanding shout
  469: handler_threatOnBuffUnsplit(69, true, "Commanding Shout"),
  // 469: handler_threatOnBuff(58, "Commanding Shout"), // 58 threat on Omen (tbc vanilla)

  // Spell reflect
  23920: handler_spellReflectCast,

  12292: handler_zero, //("Death Wish"), //Death Wish tbcc rank ?

  28515: handler_zero, // Iron shield pot
  13455: handler_zero, // Greater stoneshield pot
  4623: handler_zero, // Lesser stoneshield pot

  // Druid

  // https://tbc.wowhead.com/guides/feral-druid-tank-burning-crusade-classic

  // zidnae 322 or 344; unclear
  // OMEN   322
  6807: handler_threatOnHit((322 / 67) * 10, "Maul (Rank 1)"),
  6808: handler_threatOnHit((322 / 67) * 18, "Maul (Rank 2)"),
  6809: handler_threatOnHit((322 / 67) * 26, "Maul (Rank 3)"),
  8972: handler_threatOnHit((322 / 67) * 34, "Maul (Rank 4)"),
  9745: handler_threatOnHit((322 / 67) * 42, "Maul (Rank 5)"),
  9880: handler_threatOnHit((322 / 67) * 50, "Maul (Rank 6)"),
  9881: handler_threatOnHit((322 / 67) * 58, "Maul (Rank 7)"),
  26996: handler_threatOnHit(322, "Maul (Rank 8)"),

  779: handler_modDamage(1, "Swipe (Rank 1)"),
  780: handler_modDamage(1, "Swipe (Rank 2)"),
  769: handler_modDamage(1, "Swipe (Rank 3)"),
  9754: handler_modDamage(1, "Swipe (Rank 4)"),
  9908: handler_modDamage(1, "Swipe (Rank 5)"),
  26997: handler_modDamage(1, "Swipe (Rank 6)"),

  // Rage generation, allegedly 0 threat
  16959: handler_zero, // Primal Fury
  17057: handler_zero, // Furor
  // 5229: handler_zero, // Enrage

  // Lacerate
  // https://zidnae.gitlab.io/tbc-armor-penetration-calc/tbc_bear_tc.html
  // zidnae 267 threat, 0.5 coef
  // OMEN   285 threat, 0.2 coef
  33745: handler_lacerate(267, 0.5, "Lacerate"),

  // Speculation on modifier https://wowwiki-archive.fandom.com/wiki/Mangle_(bear)
  // Mangle (Bear) has a threat modifier of 1.5x damage done.
  // Patch 2.1.0 : Damage increased by 15%, but bonus threat reduced so that overall threat generation will be unchanged.
  // TODO : Need to add 15% when using 2 part T6 (in P3)
  // https://tbc.wowhead.com/spell=38447/improved-mangle
  33878: handler_modDamage(Druid.Mod.Mangle, "Mangle (Bear) (Rank 1)"),
  33986: handler_modDamage(Druid.Mod.Mangle, "Mangle (Bear) (Rank 2)"),
  33987: handler_modDamage(Druid.Mod.Mangle, "Mangle (Bear) (Rank 3)"),

  9898: handler_threatOnDebuff(39, "Demoralizing Roar (Rank 5)"),
  26998: handler_threatOnDebuff(39, "Demoralizing Roar"),

  // 17057: handler_resourcechange, //("Furor"),

  31786: handler_resourcechange, // Spiritual Attunement

  31709: handler_castCanMiss(-800, "Cower"),
  27004: handler_castCanMiss(-1170, "Cower"),

  /* Healing */
  // As of mars 30 2022, blizzard apparently changed final tick of life bloom's behaviour
  // 33778: handler_threatAsTargetHealed, // Final tick of life bloom
  379: handler_threatAsTargetHealed, // Earth shield = threat to player healed
  33110: handler_threatAsTargetHealed, // Prayer of mending

  17392: handler_threatOnDebuff(108, "Faerie Fire (Feral)(Rank 4)"),
  27011: handler_threatOnDebuff(131, "Faerie Fire (Feral)"),

  9907: handler_threatOnDebuff(108, "Faerie Fire (Rank 3)"),
  26993: handler_threatOnDebuff(131, "Faerie Fire"),

  // No threat since 2.1 https://wowpedia.fandom.com/wiki/Improved_Leader_of_the_Pack
  34299: handler_zero, //("Improved Leader of the Pack"),
};

export const enableSplitHealingThreatOption = true;

export const combatantImplications = {
  All: (unit, buffs, talents) => {
    if (unit.gear.some((g) => g.permanentEnchant === 2613)) {
      buffs[2613] = true;
    }

    if (unit.gear.some((g) => g.permanentEnchant === 2621)) {
      buffs[2621] = true;
    }
  },
  Druid: (unit, buffs, talents) => {
    if (unit.talents[1].id < 8) {
      talents["Feral Instinct"].rank = 0;
    }

    if (gearSetCount(unit.gear, Druid.Tier.T6) >= 2) {
      buffs[Druid.Buff.T6_2pc] = true;
    }
  },
  Warrior: (unit, buffs, talents) => {
    if (unit.talents[1].id < 35) {
      talents["Improved Berserker Stance"].rank = 0;
    }
    if (unit.talents[2].id < 3) {
      talents["Tactical Mastery"].rank = 0;
    }
    if (unit.talents[2].id < 10) {
      talents["Defiance"].rank = 0;
    }
  },

  Paladin: (unit, buffs, talents) => {
    if (unit.talents[1].id < 13) {
      talents["Improved Righteous Fury"].rank = 0;
    }
    if (unit.talents[2].id < 40) {
      talents["Fanaticism"].rank = 0;
    }
  },

  Shaman: (unit, buffs, talents) => {
    if (unit.talents[0].id < 28) {
      talents["Elemental Precision (fire)"].rank = 0;
      talents["Elemental Precision (nature)"].rank = 0;
      talents["Elemental Precision (frost)"].rank = 0;
    }
    if (unit.talents[1].id < 21) {
      talents["Spirit Weapons"].rank = 0;
    }
    if (unit.talents[2].id < 13) {
      talents["Healing Grace"].rank = 0;
    }
  },
};

export const zeroThreatSpells = Object.entries(spellFunctions)
  .filter(([, handler]) => handler === handler_zero)
  .map(([id]) => Number(id));
