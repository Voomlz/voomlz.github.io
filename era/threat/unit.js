import {
  applyThreatCoefficient,
  BASE_COEFFICIENT,
  borders,
  getThreatCoefficient,
} from "../base.js";

export class Unit {
  /**
   * @param {import("../base.js").GameVersionConfig} config
   * @param {string} key
   * @param {string} name
   * @param {string | number} type
   * @param {string | any[]} events
   */
  constructor(config, key, name, type, events) {
    this.config = config;
    // Info is an object from WCL API
    this.key = key;
    this.name = name;
    this.type = type;
    this.spellSchool = config.preferredSpellSchools[type] || 1;
    this.baseThreatCoeff =
      config.baseThreatCoefficients[type] || getThreatCoefficient(1);
    this.buffs = {};
    this.alive = true;
    this.dies = false;
    this.tank = false;
    this.lastX = 0;
    this.lastY = 0;
    let initialBuffs = {};
    const buffEvents = {
      applybuff: 1,
      refreshbuff: 1,
      applydebuff: 1,
      refreshdebuff: 1,
      removebuff: 2,
      removedebuff: 2,
    };
    for (let i = 0; i < events.length; ++i) {
      if (this.threatCoeff().value > 1) this.tank = true;
      let t = events[i].type;
      if (this.type in config.auraImplications && t === "cast") {
        if (Unit.eventToKey(events[i], "source") !== key) continue;
        let aid = events[i].ability.guid;
        if (!(aid in config.auraImplications[this.type])) continue;
        let bid = config.auraImplications[this.type][aid];
        if (!(bid in this.buffs)) {
          initialBuffs[bid] = true;
          this.buffs[bid] = true;
        }
      } else if (t in buffEvents) {
        if (Unit.eventToKey(events[i], "target") !== key) continue;
        let aid = events[i].ability.guid;
        if (!(aid in config.notableBuffs)) continue;
        if (aid === 23397 && t === "applydebuff") {
          // Special handler for Nefarian's warrior class call
          delete this.buffs[71];
          delete this.buffs[2457];
          this.buffs[2458] = true;
        }
        if (aid === 23398) {
          // Druid class call
          if (t === "applydebuff") {
            delete this.buffs[5487];
            delete this.buffs[9634];
            this.buffs[768] = true;
          } else if (t === "removedebuff") {
            delete this.buffs[768];
          }
        }
        if (buffEvents[t] === 1) {
          this.buffs[aid] = true;
        } else {
          if (!(aid in this.buffs)) initialBuffs[aid] = true;
          delete this.buffs[aid];
        }
      } else if (t === "death") {
        if (Unit.eventToKey(events[i], "target") !== key) continue;
        if (this.type === "Hunter") continue; // Feign Death is impossible to distinguish
        this.dies = true;
      }
    }
    this.buffs = initialBuffs;
    this.initialCoeff = this.threatCoeff().value;
    if (this.initialCoeff > 1) this.tank = true;
  }

  /**
   * @param {import("../threat/wcl.js").WCLAbility} [ability]
   * @returns {import("../base.js").ThreatCoefficient}
   */
  threatCoeff(ability) {
    let spellSchool = ability ? ability.type : this.spellSchool;
    let spellId = ability ? ability.guid : null;
    /** @type {import("../base.js").ThreatCoefficient} */
    let c = applyThreatCoefficient(
      BASE_COEFFICIENT,
      this.baseThreatCoeff(spellSchool),
      `${this.type} (base)`
    );

    for (let buffId in this.buffs) {
      if (buffId in this.config.buffMultipliers) {
        if (typeof this.config.buffMultipliers[buffId] === "function") {
          const nextC = this.config.buffMultipliers[buffId](spellSchool);
          c = applyThreatCoefficient(c, nextC, this.config.buffNames[buffId]);
        }
        // Allow applying a coefficient per spellId or via a combination of other buffs
        if (
          typeof this.config.buffMultipliers[buffId] === "object" &&
          "coeff" in this.config.buffMultipliers[buffId]
        ) {
          const { coeff } = this.config.buffMultipliers[buffId];
          const nextC = coeff(this.buffs, spellId)(spellSchool);
          c = applyThreatCoefficient(c, nextC, this.config.buffNames[buffId]);
        }
      }
    }
    for (let [name, talent] of Object.entries(this.talents ?? {})) {
      if (!("coeff" in talent)) continue;
      let coeff = talent.coeff(this.buffs, talent.rank, spellId);
      const nextC = coeff(spellSchool);
      c = applyThreatCoefficient(c, nextC, `${name} (talent)`);
    }
    return c;
  }

