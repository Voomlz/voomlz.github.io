import { test, expect, Page } from "@playwright/test";

test.describe("/era/ threat values", () => {
  test("Warrior Tank", async ({ page }) => {
    await loadTargetFromReport(
      page,
      "https://vanilla.warcraftlogs.com/reports/qXDrpmFfHg3dNjzt",
      "1;43;38" // Anub'Rekhan - Tragortf
    );

    await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Tragortf - Started fight with threat coeff 1.495"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 34.58 seconds"
          - row "Heroic Strike      44101.00    1275.41"
          - row "Bloodthirst        19526.04    564.70"
          - row "Melee              16111.62    465.95"
          - row "Revenge            2953.37     85.41"
          - row "Gift of Arthas     941.85      27.24"
          - row "Sunder Armor       390.19      11.28"
          - row "Demoralizing Shout 192.86      5.58"
          - row "Judgement of Light 144.79      4.19"
          - row "Kiss of the Spider 89.70       2.59"
          - row "Unbridled Wrath    9.00        0.26"
          - row "Battle Shout       7.85        0.23"
          - row "Total              84468.27    2442.83"
      `);
  });

  test("Mage - Fire", async ({ page }) => {
    await loadTargetFromReport(
      page,
      "https://vanilla.warcraftlogs.com/reports/qXDrpmFfHg3dNjzt",
      "1;43;9" // Anub'Rekhan - Chosme
    );

    await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Chosme - Started fight with threat coeff 0.49"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 34.58 seconds"
          - row "Ignite 39012.82 1128.26"
          - row "Fireball 14899.92 430.91"
          - row "Scorch 1791.93 51.82"
          - row "Master of Elements 25.11 0.73"
          - row "Combustion 19.60 0.57"
          - row "Arcane Brilliance 8.40 0.24"
          - row "Mind Quickening 0.72 0.02"
          - row "Clearcasting 0.59 0.02"
          - row "Total 55759.09 1612.56"
      `);
  });

  test("Warrior DPS", async ({ page }) => {
    await loadTargetFromReport(
      page,
      "https://vanilla.warcraftlogs.com/reports/qXDrpmFfHg3dNjzt",
      "1;43;30" // Anub'Rekhan - Rouguishh
    );

    await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Roguishh - Started fight with threat coeff 0.56"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 34.58 seconds"
          - row "Cleave 15779.68 456.35"
          - row "Melee 14248.64 412.07"
          - row "Execute 8054.90 232.95"
          - row "Bloodthirst 6582.91 190.38"
          - row "Whirlwind 4473.00 129.36"
          - row "Heroic Strike 4282.88 123.86"
          - row "Hamstring 683.20 19.76"
          - row "Dragonbreath Chili 162.40 4.70"
          - row "Judgement of Light 19.87 0.57"
          - row "Kiss of the Spider 11.20 0.32"
          - row "Unbridled Wrath 6.39 0.18"
          - row "Total 54305.07 1570.51"
      `);
  });

  test("Warlock", async ({ page }) => {
    await loadTargetFromReport(
      page,
      "https://vanilla.warcraftlogs.com/reports/qXDrpmFfHg3dNjzt",
      "1;43;10" // Anub'Rekhan - Lysten
    );

    await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Lysten - Started fight with threat coeff 0.7"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 34.58 seconds"
          - row "Searing Pain 36027.60 1041.92"
          - row "Immolate 3826.20 110.65"
          - row "Shadowburn 1465.10 42.37"
          - row "Curse of the Elements 84.00 2.43"
          - row "Total 41402.90 1197.38"
      `);
  });

  test("Rogue", async ({ page }) => {
    await loadTargetFromReport(
      page,
      "https://vanilla.warcraftlogs.com/reports/qXDrpmFfHg3dNjzt",
      "1;43;20" // Anub'Rekhan - Gwumpyx
    );

    await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Gwumpyx - Started fight with threat coeff 0.497"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 34.58 seconds"
          - row "Melee 6993.78 202.26"
          - row "Sinister Strike 3533.17 102.18"
          - row "Fire Shield 141.15 4.08"
          - row "Burst of Energy 27.27 0.79"
          - row "Blade Flurry 9.94 0.29"
          - row "Relentless Strikes Effect 8.12 0.23"
          - row "Judgement of Light 5.05 0.15"
          - row "Slice and Dice 1.69 0.05"
          - row "Head Rush 0.71 0.02"
          - row "Total 10720.88 310.05"
      `);
  });

  test("Hunter", async ({ page }) => {
    await loadTargetFromReport(
      page,
      "https://vanilla.warcraftlogs.com/reports/kTAJXcx7P6ZnrjbG",
      "28;101;4" // Nefarian - Marìa
    );

    await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Marìa - Started fight with threat coeff 0.7"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 97.34 seconds"
          - row "Auto Shot 25609.50 263.10"
          - row "Aimed Shot 15236.20 156.53"
          - row "Multi-Shot 9431.80 96.90"
          - row "Quick Shots 126.00 1.29"
          - row "Devilsaur Fury 42.00 0.43"
          - row "Rapid Fire 42.00 0.43"
          - row "Trueshot Aura 42.00 0.43"
          - row "Total 50529.50 519.12"
      `);
  });

  test("Druid - Cat", async ({ page }) => {
    await loadTargetFromReport(
      page,
      "https://vanilla.warcraftlogs.com/reports/kTAJXcx7P6ZnrjbG",
      "28;101;14" // Nefarian - Thallack
    );

    await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Thallack - Started fight with threat coeff 0.497"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 97.34 seconds"
          - row "Shred 9990.69 102.64"
          - row "Melee 9310.30 95.65"
          - row "Ferocious Bite 3183.78 32.71"
          - row "Furor 1800.00 18.49"
          - row "Claw 215.70 2.22"
          - row "Faerie Fire (Feral) 214.70 2.21"
          - row "Judgement of Light 61.13 0.63"
          - row "Earthstrike 29.82 0.31"
          - row "Total 24806.13 254.85"
      `);
  });

  test("Druid - Tank", async ({ page }) => {
    await loadTargetFromReport(
      page,
      "https://vanilla.warcraftlogs.com/reports/WXKGAVjrx3D2vqw6",
      "24;90;14" // Ebonroc - Miskovsky
    );

    await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Miskovsky - Started fight with threat coeff 1"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 58.39 seconds"
          - row "Maul 35885.33 614.58"
          - row "Growl 22262.24 381.27"
          - row "Melee 2683.95 45.97"
          - row "Swipe 2666.91 45.67"
          - row "Faerie Fire (Feral) 626.40 10.73"
          - row "Regrowth 280.40 4.80"
          - row "Thorns 130.50 2.23"
          - row "Slayer's Crest 87.00 1.49"
          - row "Furor 50.00 0.86"
          - row "Total 64672.73 1107.60"
      `);
  });

  test("Mage - Frost", async ({ page }) => {
    await loadTargetFromReport(
      page,
      "https://vanilla.warcraftlogs.com/reports/kTAJXcx7P6ZnrjbG",
      "28;101;25" // Nefarian - Bleshat
    );

    await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Bleshat - Started fight with threat coeff 0.49"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 97.34 seconds"
          - row "Frostbolt 39295.90 403.71"
          - row "Unstable Power 966.00 9.92"
          - row "Clearcasting 75.60 0.78"
          - row "Presence of Mind 42.00 0.43"
          - row "Invulnerability 30.00 0.31"
          - row "Arcane Power 25.20 0.26"
          - row "Total 40434.70 415.41"
      `);
  });

  test.describe("special threat mechanics", () => {
    test("BWL - Nefarian - Warrior class call", async ({ page }) => {
      await loadTargetFromReport(
        page,
        "https://vanilla.warcraftlogs.com/reports/kTAJXcx7P6ZnrjbG",
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
        "https://vanilla.warcraftlogs.com/reports/WXKGAVjrx3D2vqw6",
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
});

async function loadTargetFromReport(
  page: Page,
  reportUrl: string,
  unitKey: string
) {
  const [, reportId] = /reports\/(\w+)/.exec(reportUrl)!;

  await page.goto(`/era/?id=${reportId}`);

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
