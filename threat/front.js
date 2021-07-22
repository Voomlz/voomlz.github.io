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
function showAndHideTutorial() {
    showAndHide("tutorial");
}

function loadPage() {
    scroll(0, 0);

    const idParam = getParameterByName('id');
    const fightParam = getParameterByName('fightId');
    const enemyParam = getParameterByName('enemy');
    const targetParam = getParameterByName('target');

    if (idParam) {
        document.getElementById("reportSelect").value = idParam;
        selectReport();
    }
    if (fightParam) {
        document.getElementById("fightSelect").selectedIndex = fightParam;
        selectFight();
    }
    if (enemyParam) {
        document.getElementById("enemySelect").selectedIndex = enemyParam;
        selectEnemy();
    }

    if (targetParam) {
        let [reportId, fightId, enemyId, targetId] = targetParam.split(";");
        document.getElementById("targetSelect").selectedIndex = targetId;
        //selectTarget(targetId);
    }

}

function setParamAndReload() {

    let el_reportId = document.querySelector("#reportSelect").value;
    let i = document.querySelector("#fightSelect").selectedIndex;

    let el_fightSelect;
    if (i === -1) el_fightSelect = "";
    else el_fightSelect = document.querySelector("#fightSelect").options[i].value;

    i = document.querySelector("#enemySelect").selectedIndex;
    let el_enemySelect;
    if (i === -1) el_enemySelect = "";
    else el_enemySelect = document.querySelector("#enemySelect").options[i].value;


    i = document.querySelector("#targetSelect").selectedIndex;
    let el_targetSelect;
    if (i === -1) el_targetSelect = "";
    else el_targetSelect = document.querySelector("#targetSelect").options[i].value;

    const idParam = getParameterByName('id');
    const fightParam = getParameterByName('fight');
    const enemyParam = getParameterByName('enemy');
    const targetParam = getParameterByName('target');

    console.log("el_reportId " + el_reportId);
    console.log("el_fightSelect " + el_fightSelect);
    console.log("el_enemySelect " + el_enemySelect);
    console.log("el_targetSelect " + el_targetSelect);

    console.log("idParam " + idParam);
    console.log("fightParam " + fightParam);
    console.log("enemyParam " + enemyParam);
    console.log("targetParam " + targetParam);

    let b = el_reportId == idParam;
    let b1 = el_fightSelect == fightParam;
    let b2 = el_enemySelect == enemyParam;
    let b3 = el_targetSelect == targetParam;

    console.log("idParam " + b);
    console.log("fightParam " + b1);
    console.log("enemyParam " + b2);
    console.log("targetParam " + b3);

    console.log("idParam null " + idParam == null);
    console.log("fightParam null " + fightParam == null);
    console.log("enemyParam null " + enemyParam == null);
    console.log("targetParam null " + targetParam == null);

    if ((el_reportId == "" || el_reportId == idParam) &&
        (el_fightSelect == "" || el_fightSelect == fightParam) &&
        (el_enemySelect == "" || el_enemySelect == enemyParam) &&
        (el_targetSelect == "" || el_targetSelect == targetParam)) {

        console.log("No change, don't reload");
        return;
    }

    let url = location.origin + location.pathname;

    if (el_reportId) {
        url = url + '?id=' + el_reportId;
    }
    if (el_fightSelect) {
        url = url + '&fight=' + el_fightSelect;
    }
    if (el_enemySelect) {
        url = url + '&enemy=' + el_enemySelect;
    }
    if (el_targetSelect) {
        url = url + '&target=' + el_targetSelect;
    }

    console.log("Reload : " + url);
    location.href = url;
}

function redirectToThreat() {
    location.href = location.origin + location.pathname + "/threat";
}