  get invulnerable() {
    return Object.keys(this.buffs).filter(
      (x) => x in this.config.invulnerabilityBuffs
    );
  }

  get border() {
    // Returns vertex border width and color for plotting
    if (this.invulnerable.length) {
      return [2, "#0f0"];
    }
    for (let k in this.buffs) {
      if (k in this.config.aggroLossBuffs) {
        return [2, "#ff0"];
      }
    }
    if (!this.alive) return [1.5, "#f00"];
    return [0, null];
  }

  /**
   * @param {import("../threat/wcl.js").WCLEvent} ev
   * @param {import("../threat/fight.js").UnitSpecifier} unit
   * @returns {string}
   */
  static eventToKey(ev, unit) {
    // Unit should be "source" or "target"
    let key = ev[unit + "ID"];
    if (key === undefined) key = ev[unit].id;
    key = key.toString(10);
    if (unit + "Instance" in ev) key += "." + ev[unit + "Instance"];
    return key;
  }

  // Empty functions to enable blind calls
  /**
   * @param {string} unitId
   * @param {number} threat
   * @param {number} time
   * @param {string} text
   * @param {import("../base.js").ThreatCoefficient | null} [coeff]
   * @param {import("../base.js").Border | null} [border]
   */
  setThreat(unitId, threat, time, text, coeff, border) {}

  /**
   * @param {string} unitId
   * @param {number} threat
   * @param {number} time
   * @param {string} text
   * @param {import("../base.js").ThreatCoefficient | null} coeff
   * @param {number} [bonusThreat]
   */
  addThreat(unitId, threat, time, text, coeff, bonusThreat) {}

  /**
   * @param {string} unitId
   * @param {number} time
   * @param {string} text
   * @param {import("../base.js").Border | null} border
   */
  addMark(unitId, time, text, border) {}

  /**
   * @param {string} unitId
   * @param {number} time
   * @param {string} text
   */
  targetAttack(unitId, time, text) {}

  /**
   * @param {string} unitId
   * @param {number} timestamp
   */
  checkTargetExists(unitId, timestamp) {}
}
// Class for players and pets

export class Player extends Unit {
  /**
   * @param {import("../base.js").GameVersionConfig} config
   * @param {string} key
   * @param {import("./wcl.js").WCLFriendlyUnit} info
   * @param {import("./wcl.js").WCLEvent[]} events
   * @param {boolean} [tranquilAir]
   */
  constructor(config, key, info, events, tranquilAir = false) {
    super(config, key, info.name, info.type, events);
    this.global = info;
    this.talents = info.talents;

    this.combatantInfos = events.filter(
      (e) => e.type === "combatantinfo" && e.sourceID === Number(key)
    );

    console.assert(
      "initialBuffs" in info,
      "Player info not properly initialised.",
      info
    );

    this.checkWarrior(events); // Extra stance detection
    this.checkPaladin(events); // Extra Righteous Fury detection
    this.checkFaction(tranquilAir); // BoS and tranquil air
    this.checkInitalStatus(); // Check gear (enchants), talents and initial buffs

    let a = info.initialBuffs;
    for (let k in a) {
      if (a[k] === 1) {
        this.buffs[k] = true;
      } else if (a[k] === 2) {
        delete this.buffs[k];
      } else {
        a[k] = 4 - (k in this.buffs);
      }
    }
    this.initialCoeff = this.threatCoeff().value;
  }

