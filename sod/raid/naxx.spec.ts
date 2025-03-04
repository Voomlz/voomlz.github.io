import { test, expect } from "@playwright/test";
import { loadTargetFromReport } from "../../_test/helpers";

// Run the local server with `npm run start`
test.describe("/sod/ threat values - Naxx mechanics", () => {
  test.describe("special threat mechanics", () => {
    test("Patchwerk - Warrior - MT", async ({ page }) => {
      await loadTargetFromReport(
        page,
        "http://127.0.0.1:8080/sod/?id=https://sod.warcraftlogs.com/reports/ZGqcXNWmHKRPb842",
        "53;129;7" // Patchwerk - Enzad
      );

      await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Enzad - Started fight with threat coeff 0.56"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 71.61 seconds"
          - row "Heroic Strike	146113.73	2040.32"
          - row "Shield Slam	132125.59	1844.99"
          - row "Devastate	70653.86	986.61"
          - row "Deep Wound	48671.08	679.64"
          - row "Revenge	37232.68	519.92"
          - row "Damage Shield Dmg +80	25357.90	354.10"
          - row "Execute	24587.50	343.34"
          - row "Melee	23597.00	329.51"
          - row "Splintered Shield	17134.62	239.27"
          - row "Hateful Strike	6400.00	89.37"
          - row "Sunder Armor	5598.97	78.18"
          - row "Gift of Arthas	1335.24	18.65"
          - row "Wild Strike	856.56	11.96"
          - row "Defender's Resolve	751.20	10.49"
          - row "Defensive Forecast	287.04	4.01"
          - row "Gri'lek's Guard	221.76	3.10"
          - row "Bloodrage	169.70	2.37"
          - row "Battle Forecast	134.40	1.88"
          - row "Greater Stoneshield	71.76	1.00"
          - row "Rampage	71.76	1.00"
          - row "Total	541372.33	7559.69"
      `);
    });

    test("Patchwerk - Warlock - Hateful target", async ({ page }) => {
      await loadTargetFromReport(
        page,
        "http://127.0.0.1:8080/sod/?id=https://sod.warcraftlogs.com/reports/ZGqcXNWmHKRPb842",
        "53;129;21" // Patchwerk - Baldbulla
      );

      await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Baldbulla - Started fight with threat coeff 1.239"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 71.61 seconds"
          - row "Searing Pain	243904.58	3405.87"
          - row "Shadow Cleave	30054.42	419.68"
          - row "Hateful Strike	4800.00	67.03"
          - row "Melee	3931.35	54.90"
          - row "Drain Life	3434.51	47.96"
          - row "Dance of the Wicked	2150.28	30.03"
          - row "Shadow and Flame	1263.78	17.65"
          - row "Defender's Resolve	669.06	9.34"
          - row "Spreading Pain	669.06	9.34"
          - row "Demonic Grace	446.04	6.23"
          - row "Fel Armor	301.70	4.21"
          - row "The Burrower's Shell	74.34	1.04"
          - row "Total	291699.12	4073.27"
      `);
    });

    test("Patchwerk - Rogue MT", async ({ page }) => {
      await loadTargetFromReport(
        page,
        "http://127.0.0.1:8080/sod/?id=https://sod.warcraftlogs.com/reports/CNXHnFyDbqkahWpx",
        "44;160;8" // Patchwerk - Dedgame
      );

      await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Dedgame - Started fight with threat coeff 1.9097"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 74.48 seconds"
          - row "Sinister Strike	358072.43	4807.44"
          - row "Melee	294122.09	3948.85"
          - row "Unfair Advantage	175395.60	2354.84"
          - row "Eviscerate	138233.35	1855.90"
          - row "Riposte	47605.56	639.15"
          - row "Blunderbuss	28244.80	379.21"
          - row "Hateful Strike	24000.00	322.22"
          - row "Damage Shield Dmg +80	19246.18	258.40"
          - row "Poisoned Knife	17819.62	239.24"
          - row "Occult Poison II	16001.56	214.84"
          - row "Main Gauche	12848.61	172.50"
          - row "Blood Barrier	8425.70	113.12"
          - row "Rolling with the Punches	8135.42	109.23"
          - row "Relentless Strikes Effect	2240.00	30.07"
          - row "Wild Strike	1947.92	26.15"
          - row "Gift of Arthas	1203.13	16.15"
          - row "Burst of Energy	650.00	8.73"
          - row "Strikes of the Sinister	572.92	7.69"
          - row "Defender's Resolve	343.75	4.62"
          - row "Blade Dance	343.75	4.62"
          - row "Slice and Dice	229.17	3.08"
          - row "Evasion	114.58	1.54"
          - row "Blade Flurry	114.58	1.54"
          - row "Total	1155910.72	15519.12"
      `);
    });

    test("Patchwerk - Shaman - Hateful target", async ({ page }) => {
      await loadTargetFromReport(
        page,
        "http://127.0.0.1:8080/sod/?id=https://sod.warcraftlogs.com/reports/CNXHnFyDbqkahWpx",
        "44;160;15" // Patchwerk - Tombah
      );

      await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Tombah - Started fight with threat coeff 1.45"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 74.48 seconds"
          - row "Earth Shock	364967.26	4900.01"
          - row "Lava Burst	260236.05	3493.90"
          - row "Flame Shock	227647.33	3056.37"
          - row "Lightning Shield	97504.90	1309.09"
          - row "Melee	62926.58	844.84"
          - row "Damage Shield Dmg +80	37948.88	509.50"
          - row "Splintered Shield	26628.52	357.51"
          - row "Dragonbreath Chili	22620.61	303.70"
          - row "Hateful Strike	18400.00	247.04"
          - row "Shamanistic Rage	13584.36	182.38"
          - row "Maelstrom Weapon	7751.70	104.07"
          - row "Defender's Resolve	4306.50	57.82"
          - row "Shield Mastery	2640.12	35.45"
          - row "Elemental Devastation	1550.34	20.81"
          - row "Stormbraced	1033.56	13.88"
          - row "Flurry	861.30	11.56"
          - row "Maelstrom Ready!	344.52	4.63"
          - row "Clearcasting	344.52	4.63"
          - row "Total	1151297.06	15457.18"
      `);
    });
  });
});
