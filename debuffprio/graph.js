
let vertices = null;
let edges = null;
let fetchPromise = Promise.all([
	fetch("vertices.json").then(x=>x.json()).then(x=>vertices=x),
	fetch("edges.json").then(x=>x.json()).then(x=>edges=x),
]);

let style = [
	{
		selector: "node[name]",
		style: {
			label: "data(name)",
			"border-width": 0.5,
			"border-color": "#000",
		},
	},
	{
		// Later set to select nodes whose fades are not shown
		style: {
			"background-color": "#a00",
		}
	},
	{
		selector: "node:selected",
		style: {
			"background-color": "#44f",
		}
	},
	{
		selector: "edge",
		style: {
			width: 1,
		},
	},
	{
		selector: "edge[exception]",
		style: {
			"line-color": "#a00",
		}
	}
];

function dfsTraverse(path, cycles, traversed = {}) {
	let current = path[path.length-1];
	if (current.id() in traversed) return;
	traversed[current.id()] = true;
	let neighbours = current.outgoers(x=>x.group() === "nodes");
	neighbours.each(node=>dfsTraverse([...path, node], cycles, traversed));
	let neighbourIds = {};
	neighbours.each(node=>{
		neighbourIds[node.id()] = true;
	});
	let i = 0;
	let currentCycles = [];
	for (; i < path.length; ++i) {
		if (i == path.length - 1 || path[i].id() in neighbourIds) {
			currentCycles.push(path.slice(i));
			for (; i < path.length; ++i) {
				if (path[i].id() in cycles && !currentCycles.includes(cycles[path[i].id()])) {
					currentCycles.push(cycles[path[i].id()]);
				}
			}
		}
	}
	let cycle = [];
	lookup = {};
	for (let c of currentCycles) {
		for (let node of c) {
			let id = node.id();
			if (id in lookup) continue;
			lookup[id] = true;
			cycle.push(node);
			cycles[id] = cycle;
		}
	}
}

let layout = {
	name: "preset",
}
function setLayout(cycleArray, cyclePriorities) {
	const totalWidth = 3000;
	const layerHeight = 400;
	const layerPadding = 200;
	let layers = [];
	for (let i = 0; i < cyclePriorities.length; ++i) {
		let j = cyclePriorities[i];
		while (layers.length <= j) layers.push({numNodes: 0, cycles: []});
		layers[j].cycles.push(i);
		layers[j].numNodes += cycleArray[i].length;
	}
	let positions = {};
	for (let i = 0; i < layers.length; ++i) {
		let left = 0;
		const y0 = i * (layerHeight + layerPadding);
		for (let j = 0; j < layers[i].cycles.length; ++j) {
			const cycle = cycleArray[layers[i].cycles[j]];
			const width = totalWidth * cycle.length / layers[i].numNodes;
			const x0 = left + width / 2;
			if (cycle.length === 1) {
				positions[cycle[0].id()] = {x: x0, y: -y0 + (layerHeight / 2) * (j % 5 - 2) / 4};
			} else {
				for (let k = 0; k < cycle.length; ++k) {
					const a = 2 * Math.PI * (.25 + k / cycle.length);
					positions[cycle[k].id()] = {x: x0 + (width / 2) * Math.cos(a), y: -y0 - (layerHeight / 2) * Math.sin(a)};
				}
			}
			left += width;
		}
	}
	layout.positions = positions;
}

function findNodePriorities(nodes) {
	let cycles = {};
	nodes.each(x=>dfsTraverse([x], cycles));
	let cycleArray = [];
	for (let k in cycles) {
		let c = cycles[k];
		if (!cycleArray.includes(c)) cycleArray.push(c);
	}
	let cycleEdges = [];
	for (let i = 0; i < cycleArray.length; ++i) {
		cycleEdges.push([]);
		let cycle = cycleArray[i];
		let edges = cycleEdges[i];
		let targets = {};
		for (let node of cycle) {
			node.incomers(x=>x.group() === "nodes").each(n=>targets[n.id()] = true);
		}
		for (let j = 0; j < cycleArray.length; ++j) {
			if (j === i) continue;
			for (let node of cycleArray[j]) {
				if (node.id() in targets) {
					edges.push(j);
					break;
				}
			}
		}
	}
	let incomingDegrees = [];
	for (let i = 0; i < cycleEdges.length; ++i) {
		incomingDegrees.push(0);
	}
	for (let a of cycleEdges) for (let b of a) incomingDegrees[b] += 1;
	let breadth = [];
	for (let i = 0; i < incomingDegrees.length; ++i) {
		if (incomingDegrees[i] === 0) breadth.push(i);
	}
	let cyclePriorities = [];
	for (let i = 0; i < cycleEdges.length; ++i) cyclePriorities.push(null);
	for (let prio = 0; breadth.length && prio < 20; ++prio) {
		let nextBreadth = [];
		for (let i of breadth) {
			cyclePriorities[i] = prio;
			for (let j of cycleEdges[i]) {
				if (!nextBreadth.includes(j)) nextBreadth.push(j);
			}
		}
		breadth = nextBreadth;
	}
	for (let i = 0; i < cycleArray.length; ++i) {
		for (let node of cycleArray[i]) {
			node.data("debuffPriority", cyclePriorities[i]);
		}
	}
	setLayout(cycleArray, cyclePriorities);
}