  isBuffInferred(buffId) {
    return (this.global.initialBuffs[buffId] - 3) % 3 >= 0;
  }

  checkInitalStatus() {
    for (const c of this.combatantInfos) {
      // initial auras
      if (c?.auras) {
        for (const aura of c.auras) {
          this.buffs[aura.ability] = true;
        }
      }
      this.config.combatantImplications.All?.(c, this.buffs, this.talents);
      this.config.combatantImplications[this.type]?.(
        c,
        this.buffs,
        this.talents
      );
    }
  }

  // Blessing of Salvation and Tranquil Air detection
  checkFaction(tranquilAir = false) {
    if (this.dies || this.tank) return;
    if (this.global.faction === "Alliance") {
      if (1038 in this.buffs || !this.isBuffInferred(25895)) return;
      this.buffs[25895] = true;
    } else if (this.global.faction === "Horde") {
      if (!tranquilAir || !this.isBuffInferred(25909)) return;
      this.buffs[25909] = true;
    }
  }

  // Extra stance detection
  checkWarrior(events) {
    if (this.type !== "Warrior") return;
    for (let i of [71, 2457, 2458]) {
      if (i in this.buffs || !this.isBuffInferred(i)) return;
    }
    // Check if unit deals damage with execute
    for (let i = 0; i < events.length; ++i) {
      if (events[i].type !== "damage") continue;
      if (Unit.eventToKey(events[i], "source") !== this.key) continue;
      if (events[i].ability.guid !== 20647) continue;
      this.buffs[2458] = true; // Apply Berserker Stance
      return;
    }
    this.buffs[71] = true; // Apply Defensive Stance
    this.tank = true;
  }

  // Extra Righteous Fury detection
  checkPaladin(events) {
    if (this.type !== "Paladin") return;
    if (this.dies) return;
    if (!this.isBuffInferred(25780)) return;
    for (let i = 0; i < events.length; ++i) {
      if (!("ability" in events[i])) continue;
      if (Unit.eventToKey(events[i], "source") !== this.key) continue;
      if (![20925, 20927, 20928].includes(events[i].ability.guid)) continue;
      this.buffs[25780] = true;
      this.tank = true;
      return;
    }
  }
}

export class NPC extends Unit {
  /**
   * @param {import("../base.js").GameVersionConfig} config
   * @param {string} key
   * @param {import("./wcl.js").WCLFriendlyPet | import("./wcl.js").WCLEnemyUnit} unit
   * @param {import("./wcl.js").WCLEvent[]} events
   * @param {import("./fight.js").Fight} fight
   */
  constructor(config, key, unit, events, fight) {
    super(config, key, unit.name, unit.type, events);
    this.fightUnits = fight.units;
    /** @type {import("../threat/fight.js").Fight} */
    this.fight = fight;
    /** @type {Record<string, ThreatTrace>} */
    this.threat = {};
    this.target = null;
  }

  /**
   * @param {string | number} unitId
   * @param {number} time
   * @returns {ThreatTrace | undefined}
   */
  checkTargetExists(unitId, time) {
    if (unitId === -1) return;
    if (!(unitId in this.threat)) {
      if (!(unitId in this.fightUnits)) throw "Unknown unit " + unitId + ".";
      this.threat[unitId] = new ThreatTrace(
        this.fightUnits[unitId],
        time,
        this.fight
      );
    }
    return this.threat[unitId];
  }

  /**
   * @param {string} unitId
   * @param {number} threat
   * @param {number} time
   * @param {string} text
   * @param {import("../base.js").ThreatCoefficient | null} coeff
   * @param {import("../base.js").Border | null} border
   */
  setThreat(unitId, threat, time, text, coeff = null, border = null) {
    if (!this.alive) return;
    let a = this.checkTargetExists(unitId, time);
    if (!a) return;
    a.setThreat(threat, time, text, coeff, border);
  }

