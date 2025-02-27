import {
  applyThreatCoefficient,
  BASE_COEFFICIENT,
  borders,
  getThreatCoefficient,
  InitialBuff,
  Faction,
} from "../base.js";

export class Unit {
  /**
   * @param {import("../base.js").GameVersionConfig} config
   * @param {string} key
   * @param {string} name
   * @param {import("../threat/wcl.js").WCLUnitType} type
   * @param {import("../threat/wcl.js").WCLEvent[]} events
   * @param {import("../threat/fight.js").Fight} fight
   */
  constructor(config, key, name, type, events, fight) {
    this.config = config;
    this.mdStacksPerBand = [];
    this.lastInvisibility = 0;
    /** @type {Unit | null} */
    this.lastTarget = null;
    this.key = key;
    /** @type {import("../threat/fight.js").Fight} */
    this.fight = fight;
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
   * @param {number} value
   */
  setLastInvisibility(value) {
    this.lastInvisibility = value;
  }

  /**
   * @param {number} amount
   * @param {import("../threat/wcl.js").WCLEvent} ev
   * @param {import("../threat/fight.js").Fight} fight
   * @returns {boolean}
   */
  handleMisdirectionDamage(amount, ev, fight) {
    // filter serpent sting
    if (ev.ability.guid === 27016) return false;

    if (!this.fight.mdAuras[this.key]) return false;

    for (let md of this.fight.mdAuras[this.key]) {
      for (let band of md.bands) {
        // Adding a delay for projectile traveling time...
        // 3 seconds
        if (
          ev.timestamp >= band.startTime &&
          band.endTime + 3 * 1000 >= ev.timestamp
        ) {
          if (!this.mdStacksPerBand[band.startTime]) {
            this.mdStacksPerBand[band.startTime] = 3;
          } else if (this.mdStacksPerBand[band.startTime] !== 1) {
            this.mdStacksPerBand[band.startTime] =
              this.mdStacksPerBand[band.startTime] - 1;
          } else continue;
          let target = fight.eventToUnit(ev, "target");
          if (target) {
            if (globalThis.DEBUGMODE) {
              console.log(
                `[${ev.timestamp}] MD: Redirecting ${amount} from ${this.name} to ${md.name}`
              );
            }
            target.addThreat(
              md.id,
              amount,
              ev.timestamp,
              "Misdirect (" + ev.ability.name + ")",
              this.threatCoeff(ev.ability)
            );
            return true;
          }
        }
      }
    }

    return false;
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
        /** @type {import("../base.js").ThreatCoefficientObject | import("../base.js").ThreatCoefficientFn} */
        const multiplier = this.config.buffMultipliers[buffId];
        if (typeof multiplier === "function") {
          const nextC = multiplier(spellSchool);
          c = applyThreatCoefficient(c, nextC, this.config.buffNames[buffId]);
        }
        // Allow applying a coefficient per spellId or via a combination of other buffs
        if (typeof multiplier === "object" && "coeff" in multiplier) {
          const { coeff } = multiplier;
          const nextC = coeff(this.buffs, spellId, this.fight)(spellSchool);
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

  /** @returns {import("../base.js").Border} */
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
   * @param {import("./wcl.js").WCLFriendlyUnit} wcl
   * @param {import("./wcl.js").WCLEvent[]} events
   * @param {import("./fight.js").Fight} fight
   * @param {import("../base.js").UnitSettings} settings
   * @param {boolean} [tranquilAir]
   */
  constructor(config, key, wcl, events, fight, settings, tranquilAir = false) {
    super(config, key, wcl.name, wcl.type, events, fight);
    /** @type {import("../threat/wcl.js").WCLFriendlyUnit} */
    this.wclUnit = wcl;

    /** @type {Record<string, import("../base.js").Talent> } */
    this.talents;

    /** @type {Record<string, number> } */
    this.initialBuffs;

    /** @type {import("../threat/wcl").WCLClassType} */
    this.type;

    /** @type {import("./wcl.js").WCLFaction} */
    this.faction;

    /** @type {import("./wcl.js").WCLCombatantInfoEvent[]} */
    this.combatantInfos = events.filter(
      (e) => e.type === "combatantinfo" && e.sourceID === Number(key)
    );

    this.buildInitialBuffs(settings);
    this.checkWarrior(events); // Extra stance detection
    this.checkPaladin(events); // Extra Righteous Fury detection
    this.checkFaction(tranquilAir); // BoS and tranquil air
    this.checkCombatantStatus(); // Check gear (enchants), talents and initial buffs

    this.initialCoeff = this.threatCoeff().value;
  }

  isBuffInferred(buffId) {
    return (this.initialBuffs[buffId] - 3) % 3 >= 0;
  }

  /**
   * @param {import("../base.js").UnitSettings} settings
   */
  buildInitialBuffs(settings) {
    this.initialBuffs = { ...this.config.initialBuffs.All };
    // Add class-specific initial buff settings
    if (typeof this.config.initialBuffs[this.type] === "object") {
      this.initialBuffs = {
        ...this.initialBuffs,
        ...this.config.initialBuffs[this.type],
      };
    }

    for (let k in this.initialBuffs) {
      if (this.initialBuffs[k] === InitialBuff.On) {
        this.buffs[k] = true;
      } else if (this.initialBuffs[k] === InitialBuff.Off) {
        delete this.buffs[k];
      } else {
        this.initialBuffs[k] = 4 - (k in this.buffs);
      }
    }

    // override class defaults with session settings
    for (let buffId in settings.buffs) {
      if (buffId in this.initialBuffs && settings.buffs[buffId] !== undefined) {
        this.initialBuffs[buffId] = settings.buffs[buffId];
      }
    }

    // Copy talents from the global structure to this player
    this.talents = {};
    for (let talentName in this.config.talents[this.type]) {
      let t = this.config.talents[this.type][talentName];
      this.talents[talentName] = {
        rank: t.maxRank,
        maxRank: t.maxRank,
        coeff: t.coeff,
      };
    }

    // override talents with session settings
    for (let talentName in settings.talents) {
      if (
        talentName in this.talents &&
        settings.talents[talentName] !== undefined
      ) {
        this.talents[talentName].rank = settings.talents[talentName];
      }
    }
  }

  checkCombatantStatus() {
    this.faction = this.combatantInfos[0]?.faction;
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
    if (this.faction === Faction.Alliance) {
      if (1038 in this.buffs || !this.isBuffInferred(25895)) return;
      this.buffs[25895] = true;
    } else if (this.faction === Faction.Horde) {
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
      if (![20925, 20927, 20928, 27179].includes(events[i].ability.guid))
        continue;
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
    super(config, key, unit.name, unit.type, events, fight);
    this.fightUnits = fight.units;
    /** @type {import("../threat/fight.js").Fight} */
    this.fight = fight;
    /** @type {Record<string, ThreatTrace>} */
    this.threat = {};
    this.target = null;

    /** @type {import("../threat/wcl").WCLNpcType} */
    this.type;
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

/**
 * @template T
 */
export class ThreatTrace {
  /**
   * @param {T} targetUnit
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
    let output = {};
    for (let i = 0, lastThreat = 0; i < this.threat.length; ++i) {
      let threat = this.threat[i] - lastThreat;
      if (threat === 0) continue;
      lastThreat = this.threat[i];
      let time = (this.time[i] - this.fight.start) / 1000;
      if (time >= range[0] && time <= range[1]) {
        let name = this.text[i];
        if (!(name in output)) output[name] = 0;
        output[name] += threat;
      }
    }
    return output;
  }
}
