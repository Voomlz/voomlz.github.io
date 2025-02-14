import { fetchWCLv1 } from "./wcl.js";
import { Fight } from "./fight.js";

export class Report {
  /**
   * @param {string} reportId
   * @param {import("../base.js").GameVersionConfig} config
   */
  constructor(config, reportId) {
    /**
     * @type {import("../base.js").GameVersionConfig}
     */
    this.config = config;
    /**
     * @type {string}
     */
    this.reportId = reportId;
    /**
     * @type {Record<string, Fight>}
     */
    this.fights = {};

    this.data = undefined;
  }

  async fetch() {
    if (this.data) return;

    this.data = await fetchWCLv1(`report/fights/${this.reportId}?`);
    let allFriendlies = [...this.data.friendlies, ...this.data.friendlyPets];
    for (let f of allFriendlies) {
      // The settings for these buffs are displayed for all classes
      f.initialBuffs = { ...this.config.initialBuffs.All };
      // Copy talents from the global structure to this player
      f.talents = {};
      for (let talentName in this.config.talents[f.type]) {
        let t = this.config.talents[f.type][talentName];
        f.talents[talentName] = {
          rank: t.maxRank,
          maxRank: t.maxRank,
          coeff: t.coeff,
        };
      }
      // Add class-specific initial buff settings
      if (typeof this.config.initialBuffs[f.type] === "object") {
        f.initialBuffs = {
          ...f.initialBuffs,
          ...this.config.initialBuffs[f.type],
        };
      }

      // Get faction
      switch (f.type) {
        case "Paladin":
          this.faction = "Alliance";
          break;
        case "Shaman":
          this.faction = "Horde";
          break;
      }
    }
    if (this.faction) {
      for (let u of allFriendlies) u.faction = this.faction;
    }
    this.units = {};
    for (let u of this.data.enemyPets) this.units[u.id] = u;
    for (let u of this.data.enemies) this.units[u.id] = u;
    for (let u of this.data.friendlyPets) this.units[u.id] = u;
    for (let u of this.data.friendlies) this.units[u.id] = u;
    this.fights = {};
    for (let f of this.data.fights) {
      this.fights[f.id] = new Fight(
        this.config,
        this.reportId,
        f,
        this.units,
        this.faction
      );
    }
  }
}
