(() => {
  const observer = new MutationObserver(() => {
    const bigTabContainer = document.getElementById("top-level-view-tabs");
    if (!bigTabContainer || document.getElementById("overall-crit-toggle-wrap")) return;

    let toggleWrapper = document.createElement("label");
    toggleWrapper.id = "overall-crit-toggle-wrap";
    toggleWrapper.className = "big-tab view-type-tab";
    toggleWrapper.style.cssText = "display: inline-flex; align-items: center; gap: 6px; cursor: pointer; padding: 0 10px;";

    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = "overall-crit-toggle-input";

    let spanText = document.createElement("span");
    spanText.className = "big-tab-text";
    spanText.innerText = "Overall Crit %";

    toggleWrapper.appendChild(checkbox);
    toggleWrapper.appendChild(spanText);
    bigTabContainer.appendChild(toggleWrapper);

    checkbox.addEventListener("change", (e) => {
      toggleOverallCrit(e.target.checked);
    });
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function toggleOverallCrit(showOverall) {
    const tables = document.querySelectorAll("table[id^='main-table-']");

    tables.forEach((table) => {
      // Get direct <th> children to avoid inner table headers
      const headerRow = table.querySelector("thead tr");
      if (!headerRow) return;

      const headers = Array.from(headerRow.children);

      const critColIndex = headers.findIndex(th => th.innerText.includes("Crit %"));
      const missColIndex = headers.findIndex(th => th.innerText.includes("Miss %"));

      if (critColIndex === -1) return;

      const rows = table.querySelectorAll("tbody tr");

      rows.forEach((row) => {
        // Direct td children ONLY (ignores td elements inside the Name column's inner table)
        const cells = Array.from(row.children);

        if (cells.length <= critColIndex) return;

        const critCell = cells[critColIndex];
        const missCell = missColIndex !== -1 ? cells[missColIndex] : null;

        // Store pristine initial HTML and values once
        if (!critCell.dataset.originalHtml) {
          critCell.dataset.originalHtml = critCell.innerHTML;
          critCell.dataset.baseCrit = parseFloat(critCell.innerText.replace("%", "").trim());
        }

        if (missCell && !missCell.dataset.baseMiss) {
          const parsedMiss = parseFloat(missCell.innerText.replace("%", "").trim());
          missCell.dataset.baseMiss = !isNaN(parsedMiss) ? parsedMiss : 0;
        }

        if (!showOverall) {
          critCell.innerHTML = critCell.dataset.originalHtml;
          return;
        }

        // Always read from static stored data
        const landedCritPct = parseFloat(critCell.dataset.baseCrit);
        const missPct = missCell ? parseFloat(missCell.dataset.baseMiss) : 0;

        if (isNaN(landedCritPct)) return;

        // Math: Landed Crit % * (1 - (Miss% / 100))
        const overallCrit = (landedCritPct * (1 - (missPct / 100))).toFixed(1);

        critCell.innerHTML = `<span style="color: #ffb834; font-weight: bold;">${overallCrit}%</span>`;
      });
    });
  }
})();