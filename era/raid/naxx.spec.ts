import { test, expect } from "@playwright/test";
import { loadTargetFromReport } from "../../_test/helpers";

// Run the local server with `npm run start`
test.describe("/era/ threat values - Naxx mechanics", () => {
  test("Patchwerk - Hateful Strike", async ({ page }) => {
    await loadTargetFromReport(
      page,
      "http://127.0.0.1:8080/era/?id=https://vanilla.warcraftlogs.com/reports/qXDrpmFfHg3dNjzt",
      "22;223;31" // Patchwerk - Wftestthree
    );

    await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Wftestthree - Started fight with threat coeff 1.0465"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 81.30 seconds"
          - row "Heroic Strike	73234.07	900.84"
          - row "Hateful Strike	31200.00	383.79"
          - row "Bloodthirst	14981.02	184.28"
          - row "Revenge	10888.46	133.94"
          - row "Battle Shout	1838.85	22.62"
          - row "Gift of Arthas	1614.60	19.86"
          - row "Melee	830.32	10.21"
          - row "Sunder Armor	780.39	9.60"
          - row "Bloodrage	157.13	1.93"
          - row "Unbridled Wrath	95.42	1.17"
          - row "Kiss of the Spider	89.70	1.10"
          - row "Total	135709.95	1669.35"
      `);
  });

  test("Thaddius - Feugen - Magnetic pull", async ({ page }) => {
    await loadTargetFromReport(
      page,
      "http://127.0.0.1:8080/era/?id=https://vanilla.warcraftlogs.com/reports/qXDrpmFfHg3dNjzt",
      "28;233;38" // Thaddius - Feugen - Tragortf
    );

    await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Tragortf - Started fight with threat coeff 1.495"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 131.78 seconds"
          - row "Magnetic Pull	36823.47	279.43"
          - row "Heroic Strike	9194.25	69.77"
          - row "Melee	2514.59	19.08"
          - row "Bloodthirst	1474.82	11.19"
          - row "Revenge	992.31	7.53"
          - row "Sunder Armor	390.19	2.96"
          - row "Judgement of Light	60.17	0.46"
          - row "Bloodrage	56.06	0.43"
          - row "Battle Shout	44.85	0.34"
          - row "Unbridled Wrath	30.00	0.23"
          - row "Total	51580.72	391.42"
      `);
  });

  test("4HM - Zeliek - Mark of Zeliek", async ({ page }) => {
    await loadTargetFromReport(
      page,
      "http://127.0.0.1:8080/era/?id=https://vanilla.warcraftlogs.com/reports/qXDrpmFfHg3dNjzt",
      "20;205;37" // 4HM - Zeliek - Znipsqt
    );

    await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Znipsqt - Started fight with threat coeff 1.495"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 70.61 seconds"
          - row "Heroic Strike	51238.13	725.64"
          - row "Melee	22773.34	322.52"
          - row "Bloodthirst	11976.45	169.61"
          - row "Revenge	2280.62	32.30"
          - row "Sunder Armor	1170.58	16.58"
          - row "Taunt	852.28	12.07"
          - row "Goblin Sapper Charge	810.29	11.48"
          - row "Deep Wound	432.05	6.12"
          - row "Judgement of Light	122.96	1.74"
          - row "Unbridled Wrath	41.67	0.59"
          - row "Battle Shout	22.42	0.32"
          - row "Slayer's Crest	22.42	0.32"
          - row "Bloodrage	18.69	0.26"
          - row "Mark of Zeliek	-74033.55	-1048.47"
          - row "Total	17728.37	251.07"
      `);
  });

  test("Loatheb - Fungal Bloom", async ({ page }) => {
    await loadTargetFromReport(
      page,
      "http://127.0.0.1:8080/era/?id=https://vanilla.warcraftlogs.com/reports/qXDrpmFfHg3dNjzt",
      "12;107;9" // Loatheb - Chosme
    );

    await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Chosme - Started fight with threat coeff 0.49"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 94.06 seconds"
          - row "Master of Elements	1046.50	11.13"
          - row "Scorch	1024.10	10.89"
          - row "Essence of Sapphiron	42.00	0.45"
          - row "Melee	30.80	0.33"
          - row "Combustion	29.40	0.31"
          - row "Blink	25.20	0.27"
          - row "Total	2198.00	23.37"
      `);
  });
});
