function showAndHide(div) {
    var x = document.getElementById(div);
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}
function showAndHideDisclaimer() {
    showAndHide("disclaimer");
}
function showAndHideChangelog() {
    showAndHide("changelog");
}