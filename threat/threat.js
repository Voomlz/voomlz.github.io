"use strict";

const throttleTime = 150;
let apikey = "b91955fd65954650000220e85bd79c3d";
let plotXRange = [-Infinity, Infinity];
let plotData = [];
let recolorPlot = () => {
};
let colorByClass = true;

let combatantInfo = [];
const globalMdAuras = [];
let nightBaneNextLanding;

/*
function loadPage() {
    scroll(0, 0);
    const wclUrl = getParameterByName('id');
    document.getElementById("reportSelect").value = wclUrl;
    if (wclUrl) {
        selectReport();
    }
}
*/


function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function printError(e) {
    console.log(e);
    alert("Error:\n" + e + "\n\nRefresh the page to start again.");
}

function sleep(ms) {
    return new Promise(f => setTimeout(f, ms));
}

let nextRequestTime = 0;

async function fetchWCLv1(path) {
    let t = (new Date).getTime();
    nextRequestTime = Math.max(nextRequestTime, t);
    let d = nextRequestTime - t;
    nextRequestTime += throttleTime;
    await sleep(d);
    console.assert(path.length < 1900, "URL may be too long: " + path);

    let response = await fetch(`https://classic.warcraftlogs.com:443/v1/${path}&api_key=${apikey}`);
    if (!response) throw "Could not fetch " + path;
    if (response.status != 200) {
        if (response.type == "cors") {
            throw "Fetch error. Warcraftlogs may be down or logs private.";
        }
        throw "Fetch error.";
    }
    let json = await response.json();
    return json;
}

async function fetchWCLreport(path, start, end) {
    let t = start;
    let events = [];
    let filter = encodeURI(`type IN ("death","cast","begincast") OR ability.id IN (${Object.keys(notableBuffs).join(',')}) OR (type IN ("damage","heal","healing","miss","applybuff","applybuffstack","refreshbuff","applydebuff","applydebuffstack","refreshdebuff","energize","absorbed","healabsorbed","leech","drain", "removebuff") AND ability.id NOT IN (${zeroThreatSpells.join(",")}))`);
    while (typeof t === "number") {
        let json = await fetchWCLv1(`report/events/${path}&start=${t}&end=${end}&filter=${filter}`);
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
            query = query + `&filter=stack%3D${stack}`
        }
        let json = await fetchWCLv1(query);
        if (!json.auras) throw "Could not parse report " + path;
        auras.push(...json.auras);
        t = json.nextPageTimestamp;
    }
    return auras;
}

