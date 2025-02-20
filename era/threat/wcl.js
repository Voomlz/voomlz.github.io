/**
 * @typedef {{
 *   name: string;
 *   start_time: number;
 *   end_time: number;
 *   id: number;
 *   boss: number;
 * }} WCLFight
 */

const throttleTime = 150;

const apikey = "b91955fd65954650000220e85bd79c3d";

function sleep(ms) {
  return new Promise((f) => setTimeout(f, ms));
}

let nextRequestTime = 0;

export async function fetchWCLv1(path) {
  let t = new Date().getTime();
  nextRequestTime = Math.max(nextRequestTime, t);
  let d = nextRequestTime - t;
  nextRequestTime += throttleTime;
  await sleep(d);
  console.assert(path.length < 1900, "URL may be too long: " + path);
  console.log(
    `https://classic.warcraftlogs.com:443/v1/${path}&api_key=${apikey}`
  );
  let response = await fetch(
    `https://classic.warcraftlogs.com:443/v1/${path}&api_key=${apikey}`
  );
  if (!response) throw "Could not fetch " + path;
  if (response.status != 200) {
    if (response.type == "cors") {
      throw "Fetch error. The service may be throttled.";
    }
    throw "Fetch error.";
  }
  let json = await response.json();
  return json;
}

/**
 * @param {string} path
 * @param {number} start
 * @param {number} end
 * @param {import("../base").GameVersionConfig} config
 * @returns {Promise<WCLEvent[]>}
 */
export async function fetchWCLreport(path, start, end, config) {
  let t = start;
  let events = [];
  let filter = encodeURI(`
    type IN ("death","cast","begincast") 
    OR ability.id IN (${Object.keys(config.notableBuffs).join(",")}) 
    OR (
      type IN ("damage","heal","healing","miss","applybuff","applybuffstack","refreshbuff",
               "applydebuff","applydebuffstack","refreshdebuff","resourcechange","absorbed",
               "healabsorbed","leech","drain", "removebuff") 
      AND ability.id NOT IN (${config.zeroThreatSpells.join(",")})
    )`);
  while (typeof t === "number") {
    let json = await fetchWCLv1(
      `report/events/${path}&start=${t}&end=${end}&filter=${filter}`
    );
    if (!json.events) throw "Could not parse report " + path;
    events.push(...json.events);
    t = json.nextPageTimestamp;
  }
  return events;
}

async function fetchWCLDebuffs(path, start, end, abilityId, stack) {
  let t = start;
  let auras = [];
  while (typeof t === "number") {
    let query = `report/tables/debuffs/${path}&start=${t}&end=${end}&hostility=1&abilityid=${abilityId}`;
    if (stack) {
      query = query + `&filter=stack%3D${stack}`;
    }
    let json = await fetchWCLv1(query);
    if (!json.auras) throw "Could not parse report " + path;
    auras.push(...json.auras);
    t = json.nextPageTimestamp;
  }
  return auras;
}

/**
 * @param {string} path
 * @param {number} start
 * @param {number} end
 * @returns {Promise<WCLEvent[]>}
 */
export async function fetchWCLCombatantInfo(path, start, end) {
  let t = start;
  let events = [];
  while (typeof t === "number") {
    let filter = encodeURI(`type IN ("combatantinfo")`);
    let query = `report/events/${path}&start=${t}&end=${end}&filter=${filter}`;
    let json = await fetchWCLv1(query);
    if (!json.events) throw "Could not parse report " + path;
    events.push(...json.events);
    t = json.nextPageTimestamp;
  }
  return events;
}

/**
 * @param {string} path
 * @param {number} start
 * @param {number} end
 * @param {number} source
 * @returns {Promise<WCLAura[]>}
 */
async function fetchWCLPlayerBuffs(path, start, end, source) {
  let t = start;
  let auras = [];
  while (typeof t === "number") {
    let query = `report/tables/buffs/${path}&start=${t}&end=${end}&hostility=0&targetid=${source}`;
    let json = await fetchWCLv1(query);
    if (!json.auras) throw "Could not parse report " + path;
    auras.push(...json.auras);
    t = json.nextPageTimestamp;
  }
  return auras;
}

