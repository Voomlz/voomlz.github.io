let DEBUGMODE = false;

let borders = {
  taunt: [3, "#ffa500"],
};

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

const preferredSpellSchools = {
  Mage: 16, // Frost
  Priest: 2, // Holy
  Paladin: 2, // Holy
  Warlock: 32, // Shadow
  // Others will be defaulted to 1 = physical
};

const baseThreatCoefficients = {
  Rogue: getThreatCoefficient(0.71),
  // Others will be defaulted to 1
};

const buffNames = {
  1038: "Blessing of Salvation",
  25895: "Greater Blessing of Salvation",
  25909: "Tranquil Air Totem",
  71: "Defensive Stance",
  2457: "Battle Stance",
  2458: "Berserker Stance",
  5487: "Bear Form",
  9634: "Dire Bear Form",
  768: "Cat Form",
  25780: "Righteous Fury",
  35079: "Misdirection",
  2613: "Enchant : Threat on gloves",
  2621: "Enchant : Subtlety",
};

const buffMultipliers = {
  1038: getThreatCoefficient(0.7), // BoS
  40618: getThreatCoefficient(0), // Gurtogg Insignificance
  25895: getThreatCoefficient(0.7), // GBoS
  25909: getThreatCoefficient(0.8), // Tranquil Air Totem Aura
  71: getThreatCoefficient(1.3), // Defensive Stance
  2457: getThreatCoefficient(0.8), // Battle Stance
  2458: getThreatCoefficient(0.8), // Berserker Stance
  5487: getThreatCoefficient(1.3), // Bear Form
  9634: getThreatCoefficient(1.3), // Dire Bear Form
  768: getThreatCoefficient(0.71), // Cat Form
  25780: getThreatCoefficient({ 2: 1.6 }), // Righteous Fury
  26400: getThreatCoefficient(0.3), // Fetish of the Sand Reaver
  2613: getThreatCoefficient(1.02), // gloves enchants
  2621: getThreatCoefficient(0.98), // subtlety enchants
};

// The leaf elements are functions (buffs,rank) => threatCoefficient
const talents = {
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
  1161: true, // Challenging Shout
  5209: true, // Challenging Roar
  6795: true, // Growl
  40604: true, // Gurtogg Fel Rage
  694: true,
  7400: true,
  7402: true,
  20559: true,
  20560: true, // Mocking Blow
  29060: true, // Deathknight Understudy Taunt
};
// These make a dot in the graph on application and removal
// Also used for event filtering in fetchWCLreport
const notableBuffs = {
  23397: true, // Nefarian's warrior class call
  23398: true, // Druid class call
};
for (let k in buffMultipliers) notableBuffs[k] = true;
for (let k in invulnerabilityBuffs) notableBuffs[k] = true;
for (let k in aggroLossBuffs) notableBuffs[k] = true;
for (let k in fixateBuffs) notableBuffs[k] = true;

