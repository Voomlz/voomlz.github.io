let url = "https://voomlz.github.io?id=" + location.origin + location.pathname;
let bigTabContainer = document.getElementById("top-level-view-tabs-container");
let anchor = document.createElement("a");
let span = document.createElement("span");
span.className = "big-tab-text";
span.textContent = "Threat Graph";
anchor.href = url;
anchor.appendChild(span)
bigTabContainer.appendChild(anchor)
