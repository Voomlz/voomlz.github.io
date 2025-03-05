import { test, expect } from "@playwright/test";
import { loadTargetFromReport } from "../_test/helpers";

// Run the local server with `npm run start`
test.describe("/fresh/ threat values", () => {
  test("Warrior Tank", async ({ page }) => {
    await loadTargetFromReport(
      page,
      "http://127.0.0.1:8080/fresh/?id=https://fresh.warcraftlogs.com/reports/ChFjn9a2rp7VkLg8",
      "9;85;3" // Lucifron - Bubztwo
    );

    await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Bubztwo - Started fight with threat coeff 1.495"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 21.91 seconds"
          - row "Heroic Strike 8675.22 395.88"
          - row "Bloodthirst 8279.59 377.82"
          - row "Melee 7138.72 325.76"
          - row "Cleave 6484.00 295.88"
          - row "Whirlwind 2635.00 120.24"
          - row "Execute 2448.00 111.71"
          - row "Goblin Sapper Charge 577.07 26.33"
          - row "Sunder Armor 390.19 17.81"
          - row "Unbridled Wrath 31.67 1.45"
          - row "Bloodrage 10.83 0.49"
          - row "Total 36670.30 1673.37"
      `);
  });

  test("Mage - Frost", async ({ page }) => {
    await loadTargetFromReport(
      page,
      "http://127.0.0.1:8080/fresh/?id=https://fresh.warcraftlogs.com/reports/ChFjn9a2rp7VkLg8",
      "9;85;40" // Lucifron - Zorkoa
    );

    await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Zorkoa - Started fight with threat coeff 0.7"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 21.91 seconds"
          - row "Frostbolt 5957.70 271.87"
          - row "Demonic Rune 688.50 31.42"
          - row "Presence of Mind 60.00 2.74"
          - row "Arcane Power 36.00 1.64"
          - row "Total 6742.20 307.67"
      `);
  });

  test("Warrior - DPS", async ({ page }) => {
    await loadTargetFromReport(
      page,
      "http://127.0.0.1:8080/fresh/?id=https://fresh.warcraftlogs.com/reports/ChFjn9a2rp7VkLg8",
      "9;85;20" // Lucifron - Hemorrhoid
    );

    await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Hemorrhoid - Started fight with threat coeff 0.8"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 21.91 seconds"
          - row "Melee 8188.80 373.68"
          - row "Execute 5081.00 231.86"
          - row "Heroic Strike 4840.00 220.86"
          - row "Bloodthirst 3553.33 162.15"
          - row "Cleave 1574.40 71.84"
          - row "Whirlwind 1133.00 51.70"
          - row "Goblin Sapper Charge 297.60 13.58"
          - row "Dragonbreath Chili 52.80 2.41"
          - row "Unbridled Wrath 33.33 1.52"
          - row "Total 24754.27 1129.61"
      `);
  });
});