const auraImplications = {
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
  /*
    Druid: {
        6807: 9634, 6808: 9634, 6809: 9634, 8972: 9634, 9745: 9634, 9880: 9634, 9881: 9634, 26996: 9634, //Maul
        779: 9634, 780: 9634, 769: 9634, 9754: 9634, 9908: 9634, 26997: 9634, //Swipe
        99: 9634, 1735: 9634, 9490: 9634, 9747: 9634, 9898: 9634, 26998: 9634, //Demoralizing Roar
        33878: 9634, 33986: 9634, 33987: 9634, // mangle bear
        33876: 9634, 33982: 9634, 33983: 9634, // mangle cat
        33745: 9634, // lacerate
        6795: 9634, //Growl
        5229: 9634, //Enrage
        17057: 9634, //Furor
        8983: 9634, //Bash
        9850: 768, //Claw
        5221: 768, 6800: 768, 8992: 768, 9829: 768, 9830: 768, 27002: 768,  //Shred
        9904: 768, //Rake
        24248: 768, 31018: 768, 22828: 768, 22829: 768, //Ferocious Bite
        9867: 768, //Ravage
        9896: 768, 27008: 768, //Rip
        9827: 768, //Pounce
        9913: 768, //Prowl
        9846: 768, //Tiger's Fury
        1850: 768, 9821: 768, //Dash
    }
    */
};

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
    if (!a || !b) {
      return;
    }
    let coeff = (useThreatCoeffs ? a.threatCoeff(ev.ability) : 1) * extraCoeff;

    b.addThreat(a.key, amount, ev.timestamp, ev.ability.name, coeff);
  },
  unitThreatenEnemiesSplit(ev, unit, fight, amount, useThreatCoeffs = true) {
    let u = fight.eventToUnit(ev, unit);
    if (!u) return;
    let coeff = useThreatCoeffs ? u.threatCoeff(ev.ability) : 1;
    let [_, enemies] = fight.eventToFriendliesAndEnemies(ev, unit);
    let numEnemies = 0;

    if (splitHealingThreatOption) {
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
    } else {
      for (let k in enemies) {
        enemies[k].addThreat(
          u.key,
          amount,
          ev.timestamp,
          ev.ability.name,
          coeff
        );
      }
    }
  },
  unitThreatenEnemiesSplitOnHealRedirect(ev, unit, fight, amount) {
    let u = fight.eventToUnit(ev, unit);
    if (!u) return;
    let coeff;
    if (u.type === "Paladin") {
      // Only holy abilities (prayer of mending here) have coef
      coeff = u.threatCoeff(ev.ability);
    } else {
      coeff = u.threatCoeff();
    }
    let [_, enemies] = fight.eventToFriendliesAndEnemies(ev, unit);

    if (splitHealingThreatOption) {
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
    } else {
      for (let k in enemies) {
        enemies[k].addThreat(
          u.key,
          amount,
          ev.timestamp,
          ev.ability.name,
          coeff
        );
      }
    }
  },
  unitThreatenEnemies(ev, unit, fight, amount, useThreatCoeffs = true) {
    let u = fight.eventToUnit(ev, unit);
    if (!u) return;
    let coeff = useThreatCoeffs ? u.threatCoeff(ev.ability) : 1;
    let [_, enemies] = fight.eventToFriendliesAndEnemies(ev, unit);
    for (let k in enemies) {
      enemies[k].addThreat(u.key, amount, ev.timestamp, ev.ability.name, coeff);
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
      let source = fight.eventToUnit(ev, "source");
      if (source) {
        if (
          ev.sourceIsFriendly &&
          source.handleMisdirectionDamage(ev.amount, ev, fight)
        ) {
        } else {
          threatFunctions.sourceThreatenTarget(
            ev,
            fight,
            ev.amount + (ev.absorbed || 0)
          );
        }
      }
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
  if (ev.ability.guid === 1) {
    a.lastTarget = b;
  }
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

function handler_mangleModDamage() {
  return (ev, fight) => {
    if (ev.type !== "damage") return;
    let source = fight.eventToUnit(ev, "source");
    let multiplier = 1 + (1.5 - 1.15) / 1.15;
    if (source.nbDruidT6Part >= 2) {
      multiplier = 1.5;
    }
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

let lastSunderEvent;

function handler_sunderArmor(threatValue) {
  return (ev, fight) => {
    if (ev.type === "cast") {
      threatFunctions.sourceThreatenTarget(ev, fight, threatValue);
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
    threatFunctions.sourceThreatenTarget(
      ev,
      fight,
      ev.amount + (ev.absorbed || 0) + devastateValue
    );

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
  threatFunctions.unitThreatenEnemiesSplitOnHealRedirect(
    ev,
    "target",
    fight,
    ev.amount / 2
  );
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

function handler_nightbaneThreatWipeOnCast(delay) {
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

// https://zidnae.gitlab.io/tbc-armor-penetration-calc/tbc_bear_tc.html
function handler_lacerate(threatValue, tickMultiplier) {
  return (ev, fight) => {
    // miss dodge ect
    if (ev.type !== "damage" || ev.hitType > 6 || ev.hitType === 0) return;

    if (ev.tick) {
      threatFunctions.sourceThreatenTarget(
        ev,
        fight,
        (ev.amount + (ev.absorbed || 0)) * tickMultiplier
      );
      return;
    }
    threatFunctions.sourceThreatenTarget(
      ev,
      fight,
      ev.amount + (ev.absorbed || 0) + threatValue
    );
  };
}

function handler_threatOnBuff(threatValue) {
  return (ev, fight) => {
    let t = ev.type;
    if (t !== "applybuff" && t !== "refreshbuff") return;
    let useCoeff = true;
    threatFunctions.unitThreatenEnemiesSplit(
      ev,
      "source",
      fight,
      threatValue,
      useCoeff
    );
  };
}

// From my testing, battle and commanding shout aren't splitting threat on tbc anymore
// Also used for pet food bug
function handler_threatOnBuffUnsplit(threatValue, useCoeff) {
  return (ev, fight) => {
    let t = ev.type;
    if (t !== "applybuff" && t !== "refreshbuff") return;
    threatFunctions.unitThreatenEnemies(
      ev,
      "source",
      fight,
      threatValue,
      useCoeff
    );
  };
}

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

const spellFunctions = {
  18670: handler_bossDropThreatOnHit(0.5), // Broodlord Knock Away

  10101: handler_bossDropThreatOnHit(0.5), // Knock Away variants
  18813: handler_bossDropThreatOnHit(0.5),
  18945: handler_bossDropThreatOnHit(0.5),
  20686: handler_bossDropThreatOnHit(0.5),
  23382: handler_bossDropThreatOnHit(0.5),
  30121: handler_bossDropThreatOnHit(0.5),
  32077: handler_bossDropThreatOnHit(0.5),
  32959: handler_bossDropThreatOnHit(0.5),
  37597: handler_bossDropThreatOnHit(0.5),
  23339: handler_bossDropThreatOnHit(0.5), // BWL Wing Buffet
  18392: handler_bossDropThreatOnCast(0), // Onyxia Fireball
  19633: handler_bossDropThreatOnHit(0.75), // Onyxia Knock Away
  25778: handler_bossDropThreatOnHit(0.75), // Void Reaver, Fathom Lurker, Fathom Sporebat, Underbog Lord, Knock Away
  31389: handler_bossDropThreatOnHit(0.75), // Knock Away Generic
  37102: handler_bossDropThreatOnHit(0.75), // Crystalcore Devastator (TK) Knock Away
  30013: handler_bossThreatWipeOnCast, // Disarm (etheral thief in kara) removes threat
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
  33237: handler_bossThreatWipeOnCast, // Kiggler the Crazed arcane explosion - HKM fight
  //37676: handler_nightbaneThreatWipeOnCast((43 * 1000)), // Leotheras demon form
  37098: handler_nightbaneThreatWipeOnCast(43 * 1000), // Nightbane's Rain of Bones. delay : 43 sec is the timer according to DBM
  29060: handler_taunt, // Deathknight Understudy Taunt
  28835: handler_bossPartialThreatWipeOnCast(0.5), // Mark of Zeliek
  28834: handler_bossPartialThreatWipeOnCast(0.5), // Mark of Mograine
  28833: handler_bossPartialThreatWipeOnCast(0.5), // Mark of Blaumeux
  28832: handler_bossPartialThreatWipeOnCast(0.5), // Mark of Korth'azz

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

  17624: handler_vanish, // Flask of Petrification

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

  // Paladin
  25898: handler_threatOnBuff(60), // GBoK
  25890: handler_threatOnBuff(60), // GBoL
  27145: handler_threatOnBuff(69), // GBoL r2
  27144: handler_threatOnBuff(69), // BoL r4
  25916: handler_threatOnBuff(60), // GBoM
  25782: handler_threatOnBuff(60), // GBoM
  27141: handler_threatOnBuff(70), // GBoM r 3
  27140: handler_threatOnBuff(70), // BoM r 8
  25895: handler_threatOnBuff(60), // GBoS
  25899: handler_threatOnBuff(60), // GBoSanc
  27169: handler_threatOnBuff(70), // GBoSanc r 2
  25894: handler_threatOnBuff(54), // GBoW
  25918: handler_threatOnBuff(60), // GBoW
  27143: handler_threatOnBuff(70), // GBoW r3
  19742: handler_threatOnBuff(14), // BoW
  19850: handler_threatOnBuff(24), // BoW
  19852: handler_threatOnBuff(34), // BoW
  19853: handler_threatOnBuff(44), // BoW
  19854: handler_threatOnBuff(54), // BoW
  25290: handler_threatOnBuff(60), // BoW
  27142: handler_threatOnBuff(70), // BoW r 7
  20293: threatFunctions.concat(handler_threatOnBuff(58), handler_damage), // Seal of Righteousness r8
  27155: threatFunctions.concat(handler_threatOnBuff(58), handler_damage), // Seal of Righteousness r9
  20286: handler_damage, // Judgement of Righteousness
  26573: handler_damage, // Consecration r1
  20116: handler_damage, // Consecration r2
  20922: handler_damage, // Consecration r3
  20923: handler_damage, // Consecration r4
  20924: handler_damage, // Consecration r5
  24239: handler_damage, // Hammer of Wrath

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
  27135: handler_modHeal(0.5), // Holy Light r10
  27136: handler_modHeal(0.5), // Holy Light r11
  19750: handler_modHeal(0.5), // Flash of Light r1
  19939: handler_modHeal(0.5), // Flash of Light r2
  19940: handler_modHeal(0.5), // Flash of Light r3
  19941: handler_modHeal(0.5), // Flash of Light r4
  19942: handler_modHeal(0.5), // Flash of Light r5
  19943: handler_modHeal(0.5), // Flash of Light r6
  27137: handler_modHeal(0.5), // Flash of Light r7
  //633: handler_modHeal(.5), // Lay on Hands r1 - Generates a total threat of heal * .5 instead of heal * .25
  //2800: handler_modHeal(.5), // Lay on Hands r2
  //10310: handler_modHeal(.5), // Lay on Hands r3
  //27154: handler_modHeal(.5), // Lay on Hands r4
  25914: handler_modHeal(0.5), // Holy Shock r1
  25913: handler_modHeal(0.5), // Holy Shock r2
  25903: handler_modHeal(0.5), // Holy Shock r3
  19968: handler_modHeal(0.5), // Holy Light that appears in logs
  19993: handler_modHeal(0.5), // Flash of Light that appears in logs

  // Mage
  10181: handler_damage, // Frostbolt
  66: handler_partialThreatWipeOnEvent(0.2), // invisibility : 20% per second of buff

  // Rogue
  1856: handler_vanish,
  1857: handler_vanish, // Vanish
  26889: handler_vanish, // Vanish
  1966: handler_castCanMissNoCoefficient(-150), // Feint r1
  6768: handler_castCanMissNoCoefficient(-240), // Feint r2
  8637: handler_castCanMissNoCoefficient(-390), // Feint r3
  11303: handler_castCanMissNoCoefficient(-600), // Feint r4
  25302: handler_castCanMissNoCoefficient(-800), // Feint r5

  // Priest
  6788: handler_zero, // Weakened Soul

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

  // From ResultsMayVary https://resultsmayvary.github.io/ClassicThreatPerSecond/
  1: handler_damage,
  /* Consumables */
  11374: handler_threatOnDebuff(90, "Gift of Arthas"),
  /* Damage/Weapon Procs */
  20007: handler_zero, //("Heroic Strength (Crusader)"),
  18138: handler_damage, //("Shadow Bolt (Deathbringer Proc)"),
  24388: handler_damage, //("Brain Damage (Lobotomizer Proc)"),
  23267: handler_damage, //("Firebolt (Perdition's Proc)"),
  18833: handler_damage, //("Firebolt (Alcor's Proc)"),

  21992: handler_modDamagePlusThreat(0.5, 63), // Thunderfury
  27648: handler_zero,

  /* Thorn Effects */
  9910: handler_damage, //("Thorns"),  //Thorns (Rank 6)
  26992: handler_damage, //("Thorns"),  //Thorns (Rank 7)
  17275: handler_damage, //("Heart of the Scale"), //Heart of the Scale
  22600: handler_damage, //("Force Reactive Disk"), //Force Reactive
  11350: handler_zero, //("Oil of Immolation"),   //Oil of Immolation (buff)
  11351: handler_damage, //("Oil of Immolation"), //Oil of Immolation (dmg)

  /* Explosives */
  13241: handler_damage, //("Goblin Sapper Charge"), //Goblin Sapper Charge
  30486: handler_damage, //Super Sapper Charge
  39965: handler_damage, //Frost Grenades
  30217: handler_damage, //Adamantite Grenade
  30461: handler_damage, //The Bigger One
  19821: handler_damage, //Arcane Bomb
  30216: handler_damage, //Fel Iron Bomb
  46567: handler_damage, //Rocket Launch
  // TODO : Need to double check if slow/stun effects add threat modifier on some explosives

  /* Zero Threat Abilities */
  71: handler_zero, // Defensive Stance
  2457: handler_zero, // Battle Stance
  2458: handler_zero, // Berserker Stance
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
  28508: handler_zero, // Destruction pot
  28507: handler_zero, // Haste pot
  22838: handler_zero, // Haste pot
  29529: handler_zero, // Drums of battle
  35476: handler_zero, // Drums of battle
  185848: handler_zero, // Greater Drums of battle

  32182: handler_zero, // Heroism
  2825: handler_zero, // Bloodlust

  /* Physical */
  12721: handler_damage, //("Deep Wounds"),
  6552: handler_threatOnHit(76, "Pummel (Rank 1)"), //TODO: Verify these values ingame
  6554: handler_threatOnHit(116, "Pummel (Rank 2)"),

  //TODO : Add tactical mastery talent threat modifier
  23881: handler_damage, //("Bloodthirst"), //Rank 1
  23892: handler_damage, //("Bloodthirst"), //Rank 2
  23893: handler_damage, //("Bloodthirst"), //Rank 3
  23894: handler_damage, //("Bloodthirst"), //Rank 4
  23888: handler_zero, //("Bloodthirst"),   //Buff
  23885: handler_zero, //("Bloodthirst"),   //Buff
  23891: handler_heal, // BT heal buff

  //Heroic Strike
  78: handler_threatOnHit(16, "Heroic Strike"),
  284: handler_threatOnHit(39, "Heroic Strike"),
  285: handler_threatOnHit(59, "Heroic Strike"),
  1608: handler_threatOnHit(78, "Heroic Strike"),
  11564: handler_threatOnHit(98, "Heroic Strike"),
  11565: handler_threatOnHit(118, "Heroic Strike"),
  11566: handler_threatOnHit(137, "Heroic Strike"),
  11567: handler_threatOnHit(145, "Heroic Strike"),
  25286: handler_threatOnHit(173, "Heroic Strike"), // (AQ)Rank 9
  29707: handler_threatOnHit(194, "Heroic Strike"), // Rank 10
  30324: handler_threatOnHit(220, "Heroic Strike"), // Unused rank ?

  //Shield Slam
  23922: handler_threatOnHit(178, "Shield Slam (Rank 1)"), //Rank 1
  23923: handler_threatOnHit(203, "Shield Slam (Rank 2)"), //Rank 2
  23924: handler_threatOnHit(229, "Shield Slam (Rank 3)"), //Rank 3
  23925: handler_threatOnHit(254, "Shield Slam (Rank 4)"), //Rank 4
  25258: handler_threatOnHit(278, "Shield Slam (Rank 5)"), //Rank 5
  30356: handler_threatOnHit(305, "Shield Slam"), //Rank 6

  //Devastate
  20243: handler_devastate(100, 301.5, "devastate (Rank 1)"), //Rank 1
  30016: handler_devastate(100, 301.5, "devastate (Rank 2)"), //Rank 2
  30022: handler_devastate(100, 301.5, "devastate (Rank 3)"), //Rank 3

  // CF https://github.com/magey/tbc-warrior/wiki/Threat-Values

  // Shield Bash
  72: handler_modDamagePlusThreat(1.5, 36),
  1671: handler_modDamagePlusThreat(1.5, 96),
  1672: handler_modDamagePlusThreat(1.5, 156),
  29704: handler_modDamagePlusThreat(1.5, 192),

  //Revenge
  11601: handler_threatOnHit(150), //Rank 5
  25288: handler_threatOnHit(175), //Rank 6 (AQ)
  25269: handler_threatOnHit(185), //Rank 7 -- approx
  30357: handler_threatOnHit(200), //Rank 8
  12798: handler_threatOnHit(20), //("Revenge Stun"),           //Revenge Stun - now +20 threat on tbcc, boss are imumune more often than not

  //Cleave
  845: handler_threatOnHit(10, "Cleave"), //Rank 1
  7369: handler_threatOnHit(40, "Cleave"), //Rank 2
  11608: handler_threatOnHit(60, "Cleave"), //Rank 3
  11609: handler_threatOnHit(70, "Cleave"), //Rank 4
  20569: handler_threatOnHit(100, "Cleave"), //Rank 5
  25231: handler_threatOnHit(125, "Cleave"), //Rank 6

  //Whirlwind
  1680: handler_modDamage(1.25), //("Whirlwind"), //Whirlwind

  // Thunderclap
  6343: handler_modDamage(1.75), // Thunder Clap r1
  8198: handler_modDamage(1.75), // Thunder Clap r2
  8204: handler_modDamage(1.75), // Thunder Clap r3
  8205: handler_modDamage(1.75), // Thunder Clap r4
  11580: handler_modDamage(1.75), // Thunder Clap r5
  11581: handler_modDamage(1.75), // Thunder Clap r6

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

  //Mocking Blow
  20560: threatFunctions.concat(
    handler_damage,
    handler_markSourceOnMiss(borders.taunt)
  ), //("Mocking Blow"),

  //Overpower
  11585: handler_damage, //("Overpower"),

  //Rend
  11574: handler_damage, //("Rend"),

  // Spell reflect
  23920: handler_spellReflectCast,

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
  12292: handler_zero, //("Death Wish"), //Death Wish tbcc rank ?
  871: handler_zero, //("Shield Wall"),
  1719: handler_zero, //("Recklessness"), //Recklessness
  12323: handler_zero, //("Piercing Howl"), //Piercing Howl
  14204: handler_zero, //("Enrage"), //Enrage
  12975: handler_zero, //("Last Stand (cast)"), //Last Stand (cast)
  12976: handler_zero, //("Last Stand (buff)"), //Last Stand (buff)
  2565: handler_zero, //("Shield Block"), //Shield Block

  /* Consumable */
  6613: handler_zero, //("Great Rage Potion"), //Great Rage Potion
  17528: handler_zero, //("Mighty Rage Potion"), //Mighty Rage Potion
  28515: handler_zero, // Iron shield pot
  13455: handler_zero, // Greater stoneshield pot
  4623: handler_zero, // Lesser stoneshield pot

  /* Forms */
  9634: handler_zero, //(1.45, "Bear Form"),
  768: handler_zero, //(0.71, "Cat Form"),

  /* Bear */
  5209: handler_markSourceOnMiss(borders.taunt), // Challenging Roar

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
  33878: handler_mangleModDamage("Mangle (Bear) (Rank 1)"),
  33986: handler_mangleModDamage("Mangle (Bear) (Rank 2)"),
  33987: handler_mangleModDamage("Mangle (Bear) (Rank 3)"),

  99: handler_threatOnDebuff(9, "Demoralizing Roar (Rank 1)"),
  1735: handler_threatOnDebuff(15, "Demoralizing Roar (Rank 2)"),
  9490: handler_threatOnDebuff(20, "Demoralizing Roar (Rank 3)"),
  9747: handler_threatOnDebuff(30, "Demoralizing Roar (Rank 4)"),
  9898: handler_threatOnDebuff(39, "Demoralizing Roar (Rank 5)"),
  26998: handler_threatOnDebuff(39, "Demoralizing Roar"),

  6795: threatFunctions.concat(
    handler_taunt,
    handler_markSourceOnMiss(borders.taunt)
  ), //("Growl"),
  5229: handler_resourcechange, //("Enrage"),
  // 17057: handler_resourcechange, //("Furor"),

  31786: handler_resourcechange, // Spiritual Attunement

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
  31709: handler_castCanMiss(-800, "Cower"),
  27004: handler_castCanMiss(-1170, "Cower"),

  /* Healing */
  // As of mars 30 2022, blizzard apparently changed final tick of life bloom's behaviour
  // 33778: handler_threatAsTargetHealed, // Final tick of life bloom
  379: handler_threatAsTargetHealed, // Earth shield = threat to player healed
  33110: handler_threatAsTargetHealed, // Prayer of mending

  /* Abilities */
  16857: handler_threatOnDebuff(108, "Faerie Fire (Feral)(Rank 1)"),
  17390: handler_threatOnDebuff(108, "Faerie Fire (Feral)(Rank 2)"),
  17391: handler_threatOnDebuff(108, "Faerie Fire (Feral)(Rank 3)"),
  17392: handler_threatOnDebuff(108, "Faerie Fire (Feral)(Rank 4)"),
  27011: handler_threatOnDebuff(131, "Faerie Fire (Feral)"),

  770: handler_threatOnDebuff(108, "Faerie Fire (Rank 1)"),
  778: handler_threatOnDebuff(108, "Faerie Fire (Rank 2)"),
  9749: handler_threatOnDebuff(108, "Faerie Fire (Rank 3)"),
  9907: handler_threatOnDebuff(108, "Faerie Fire (Rank 3)"),
  26993: handler_threatOnDebuff(131, "Faerie Fire"),

  16870: handler_zero, //("Clearcasting"),
  29166: handler_zero, //("Innervate"),

  22842: handler_heal, //("Frienzed Regeneration (Rank 1)"),
  22895: handler_heal, //("Frienzed Regeneration (Rank 2)"),
  22896: handler_heal, //("Frienzed Regeneration"),

  24932: handler_zero, //("Leader of the Pack"),
  // No threat since 2.1 https://wowpedia.fandom.com/wiki/Improved_Leader_of_the_Pack
  34299: handler_zero, //("Improved Leader of the Pack"),

  /* Items */
  13494: handler_zero, //("Manual Crowd Pummeler"),
};

let zeroThreatSpells = [];
for (let i in spellFunctions) {
  if (i >= 0 && spellFunctions[i] === handler_zero) {
    zeroThreatSpells.push(i);
  }
}
