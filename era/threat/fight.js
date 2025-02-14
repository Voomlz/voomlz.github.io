import { fetchWCLreport, fetchWCLCombatantInfo } from "./wcl.js";
import { Unit, Player, NPC } from "./unit.js";
import { handler_basic, handler_mark, threatFunctions } from "../base.js";

export class Fight {
  /**
   * @param {import("../base.js").GameVersionConfig} config
   * @param {string} reportId
   * @param {import("./wcl.js").WCLFight} fight
   * @param {Record<string, Unit>} globalUnits
   * @param {string} faction
   */
  constructor(config, reportId, fight, globalUnits, faction) {
    /**
     * @type {import("../base.js").GameVersionConfig}
     */
    this.config = config;
    this.name = fight.name;
    this.start = fight.start_time;
    this.end = fight.end_time;
    this.id = fight.id;
    this.encounter = fight.boss;
    this.globalUnits = globalUnits;
    this.faction = faction;
    this.reportId = reportId;
    this.tranquilAir = false;
    this.combatantInfos = [];

    /** @type {Record<string, NPC>} */
    this.enemies = {};

    /** @type {Record<string, Player>} */
    this.friendlies = {};

    /** @type {Record<string, Unit>} */
    this.units = {};

    this.events = undefined;
  }

  async fetch() {
    if (this.events) return;
    this.events = await fetchWCLreport(
      this.reportId + "?",
      this.start,
      this.end,
      this.config
    );
    if (this.combatantInfos.length === 0) {
      this.combatantInfos = await fetchWCLCombatantInfo(
        this.reportId + "?",
        this.start,
        this.end
      );
    }
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
  }

  eventToUnit(ev, unit) {
    // Unit should be "source" or "target"
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
      let t = u.type;
      if (t === "NPC" || t === "Boss" || t === "Pet") {
        a[k] = new NPC(this.config, k, u, this.events, this);
      } else {
        a[k] = new Player(
          this.config,
          k,
          this.globalUnits[id],
          this.events,
          this.combatantInfos.filter((i) => i.sourceID === Number(id)),
          this.tranquilAir
        );
      }
      this.units[k] = a[k];
    }
    return this.units[k];
  }

  eventToFriendliesAndEnemies(ev, unit) {
    let friendly = ev[unit + "IsFriendly"];
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

    let source = this.eventToUnit(ev, "source");
    if (source) {
      if (ev.x) {
        if (ev.type !== "damage") {
          if (source.name === "Naxxramas") {
            console.log(JSON.stringify(ev));
          }
          // fix losing the decimal point due to casting data type
          source.lastX = ev.x / 100;
          source.lastY = ev.y / 100;
        }
      }
    }
    /*
        let target = this.eventToUnit(ev, "target");
        if (target) {
            if (ev.x) {
                target.lastX = ev.x/100;
                target.lastY = ev.y/100;
            }
        }
         */
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
    for (let i = 0; i < this.events.length; ++i) {
      this.processEvent(this.events[i]);
    }
  }
}