/**
 * @typedef {{
 *   guid: number;
 *   type: number;
 *   name: string;
 *   abilityIcon: string;
 * }} WCLAbility
 */

/**
 * @typedef {{
 *   amount: number;
 *   cost: number;
 *   max: number;
 *   type: number;
 * }} Resource
 */

/**
 * @typedef {{ ability: WCLAbility; sourceID: number; }
 *   & (
 *     WCLHealEvent |
 *     WCLApplyBuffEvent |
 *     WCLRemoveBuffEvent |
 *     WCLApplyDebuffEvent |
 *     WCLRemoveDebuffEvent |
 *     WCLCombatantInfoEvent
 *   )} WCLEvent
 */

/**
 * @typedef {{
 *   type: "heal";
 *   ability: WCLAbility;
 *   absorb: number;
 *   amount: number;
 *   armor: number;
 *   attackPower: number;
 *   avoidance: number;
 *   classResources: Resource[];
 *   facing: number;
 *   fight: number;
 *   hitPoints: number;
 *   hitType: number;
 *   itemLevel: number;
 *   mapID: number;
 *   maxHitPoints: number;
 *   overheal: number;
 *   resourceActor: number;
 *   sourceID: number;
 *   sourceIsFriendly: boolean;
 *   spellPower: number;
 *   targetID: number;
 *   targetIsFriendly: boolean;
 *   tick: boolean;
 *   timestamp: number;
 *   versatility: number;
 *   x: number;
 *   y: number;
 * }} WCLHealEvent
 */

/**
 * @typedef {{
 *   type: "applybuff";
 *   ability: WCLAbility;
 *   fight: number;
 *   sourceID: number;
 *   sourceIsFriendly: boolean;
 *   targetID: number;
 *   targetIsFriendly: boolean;
 *   timestamp: number;
 * }} WCLApplyBuffEvent
 */

/**
 * @typedef {{
 *   type: "removedebuff";
 *   ability: WCLAbility;
 *   fight: number;
 *   sourceID: number;
 *   sourceIsFriendly: boolean;
 *   targetID: number;
 *   targetIsFriendly: boolean;
 *   timestamp: number;
 * }} WCLRemoveDebuffEvent
 */

/**
 * @typedef {{
 *   type: "applydebuff";
 *   ability: WCLAbility;
 *   fight: number;
 *   sourceID: number;
 *   sourceIsFriendly: boolean;
 *   targetID: number;
 *   targetIsFriendly: boolean;
 *   timestamp: number;
 * }} WCLApplyDebuffEvent
 */

/**
 * @typedef {{
 *   type: "removebuff";
 *   ability: WCLAbility;
 *   fight: number;
 *   sourceID: number;
 *   sourceIsFriendly: boolean;
 *   targetID: number;
 *   targetIsFriendly: boolean;
 *   timestamp: number;
 * }} WCLRemoveBuffEvent
 */

/**
 * @typedef {{
 *   type: "combatantinfo";
 *   faction: number;
 *   fight: number;
 *   expansion: string;
 *   sourceID: number;
 *   specID: number;
 *   talents: [WCLTalent, WCLTalent, WCLTalent];
 *   auras: WCLAura[];
 *   gear: WCLCombatantGear[];
 *   timestamp: number;
 * }} WCLCombatantInfoEvent
 */

/**
 * @typedef {{
 *   id: number;
 * }} WCLTalent
 */

/**
 * @typedef {{
 *   ability: number;
 *   icon: string;
 *   name: string;
 *   source: number;
 *   stacks: number;
 * }} WCLAura
 */

/**
 * @typedef {{
 *   icon: string;
 *   id: number;
 *   itemLevel: number;
 *   quality: WCLQuality;
 *   setID: number;
 *   temporaryEnchant: number;
 * }} WCLCombatantGear
 */

/**
 * @typedef {0 | 1 | 2 | 3 | 4 | 5} WCLQuality
 */

/**
 * @enum {typeof WCLQuality}
 */
const WCLQuality = {
  Poor: 0,
  Common: 1,
  Uncommon: 2,
  Rare: 3,
  Epic: 4,
  Legendary: 5,
};
