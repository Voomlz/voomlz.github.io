import {
  handler_bossThreatWipeOnCast,
  handler_bossPartialThreatWipeOnCast,
  handler_taunt,
  getThreatCoefficient,
} from "../base.js";

import { Player } from '../threat/unit.js';

export const config = {
  Buff: {
    FungalBloom: 29232,
  },
};

export const buffNames = {
  [config.Buff.FungalBloom]: "Fungal Bloom",
};

export const buffMultipliers = {
  [config.Buff.FungalBloom]: getThreatCoefficient(0), // Fungal Bloom
};

export const fixateBuffs = {
  29060: true, // Deathknight Understudy Taunt
};

export const spellFunctions = {
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
};

export const notableBuffs = {
  [config.Buff.FungalBloom]: true, // Fungal Bloom
};

/** Hateful strike gives a fixed amount to the top 4 threat targets in melee range. */
function handler_hatefulstrike(fixedThreat) {
  return (ev, fight) => {
    // hitType 0=miss, 7=dodge, 8=parry, 10 = immune, 14=resist, ...
    /*
    if (
      ev.type !== "damage" ||
      (ev.hitType > 6 && ev.hitType !== 10 && ev.hitType !== 14) ||
      ev.hitType === 0
    )
      return;
      */
    let source = fight.eventToUnit(ev, "source");
    let target = fight.eventToUnit(ev, "target");
    if (!source || !target) return;

    let meleeRangedThreat = [];
    let [friendlies, enemies] = fight.eventToFriendliesAndEnemies(ev, "target");

    let enemyX = 0,
      enemyY = 0;

    for (let k in enemies) {
      if (enemies[k].name === "Patchwerk") {
        enemyX = enemies[k].lastX;
        enemyY = enemies[k].lastY;
      }
    }

    for (let k in friendlies) {
      if (friendlies[k] instanceof Player) {
          // force target of the hateful to be in the top 4
          if (friendlies[k] == target) {
              let threat = {};
              threat = {
                threat: 10000000,
                unit: friendlies[k],
              };
              meleeRangedThreat.push(threat);
          } else {

              let x1 = enemyX - friendlies[k].lastX;
              let y1 = enemyY - friendlies[k].lastY;
              let c = Math.sqrt(x1 * x1 + y1 * y1);
              if (c < 10) {
                // Arbitraty distance of 10, we don't really know the exact
                //console.log(friendlies[k].name + " is in melee range of patchwerk c:" + c)

                // Order patchwerk threat list, take the first 4th in this condition

                if (source.threat[k]) {
                  let threat = {};
                  threat = {
                    threat: source.threat[k].currentThreat,
                    unit: friendlies[k],
                  };
                  meleeRangedThreat.push(threat);
                }
            }
          }
        }
    }
    sortByKey(meleeRangedThreat, "threat");

    let topFourThreatInMelee = meleeRangedThreat.slice(-4);

    for (let topFour in topFourThreatInMelee) {
      source.addThreat(
        topFourThreatInMelee[topFour].unit.key,
        fixedThreat,
        ev.timestamp,
        ev.ability.name,
        1
      );
    }
  };
}

function sortByKey(array, key) {
  return array.sort(function (a, b) {
    var x = a[key];
    var y = b[key];
    return x < y ? -1 : x > y ? 1 : 0;
  });
}

function handler_magneticPull() {
  return (ev, fight) => {
    let source = fight.eventToUnit(ev, "source");
    let [friendlies, enemies] = fight.eventToFriendliesAndEnemies(ev, "source");

    let threatList = [];
    for (let k in friendlies) {
      if (source.name !== friendlies[k].name) {
        if (!("threat" in source)) return;
        for (let i in enemies) {
          if (source.target.name !== enemies[i].name) {
            if (friendlies[k].threat[i]) {
              let threat = {};
              threat = {
                threat: friendlies[k].threat[i].currentThreat,
                unit: enemies[i],
              };
              threatList.push(threat);
            }
          }
        }

        let sortedThreatList = sortByKey(threatList, "threat");
        let topThreat = sortedThreatList.slice(-1)[0];

        let maxThreat = 0;
        for (let j in source.threat) {
          maxThreat = Math.max(maxThreat, source.threat[j].currentThreat);
        }

        source.setThreat(
          topThreat.unit.key,
          maxThreat,
          ev.timestamp,
          ev.ability.name
        );
        //source.target = topThreat;
      }
    }
  };
}