function spellNodeToString(node) {
	return node.id() + " - " + node.data("name");
}

function addGraphButton(cy, targetElement, selects, text) {
	if (!text) {
		if (selects.group() == "nodes") {
			if ("containerNode" in selects.data()) {
				text = selects.id();
			} else {
				text = spellNodeToString(selects);
			}
		} else {
			text = spellNodeToString(selects.source()) + " -> " + spellNodeToString(selects.target());
		}
	}
	let el_b = document.createElement("button");
	el_b.textContent = text;
	el_b.addEventListener("click", function(){
		cy.$(":selected").unselect();
		selects.select();
	});
	let el_div = document.createElement("div");
	el_div.appendChild(el_b);
	targetElement.appendChild(el_div);
	return el_div;
}

function addText(el, s) {
	let a = s.split("\n");
	for (let i = 0; i < a.length; ++i) {
		if (i) el.appendChild(document.createElement("br"));
		if (a[i]) el.appendChild(document.createTextNode(a[i]));
	}
}

function getTrackedFades() {
	let els = document.querySelectorAll(".tracked-fade");
	let r = {};
	for (let i = 0; i < els.length; ++i) {
		let checkbox = document.getElementById(els[i].htmlFor);
		if (!checkbox.checked) continue;
		r[els[i].textContent] = true;
	}
	return r;
}

function getReferState() {
	let s = location.hash;
	if (!s || s.length <= 1) return "";
	return s.substring(1);
}

const edgeExceptions = {
	16528: {
		6343: true,
		8198: true,
		8204: true,
		8205: true,
		11580: true,
		11581: true,
	},
};

