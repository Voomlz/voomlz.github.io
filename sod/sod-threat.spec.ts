import { test, expect } from "@playwright/test";
import { loadTargetFromReport } from "../_test/helpers";

// Run the local server with `npm run start`
test.describe("/sod/ threat values", () => {
  test("Warrior Tank", async ({ page }) => {
    await loadTargetFromReport(
      page,
      "http://127.0.0.1:8080/sod/?id=https://sod.warcraftlogs.com/reports/JvA4KLpyZ1fxrPgN",
      "3;36;9" // The Prophet Skeram - Sheenftw
    );

    await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Sheenftw - Started fight with threat coeff 1.6445"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 107.19 seconds"
          - row "Shield Slam	67592.24	630.61"
          - row "Heroic Strike	45707.23	426.43"
          - row "Devastate	43380.27	404.72"
          - row "Melee	35522.84	331.42"
          - row "Deep Wound	30660.06	286.05"
          - row "Revenge	17649.60	164.66"
          - row "Thunderfury	14553.83	135.78"
          - row "Taunt	12941.48	120.74"
          - row "Sunder Armor	9871.93	92.10"
          - row "Cleave	3606.39	33.65"
          - row "Rallying Cry	2170.74	20.25"
          - row "Wild Strike	1907.62	17.80"
          - row "Defender's Resolve	1052.48	9.82"
          - row "Sword and Board	920.92	8.59"
          - row "Shield Bash	703.02	6.56"
          - row "Battle Shout	394.68	3.68"
          - row "Thorium Shield Spike	296.01	2.76"
          - row "Thorns	272.99	2.55"
          - row "Wrath of Wray	98.67	0.92"
          - row "Bloodrage	40.00	0.37"
          - row "Total	289342.99	2699.47"
      `);
  });

  test("Druid Tank", async ({ page }) => {
    await loadTargetFromReport(
      page,
      "http://127.0.0.1:8080/sod/?id=https://sod.warcraftlogs.com/reports/kTf82pHyXPwKtR41",
      "43;102;23" // Heigan the Unclean - Lucyol
    );

    await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Lucyol - Started fight with threat coeff 2.1031"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 77.26 seconds"
          - row "Maul	528334.71	6838.40"
          - row "Lacerate	330506.38	4277.85"
          - row "Mangle	292961.15	3791.89"
          - row "Tooth and Claw	72404.84	937.16"
          - row "Damage Shield Dmg +80	26683.88	345.38"
          - row "Melee	21051.83	272.48"
          - row "Thorns	3030.54	39.23"
          - row "Defender's Resolve	1169.38	15.14"
          - row "Gore	922.36	11.94"
          - row "Wild Strike	655.77	8.49"
          - row "Gift of Arthas	567.83	7.35"
          - row "Primal Fury	239.95	3.11"
          - row "Faerie Fire (Feral)	227.13	2.94"
          - row "Animal Fury	195.53	2.53"
          - row "Berserk	132.83	1.72"
          - row "Kiss of the Spider	126.18	1.63"
          - row "Natural Reaction	37.70	0.49"
          - row "Survival Instincts	11.47	0.15"
          - row "Total	1279259.46	16557.85"
      `);
  });

  test("Paladin Tank", async ({ page }) => {
    await loadTargetFromReport(
      page,
      "http://127.0.0.1:8080/sod/?id=https://sod.warcraftlogs.com/reports/JvA4KLpyZ1fxrPgN",
      "20;92;5" // Princess Huhuran - Neitsa
    );

    await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Neitsa - Started fight with threat coeff 2.85"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 86.47 seconds"
          - row "Seal of Martyrdom	158833.80	1836.78"
          - row "Melee	108772.50	1257.86"
          - row "Hammer of the Righteous	51915.60	600.36"
          - row "Shield of Righteousness	33376.35	385.97"
          - row "Avenger's Shield	32196.45	372.33"
          - row "Holy Shield	18786.06	217.25"
          - row "Judgement of Martyrdom	16196.55	187.30"
          - row "Redoubt	13230.00	152.99"
          - row "Exorcism	9139.95	105.70"
          - row "Judgement of Light	8914.80	103.09"
          - row "Vindication	4104.00	47.46"
          - row "Thorns	3868.50	44.74"
          - row "Righteous Fury	1826.00	21.12"
          - row "Wild Strike	1800.00	20.82"
          - row "Defender's Resolve	1260.00	14.57"
          - row "Holy Fortitude	1197.00	13.84"
          - row "Fire Strike	925.50	10.70"
          - row "Guarded by the Light	819.50	9.48"
          - row "Crusader's Zeal	360.00	4.16"
          - row "Divine Protection	171.00	1.98"
          - row "Total	467693.56	5408.49"
      `);
  });

  test("Rogue Tank", async ({ page }) => {
    await loadTargetFromReport(
      page,
      "http://127.0.0.1:8080/sod/?id=https://sod.warcraftlogs.com/reports/3kQ6nRY7W4fdtMJ8",
      "4;36;23" // The Prophet Skeram - Jaistyr
    );

    await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Jaistyr - Started fight with threat coeff 1.317"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 68.80 seconds"
          - row "Sinister Strike	89455.10	1300.31"
          - row "Melee	71216.84	1035.20"
          - row "Eviscerate	36653.50	532.79"
          - row "Unfair Advantage	24279.82	352.93"
          - row "Blunderbuss	11771.79	171.11"
          - row "Riposte	11000.00	159.90"
          - row "Poisoned Knife	2634.10	38.29"
          - row "Main Gauche	2109.91	30.67"
          - row "Dragonbreath Chili	1737.19	25.25"
          - row "Brittle Armor	1501.44	21.82"
          - row "Rolling with the Punches	1290.71	18.76"
          - row "Relentless Strikes Effect	1208.33	17.56"
          - row "Damage Shield Dmg +80	977.25	14.21"
          - row "The Fumigator	874.52	12.71"
          - row "Wild Strike	869.25	12.64"
          - row "Strikes of the Sinister	184.39	2.68"
          - row "Defender's Resolve	158.05	2.30"
          - row "Blade Dance	158.05	2.30"
          - row "Slice and Dice	158.05	2.30"
          - row "Thorns	118.53	1.72"
          - row "Blade Flurry	79.02	1.15"
          - row "Evasion	79.02	1.15"
          - row "Sprint	26.34	0.38"
          - row "Total	258541.21	3758.14"
      `);
  });

  test("Shaman Tank", async ({ page }) => {
    await loadTargetFromReport(
      page,
      "http://127.0.0.1:8080/sod/?id=https://sod.warcraftlogs.com/reports/GKfj9q83Yw1vBVkc",
      "3;87;6" // Anub'Rekhan - Predasmoke
    );

    await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Predasmoke - Started fight with threat coeff 4.1641"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 58.74 seconds"
          - row "Lava Burst	236283.44	4022.19"
          - row "Flame Shock	225635.84	3840.94"
          - row "Lightning Shield	214592.65	3652.95"
          - row "Earth Shock	194071.97	3303.63"
          - row "Chain Lightning	115187.29	1960.80"
          - row "Melee	80433.72	1369.20"
          - row "Damage Shield Dmg +80	44497.56	757.47"
          - row "Damage Shield Dmg +20	16693.87	284.18"
          - row "Thorns	5001.08	85.13"
          - row "Maelstrom Weapon	2269.43	38.63"
          - row "Gift of Arthas	2248.61	38.28"
          - row "Defender's Resolve	1311.69	22.33"
          - row "Flurry	1103.49	18.78"
          - row "Shield Mastery	982.20	16.72"
          - row "Boon of Fire	891.12	15.17"
          - row "Elemental Devastation	812.00	13.82"
          - row "Clearcasting	353.95	6.03"
          - row "Stormbraced	291.49	4.96"
          - row "Maelstrom Ready!	124.92	2.13"
          - row "Greater Stoneshield	83.28	1.42"
          - row "Energized Shield	62.46	1.06"
          - row "Boon of Earth	62.46	1.06"
          - row "Boon of Water	45.11	0.77"
          - row "Total	1143039.63	19457.65"
      `);
  });

  test("Warlock Tank", async ({ page }) => {
    await loadTargetFromReport(
      page,
      "http://127.0.0.1:8080/sod/?id=https://sod.warcraftlogs.com/reports/vjbpBYnLQDxqcw1P",
      "11;80;7" // Anub'Rekhan - Dagreât
    );

    await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Dagreât - Started fight with threat coeff 3.7225"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 168.94 seconds"
          - row "Searing Pain	1528743.87	9048.77"
          - row "Curse of Agony	139833.89	827.69"
          - row "Shadow Cleave	83829.61	496.19"
          - row "Immolate	68898.86	407.82"
          - row "Dragonbreath Chili	51500.12	304.83"
          - row "Melee	19688.05	116.54"
          - row "Thorns	3886.24	23.00"
          - row "Gift of Arthas	3350.21	19.83"
          - row "Dance of the Wicked	2251.07	13.32"
          - row "Shadow and Flame	1745.54	10.33"
          - row "Demonic Grace	771.08	4.56"
          - row "Fel Armor	651.40	3.86"
          - row "Defender's Resolve	238.68	1.41"
          - row "Major Healthstone	193.96	1.15"
          - row "Vengeance	148.90	0.88"
          - row "Infernal Armor	57.08	0.34"
          - row "Speed	24.82	0.15"
          - row "Total	1905813.36	11280.67"
      `);
  });

  test("Ret Pally", async ({ page }) => {
    await loadTargetFromReport(
      page,
      "http://127.0.0.1:8080/sod/?id=https://sod.warcraftlogs.com/reports/JvA4KLpyZ1fxrPgN",
      "3;36;1" // The Prophet Skeram - Ascherìt
    );

    await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Ascherìt - Started fight with threat coeff 0.49"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 107.19 seconds"
          - row "Seal of Martyrdom	57319.61	534.77"
          - row "Melee	45676.47	426.15"
          - row "Judgement of Martyrdom	40880.21	381.40"
          - row "Righteous Vengeance	18817.40	175.56"
          - row "Seal of Command	13945.40	130.11"
          - row "Crusader Strike	11246.51	104.93"
          - row "Exorcism	6717.41	62.67"
          - row "Hammer of Wrath	6373.50	59.46"
          - row "Dragonbreath Chili	5858.30	54.66"
          - row "Divine Storm	5804.87	54.16"
          - row "Sheath of Light	3710.00	34.61"
          - row "Vengeance	1974.70	18.42"
          - row "Vindication	1259.30	11.75"
          - row "Swift Judgement	1197.00	11.17"
          - row "Wild Strike	602.00	5.62"
          - row "Judgement of Wisdom	434.00	4.05"
          - row "Avenging Wrath	29.40	0.27"
          - row "Aura Mastery	29.40	0.27"
          - row "Wrath of Wray	29.40	0.27"
          - row "Total	221904.88	2070.30"
      `);
  });

  test("Hunter", async ({ page }) => {
    await loadTargetFromReport(
      page,
      "http://127.0.0.1:8080/sod/?id=https://sod.warcraftlogs.com/reports/JvA4KLpyZ1fxrPgN",
      "3;36;15" // The Prophet Skeram - Madbulltwo
    );

    await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Madbulltwo - Started fight with threat coeff 0.7"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 107.19 seconds"
          - row "Chimera Shot	82119.10	766.14"
          - row "Auto Shot	39804.80	371.37"
          - row "Chimera Shot - Serpent	24182.90	225.62"
          - row "Aimed Shot	13864.90	129.35"
          - row "Serpent Sting	11456.20	106.88"
          - row "Immolation Trap Effect	10911.60	101.80"
          - row "Multi-Shot	8226.40	76.75"
          - row "Expose Weakness	1036.00	9.67"
          - row "Sniper Training	994.00	9.27"
          - row "Lock and Load	609.00	5.68"
          - row "Judgement of Wisdom	59.50	0.56"
          - row "Rapid Fire	42.00	0.39"
          - row "Locked In	42.00	0.39"
          - row "Trueshot Aura	42.00	0.39"
          - row "Death	-85320.20	-796.01"
          - row "Total	108070.20	1008.26"
      `);
  });

  test("Rogue", async ({ page }) => {
    await loadTargetFromReport(
      page,
      "http://127.0.0.1:8080/sod/?id=https://sod.warcraftlogs.com/reports/JvA4KLpyZ1fxrPgN",
      "3;36;24" // The Prophet Skeram - Danstonass
    );

    await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Danstonass - Started fight with threat coeff 0.497"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 107.19 seconds"
          - row "Instant Poison VI	36929.59	344.54"
          - row "Envenom	32621.59	304.35"
          - row "Melee	25724.22	240.00"
          - row "Mutilate	20936.62	195.33"
          - row "Occult Poison II	8088.18	75.46"
          - row "Rupture	2808.05	26.20"
          - row "Crimson Tempest	2476.05	23.10"
          - row "Relentless Strikes Effect	2466.67	23.01"
          - row "Poisoned Knife	1191.81	11.12"
          - row "Dream Eater	831.67	7.76"
          - row "Dragonbreath Chili	795.20	7.42"
          - row "Wild Strike	472.15	4.41"
          - row "Burst of Energy	375.00	3.50"
          - row "Clearcasting	228.62	2.13"
          - row "Kick	202.28	1.89"
          - row "Slice and Dice	119.28	1.11"
          - row "Carnage	93.68	0.87"
          - row "Blade Flurry	29.82	0.28"
          - row "Stealth	29.82	0.28"
          - row "Master of Subtlety	29.82	0.28"
          - row "Venomous Totem	29.82	0.28"
          - row "Total	136479.93	1273.31"
      `);
  });

  test("Warrior - DPS", async ({ page }) => {
    await loadTargetFromReport(
      page,
      "http://127.0.0.1:8080/sod/?id=https://sod.warcraftlogs.com/reports/JvA4KLpyZ1fxrPgN",
      "3;36;10" // The Prophet Skeram - Absÿ
    );

    await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Absÿ - Started fight with threat coeff 0.56"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 107.19 seconds"
          - row "Heroic Strike	36195.04	337.69"
          - row "Deep Wound	27734.56	258.75"
          - row "Melee	23346.40	217.81"
          - row "Quick Strike	15003.52	139.98"
          - row "Overpower	14676.48	136.93"
          - row "Slam	6749.68	62.97"
          - row "Rend	4835.04	45.11"
          - row "Bloodthirst	3402.00	31.74"
          - row "Execute	2415.00	22.53"
          - row "Tactician	772.80	7.21"
          - row "Rallying Cry	739.20	6.90"
          - row "Whirlwind	627.20	5.85"
          - row "Echoes of Battle Stance	392.00	3.66"
          - row "Berserker Forecast	392.00	3.66"
          - row "Echoes of Berserker Stance	380.80	3.55"
          - row "Battle Forecast	380.80	3.55"
          - row "Taste for Blood	336.00	3.13"
          - row "Wild Strike	280.00	2.61"
          - row "Blood Surge	252.00	2.35"
          - row "Bloodrage	103.00	0.96"
          - row "Enrage	56.00	0.52"
          - row "Rampage	33.60	0.31"
          - row "Wrath of Wray	33.60	0.31"
          - row "Unbridled Wrath	15.00	0.14"
          - row "Total	139151.72	1298.24"
      `);
  });
});
