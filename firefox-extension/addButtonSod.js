let url =
  "https://voomlz.github.io/sod/?id=" + location.origin + location.pathname;
let bigTabContainer = document.getElementById("top-level-view-tabs");
let anchor = document.createElement("a");

let spanText = document.createElement("span");
spanText.className = "big-tab-text";
spanText.style = "position: relative";
spanText.innerHTML = `<span style="
    position: absolute;
    color: red;
    font-weight: bold;
    transform: rotate(-8deg);
    left: 0;
    top: 8px;
    font-size: 10px;
">BETA</span>
<br> Threat Graph`;
spanText.class = "big-tab view-type-tab selected";

let spanIcon = document.createElement("span");
spanIcon.className = "zmdi zmdi-chart";
spanIcon.class = "big-tab view-type-tab selected";

anchor.href = url;
anchor.id = "threat-graph-link";
anchor.className = "big-tab view-type-tab";
anchor.appendChild(spanIcon);
anchor.appendChild(spanText);

bigTabContainer.appendChild(anchor);
