import { fetchWCLMisdirectionUptime, fetchWCLreport } from "./wcl.js";
import { Unit, Player, NPC } from "./unit.js";
import {
  handler_basic,
  handler_mark,
  threatFunctions,
  GLOBAL_SPELL_HANDLER_ID,
} from "../base.js";

/**
 * @typedef {'source' | 'target'} UnitSpecifier
 */

export class Fight {
  /**
   * @param {import("../base.js").GameVersionConfig} config
   * @param {string} reportId
   * @param {import("./wcl.js").WCLFight} fight
   * @param {Record<string, import("./wcl.js").WCLUnit>} globalUnits
   * @param {'Alliance' | 'Horde' | undefined} faction
   * @param {number} gameVersion
   */
  constructor(config, reportId, fight, globalUnits, faction, gameVersion) {
    /**
     * @type {import("../base.js").GameVersionConfig}
     */
    this.config = config;
    this.name = fight.name;
    this.start = fight.start_time;
    this.end = fight.end_time;
    this.id = fight.id;
    this.encounter = fight.boss;
    /** @type {number} */
    this.gameVersion = gameVersion;

    /** @type {import("./wcl.js").WCLFight} */
    this.wclData = fight;

    /**
     * @type {Record<string, import("./wcl.js").WCLUnit>}
     */
    this.globalUnits = globalUnits;
    /** @type {'Alliance' | 'Horde' | undefined} */
    this.faction = faction;
    this.reportId = reportId;
    this.tranquilAir = false;

    /** @type {Record<string, NPC>} */
    this.enemies = {};

    /** @type {Record<string, Player>} */
    this.friendlies = {};

    /** @type {Record<string, Unit>} */
    this.units = {};

    /** @type {import("./wcl.js").WCLEvent[] | undefined} */
    this.events = undefined;

    /** @type {Record<string, import("./wcl.js").WCLAuraUptime[]>} */
    this.mdAuras = {};
  }

  async fetch() {
    if (this.events) return;
    this.events = await fetchWCLreport(
      this.reportId + "?",
      this.start,
      this.end,
      this.config
    );
    // Custom events
    if (this.encounter === 791) {
      // High Priestess Arlokk
      let u;
      for (let k in this.globalUnits) {
        if (this.globalUnits[k].name === this.name) {
          u = this.globalUnits[k];
          break;
        }
      }
      if (!u) return;
      let lastTime = this.start;
      for (let i = 0; i < this.events.length; ++i) {
        if (this.events[i].type !== "cast" || this.events[i].sourceID !== u.id)
          continue;
        if (this.events[i].timestamp - lastTime > 30000) {
          for (let j = i - 1; j >= 0; --j) {
            if (this.events[i].timestamp - this.events[j].timestamp < 5000)
              continue;
            this.events.splice(j + 1, 0, {
              ability: { guid: -1, name: "Estimated re-entry" },
              timestamp: this.events[j].timestamp,
              type: "cast",
              sourceID: u.id,
              targetID: -1,
            });
            break;
          }
        }
        lastTime = this.events[i].timestamp;
      }
    }

    // TBC onwards: handle misdirection mechanics
    if (this.gameVersion >= 5) {
      for (let key in this.globalUnits) {
        if (this.globalUnits[key].type === "Hunter") {
          let misdirectionUptime = await fetchWCLMisdirectionUptime(
            this.reportId + "?",
            this.start,
            this.end,
            this.globalUnits[key].id
          );
          misdirectionUptime.source = this.globalUnits[key].id;
          this.mdAuras[this.globalUnits[key].id] = misdirectionUptime;
        }
      }
    }
  }

  /**
   * @param {import("./wcl.js").WCLEvent} ev
   * @param {UnitSpecifier} unit
   * @param {boolean} [createIfMissing]
   * @returns {Unit | undefined}
   */
  eventToUnit(ev, unit, createIfMissing = true) {
    // TODO: Fix units that are both enemies and friends in a single fight
    let k = Unit.eventToKey(ev, unit);
    if (!k || k == -1) return;
    if (!(k in this.units)) {
      let friendly = ev[unit + "IsFriendly"];
      let [a, b] = this.eventToFriendliesAndEnemies(ev, unit);
      let [id, ins] = k.split(".");
      let u = this.globalUnits[id];
      if (!u) {
        if (globalThis.DEBUGMODE)
          console.log("Invalid unit", ev, unit, this.globalUnits);
        return;
      }
      if (!createIfMissing) {
        return;
      }
      let t = u.type;
      if (t === "NPC" || t === "Boss" || t === "Pet") {
        a[k] = new NPC(this.config, k, u, this.events, this);
      } else {
        a[k] = new Player(
          this.config,
          k,
          this.globalUnits[id],
          this.events,
          this,
          this.tranquilAir
        );
      }
      this.units[k] = a[k];
    }
    return this.units[k];
  }

