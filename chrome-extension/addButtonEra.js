let url =
  "https://voomlz.github.io/era/?id=" + location.origin + location.pathname;
let bigTabContainer = document.getElementById("top-level-view-tabs");

let spanText = document.createElement("span");
spanText.className = "big-tab-text";
spanText.appendChild(document.createElement("br"));
spanText.innerHTML = "<br> Threat Graph";
spanText.class = "big-tab view-type-tab selected";

let spanIcon = document.createElement("span");
spanIcon.className = "zmdi zmdi-chart";
spanIcon.class = "big-tab view-type-tab selected";

let anchor = document.createElement("a");
anchor.href = url;
anchor.target = "_blank";
anchor.id = "threat-graph-link";
anchor.className = "big-tab view-type-tab";
anchor.appendChild(spanIcon);
anchor.appendChild(spanText);

bigTabContainer.appendChild(anchor);
