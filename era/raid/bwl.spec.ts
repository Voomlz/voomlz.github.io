import { test, expect } from "@playwright/test";
import { loadTargetFromReport } from "../../_test/helpers";

// Run the local server with `npm run start`
test.describe("/era/ threat values - BWL mechanics", () => {
  test("BWL - Nefarian - Warrior class call", async ({ page }) => {
    await loadTargetFromReport(
      page,
      "http://127.0.0.1:8080/era/?id=https://vanilla.warcraftlogs.com/reports/kTAJXcx7P6ZnrjbG",
      "28;101;32" // Nefarian - Amí
    );

    await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
        - textbox
        - text: "Amí - Started fight with threat coeff 1.495"
        - table:
            - rowgroup:
                - row "Ability        Threat (*)  Per 97.34 seconds"
            - row "Heroic Strike	90313.28	927.84"
            - row "Melee	36150.53	371.40"
            - row "Execute	35584.00	365.58"
            - row "Bloodthirst	18217.89	187.16"
            - row "Revenge	8543.92	87.78"
            - row "Electric Discharge	1523.25	15.65"
            - row "Whirlwind	480.00	4.93"
            - row "Sunder Armor	390.19	4.01"
            - row "Judgement of Light	302.74	3.11"
            - row "Unbridled Wrath	170.11	1.75"
            - row "Bloodrage	70.00	0.72"
            - row "Demoralizing Shout	64.29	0.66"
            - row "Total	191810.21	1970.58"
        `);
  });

  test("BWL - Nefarian - Druid class call", async ({ page }) => {
    await loadTargetFromReport(
      page,
      "http://127.0.0.1:8080/era/?id=https://vanilla.warcraftlogs.com/reports/WXKGAVjrx3D2vqw6",
      "31;110;14" // Nefarian - Miskovsky
    );

    await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
        - textbox
        - text: "Miskovsky - Started fight with threat coeff 1.45"
        - table:
            - rowgroup:
                - row "Ability        Threat (*)  Per 123.61 seconds"
            - row "Maul	86615.03	700.72"
            - row "Melee	18594.81	150.43"
            - row "Shred	4518.44	36.55"
            - row "Ferocious Bite	1569.81	12.70"
            - row "Faerie Fire (Feral)	1406.16	11.38"
            - row "Claw	329.44	2.67"
            - row "Swipe	296.89	2.40"
            - row "Furor	120.83	0.98"
            - row "Earthstrike	29.00	0.23"
            - row "Slayer's Crest	29.00	0.23"
            - row "Total	113509.41	918.30"
        `);
  });
});
