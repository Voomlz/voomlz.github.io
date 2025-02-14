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