async function fetchWCLCombatantInfo(path, start, end) {

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

async function fetchWCLMisdirectionUptime(path, start, end, source) {
    let query = `report/tables/buffs/${path}&start=${start}&end=${end}&abilityid=35079&sourceid=${source}`;
    let json = await fetchWCLv1(query);
    if (!json) throw "Could not parse report " + path;
    json.auras.source = source;
    return json.auras;
}

class ThreatTrace {
    constructor(targetUnit, startTime, fight) {
        this.threat = [0];
        this.time = [startTime];
        this.text = ["Joined fight"];
        this.coeff = [targetUnit.threatCoeff()];
        let [w, c] = targetUnit.border;
        this.borderWidth = [w];
        this.borderColor = [c];
        this.target = targetUnit;
        this.currentThreat = 0;
        this.fight = fight;
        this.fixates = {};
        this.fixateHistory = [null];
        this.invulnerabilityHistory = [[]];
    }

    // coeff is only used for text labels
    setThreat(threat, time, text, coeff = null, border = null) {
        if (threat < 0) threat = 0;
        this.threat.push(threat);
        this.time.push(time);
        this.text.push(text);
        this.coeff.push(coeff);
        let [w, c] = border !== null ? border : this.fixated ? borders.taunt : this.target.border;
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

    // coeff multiplies threat
    addThreat(threat, time, text, coeff) {
        if (threat === 0) return;
        this.setThreat(this.currentThreat + threat * coeff, time, text, coeff);
    }

    addMark(time, text, border = null) {
        this.setThreat(this.currentThreat, time, text, null, border);
    }

    receiveAttack(time, text) {
        this.setThreat(this.currentThreat, time, "Received " + text, null, true);
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

    tabulateThreat(el_div) {
        let el_table = document.createElement("table");

        function addRow(texts) {
            let el_tr = document.createElement("tr");
            for (let i = 0; i < texts.length; ++i) {
                let el_td = document.createElement("td");
                if (typeof texts[i] === "number") {
                    el_td.textContent = texts[i].toFixed(2);
                    el_td.align = "right";
                } else {
                    el_td.textContent = texts[i];
                }
                el_tr.appendChild(el_td);
            }
            el_table.appendChild(el_tr);
        }

        let rangeWidth = plotXRange[1] - plotXRange[0];
        el_table.innerHTML = `<tr><th>Ability</th><th title="Over the currently zoomed x range.">Threat (*)</th><th>Per ${rangeWidth.toFixed(2)} seconds</th></tr>`;
        let a = this.threatBySkill(plotXRange);
        let keys = Object.keys(a);
        keys.sort((x, y) => a[y] - a[x]);
        let totalThreat = 0;
        let data = [];
        for (let i = 0; i < keys.length; ++i) {
            let k = keys[i];
            totalThreat += a[k];
            addRow([k, a[k], a[k] / rangeWidth]);
            data.push([k, a[k], a[k] / rangeWidth]);
        }
        addRow(["Total", totalThreat, totalThreat / rangeWidth]);
        data.push(["Total", totalThreat, totalThreat / rangeWidth]);
        console.log(JSON.stringify(data));
        el_div.appendChild(el_table);
    }

    tabulate(el_div) {
        el_div.innerHTML = this.target.name + " - Started fight with threat coeff " + parseFloat(this.target.initialCoeff.toFixed(4));
        // Color
        if ("global" in this.target) {
            let el_color = document.createElement("input");
            el_color.type = "color";
            el_color.title = "Change trace color";
            el_color.className = "colorPicker";
            for (let trace of plotData) {
                if (trace.unitKey !== this.target.key) continue;
                el_color.value = trace.marker.color;
                break;
            }
            el_color.onchange = () => {
                this.target.global.color = el_color.value;
                recolorPlot()
            };
            el_div.insertBefore(el_color, el_div.firstChild);
        }
        // Threat values
        this.tabulateThreat(el_div);
        // Buff table
        if (!("global" in this.target)) return;
        let el_table = document.createElement("table");
        el_table.innerHTML = "<tr><th>Buff</th><th title=\"Fetch fight again to recompute\">On/off at start (*)</th></tr>";
        let a = this.target.global.initialBuffs;
        for (let k in a) {
            let els = ["tr", "td", "td", "select", "option", "option", "option", "option", "option"].map(s => document.createElement(s));
            els[1].textContent = buffNames[k] + " " + buffMultipliers[k](this.target.spellSchool);
            els[4].textContent = "Infer";
            els[5].textContent = "On";
            els[6].textContent = "Off";
            els[7].textContent = "Inferred on";
            els[8].textContent = "Inferred off";
            for (let i = 4; i < 9; ++i) els[3].appendChild(els[i]);
            els[2].appendChild(els[3]);
            els[0].appendChild(els[1]);
            els[0].appendChild(els[2]);
            els[3].selectedIndex = a[k];
            els[3].onchange = () => a[k] = els[3].selectedIndex;
            el_table.appendChild(els[0]);
        }
        el_div.appendChild(el_table);
        // Talent table
        el_table = document.createElement("table");
        el_table.innerHTML = "<tr><th>Talent name</th><th title=\"Fetch fight again to recompute\">Rank (*)</th></tr>";
        let talents = this.target.global.talents;
        for (let talentName in talents) {
            let t = talents[talentName];
            let els = ["tr", "td", "td", "input"].map(s => document.createElement(s));
            els[0].appendChild(els[1]);
            els[0].appendChild(els[2]);
            els[1].textContent = talentName;
            els[2].appendChild(els[3]);
            els[2].appendChild(document.createTextNode(" / " + t.maxRank));
            els[3].type = "number";
            els[3].min = 0;
            els[3].max = t.maxRank;
            els[3].value = t.rank;
            els[3].className = "talent";
            els[3].onchange = () => t.rank = els[3].value;
            el_table.appendChild(els[0]);
        }
        el_div.appendChild(el_table);
        let labelOverrideTalents = document.createElement("LABEL");
        labelOverrideTalents.textContent = "Force override talents";
        let buttonOverrideTalents = document.createElement("INPUT");
        buttonOverrideTalents.setAttribute("type", "checkbox");
        buttonOverrideTalents.setAttribute("id", "buttonOverrideTalents");
        el_div.appendChild(labelOverrideTalents)
        el_div.appendChild(buttonOverrideTalents)
    }
}

class Unit {
    constructor(key, name, type, events, lastInvisibility = 0) { // Info is an object from WCL API
        this.mdStacksPerBand = [];
        this.lastInvisibility = lastInvisibility;
        this.key = key;
        this.name = name;
        this.type = type;
        this.spellSchool = preferredSpellSchools[type] || 1;
        this.baseThreatCoeff = baseThreatCoefficients[type] || getThreatCoefficient(1);
        this.buffs = {};
        this.alive = true;
        this.dies = false;
        this.tank = false;
        let initialBuffs = {};
        const buffEvents = {
            "applybuff": 1,
            "refreshbuff": 1,
            "applydebuff": 1,
            "refreshdebuff": 1,
            "removebuff": 2,
            "removedebuff": 2
        };
        for (let i = 0; i < events.length; ++i) {
            if (this.threatCoeff() > 1) this.tank = true;
            let t = events[i].type;
            if (this.type in auraImplications && t === "cast") {
                if (Unit.eventToKey(events[i], "source") !== key) continue;
                let aid = events[i].ability.guid;
                if (!(aid in auraImplications[this.type])) continue;
                let bid = auraImplications[this.type][aid];
                if (!(bid in this.buffs)) {
                    initialBuffs[bid] = true;
                    this.buffs[bid] = true;
                }
            } else if (t in buffEvents) {
                if (Unit.eventToKey(events[i], "target") !== key) continue;
                let aid = events[i].ability.guid;
                if (!(aid in notableBuffs)) continue;
                if (aid === 23397 && t === "applydebuff") { // Special handler for Nefarian's warrior class call
                    delete this.buffs[71];
                    delete this.buffs[2457];
                    this.buffs[2458] = true;
                }
                if (aid === 23398) { // Druid class call
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
        this.initialCoeff = this.threatCoeff();
        if (this.initialCoeff > 1) this.tank = true;
    }

    setLastInvisibility(value) {
        this.lastInvisibility = value;
    }

    handleMisdirectionDamage(amount, ev, fight) {
        if (ev.ability.guid === 27016) return false;
        // filter serpent sting

        let mdAuraForThis = globalMdAuras[this.key];
        for (let i in mdAuraForThis) {
            let md = mdAuraForThis[i];
            for (let j in md.bands) {
                let band = md.bands[j];

                // Adding a delay for projectile traveling time...
                // 3 seconds
                if (ev.timestamp >= band.startTime && band.endTime + (3 * 1000) >= ev.timestamp) {
                    if (!this.mdStacksPerBand[band.startTime]) {
                        this.mdStacksPerBand[band.startTime] = 3;
                    } else if (this.mdStacksPerBand[band.startTime] !== 1) {
                        this.mdStacksPerBand[band.startTime] = this.mdStacksPerBand[band.startTime] - 1;
                    } else continue;
                    let b = fight.eventToUnit(ev, "target");
                    if (b) {
                        console.log("[" + ev.timestamp + "]MD: Redirecting " + amount + " from " + this.name + " to " + md.name);
                        b.addThreat(md.id, amount, ev.timestamp, "Misdirect (" + ev.ability.name + ")", this.threatCoeff(ev.ability));
                        return true;
                    }
                }
            }
        }

        return false;
    }

    threatCoeff(ability) {
        //, event) { // Ability is of type {type: (int)spellSchool, guid: (int)spellId, [name: string]}

        /*
        let auras = playersAuras.get(this.key);

        for (let i in auras) {
            console.log("Aura : " + auras[i].name);
            for (const buff of buffMultipliers) {
                if (auras[i].guid === buff) {
                    console.log("Found buff " + auras[i].name + " for " + this.name);
                }
            }
        }

         */

        let spellSchool = ability ? ability.type : this.spellSchool;
        let spellId = ability ? ability.guid : null;
        let c = this.baseThreatCoeff(spellSchool);
        for (let i in this.buffs) {
            if (i in buffMultipliers) c *= buffMultipliers[i](spellSchool);
        }
        for (let i in this.talents) {
            let t = this.talents[i];
            if (!("coeff" in t)) continue;
            let coeff = t.coeff(this.buffs, t.rank, spellId);
            c *= coeff(spellSchool);
        }

        return c;
    }

    get invulnerable() {
        return Object.keys(this.buffs).filter(x => x in invulnerabilityBuffs);
    }

    get border() { // Returns vertex border width and color for plotting
        if (this.invulnerable.length) {
            return [2, "#0f0"];
        }
        for (let k in this.buffs) {
            if (k in aggroLossBuffs) {
                return [2, "#ff0"];
            }
        }
        if (!this.alive) return [1.5, "#f00"];
        return [0, null];
    }

    static eventToKey(ev, unit) { // Unit should be "source" or "target"
        let key = ev[unit + "ID"];
        if (key === undefined) key = ev[unit].id;
        key = key.toString(10);
        if ((unit + "Instance") in ev) key += "." + ev[unit + "Instance"];
        return key;
    }

// Empty functions to enable blind calls
    setThreat() {
    }

    addThreat() {
    }

    addMark() {
    }

    targetAttack() {
    }

    plot() {
    }

    checkTargetExists() {
    }
}

// Class for players and pets
class Player extends Unit {
    constructor(key, info, events, tranquilAir = false) {
        super(key, info.name, info.type, events);
        this.global = info;
        this.talents = info.talents;
        console.assert("initialBuffs" in info, "Player info not properly initialised.", info);

        this.checkWarrior(events); // Extra stance detection
        this.checkPaladin(events); // Extra Righteous Fury detection
        // this.checkBear(events); // Extra Bear detection
        // this.checkFaction(tranquilAir); // BoS and tranquil air
        this.checkInitalStatus(); // Gloves and cloack enchants, talents and buffs

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

        this.initialCoeff = this.threatCoeff();
    }

    isBuffInferred(buffId) {
        return (this.global.initialBuffs[buffId] - 3) % 3 >= 0;
    }

    checkInitalStatus() {

        let overrideTalents = false;
        let elementById = document.getElementById("buttonOverrideTalents");
        if (elementById) {
            if (elementById.value) {
                overrideTalents = true;
            }
        }

        for (const combatantInfoElement of combatantInfo) {

            if (combatantInfoElement.sourceID == this.key) {
                if (!overrideTalents) {
                    // Talent format [0/44/17]
                    // Just guessing people with enough point do take the talents, and thus infer it
                    let talents = combatantInfoElement.talents;
                    switch (this.type) {
                        case "Warrior" :
                            if (talents[1].id < 35) {
                                this.talents["Improved Berserker Stance"].rank = 0;
                            }
                            if (talents[2].id < 3) {
                                this.talents["Tactical Mastery"].rank = 0;
                            }
                            if (talents[2].id < 10) {
                                this.talents["Defiance"].rank = 0;
                            }
                            break;
                        case "Druid" :
                            if (talents[1].id < 8) {
                                this.talents["Feral Instinct"].rank = 0;
                            }
                            break;
                        case "Paladin" :
                            if (talents[1].id < 13) {
                                this.talents["Improved Righteous Fury"].rank = 0;
                            }
                            if (talents[2].id < 40) {
                                this.talents["Fanaticism"].rank = 0;
                            }
                            break;
                        case "Shaman" :
                            if (talents[0].id < 28) {
                                this.talents["Elemental Precision (fire)"].rank = 0;
                                this.talents["Elemental Precision (nature)"].rank = 0;
                                this.talents["Elemental Precision (frost)"].rank = 0;
                            }
                            if (talents[1].id < 21) {
                                this.talents["Spirit Weapons"].rank = 0;
                            }
                            if (talents[2].id < 13) {
                                this.talents["Healing Grace"].rank = 0;
                            }
                            break;
                    }
                }

                let auras = combatantInfoElement.auras;

                if (auras) {
                    for (const a of auras) {
                        this.buffs[a.ability] = true;
                    }
                }

                let gear = combatantInfoElement.gear;
                if (gear) {
                    for (const g of gear) {
                        let enchant = g.permanentEnchant;
                        if (enchant != null) {
                            if (enchant === 2613) { // gloves threat enchant
                                this.buffs[2613] = true;
                            }
                            if (enchant === 2621) { // cloack threat enchant
                                this.buffs[2621] = true;
                            }
                        }
                    }
                }
                return;
            }
        }
    }

    // Extra stance detection
    checkWarrior(events) {
        if (this.type !== "Warrior") return;
        for (let i of [71, 2457, 2458]) {
            if ((i in this.buffs) || !this.isBuffInferred(i)) return;
        }
        // Check if unit deals damage with Whirlwind
        for (let i = 0; i < events.length; ++i) {
            if (events[i].type !== "damage") continue;
            if (Unit.eventToKey(events[i], "source") !== this.key) continue;
            if (events[i].ability.guid !== 1680) continue;
            this.buffs[2458] = true;		// Apply Berserker Stance
            return;
        }
        this.buffs[71] = true;				// Apply Defensive Stance
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
            if (![20925, 20927, 20928, 27179].includes(events[i].ability.guid)) continue;
            this.buffs[25780] = true;
            this.tank = true;
            return;
        }
    }

    // Extra Mangle Bear detection
    checkBear(events) {
        if (this.type !== "Druid") return;
        if (this.dies) return;
        if (!this.isBuffInferred(9634)) return;
        for (let i = 0; i < events.length; ++i) {
            if (!("ability" in events[i])) continue;
            if (Unit.eventToKey(events[i], "source") !== this.key) continue;
            if (![33878, 33986, 33987].includes(events[i].ability.guid)) continue;
            this.buffs[9634] = true;
            this.tank = true;
            return;
        }
    }
}

class NPC extends Unit {
    constructor(key, unit, events, fight) {
        super(key, unit.name, unit.type, events);
        this.fightUnits = fight.units;
        this.fight = fight;
        this.threat = {};
        this.target = null;
    }

    checkTargetExists(unitId, time) {
        if (unitId === -1) return;
        if (!(unitId in this.threat)) {
            if (!(unitId in this.fightUnits)) {
                throw "Unknown unit " + unitId + ".";
            }
            this.threat[unitId] = new ThreatTrace(this.fightUnits[unitId], time, this.fight);
        }
        return this.threat[unitId];
    }

    setThreat(unitId, threat, time, text, coeff = null, border = null) {
        if (!this.alive) return;
        let a = this.checkTargetExists(unitId, time);
        if (!a) return;
        a.setThreat(threat, time, text, coeff, border);
    }

    addThreat(unitId, threat, time, text, coeff) {
        if (!this.alive) return;
        let a = this.checkTargetExists(unitId, time);
        if (!a) return;
        a.addThreat(threat, time, text, coeff);
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

    plot(reportId, fight) {
        let el_div = document.querySelector("#output");
        el_div.innerHTML = "";
        plotData = [];
        for (let unitId in this.threat) {
            let unitInfo = this.threat[unitId];
            let u = this.fightUnits[unitId];
            let t = [], texts = [];
            for (let i = 0; i < unitInfo.time.length; ++i) {
                let threatDiff = unitInfo.threat[i] - (unitInfo.threat[i - 1] || 0);
                t.push((unitInfo.time[i] - fight.start) / 1000);
                let text = `${unitInfo.text[i]}<br>Time: ${t[i]}<br>Threat: ${threatDiff.toFixed(1)}<br>Total: ${unitInfo.threat[i].toFixed(1)}`;
                if (unitInfo.coeff[i] !== null) text += "<br>Coeff: " + unitInfo.coeff[i].toFixed(2);
                if (unitInfo.fixateHistory[i]) text += "<br>Fixate: " + unitInfo.fixateHistory[i];
                if (unitInfo.invulnerabilityHistory[i].length) text += "<br>Invulnerability: " + unitInfo.invulnerabilityHistory[i].map(x => invulnerabilityBuffs[x]).join("+");
                texts.push(text);
            }
            let trace = {
                unitKey: u.key,
                x: t,
                y: unitInfo.threat,
                text: texts,
                type: "scatter",
                mode: "lines+markers",
                name: u.name + " " + u.initialCoeff.toFixed(2),
                hoverinfo: "name+text",
                line: {shape: "hv"},
                marker: {line: {width: unitInfo.borderWidth, color: unitInfo.borderColor}}
            };
            plotData.push(trace);
            if (colorByClass) trace.marker.color = classColors[u.type];
            if (u.global && u.global.color && u.global.color !== "#000000") trace.marker.color = u.global.color;
        }
        plotData.sort((a, b) => Math.max(0, ...b.y) - Math.max(0, ...a.y));
        // Fill missing colors according to threat positions
        for (let i = 0; i < plotData.length; ++i) {
            plotData[i].marker.color = plotData[i].marker.color || getColor(i);
        }
        let el_plot = document.createElement("div");
        el_div.appendChild(el_plot);
        recolorPlot = () => {
            let colors = [];
            for (let i = 0; i < plotData.length; ++i) {
                let u = this.fight.units[plotData[i].unitKey];
                if (u.global && u.global.color) {
                    colors.push(u.global.color);
                } else if (colorByClass) {
                    colors.push(classColors[u.type]);
                } else {
                    colors.push(getColor(i));
                }
            }
            Plotly.restyle(el_plot, {"marker.color": colors});
        }
        createCheckbox(el_div, colorByClass, "Color by class", x => {
            colorByClass = x;
            recolorPlot()
        });
        createCheckbox(el_div, fight.tranquilAir, "Tranquil Air", x => {
            fight.tranquilAir = x;
            fight.process();
            selectEnemy();
        });
        plotXRange = [0, (fight.end - fight.start) / 1000];
        Plotly.newPlot(el_plot, plotData, {
            title: `Threat - ${this.name}`,
            titlefont: {color: "#fff"},
            xaxis: {
                title: "Time (s)",
                titlefont: {color: "#fff"},
                tickcolor: "#666",
                tickfont: {color: "#fff"},
                rangemode: "tozero",
                gridcolor: "#666",
                linecolor: "#999",
                range: plotXRange.slice()
            },
            yaxis: {
                title: "Threat",
                titlefont: {color: "#fff"},
                tickcolor: "#666",
                tickfont: {color: "#fff"},
                rangemode: "tozero",
                gridcolor: "#666",
                linecolor: "#999"
            },
            width: 1920,
            height: 1080,
            hovermode: "closest",
            plot_bgcolor: "#222",
            paper_bgcolor: "#222",
            legend: {font: {color: "#fff"}}
        });
        el_plot.on("plotly_click", e => {
            if (e.points.length === 0) return;
            selectTarget(reportId + ";" + fight.id + ";" + this.key + ";" + e.points[0].data.unitKey);
        });
        el_plot.on("plotly_relayout", e => {
            let range = [e["xaxis.range[0]"], e["xaxis.range[1]"]];
            if (range[0] === undefined || range[1] === undefined) return;
            if (range[0] === plotXRange[0] && range[1] === plotXRange[1]) return;
            plotXRange = range;
            selectTarget();
        });
    }
}

class Fight {
    constructor(reportId, fight, globalUnits, faction) {
        this.name = fight.name;
        this.start = fight.start_time;
        this.end = fight.end_time;
        this.id = fight.id;
        this.encounter = fight.boss;
        this.globalUnits = globalUnits;
        this.faction = faction;
        this.reportId = reportId;
        this.tranquilAir = false;
    }

    async fetch() {
        combatantInfo = await fetchWCLCombatantInfo(this.reportId + "?", 0, this.end);

        if ("events" in this) return;
        this.events = await fetchWCLreport(this.reportId + "?", this.start, this.end);
        // Custom events
        if (this.encounter === 791) { // High Priestess Arlokk
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
                if (this.events[i].type !== "cast" || this.events[i].sourceID !== u.id) continue;
                if (this.events[i].timestamp - lastTime > 30000) {
                    for (let j = i - 1; j >= 0; --j) {
                        if (this.events[i].timestamp - this.events[j].timestamp < 5000) continue;
                        this.events.splice(j + 1, 0, {
                            ability: {guid: -1, name: "Estimated re-entry"},
                            timestamp: this.events[j].timestamp,
                            type: "cast",
                            sourceID: u.id,
                            targetID: -1
                        });
                        break;
                    }
                }
                lastTime = this.events[i].timestamp;
            }
        }

        for (let f in this.globalUnits) {

            if (this.globalUnits[f].type === "Hunter") {
                let misdirectionUptime = await fetchWCLMisdirectionUptime(this.reportId + "?", this.start, this.end, this.globalUnits[f].id);
                misdirectionUptime.source = this.globalUnits[f].id;
                globalMdAuras[this.globalUnits[f].id] = misdirectionUptime;
            }
        }
    }

    eventToUnit(ev, unit) { // Unit should be "source" or "target"
        // TODO: Fix units that are both enemies and friends in a single fight
        let k = Unit.eventToKey(ev, unit);
        if (!k || k == -1) return;
        if (!(k in this.units)) {
            let friendly = ev[unit + "IsFriendly"];
            let [a, b] = this.eventToFriendliesAndEnemies(ev, unit);
            let [id, ins] = k.split(".");
            let u = this.globalUnits[id];
            if (!u) {
                if (DEBUGMODE) console.log("Invalid unit", ev, unit, this.globalUnits);
                return;
            }
            let t = u.type;
            if (t === "NPC" || t === "Boss" || t === "Pet") {
                a[k] = new NPC(k, u, this.events, this);
            } else {
                a[k] = new Player(k, this.globalUnits[id], this.events, this.tranquilAir);
            }
            this.units[k] = a[k];
        }
        return this.units[k];
    }

    instanciateUnit(ev, existingUnits) {
        if (!ev) {
            console.log(JSON.stringify(ev));
            return;
        }
        let k = Unit.eventToKey(ev, "source");

        for (let key in existingUnits) {
            if (existingUnits[key] === k) return
        }

        if (!k || k == -1) return;
        if (!(k in this.units)) {
            let [a, b] = this.eventToFriendliesAndEnemies(ev, "source");
            let [id, ins] = k.split(".");
            let u = this.globalUnits[id];
            if (!u) {
                if (DEBUGMODE) console.log("Invalid unit", ev, "source", this.globalUnits);
                return;
            }
            let t = u.type;
            if (t === "NPC" || t === "Boss" || t === "Pet") {
                return;
            } else {
                a[k] = new Player(k, this.globalUnits[id], this.events, this.tranquilAir);
            }
            this.units[k] = a[k];
        }
        return k;
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
                    if (!ev.sourceIsFriendly && "target" in ev && ev.target.id === -1 && !(Unit.eventToKey(ev, "source") in this.units)) break; // Caster is casting some visual spell outside fight
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
                    if (!(i in notableBuffs)) break;
                    u = this.eventToUnit(ev, "target");
                    if (!u) break;
                    if (i === 23397 && ev.type === "applydebuff") { // Special handler for Nefarian's warrior class call
                        delete u.buffs[71];
                        delete u.buffs[2457];
                        u.buffs[2458] = true;
                    }
                    if (i === 23398 && ev.type === "applydebuff") { // Druid class call
                        delete u.buffs[5487];
                        delete u.buffs[9634];
                        u.buffs[768] = true;
                    }
                    u.buffs[i] = true;
                    [_, enemies] = this.eventToFriendliesAndEnemies(ev, "target");
                    for (let k in enemies) {
                        enemies[k].addThreat(u.key, null, ev.timestamp, ev.ability.name, u.threatCoeff());
                    }
                    if (i in fixateBuffs) {
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
                    if (!(i in notableBuffs)) break;
                    u = this.eventToUnit(ev, "target");
                    if (!u) break;
                    [_, enemies] = this.eventToFriendliesAndEnemies(ev, "target");
                    for (let k in enemies) {
                        enemies[k].addThreat(u.key, null, ev.timestamp, ev.ability.name + " fades", u.threatCoeff());
                    }
                    if (i === 23398) { // Druid class call
                        delete u.buffs[768];
                    }
                    delete u.buffs[i];
                    if (i in fixateBuffs) {
                        let v = this.eventToUnit(ev, "source");
                        if (!v || !("threat" in u)) break;
                        let t = u.checkTargetExists(v.key, ev.timestamp);
                        delete t.fixates[ev.ability.name];
                        t.addMark(ev.timestamp, ev.ability.name + " fades");
                    }
                    break;
            }
        }

        // hack for nightbane
        if (nightBaneNextLanding) {
            if (ev.sourceIsFriendly && !ev.targetIsFriendly) {
                if (ev.timestamp > nightBaneNextLanding) {
                    let u = this.eventToUnit(ev, "target");
                    if (!u) return;
                    for (let k in u.threat) {
                        u.setThreat(k, 0, nightBaneNextLanding, "Landing Threat Wipe");
                    }
                    nightBaneNextLanding = null;
                }
            }
        }

        let f = handler_basic;
        if ("ability" in ev && ev.ability.guid in spellFunctions) {
            f = spellFunctions[ev.ability.guid];
        }
        f(ev, this);
    }

    process() {
        this.friendlies = {};
        this.enemies = {};
        this.units = {};

        let existingUnits = [];

        // Force instanciate all units so we don't have a bug with MD pull
        let number = this.events.length < 450 ? this.events.length : 450;
        for (let i = 0; i < number; ++i) {

            existingUnits.push(this.instanciateUnit(this.events[i], existingUnits));

        }
        for (let i = 0; i < this.events.length; ++i) {
            this.processEvent(this.events[i]);
        }
    }
}

class Report {
    constructor(reportId) {
        this.reportId = reportId;
    }

    async fetch() {
        if ("data" in this) return;
        this.data = await fetchWCLv1(`report/fights/${this.reportId}?`);
        let allFriendlies = [...this.data.friendlies, ...this.data.friendlyPets];
        for (let f of allFriendlies) {
            // The settings for these buffs are displayed for all classes
            f.initialBuffs = {1038: 0, 25895: 0, 25909: 0, 2613: 0, 2621: 0};
            // Copy talents from the global structure to this player
            f.talents = {};
            for (let talentName in talents[f.type]) {
                let t = talents[f.type][talentName];
                f.talents[talentName] = {
                    rank: t.maxRank,
                    maxRank: t.maxRank,
                    coeff: t.coeff,
                }
            }
            // Get faction and add class-specific initial buff settings
            switch (f.type) {
                case "Paladin":
                    f.initialBuffs[25780] = 0;	// Righteous Fury
                    this.faction = "Alliance";
                    break;
                case "Shaman":
                    this.faction = "Horde";
                    break;
                case "Warrior":
                    f.initialBuffs[71] = 0;		// Stances
                    f.initialBuffs[2457] = 0;
                    f.initialBuffs[2458] = 0;
                    break;
                case "Druid":
                    f.initialBuffs[5487] = 0;	// Forms
                    f.initialBuffs[9634] = 0;
                    f.initialBuffs[768] = 0;
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
            this.fights[f.id] = new Fight(this.reportId, f, this.units, this.faction);
        }
    }
}


const reports = {};

function selectReport() {

    let wcl = getParameterByName('id');
    let el = document.querySelector("#reportSelect");
    let el_fightSelect = document.querySelector("#fightSelect");
    let el_enemySelect = document.querySelector("#enemySelect");
    let el_targetSelect = document.querySelector("#targetSelect");

    let fightParam = el_fightSelect === null ? "" : "&fight=" + el_fightSelect.value;
    let enemyParam = el_enemySelect === null ? "" : "&enemy=" + el_enemySelect.value;
    let targetParam = el_targetSelect === null ? "" : "&target=" + el_targetSelect.value;

    el_fightSelect.innerHTML = "";
    let reportId = el.value;
    if (!wcl || wcl !== reportId) {
        location.href = location.origin + location.pathname + '?id=' + el.value + fightParam + enemyParam + targetParam;
        return;
    }
    let urlmatch = reportId.match(/https:\/\/(?:[a-z]+\.)?(?:classic\.|www\.)?warcraftlogs\.com\/reports\/((?:a:)?\w+)/);
    if (urlmatch) reportId = urlmatch[1];
    if (!reportId || reportId.length !== 16 && reportId.length !== 18) {
        el.style.borderColor = "red";
        return;
    }
    el.style.borderColor = null;
    if (!(reportId in reports)) reports[reportId] = new Report(reportId);
    enableInput(false);
    reports[reportId].fetch().then(() => {
        for (let id in reports[reportId].fights) {
            let f = reports[reportId].fights[id];
            let el_f = document.createElement("option");
            el_f.value = reportId + ";" + id;
            el_f.textContent = f.name + " - " + id;
            el_fightSelect.appendChild(el_f);
            enableInput(true);
        }
    }).catch(printError);
}

function selectEnemy() {
    try {
        let el = document.querySelector("#enemySelect");
        let i = el.selectedIndex;
        if (i === -1) return;
        let s = el.options[i].value;
        let [reportId, fightId, enemyId] = s.split(";");
        let f = reports[reportId].fights[fightId];
        let u = f.enemies[enemyId];
        u.plot(reportId, f);
        let el_targetSelect = document.querySelector("#targetSelect");
        let j = el_targetSelect.selectedIndex;
        let prevSelection = "";	// Select the same entry in newly generated dropdown
        if (j !== -1) prevSelection = el_targetSelect.options[j].value.split(";")[3];
        el_targetSelect.innerHTML = "";
        j = 0;
        for (let k in u.threat) {
            let el_u = document.createElement("option");
            el_u.value = s + ";" + k;
            el_u.textContent = u.threat[k].target.name + " - " + u.threat[k].target.key;
            el_targetSelect.appendChild(el_u);
            if (k === prevSelection) el_targetSelect.selectedIndex = j;
            j += 1;
        }
        selectTarget();
    } catch (e) {
        printError(e);
    }
}

function selectTarget(target) {
    try {
        let el = document.querySelector("#targetSelect");
        let el_out = document.querySelector("#threatTableContainer");
        el_out.innerHTML = "";
        if (!target) {
            let i = el.selectedIndex;
            if (i === -1) return;
            target = el.options[i].value;
        } else {
            for (let i = 0; i < el.options.length; ++i) {
                if (el.options[i].value === target) {
                    el.selectedIndex = i;
                    break;
                }
            }
        }
        let [reportId, fightId, enemyId, targetId] = target.split(";");
        reports[reportId].fights[fightId].enemies[enemyId].threat[targetId].tabulate(el_out);
    } catch (e) {
        printError(e);
    }
}

function enableInput(enable = true) {
    let a = ["input", "button", "select"].map(s => document.querySelectorAll(s));
    for (let b of a) {
        for (let el of b) {
            el.disabled = !enable;
        }
    }
}

function createCheckbox(el_out, checked, text, callback) {
    let el_checkbox = document.createElement("input");
    let el_label = document.createElement("label");
    el_checkbox.type = "checkbox";
    el_checkbox.className = "checkbox";
    el_checkbox.checked = checked;
    el_checkbox.onchange = () => callback(el_checkbox.checked);
    el_label.textContent = text;
    el_out.appendChild(el_checkbox);
    el_out.appendChild(el_label);
}

function selectFight(index) {
    let el = document.querySelector("#fightSelect");
    let el_enemySelect = document.querySelector("#enemySelect");
    let i;
    if (index)
        i = index;
    else
        i = el.selectedIndex;
    if (i === -1) return;
    let s = el.options[i].value;
    let [reportId, fightId] = s.split(";");
    let f = reports[reportId].fights[fightId];
    enableInput(false);
    f.fetch().then(() => {
        f.process();
        let j = el_enemySelect.selectedIndex;
        let prevSelection = "";
        if (j !== -1) prevSelection = el_enemySelect.options[j].value;
        j = 0;
        el_enemySelect.innerHTML = "";
        for (let k in f.enemies) {
            let u = f.enemies[k];
            let el_u = document.createElement("option");
            el_u.value = reportId + ";" + fightId + ";" + k;
            el_u.textContent = u.name + " - " + k;
            el_enemySelect.appendChild(el_u);
            if (el_u.value === prevSelection) el_enemySelect.selectedIndex = j;
            j += 1;
        }
        selectEnemy();
        enableInput(true);
    }).catch(printError);
}
