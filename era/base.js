/*!
 * General constants and handlers for the base game.
 *
 * Override for specific game versions in a separate file.
 */

const School = {
  Physical: 1,
  Holy: 2,
  Fire: 4,
  Nature: 8,
  Frost: 16,
  Shadow: 32,
  Arcane: 64,
};

const borders = {
  taunt: [3, "#ffa500"],
};

// Core threat calculation functions
function getThreatCoefficient(values) {
  if (typeof values === "number") {
    values = { 0: values };
  }
  if (!(0 in values)) values[0] = 1;
  return function (spellSchool = 0) {
    if (spellSchool in values) return values[spellSchool];
    return values[0];
  };
}

function getAdditiveThreatCoefficient(value, base) {
  return getThreatCoefficient((base + value) / base);
}

// Core threat handling functions
const threatFunctions = {
  sourceThreatenTarget(
    ev,
    fight,
    amount,
    useThreatCoeffs = true,
    extraCoeff = 1
  ) {
    // extraCoeff is only used for tooltip text
    let a = fight.eventToUnit(ev, "source");
    let b = fight.eventToUnit(ev, "target");
    if (!a || !b) return;
    let coeff = (useThreatCoeffs ? a.threatCoeff(ev.ability) : 1) * extraCoeff;
    b.addThreat(a.key, amount, ev.timestamp, ev.ability.name, coeff);
  },
  unitThreatenEnemiesSplit(ev, unit, fight, amount, useThreatCoeffs = true) {
    let u = fight.eventToUnit(ev, unit);
    if (!u) return;
    let coeff = useThreatCoeffs ? u.threatCoeff(ev.ability) : 1;
    let [_, enemies] = fight.eventToFriendliesAndEnemies(ev, unit);
    let numEnemies = 0;
    for (let k in enemies) {
      if (enemies[k].alive) numEnemies += 1;
    }
    for (let k in enemies) {
      enemies[k].addThreat(
        u.key,
        amount / numEnemies,
        ev.timestamp,
        ev.ability.name,
        coeff
      );
    }
  },
  unitLeaveCombat(ev, unit, fight, text) {
    let u = fight.eventToUnit(ev, unit);
    if (!u) return;
    for (let k in fight.units) {
      if (!("threat" in fight.units[k]) || !(u.key in fight.units[k].threat))
        continue;
      fight.units[k].setThreat(u.key, 0, ev.timestamp, text);
    }
  },
  threatWipe(sources, targets, time, text) {
    for (let a in sources) {
      let source = sources[a];
      for (let targetKey in targets) {
        source.setThreat(targetKey, 0, time, text);
      }
    }
  },
  concat() {
    return (ev, fight) => {
      for (let i = 0; i < arguments.length; ++i) {
        // Arguments is from outer func
        arguments[i](ev, fight);
      }
    };
  },
};