  /**
   * @param {string} unitId
   * @param {number} threat
   * @param {number} time
   * @param {string} text
   * @param {import("../base.js").ThreatCoefficient | null} coeff
   * @param {number} [bonusThreat]
   */
  addThreat(unitId, threat, time, text, coeff, bonusThreat) {
    if (!this.alive) return;
    let trace = this.checkTargetExists(unitId, time);
    if (!trace) return;
    trace.addThreat(threat, time, text, coeff, bonusThreat);
  }

  addMark(unitId, time, text, border) {
    let a = this.checkTargetExists(unitId, time);
    if (!a) return;
    a.addMark(time, text, border);
  }

  targetAttack(unitId, time, text) {
    let a = this.checkTargetExists(unitId, time);
    if (!a) return;
    a.addMark(time, "Received " + text, [6, "#ff0000"]);
  }
}

export class ThreatTrace {
  /**
   * @param {Unit} targetUnit
   * @param {number} startTime
   * @param {import("../threat/fight.js").Fight} fight
   */
  constructor(targetUnit, startTime, fight) {
    this.threat = [0];
    this.time = [startTime];
    this.text = ["Joined fight"];
    /** @type {(import("../base.js").ThreatCoefficient | null)[]} */
    this.coeff = [targetUnit.threatCoeff()];
    let [w, c] = targetUnit.border;
    this.borderWidth = [w];
    this.borderColor = [c];
    this.target = targetUnit;
    this.currentThreat = 0;
    this.fight = fight;
    this.fixates = {};

    /** @type {(string | null)[]} */
    this.fixateHistory = [null];

    /** @type {string[][]} */
    this.invulnerabilityHistory = [[]];
  }

  /**
   * @param {number} threat
   * @param {number} time
   * @param {string} text
   * @param {import("../base.js").ThreatCoefficient | null} [displayCoeff]
   * @param {import("../base.js").Border | null} [border]
   */
  setThreat(threat, time, text, displayCoeff = null, border = null) {
    if (threat < 0) threat = 0;
    this.threat.push(threat);
    this.time.push(time);
    this.text.push(text);
    this.coeff.push(displayCoeff);
    let [w, c] =
      border !== null
        ? border
        : this.fixated
        ? borders.taunt
        : this.target.border;
    this.borderWidth.push(w);
    this.borderColor.push(c);
    let s = "";
    for (let k in this.fixates) s += "+" + k;
    this.fixateHistory.push(s.substring(1));
    this.invulnerabilityHistory.push(this.target.invulnerable);
    this.currentThreat = threat;
  }

  // Gets whether this.fixates contains anything
  get fixated() {
    for (let k in this.fixates) return true;
    return false;
  }

  /**
   * @param {number} threat
   * @param {number} time
   * @param {string} text
   * @param {import("../base.js").ThreatCoefficient | null} coeff
   * @param {number} [bonusThreat]
   */
  addThreat(threat, time, text, coeff, bonusThreat = 0) {
    if (threat === 0) return;
    this.setThreat(
      this.currentThreat + threat * (coeff?.value ?? 1) + bonusThreat,
      time,
      text,
      coeff
    );
  }

  /**
   * @param {number} time
   * @param {string} text
   * @param {import("../base.js").Border | null} border
   */
  addMark(time, text, border = null) {
    this.setThreat(this.currentThreat, time, text, null, border);
  }

  threatBySkill(range = [-Infinity, Infinity]) {
    let a = {};
    for (let i = 0, t = 0; i < this.threat.length; ++i) {
      let d = this.threat[i] - t;
      if (d === 0) continue;
      t = this.threat[i];
      let time = (this.time[i] - this.fight.start) / 1000;
      if (time < range[0] || time > range[1]) continue;
      let n = this.text[i];
      if (!(n in a)) a[n] = 0;
      a[n] += d;
    }
    return a;
  }
}
