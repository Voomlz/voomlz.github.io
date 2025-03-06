import { test, expect } from "@playwright/test";
import { loadTargetFromReport } from "../_test/helpers";

// NOTE: We cannot find a live TBC report on WCL. So instead this is a Wrath log. It's main purpose
// is to test threat totals so that we can see any threat changes that may happen with small changes.

// If anyone has a TBC report that is not archived, we'd be happy to use it for values.

// Run the local server with `npm run start`
test.describe("/classic/ threat values", () => {
  test("Warrior Tank", async ({ page }) => {
    await loadTargetFromReport(
      page,
      "http://127.0.0.1:8080/threat/?id=https://classic.warcraftlogs.com/reports/Gdc78AfBXKMgbPm9",
      "8;176;14" // Shannox - Kitasan
    );

    await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Kitasan - Started fight with threat coeff 0.9568"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 186.13 seconds"
          - row "Heroic Strike	1303286.94	7001.87"
          - row "Shield Slam	878774.87	4721.19"
          - row "Revenge	543461.44	2919.73"
          - row "Melee	486775.83	2615.19"
          - row "Deep Wound	315807.15	1696.67"
          - row "Rend	292689.90	1572.47"
          - row "Thunder Clap	255988.97	1375.29"
          - row "Devastate	233627.60	1255.16"
          - row "Combust	174937.48	939.85"
          - row "Cleave	169869.32	912.62"
          - row "Shockwave	52547.46	282.31"
          - row "Concussion Blow	19787.58	106.31"
          - row "Prayer of Mending	13505.33	72.56"
          - row "Retaliation	11538.05	61.99"
          - row "Shattering Throw	5104.53	27.42"
          - row "Weight of a Feather	1931.12	10.37"
          - row "Tipping of the Scales	1300.32	6.99"
          - row "Thunderstruck	139.24	0.75"
          - row "Enrage	122.24	0.66"
          - row "Incite	114.07	0.61"
          - row "Windwalk	94.45	0.51"
          - row "Sword and Board	88.94	0.48"
          - row "Hold the Line	82.72	0.44"
          - row "Inner Rage	44.47	0.24"
          - row "Spell Block	41.01	0.22"
          - row "Synapse Springs	28.70	0.15"
          - row "Turn of the Worm	8.61	0.05"
          - row "Berserker Rage	8.53	0.05"
          - row "Earthen Armor	4.78	0.03"
          - row "Total	4761711.64	25582.17"
      `);
  });

  test("Hunter (Misdirect)", async ({ page }) => {
    await loadTargetFromReport(
      page,
      "http://127.0.0.1:8080/threat/?id=https://classic.warcraftlogs.com/reports/Gdc78AfBXKMgbPm9",
      "8;176;12" // Shannox - Jhuntd
    );

    await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Jhuntd - Started fight with threat coeff 1"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 186.13 seconds"
          - row "Explosive Shot	2333654.00	12537.49"
          - row "Cobra Shot	1368277.00	7351.03"
          - row "Auto Shot	924562.00	4967.18"
          - row "Serpent Sting	390837.00	2099.76"
          - row "Kill Shot	269803.00	1449.51"
          - row "Arcane Shot	223360.00	1200.00"
          - row "Black Arrow	212982.00	1144.24"
          - row "Explosive Trap	77260.00	415.08"
          - row "Flaming Arrow	70294.00	377.65"
          - row "Misdirect (Explosive Shot)	21803.00	117.14"
          - row "Misdirect (Cobra Shot)	10726.00	57.63"
          - row "Misdirect (Auto Shot)	5698.00	30.61"
          - row "Improved Serpent Sting	5228.00	28.09"
          - row "Flintlocke's Woodchucker	4030.52	21.65"
          - row "Sic 'Em!	520.45	2.80"
          - row "Energize	299.07	1.61"
          - row "Go for the Throat	227.07	1.22"
          - row "Devour	74.39	0.40"
          - row "Burning Adrenaline	68.39	0.37"
          - row "Misdirection	60.00	0.32"
          - row "Lock and Load	41.31	0.22"
          - row "Sniper Training	38.67	0.21"
          - row "Synapse Springs	28.86	0.16"
          - row "Matrix Restabilized	25.00	0.13"
          - row "Thrill of the Hunt	23.00	0.12"
          - row "Trap Launcher	21.52	0.12"
          - row "Berserking	20.00	0.11"
          - row "Rapid Fire	20.00	0.11"
          - row "Aspect of the Hawk	8.57	0.05"
          - row "Aspect of the Fox	7.50	0.04"
          - row "Tol'vir Agility	2.86	0.02"
          - row "Total	5920001.19	31805.05"
      `);
  });

  test("Resto Druid", async ({ page }) => {
    await loadTargetFromReport(
      page,
      "http://127.0.0.1:8080/threat/?id=https://classic.warcraftlogs.com/reports/Gdc78AfBXKMgbPm9",
      "8;176;27" // Shannox - Zith
    );

    await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Zith - Started fight with threat coeff 1"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 186.13 seconds"
          - row "Wrath	94223.00	506.21"
          - row "Regrowth	34006.30	182.70"
          - row "Moonfire	32454.00	174.36"
          - row "Wild Growth	29751.88	159.84"
          - row "Lifebloom	20722.44	111.33"
          - row "Efflorescence	15580.44	83.71"
          - row "Tranquility	10126.93	54.41"
          - row "Replenishment	8003.82	43.00"
          - row "Rejuvenation	7854.59	42.20"
          - row "Swiftmend	7162.34	38.48"
          - row "Firebloom	5578.90	29.97"
          - row "Living Seed	5394.37	28.98"
          - row "Revitalize	1741.78	9.36"
          - row "Healing Touch	1398.68	7.51"
          - row "Heartfire	1106.11	5.94"
          - row "Nourish	685.96	3.69"
          - row "Harmony	405.27	2.18"
          - row "Grounded Soul	68.86	0.37"
          - row "Mark of the Wild	65.71	0.35"
          - row "Victorious	54.00	0.29"
          - row "Power Torrent	35.67	0.19"
          - row "Nature's Grace	30.95	0.17"
          - row "Synapse Springs	15.52	0.08"
          - row "Tree of Life	6.67	0.04"
          - row "Nature's Bounty	6.67	0.04"
          - row "Nature's Swiftness	6.00	0.03"
          - row "Victory	6.00	0.03"
          - row "Volcanic Power	6.00	0.03"
          - row "Nitro Boosts	3.00	0.02"
          - row "Berserking	2.86	0.02"
          - row "Total	276504.70	1485.51"
      `);
  });

  test("Ret Pally", async ({ page }) => {
    await loadTargetFromReport(
      page,
      "http://127.0.0.1:8080/threat/?id=https://classic.warcraftlogs.com/reports/Gdc78AfBXKMgbPm9",
      "8;176;16" // Shannox - Valtrina
    );

    await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Valtrina - Started fight with threat coeff 1"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 186.13 seconds"
          - row "Hand of Light	1514737.00	8137.88"
          - row "Templar's Verdict	1111711.00	5972.64"
          - row "Crusader Strike	833219.99	4476.45"
          - row "Melee	694980.00	3733.76"
          - row "Censure	687404.00	3693.06"
          - row "Exorcism	659212.00	3541.60"
          - row "Seal of Truth	538312.00	2892.07"
          - row "Judgement of Truth	254909.00	1369.49"
          - row "Seals of Command	223538.00	1200.95"
          - row "Hammer of Wrath	199683.00	1072.79"
          - row "Flames of the Faithful	123660.00	664.36"
          - row "Eye for an Eye	42893.00	230.44"
          - row "Holy Wrath	41151.00	221.08"
          - row "Consecration	17157.00	92.18"
          - row "Ancient Fury	6935.00	37.26"
          - row "Judgements of the Bold	3817.20	20.51"
          - row "Replenishment	1691.96	9.09"
          - row "Ancient Power	1127.24	6.06"
          - row "Healthstone	409.12	2.20"
          - row "Titanic Power	268.22	1.44"
          - row "Divine Plea	169.80	0.91"
          - row "Landslide	102.92	0.55"
          - row "The Art of War	99.08	0.53"
          - row "Arcane Torrent	91.00	0.49"
          - row "Judgements of the Pure	75.23	0.40"
          - row "Divine Purpose	64.38	0.35"
          - row "Inquisition	43.73	0.23"
          - row "Swordguard Embroidery	30.95	0.17"
          - row "Rageheart	24.29	0.13"
          - row "Zealotry	23.00	0.12"
          - row "Avenging Wrath	23.00	0.12"
          - row "Synapse Springs	14.31	0.08"
          - row "Blessing of the Shaper	11.57	0.06"
          - row "Hand of Sacrifice	3.00	0.02"
          - row "Divine Protection	3.00	0.02"
          - row "Golem's Strength	3.00	0.02"
          - row "Total	6957597.99	37379.51"
      `);
  });

  test("Mage", async ({ page }) => {
    await loadTargetFromReport(
      page,
      "http://127.0.0.1:8080/threat/?id=https://classic.warcraftlogs.com/reports/Gdc78AfBXKMgbPm9",
      "8;176;25" // Shannox - Ceeze
    );

    await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Ceeze - Started fight with threat coeff 0.9"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 186.13 seconds"
          - row "Fireball	2273075.10	12212.04"
          - row "Pyroblast!	1206131.40	6479.91"
          - row "Ignite	1132290.90	6083.20"
          - row "Combustion	830896.20	4463.97"
          - row "Living Bomb	796734.90	4280.44"
          - row "Pyroblast	114219.00	613.64"
          - row "Flame Orb	39991.50	214.85"
          - row "Volcanic Destruction	17930.70	96.33"
          - row "Fire Blast	9569.70	51.41"
          - row "Fire Power	9568.80	51.41"
          - row "Master of Elements	1507.90	8.10"
          - row "Hot Streak	177.88	0.96"
          - row "Impact	73.65	0.40"
          - row "Power Torrent	34.52	0.19"
          - row "Lightweave	30.00	0.16"
          - row "Dire Magic	25.00	0.13"
          - row "Synapse Springs	23.00	0.12"
          - row "Berserking	22.86	0.12"
          - row "Blink	4.50	0.02"
          - row "Volcanic Power	3.00	0.02"
          - row "Total	6432310.52	34557.42"
      `);
  });

  test("Warlock", async ({ page }) => {
    await loadTargetFromReport(
      page,
      "http://127.0.0.1:8080/threat/?id=https://classic.warcraftlogs.com/reports/Gdc78AfBXKMgbPm9",
      "8;176;22" // Shannox - Scts
    );

    await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Scts - Started fight with threat coeff 0.9"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 186.13 seconds"
          - row "Shadow Bolt	929323.80	4992.77"
          - row "Unstable Affliction	795672.90	4274.73"
          - row "Corruption	726538.50	3903.31"
          - row "Bane of Doom	550498.50	2957.54"
          - row "Drain Soul	331403.40	1780.46"
          - row "Haunt	206118.00	1107.36"
          - row "Shadowflame	75847.50	407.49"
          - row "Volcanic Destruction	18549.77	99.66"
          - row "Fel Flame	9247.50	49.68"
          - row "Siphon Life	1871.25	10.05"
          - row "Fel Armor	1612.57	8.66"
          - row "Dark Intent	1124.24	6.04"
          - row "Synapse Springs	63.86	0.34"
          - row "Dire Magic	59.40	0.32"
          - row "Blood Fury	58.50	0.31"
          - row 
          - row "Power Torrent	32.10	0.17"
          - row "Shadow Trance	31.24	0.17"
          - row "Eradication	17.90	0.10"
          - row "Fel Spark	16.80	0.09"
          - row 
          - row "Nitro Boosts	2.70	0.01"
          - row "Volcanic Power	2.45	0.01"
          - row "Total	3648154.10	19599.61"
      `);
  });

  test("Shaman", async ({ page }) => {
    await loadTargetFromReport(
      page,
      "http://127.0.0.1:8080/threat/?id=https://classic.warcraftlogs.com/reports/Gdc78AfBXKMgbPm9",
      "8;176;31" // Shannox - Edshearin
    );

    await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Edshearin - Started fight with threat coeff 1"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 186.13 seconds"
          - row "Lightning Bolt	1934567.45	10393.41"
          - row "Lava Burst	950096.86	5104.37"
          - row "Flame Shock	272853.30	1465.90"
          - row "Fulmination	260289.29	1398.40"
          - row "Earth Shock	57820.56	310.64"
          - row "Volcanic Destruction	13411.51	72.05"
          - row "Rolling Thunder	9550.46	51.31"
          - row "Healing Stream Totem	3511.87	18.87"
          - row "Lightning Shield	269.72	1.45"
          - row "Synapse Springs	70.67	0.38"
          - row "Lightweave	70.00	0.38"
          - row "Blood Fury	64.00	0.34"
          - row "Elemental Mastery	62.10	0.33"
          - row "Power Torrent	35.52	0.19"
          - row "Dire Magic	25.45	0.14"
          - row "Volcanic Power	3.00	0.02"
          - row "Total	3502701.77	18818.17"
      `);
  });

  test("Pally tank", async ({ page }) => {
    await loadTargetFromReport(
      page,
      "http://127.0.0.1:8080/threat/?id=https://classic.warcraftlogs.com/reports/y1TBQzDhM9VKL62N",
      "13;103;8" // Shannox - Ravæner
    );

    await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(`
      - textbox
      - text: "Ravæner - Started fight with threat coeff 1.9"
      - table:
          - rowgroup:
              - row "Ability        Threat (*)  Per 138.82 seconds"
          - row "Shield of the Righteous	1497855.50	10789.60"
          - row "Censure	722324.90	5203.17"
          - row "Crusader Strike	718969.12	5179.00"
          - row "Judgement of Truth	656961.10	4732.33"
          - row "Avenger's Shield	615726.54	4435.30"
          - row "Melee	564089.00	4063.34"
          - row "Seal of Truth	500585.40	3605.90"
          - row "Hammer of Wrath	288345.90	2077.06"
          - row "Righteous Flames	157668.00	1135.74"
          - row "Consecration	144495.00	1040.85"
          - row "Flames of the Faithful	105484.00	759.84"
          - row "Holy Wrath	57894.90	417.04"
          - row "Retribution Aura	33432.40	240.83"
          - row "Prayer of Mending	15906.24	114.58"
          - row "Earth Shield	5143.42	37.05"
          - row "Judgements of the Wise	3102.67	22.35"
          - row "Sanctuary	1229.57	8.86"
          - row "Divine Plea	228.82	1.65"
          - row "Accelerated	148.12	1.07"
          - row "Sacred Duty	103.08	0.74"
          - row "Reckoning	97.68	0.70"
          - row "Grand Crusader	44.91	0.32"
          - row "Landslide	37.92	0.27"
          - row "Rageheart	22.40	0.16"
          - row "Synapse Springs	5.26	0.04"
          - row "Divine Protection	4.75	0.03"
          - row "Inquisition	4.56	0.03"
          - row "Avenging Wrath	4.56	0.03"
          - row "Golem's Strength	2.86	0.02"
          - row "Ardent Defender	2.40	0.02"
          - row "Total	6089920.99	43867.93"
      `);
  });
});