function handler_vanish(ev, fight) {
  if (ev.type !== "cast") return;
  threatFunctions.unitLeaveCombat(ev, "source", fight, ev.ability.name);
}
function handler_mindcontrol(ev, fight) {
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

function handler_resourcechange(ev, fight) {
  if (ev.type !== "resourcechange") return;
  let diff = ev.resourceChange - ev.waste;
  // Not sure if threat should be given to "target" instead...
  threatFunctions.unitThreatenEnemiesSplit(
    ev,
    "source",
    fight,
    ev.resourceChangeType === 0 ? diff / 2 : diff * 5,
    false
  );
}
function handler_resourcechangeCoeff(ev, fight) {
  if (ev.type !== "resourcechange") return;
  let diff = ev.resourceChange - ev.waste;
  // Not sure if threat should be given to "target" instead...
  threatFunctions.unitThreatenEnemiesSplit(
    ev,
    "source",
    fight,
    ev.resourceChangeType === 0 ? diff / 2 : diff * 5,
    true
  );
}

function handler_basic(ev, fight) {
  switch (ev.type) {
    case "damage":
      threatFunctions.sourceThreatenTarget(
        ev,
        fight,
        ev.amount + (ev.absorbed || 0)
      );
      break;
    case "heal":
      if (ev.sourceIsFriendly !== ev.targetIsFriendly) return;
      threatFunctions.unitThreatenEnemiesSplit(
        ev,
        "source",
        fight,
        ev.amount / 2
      );
      break;
    case "resourcechange":
      if (DEBUGMODE) console.log("Unhandled resourcechange.", ev);
      handler_resourcechange(ev, fight);
      break;
    case "applybuff":
    case "refreshbuff":
    case "applybuffstack":
      if (DEBUGMODE) console.log("Unhandled buff.", ev);
      if (ev.sourceIsFriendly !== ev.targetIsFriendly) return;
      threatFunctions.unitThreatenEnemiesSplit(ev, "source", fight, 60);
      break;
    case "applydebuff":
    case "applydebuffstack":
    case "refreshdebuff":
      if (DEBUGMODE) console.log("Unhandled buff.", ev);
      if (ev.sourceIsFriendly !== ev.targetIsFriendly) return;
      threatFunctions.sourceThreatenTarget(ev, fight, 120);
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
      if (DEBUGMODE) console.log("Unhandled event.", ev);
  }
}

function handler_mark(ev, fight) {
  if (ev.type !== "cast") return;
  if ("target" in ev && ev.target.id === -1) return; // Target is environment
  let a = fight.eventToUnit(ev, "source");
  let b = fight.eventToUnit(ev, "target");
  if (!a || !b) return;
  a.targetAttack(b.key, ev.timestamp, ev.ability.name);
  if (ev.ability.guid === 1 || ev.ability.guid < 0) {
    a.target = b;
  }
}

function handler_markSourceOnMiss(border) {
  return (ev, fight) => {
    if (ev.type !== "damage") return;
    if (ev.hitType !== 0 && ev.hitType <= 6) return;
    let a = fight.eventToUnit(ev, "source");
    let b = fight.eventToUnit(ev, "target");
    if (!a || !b) return;
    b.addMark(a.key, ev.timestamp, "Missed " + ev.ability.name, border);
  };
}

function handler_markSourceOnDebuff(border) {
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

function handler_zero() {}

function handler_castCanMiss(threatValue) {
  return (ev, fight) => {
    let t = ev.type;
    if (t === "cast") {
      threatFunctions.sourceThreatenTarget(ev, fight, threatValue);
    } else if (t === "damage") {
      threatFunctions.sourceThreatenTarget(ev, fight, -threatValue);
    }
  };
}

function handler_castCanMissNoCoefficient(threatValue) {
  return (ev, fight) => {
    let t = ev.type;
    if (t === "cast") {
      threatFunctions.sourceThreatenTarget(ev, fight, threatValue, false);
    } else if (t === "damage") {
      threatFunctions.sourceThreatenTarget(ev, fight, -threatValue, false);
    }
  };
}

function handler_modDamage(multiplier) {
  return (ev, fight) => {
    if (ev.type !== "damage") return;
    threatFunctions.sourceThreatenTarget(
      ev,
      fight,
      ev.amount + (ev.absorbed || 0),
      true,
      multiplier
    );
  };
}
function handler_modHeal(multiplier) {
  return (ev, fight) => {
    if (ev.type !== "heal") return;
    threatFunctions.unitThreatenEnemiesSplit(
      ev,
      "source",
      fight,
      (multiplier * ev.amount) / 2
    );
  };
}

function handler_modDamagePlusThreat(multiplier, bonus) {
  return (ev, fight) => {
    if (ev.type !== "damage" || ev.hitType > 6 || ev.hitType === 0) return;
    threatFunctions.sourceThreatenTarget(
      ev,
      fight,
      multiplier * (ev.amount + (ev.absorbed || 0)) + bonus
    );
  };
}

function handler_damage(ev, fight) {
  if (ev.type !== "damage") return;
  threatFunctions.sourceThreatenTarget(
    ev,
    fight,
    ev.amount + (ev.absorbed || 0)
  );
}

function handler_heal(ev, fight) {
  if (ev.type !== "heal") return;
  threatFunctions.unitThreatenEnemiesSplit(ev, "source", fight, ev.amount / 2);
}

function handler_threatOnHit(threatValue) {
  return (ev, fight) => {
    if (ev.type !== "damage" || ev.hitType > 6 || ev.hitType === 0) return;
    threatFunctions.sourceThreatenTarget(
      ev,
      fight,
      ev.amount + (ev.absorbed || 0) + threatValue
    );
  };
}

function handler_bossDropThreatOnHit(pct) {
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
function handler_bossDropThreatOnDebuff(pct) {
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
function handler_bossDropThreatOnCast(pct) {
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
function handler_bossThreatWipeOnCast(ev, fight) {
  if (ev.type !== "cast") return;
  let u = fight.eventToUnit(ev, "source");
  if (!u) return;
  for (let k in u.threat) {
    u.setThreat(k, 0, ev.timestamp, ev.ability.name);
  }
}
function handler_bossPartialThreatWipeOnCast(pct) {
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

function handler_threatOnDebuff(threatValue) {
  return (ev, fight) => {
    let t = ev.type;
    if (t !== "applydebuff" && t !== "refreshdebuff") return;
    threatFunctions.sourceThreatenTarget(ev, fight, threatValue);
  };
}

function handler_threatOnDebuffOrDamage(threatValue) {
  return (ev, fight) => {
    let t = ev.type;
    if (t === "applydebuff") {
      threatFunctions.sourceThreatenTarget(ev, fight, threatValue);
    } else if (t === "damage") {
      threatFunctions.sourceThreatenTarget(
        ev,
        fight,
        ev.amount + (ev.absorbed || 0)
      );
    }
  };
}

function handler_threatOnBuff(threatValue) {
  return (ev, fight) => {
    let t = ev.type;
    if (t !== "applybuff" && t !== "refreshbuff") return;
    threatFunctions.unitThreatenEnemiesSplit(ev, "source", fight, threatValue);
  };
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

function handler_hatefulstrike(mainTankThreat) {
  return (ev, fight) => {
    // hitType 0=miss, 7=dodge, 8=parry, 10 = immune, 14=resist, ...
    if (
      ev.type !== "damage" ||
      (ev.hitType > 6 && ev.hitType !== 10 && ev.hitType !== 14) ||
      ev.hitType === 0
    )
      return;
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
      let x1 = enemyX - friendlies[k].lastX;
      let y1 = enemyY - friendlies[k].lastY;
      let c = Math.sqrt(x1 * x1 + y1 * y1);

      if (c < 10) {
        // Arbitraty distance of 10, we don't really know the exact
        // console.log(friendlies[k].name + " is in melee range of patchwerk c:" + c)

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
    sortByKey(meleeRangedThreat, "threat");
    let topFourThreatInMelee = meleeRangedThreat.slice(-4);

    for (let topFour in topFourThreatInMelee) {
      source.addThreat(
        topFourThreatInMelee[topFour].unit.key,
        mainTankThreat,
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

function handler_taunt(ev, fight) {
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

function handler_timelapse(ev, fight) {
  if (ev.type !== "applydebuff") return;
  let u = fight.eventToUnit(ev, "source");
  let v = fight.eventToUnit(ev, "target");
  if (!u || !v) return;
  u.setThreat(
    v.key,
    u.threat[v.key].currentThreat * v.threatCoeff(),
    ev.timestamp,
    ev.ability.name
  );
}