  /**
   * @param {import("./wcl.js").WCLEvent} ev
   */
  initFriendly(ev) {
    let key = Unit.eventToKey(ev, "source");

    if (!key || key == -1) return;
    if (!(key in this.units)) {
      let [friendlies] = this.eventToFriendliesAndEnemies(ev, "source");
      let [id] = key.split(".");
      let wclUnit = this.globalUnits[id];
      if (!wclUnit) {
        if (globalThis.DEBUGMODE)
          console.log("Invalid unit", ev, "source", this.globalUnits);
        return;
      }
      let type = wclUnit.type;
      if (type === "NPC" || type === "Boss" || type === "Pet") {
        return;
      } else {
        friendlies[key] = new Player(
          this.config,
          key,
          this.globalUnits[id],
          this.events,
          this,
          this.tranquilAir
        );
      }
      this.units[key] = friendlies[key];
    }
  }

  /**
   * @param {import("./wcl.js").WCLEvent} ev
   * @param {UnitSpecifier} unit
   * @returns {[Record<string, Unit>, Record<string, Unit>]}
   */
  eventToFriendliesAndEnemies(ev, unit) {
    let friendly = ev[unit + "IsFriendly"] ?? ev.type === "combatantinfo";
    let friendlies = friendly ? this.friendlies : this.enemies;
    let enemies = friendly ? this.enemies : this.friendlies;
    return [friendlies, enemies];
  }

  processEvent(ev) {
    {
      let _, i, u, friendlies, enemies;
      switch (ev.type) {
        case "cast":
        case "begincast":
          if (
            !ev.sourceIsFriendly &&
            "target" in ev &&
            ev.target.id === -1 &&
            !(Unit.eventToKey(ev, "source") in this.units)
          )
            break; // Caster is casting some visual spell outside fight
          u = this.eventToUnit(ev, "source");
          if (!u) break;
          u.alive = true;
          handler_mark(ev, this);
          break;
        case "damage": // Overkill in damage event = death
          if (!("overkill" in ev) || ev.overkill <= 0) break;
        case "death":
          u = this.eventToUnit(ev, "target");
          if (!u) break;
          u.alive = false;
          threatFunctions.unitLeaveCombat(ev, "target", this, "Death");
          break;
        case "applybuff":
        case "applydebuff":
        case "refreshbuff":
        case "refreshdebuff":
          i = ev.ability.guid;
          if (!(i in this.config.notableBuffs)) break;
          u = this.eventToUnit(ev, "target");
          if (!u) break;
          u.buffs[i] = true;
          [_, enemies] = this.eventToFriendliesAndEnemies(ev, "target");
          for (let k in enemies) {
            enemies[k].addThreat(
              u.key,
              null,
              ev.timestamp,
              ev.ability.name,
              u.threatCoeff()
            );
          }
          if (i in this.config.fixateBuffs) {
            let v = this.eventToUnit(ev, "source");
            if (!v || !("threat" in u)) break;
            let t = u.checkTargetExists(v.key, ev.timestamp);
            t.fixates[ev.ability.name] = true;
            t.addMark(ev.timestamp, ev.ability.name);
          }
          break;
        case "removebuff":
        case "removedebuff":
          i = ev.ability.guid;
          if (!(i in this.config.notableBuffs)) break;
          u = this.eventToUnit(ev, "target");
          if (!u) break;
          [_, enemies] = this.eventToFriendliesAndEnemies(ev, "target");
          for (let k in enemies) {
            enemies[k].addThreat(
              u.key,
              null,
              ev.timestamp,
              ev.ability.name + " fades",
              u.threatCoeff()
            );
          }
          delete u.buffs[i];
          if (i in this.config.fixateBuffs) {
            let v = this.eventToUnit(ev, "source");
            if (!v || !("threat" in u)) break;
            let t = u.checkTargetExists(v.key, ev.timestamp);
            delete t.fixates[ev.ability.name];
            t.addMark(ev.timestamp, ev.ability.name + " fades");
          }
          break;
      }
    }

    let source = this.eventToUnit(ev, "source", false /* createIfMissing */);
    if (source) {
      if (ev.x) {
        //if (ev.type !== "damage") {
          // fix losing the decimal point due to casting data type
          source.lastX = ev.x / 100;
          source.lastY = ev.y / 100;
        //}
      }
    }

    if (
      "ability" in ev &&
      this.config.spellFunctions[GLOBAL_SPELL_HANDLER_ID]
    ) {
      this.config.spellFunctions[GLOBAL_SPELL_HANDLER_ID](ev, this);
    }

    let f = handler_basic;
    if ("ability" in ev && ev.ability.guid in this.config.spellFunctions) {
      f = this.config.spellFunctions[ev.ability.guid];
    }
    f(ev, this);
  }

  process() {
    this.friendlies = {};
    this.enemies = {};
    this.units = {};

    // Force instantiate all friendly units so we don't have a bug with MD pull
    const initialEvents = (this.events ?? []).slice(0, 450);
    for (let ev of initialEvents) {
      this.initFriendly(ev);
    }
    for (let ev of this.events ?? []) {
      this.processEvent(ev);
    }
  }
}