let removeEdge;
function generateGraph() {
	let el_info = document.querySelector("#info");
	let elements = [];
	const mergeRanks = document.querySelector("#merge-ranks").checked;
	let trackedFades = getTrackedFades();
	style[1].selector = "node[!containerNode]";
	for (let type in trackedFades) style[1].selector += `[type != "${type}"]`;
	for (let id in vertices) {
		if (mergeRanks && "maxRank" in vertices[id] && vertices[id].maxRank != id) continue;
		let v = {data: {id: id, name: vertices[id].name, type: vertices[id].type}};
		elements.push(v);
	}
	let edgeMap = {};
	let storedExceptions = [];
	for (let a in edges) {
		for (let b in edges[a]) {
			if (!(vertices[b].type in trackedFades)) continue;
			if (mergeRanks) {
				let a2 = ("maxRank" in vertices[a]) ? vertices[a].maxRank : a;
				let b2 = ("maxRank" in vertices[b]) ? vertices[b].maxRank : b;
				let key = a2 + "-" + b2;
				if (key in edgeMap) {
					edgeMap[key].data.wcl.push(...edges[a][b]);
				} else {
					let e = {data: {source: a2, target: b2, wcl: edges[a][b]}};
					edgeMap[key] = e;
					if (a2 in edgeExceptions && b2 in edgeExceptions[a2]) {
						e.data.exception = true;
						storedExceptions.push(e);
					} else {
						elements.push(e);
					}
				}
			} else {
				let e = {data: {source: a, target: b, wcl: edges[a][b]}};
				if (a in edgeExceptions && b in edgeExceptions[a]) {
					e.data.exception = true;
					storedExceptions.push(e);
				} else {
					elements.push(e);
				}
			}
		}
	}
	let el_splash = document.querySelector("#splash");
	el_splash.textContent = "Generating graph...";
	el_splash.style.display = null;
	setTimeout(function(){
		let cy = cytoscape({
			container: document.querySelector("#cy"),
			style: style,
		});
		cy.batch(function(){
			cy.add(elements);
			findNodePriorities(cy.nodes());
			let priorities = {};
			cy.nodes().each(function(n){
				let p = n.data("debuffPriority");
				let id = "priority" + p;
				if (!(p in priorities)) {
					cy.add({data: {id: id, containerNode: true}});
					priorities[p] = true;
				}
				n.move({parent: id});
			});
			cy.add(storedExceptions);
		});

		cy.layout(layout).run();
		cy.$("edge").on("select", function(e){
			el_info.innerHTML = "";
			e = e.target;
			let source = e.source();
			let target = e.target();
			let referState = source.id() + "-" + target.id();
			if (getReferState() != referState) history.pushState(null, referState, "#" + referState);
			addGraphButton(cy, el_info, source);
			addText(el_info, "pushes off\n");
			addGraphButton(cy, el_info, target);
			if ("exception" in e.data()) {
				addText(el_info, "\nThis edge is flagged as an exception and is not considered in debuff priority detection.\n");
			}
			addText(el_info, "\nLogs\n");
			for (let url of e.data("wcl")) {
				let el_a = document.createElement("a");
				el_a.href = url;
				el_a.textContent = url.match(/reports\/(\w+)/)[1];
				el_a.target = "_blank";
				el_info.appendChild(el_a);
				el_info.appendChild(document.createElement("br"));
			}
			document.querySelector("#sidebar").scroll(0,0);
			removeEdge = ()=>{delete edges[source.id()][target.id()];generateGraph()};
		});
		cy.$("node").on("select", function(e){
			let id = e.target.id();
			if (getReferState() != id) history.pushState(null, id, "#" + id);
			if ("containerNode" in e.target.data()) {
				el_info.innerHTML = `${id}<br><br>Contains:<br>`;
				cy.nodes(`#${id} node`).each(n=>addGraphButton(cy, el_info, n));
			} else {
				const sortFunc = (a,b) => (a.source().id() - b.source().id()) || (a.target().id() - b.target().id());
				let out = e.target.outgoers("edge").sort(sortFunc);
				let inc = e.target.incomers("edge").sort(sortFunc);
				el_info.innerHTML = `<a href="https://classic.wowhead.com/spell=${e.target.id()}" target="_blank">${e.target.id()} - ${e.target.data("name")}</a><br>`;
				let parent = e.target.parent();
				if (parent) addGraphButton(cy, el_info, parent);
				addText(el_info, "\n");
				if (!(e.target.data("type") in trackedFades)) addText(el_info, "This spell is flagged as " + e.target.data("type") + ", so its removal is not shown.\n\n");
				addText(el_info, "Pushes off:\n");
				out.each(n=>addGraphButton(cy, el_info, n));
				addText(el_info, "\nPushed off by:\n");
				inc.each(n=>addGraphButton(cy, el_info, n))
			}
			document.querySelector("#sidebar").scroll(0,0);
		});
		function listDebuffs() {
			setTimeout(function(){
				if (cy.$(":selected").length) return;
				if (getReferState() != "") history.pushState(null, "", location.pathname);
				el_info.innerHTML = "";
				let els = [];
				cy.$("node").each(n=>els.push(addGraphButton(cy, el_info, n)));
				let el_s = document.createElement("input");
				el_s.type = "text";
				el_s.id = "search";
				el_s.placeholder = "Search...";
				el_info.insertBefore(document.createElement("br"), el_info.firstChild);
				el_info.insertBefore(el_s, el_info.firstChild);
				el_s.addEventListener("change", function(){
					let s = el_s.value;
					for (let e of els) {
						let d = "none";
						if (e.textContent.match(new RegExp(s,"i"))) d = "inherit";
						e.style.display = d;
					}
				});
				document.querySelector("#sidebar").scroll(0,0);
			}, 0);
		}
		cy.on("tapunselect", listDebuffs);
		function selectReferredState() {
			cy.$(":selected").unselect();
			let state = getReferState();
			if (!state) {
				listDebuffs();
			} else {
				let a = state.split("-");
				let sel = [];
				if (a.length == 1) {
					sel = cy.$(`node[id = "${a[0]}"]`);
				} else {
					sel = cy.$(`edge[source = "${a[0]}"][target = "${a[1]}"]`);
				}
				if (sel.length) {
					sel.select()
				} else {
					listDebuffs();
				}
			}
		}
		cy.ready(selectReferredState);
		if (generateGraph.popevent) removeEventListener("popstate", generateGraph.popevent);
		generateGraph.popevent = selectReferredState;
		addEventListener("popstate", selectReferredState);
		el_splash.style.display = "none";
	}, 50);
}

function main() {
	fetchPromise.then(function(){
		let el_options = document.querySelector("#options");
		addText(el_options, "\nShow fades for:\n(everything except other have false positives)");
		let vertexTypes = {};
		for (let id in vertices) {
			vertexTypes[vertices[id].type] = true;
		}
		for (let type in vertexTypes) {
			let id = "track-" + type;
			let el_div = document.createElement("div");
			let el_checkbox = document.createElement("input");
			let el_label = document.createElement("label");
			el_checkbox.type = "checkbox";
			el_checkbox.id = id;
			el_checkbox.onchange = generateGraph;
			if (type == "other") el_checkbox.checked = true;
			el_label.htmlFor = id;
			el_label.className = "tracked-fade";
			el_label.textContent = type;
			el_div.appendChild(el_checkbox);
			el_div.appendChild(el_label);
			el_options.appendChild(el_div);
		}
		generateGraph();
	});
}
