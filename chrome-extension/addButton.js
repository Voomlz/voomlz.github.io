let url = "https://voomlz.github.io/threat?id=" + location.origin + location.pathname;
let bigTabContainer = document.getElementById("top-level-view-tabs-container");
let anchor = document.createElement("a");
let span = document.createElement("span");
span.className = "big-tab-text";
span.textContent = "Threat Graph";
anchor.href = url;
//anchor.innerText = 'Go to Google';
anchor.appendChild(span)
bigTabContainer.appendChild(anchor)
