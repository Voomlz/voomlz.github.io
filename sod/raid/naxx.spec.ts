import { test, expect } from "@playwright/test";
import { loadTargetFromReport } from "../../_test/helpers";

// Run the local server with `npm run start`
test.describe("/sod/ threat values - Naxx mechanics", () => {
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
      "44;160;15" // Patchwerk - Dedgame
    );

    await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Tombah - Started fight with threat coeff 1.45"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 74.48 seconds"
          - row "Earth Shock	221192.28	2969.70"
          - row "Lava Burst	157718.82	2117.51"
          - row "Flame Shock	137968.08	1852.34"
          - row "Lightning Shield	59093.88	793.39"
          - row "Melee	38137.32	512.03"
          - row "Damage Shield Dmg +80	22999.32	308.79"
          - row "Splintered Shield	16138.50	216.67"
          - row "Dragonbreath Chili	13709.46	184.06"
          - row "Shamanistic Rage	11141.40	149.58"
          - row "Hateful Strike	5600.00	75.18"
          - row "Maelstrom Weapon	4698.00	63.07"
          - row "Defender's Resolve	2610.00	35.04"
          - row "Shield Mastery	1825.80	24.51"
          - row "Elemental Devastation	939.60	12.61"
          - row "Stormbraced	626.40	8.41"
          - row "Flurry	522.00	7.01"
          - row "Clearcasting	208.80	2.80"
          - row "Maelstrom Ready!	208.80	2.80"
          - row "Total	695338.46	9335.53"
      `);
  });
});
