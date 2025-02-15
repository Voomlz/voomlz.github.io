import { test, expect, Page } from "@playwright/test";

test.describe("/sod/ threat values", () => {
  test("Warrior Tank", async ({ page }) => {
    await loadTargetFromReport(
      page,
      "https://sod.warcraftlogs.com/reports/JvA4KLpyZ1fxrPgN",
      "3;36;9" // The Prophet Skeram - Sheenftw
    );

    await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Sheenftw - Started fight with threat coeff 0.928"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 107.19 seconds"
          - row "Taunt 146094.88 1363.02"
          - row "Shield Slam 35785.54 333.87"
          - row "Heroic Strike 25792.83 240.64"
          - row "Devastate 24479.71 228.39"
          - row "Melee 20045.73 187.02"
          - row "Deep Wound 17301.63 161.42"
          - row "Revenge 9959.76 92.92"
          - row "Thunderfury 8212.80 76.62"
          - row "Sunder Armor 5570.78 51.97"
          - row "Cleave 2035.10 18.99"
          - row "Rallying Cry 1224.96 11.43"
          - row "Wild Strike 1076.48 10.04"
          - row "Defender's Resolve 593.92 5.54"
          - row "Sword and Board 519.68 4.85"
          - row "Shield Bash 396.72 3.70"
          - row "Battle Shout 222.72 2.08"
          - row "Thorium Shield Spike 167.04 1.56"
          - row "Thorns 154.05 1.44"
          - row "Wrath of Wray 55.68 0.52"
          - row "Bloodrage 40.00 0.37"
          - row "Total 299730.02 2796.38"
      `);
  });

  test("Druid Tank", async ({ page }) => {
    await loadTargetFromReport(
      page,
      "https://sod.warcraftlogs.com/reports/kTf82pHyXPwKtR41",
      "43;102;23" // Heigan the Unclean - Lucyol
    );

    await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Lucyol - Started fight with threat coeff 1.45"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 77.26 seconds"
          - row "Maul	364268.28	4714.84"
          - row "Lacerate	227872.58	2949.42"
          - row "Mangle	201986.45	2614.37"
          - row "Tooth and Claw	49920.60	646.14"
          - row "Damage Shield Dmg +80	18397.60	238.13"
          - row "Melee	14514.50	187.87"
          - row "Thorns	2089.45	27.04"
          - row "Gift of Arthas	391.50	5.07"
          - row "Defender's Resolve	371.82	4.81"
          - row "Gore	370.75	4.80"
          - row "Wild Strike	235.97	3.05"
          - row "Faerie Fire (Feral)	156.60	2.03"
          - row "Primal Fury	125.47	1.62"
          - row "Berserk	90.00	1.16"
          - row "Kiss of the Spider	87.00	1.13"
          - row "Animal Fury	68.22	0.88"
          - row "Natural Reaction	18.97	0.25"
          - row "Survival Instincts	6.69	0.09"
          - row "Total	880972.44	11402.70"
      `);
  });

  test("Paladin Tank", async ({ page }) => {
    await loadTargetFromReport(
      page,
      "https://sod.warcraftlogs.com/reports/JvA4KLpyZ1fxrPgN",
      "20;92;5" // Princess Huhuran - Neitsa
    );

    await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Neitsa - Started fight with threat coeff 1.3"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 86.47 seconds"
          - row "Seal of Martyrdom	111918.60	1294.25"
          - row "Melee	108772.50	1257.86"
          - row "Hammer of the Righteous	35521.20	410.77"
          - row "Shield of Righteousness	22836.45	264.08"
          - row "Avenger's Shield	22029.15	254.75"
          - row "Redoubt	13230.00	152.99"
          - row "Holy Shield	12853.62	148.64"
          - row "Judgement of Martyrdom	11081.85	128.15"
          - row "Exorcism	6253.65	72.32"
          - row "Judgement of Light	6099.60	70.54"
          - row "Thorns	3868.50	44.74"
          - row "Vindication	2808.00	32.47"
          - row "Righteous Fury	1826.00	21.12"
          - row "Wild Strike	1800.00	20.82"
          - row "Defender's Resolve	1260.00	14.57"
          - row "Fire Strike	925.50	10.70"
          - row "Holy Fortitude	819.00	9.47"
          - row "Guarded by the Light	765.50	8.85"
          - row "Crusader's Zeal	360.00	4.16"
          - row "Divine Protection	117.00	1.35"
          - row "Total	365146.12	4222.61"
      `);
  });

  test("Rogue Tank", async ({ page }) => {
    await loadTargetFromReport(
      page,
      "https://sod.warcraftlogs.com/reports/3kQ6nRY7W4fdtMJ8",
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
      "https://sod.warcraftlogs.com/reports/GKfj9q83Yw1vBVkc",
      "3;87;6" // Anub'Rekhan - Predasmoke
    );

    await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Predasmoke - Started fight with threat coeff 1.45"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 58.74 seconds"
          - row "Lava Burst	98732.82	1680.70"
          - row "Flame Shock	94283.64	1604.96"
          - row "Lightning Shield	89669.16	1526.41"
          - row "Earth Shock	81094.44	1380.45"
          - row "Chain Lightning	48131.88	819.34"
          - row "Melee	33609.84	572.13"
          - row "Damage Shield Dmg +80	18593.64	316.51"
          - row "Damage Shield Dmg +20	6975.66	118.74"
          - row "Thorns	2089.74	35.57"
          - row "Maelstrom Weapon	948.30	16.14"
          - row "Gift of Arthas	939.60	15.99"
          - row "Shield Mastery	582.23	9.91"
          - row "Defender's Resolve	548.10	9.33"
          - row "Flurry	461.10	7.85"
          - row "Boon of Fire	372.36	6.34"
          - row "Elemental Devastation	339.30	5.78"
          - row "Clearcasting	147.90	2.52"
          - row "Stormbraced	121.80	2.07"
          - row "Maelstrom Ready!	52.20	0.89"
          - row "Greater Stoneshield	34.80	0.59"
          - row "Boon of Earth	26.10	0.44"
          - row "Energized Shield	26.10	0.44"
          - row "Boon of Water	18.85	0.32"
          - row "Total	477799.55	8133.45"
      `);
  });

  test("Warlock Tank", async ({ page }) => {
    await loadTargetFromReport(
      page,
      "https://sod.warcraftlogs.com/reports/vjbpBYnLQDxqcw1P",
      "11;80;7" // Anub'Rekhan - Dagreât
    );

    await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Dagreât - Started fight with threat coeff 2.5665"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 168.94 seconds"
          - row "Searing Pain	1054015.35	6238.81"
          - row "Curse of Agony	96410.57	570.66"
          - row "Shadow Cleave	57797.58	342.11"
          - row "Immolate	47503.35	281.18"
          - row "Dragonbreath Chili	35507.53	210.17"
          - row "Melee	13574.22	80.35"
          - row "Thorns	2679.43	15.86"
          - row "Gift of Arthas	2309.85	13.67"
          - row "Dance of the Wicked	1590.01	9.41"
          - row "Shadow and Flame	1134.71	6.72"
          - row "Demonic Grace	505.56	2.99"
          - row "Fel Armor	405.01	2.40"
          - row "Defender's Resolve	153.35	0.91"
          - row "Major Healthstone	127.04	0.75"
          - row "Vengeance	102.66	0.61"
          - row "Infernal Armor	33.77	0.20"
          - row "Speed	15.40	0.09"
          - row "Total	1313865.39	7776.88"
      `);
  });

  test("Ret Pally", async ({ page }) => {
    await loadTargetFromReport(
      page,
      "https://sod.warcraftlogs.com/reports/JvA4KLpyZ1fxrPgN",
      "3;36;1" // The Prophet Skeram - Ascherìt
    );

    await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Ascherìt - Started fight with threat coeff 0.49"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 107.19 seconds"
          - row "Melee	65252.10	608.78"
          - row "Seal of Martyrdom	57319.61	534.77"
          - row "Judgement of Martyrdom	40880.21	381.40"
          - row "Righteous Vengeance	18817.40	175.56"
          - row "Seal of Command	13945.40	130.11"
          - row "Crusader Strike	11246.51	104.93"
          - row "Divine Storm	8091.56	75.49"
          - row "Exorcism	6717.41	62.67"
          - row "Hammer of Wrath	6373.50	59.46"
          - row "Dragonbreath Chili	5858.30	54.66"
          - row "Sheath of Light	5300.00	49.45"
          - row "Vengeance	2821.00	26.32"
          - row "Vindication	1259.30	11.75"
          - row "Swift Judgement	1197.00	11.17"
          - row "Wild Strike	602.00	5.62"
          - row "Judgement of Wisdom	434.00	4.05"
          - row "Wrath of Wray	42.00	0.39"
          - row "Avenging Wrath	29.40	0.27"
          - row "Aura Mastery	29.40	0.27"
          - row "Total	246216.10	2297.11"
      `);
  });

  test("Hunter", async ({ page }) => {
    await loadTargetFromReport(
      page,
      "https://sod.warcraftlogs.com/reports/JvA4KLpyZ1fxrPgN",
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
      "https://sod.warcraftlogs.com/reports/JvA4KLpyZ1fxrPgN",
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
      "https://sod.warcraftlogs.com/reports/JvA4KLpyZ1fxrPgN",
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

  test.describe("special threat mechanics", () => {
    test("Patchwerk - Warrior - MT", async ({ page }) => {
      await loadTargetFromReport(
        page,
        "https://sod.warcraftlogs.com/reports/ZGqcXNWmHKRPb842",
        "53;129;7" // Patchwerk - Enzad
      );

      await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Enzad - Started fight with threat coeff 0.812"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 71.61 seconds"
          - row "Heroic Strike	142303.92	1987.12"
          - row "Shield Slam	125212.24	1748.46"
          - row "Devastate	68594.46	957.85"
          - row "Deep Wound	47388.36	661.73"
          - row "Revenge	36111.96	504.27"
          - row "Damage Shield Dmg +80	24665.04	344.42"
          - row "Execute	24587.50	343.34"
          - row "Melee	23011.96	321.34"
          - row "Splintered Shield	16657.80	232.61"
          - row "Hateful Strike	6400.00	89.37"
          - row "Sunder Armor	5439.24	75.95"
          - row "Gift of Arthas	1299.60	18.15"
          - row "Wild Strike	832.80	11.63"
          - row "Defender's Resolve	729.60	10.19"
          - row "Defensive Forecast	278.40	3.89"
          - row "Gri'lek's Guard	219.60	3.07"
          - row "Bloodrage	167.00	2.33"
          - row "Gladiator Stance	134.40	1.88"
          - row "Battle Forecast	134.40	1.88"
          - row "Greater Stoneshield	69.60	0.97"
          - row "Rampage	69.60	0.97"
          - row "Total	524307.48	7321.40"
      `);
    });

    test("Patchwerk - Warlock - Hateful target", async ({ page }) => {
      await loadTargetFromReport(
        page,
        "https://sod.warcraftlogs.com/reports/ZGqcXNWmHKRPb842",
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
        "https://sod.warcraftlogs.com/reports/CNXHnFyDbqkahWpx",
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
        "https://sod.warcraftlogs.com/reports/CNXHnFyDbqkahWpx",
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
});

async function loadTargetFromReport(
  page: Page,
  reportUrl: string,
  unitKey: string
) {
  const [, reportId] = /reports\/(\w+)/.exec(reportUrl)!;

  await page.goto(`/sod/?id=${reportId}`);

  if (reportId) {
    const [fightId, enemyId, targetId] = unitKey.split(";");
    await page.locator("#fightSelect").selectOption(`${reportId};${fightId}`);

    await page.getByRole("button", { name: "Fetch/Refresh" }).click();

    await page
      .locator("#enemySelect")
      .selectOption(`${reportId};${fightId};${enemyId}`);
    await page
      .locator("#targetSelect")
      .selectOption(`${reportId};${fightId};${enemyId};${targetId}`);
  }
}
