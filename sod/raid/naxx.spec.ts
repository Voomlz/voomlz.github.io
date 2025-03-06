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
      - text: "Enzad - Started fight with threat coeff 0.8122"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 71.61 seconds"
          - row "Heroic Strike	211923.35	2959.29"
          - row "Shield Slam	191634.96	2675.98"
          - row "Devastate	102476.36	1430.97"
          - row "Deep Wound	70592.53	985.75"
          - row "Revenge	54002.27	754.08"
          - row "Damage Shield Dmg +80	36779.09	513.58"
          - row "Execute	35661.71	497.98"
          - row "Melee	34225.08	477.92"
          - row "Splintered Shield	24852.05	347.03"
          - row "Sunder Armor	8120.75	113.40"
          - row "Hateful Strike	6400.00	89.37"
          - row "Gift of Arthas	1936.63	27.04"
          - row "Wild Strike	1242.35	17.35"
          - row "Defender's Resolve	1089.54	15.21"
          - row "Defensive Forecast	416.32	5.81"
          - row "Gri'lek's Guard	254.08	3.55"
          - row "Bloodrage	210.10	2.93"
          - row "Battle Forecast	194.93	2.72"
          - row "Greater Stoneshield	104.08	1.45"
          - row "Rampage	104.08	1.45"
          - row "Total	782220.28	10922.88"
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
      - text: "Baldbulla - Started fight with threat coeff 1.797"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 71.61 seconds"
          - row "Searing Pain	353759.21	4939.87"
          - row "Shadow Cleave	43590.94	608.70"
          - row "Hateful Strike	6400.00	89.37"
          - row "Melee	5702.03	79.62"
          - row "Drain Life	4981.41	69.56"
          - row "Dance of the Wicked	2719.49	37.97"
          - row "Shadow and Flame	1832.99	25.60"
          - row "Defender's Resolve	970.40	13.55"
          - row "Spreading Pain	970.40	13.55"
          - row "Demonic Grace	646.94	9.03"
          - row "Fel Armor	437.58	6.11"
          - row "The Burrower's Shell	107.82	1.51"
          - row "Total	422119.20	5894.45"
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
      - text: "Tombah - Started fight with threat coeff 4.1641"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 74.48 seconds"
          - row "Earth Shock	529348.52	7106.97"
          - row "Lava Burst	377446.37	5067.55"
          - row "Flame Shock	330179.69	4432.95"
          - row "Lightning Shield	141421.11	1898.70"
          - row "Melee	91268.71	1225.36"
          - row "Damage Shield Dmg +80	55041.05	738.97"
          - row "Splintered Shield	38622.01	518.53"
          - row "Dragonbreath Chili	32808.93	440.49"
          - row "Hateful Strike	18400.00	247.04"
          - row "Shamanistic Rage	16377.45	219.88"
          - row "Maelstrom Weapon	11243.07	150.95"
          - row "Defender's Resolve	6246.15	83.86"
          - row "Shield Mastery	3571.15	47.95"
          - row "Elemental Devastation	2248.61	30.19"
          - row "Stormbraced	1499.08	20.13"
          - row "Flurry	1249.23	16.77"
          - row "Clearcasting	499.69	6.71"
          - row "Maelstrom Ready!	499.69	6.71"
          - row "Total	1657970.51	22259.72"
      `);
    });

    test("Patchwerk - Druid Tank - Seal Rank 5", async ({ page }) => {
      await loadTargetFromReport(
        page,
        "http://127.0.0.1:8080/sod/?id=https://sod.warcraftlogs.com/reports/Gx1TbcvwNYDm2kjV",
        "37;102;3" // Patchwerk - Miruqui
      );

      await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Miruqui - Started fight with threat coeff 2.175"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 84.26 seconds"
          - row "Maul	621473.08	7376.01"
          - row "Lacerate	533917.91	6336.85"
          - row "Mangle	263544.75	3127.90"
          - row "Frenzied Regeneration	149111.48	1769.74"
          - row "Melee	80292.30	952.96"
          - row "Damage Shield Dmg +80	55662.60	660.64"
          - row "Tooth and Claw	52302.23	620.75"
          - row "Hateful Strike	32800.00	389.29"
          - row "Damage Shield Dmg +20	6844.73	81.24"
          - row "Thorns	6046.50	71.76"
          - row "Defender's Resolve	3132.00	37.17"
          - row "Gore	2246.50	26.66"
          - row "Animal Fury	2218.50	26.33"
          - row "Wild Strike	2088.00	24.78"
          - row "Primal Fury	1250.00	14.84"
          - row "Natural Reaction	325.00	3.86"
          - row "Berserk	261.00	3.10"
          - row "Survival Instincts	261.00	3.10"
          - row "Total	1813777.57	21526.98"
      `);
    });

    test("Seal buff but not in Naxx", async ({ page }) => {
      await loadTargetFromReport(
        page,
        "http://127.0.0.1:8080/sod/?id=https://sod.warcraftlogs.com/reports/RQThY9wLgBzytDV4",
        "56;106;18" // Ouro - Jeeraya
      );

      await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Jeeraya - Started fight with threat coeff 1.495"
      `);
    });
  });
});
