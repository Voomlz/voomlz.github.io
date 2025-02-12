import { test, expect } from "@playwright/test";

const TEST_LOG_URL = "https://sod.warcraftlogs.com/reports/JvA4KLpyZ1fxrPgN";

test.describe("/sod/", () => {
  test.describe("no url param", () => {
    test("can load a report", async ({ page }) => {
      await page.goto(`/sod/`);
      await page.locator("#reportSelect").fill(TEST_LOG_URL);
      await page.getByRole("button", { name: "Fetch", exact: true }).click();
      await page.getByRole("button", { name: "Fetch/Refresh" }).click();
      await expect(page.locator("#fightSelect")).toContainText(
        "The Prophet Skeram - 3"
      );
    });
  });

  test.describe("with url param", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/sod/?id=${TEST_LOG_URL}`);
    });

    test("can switch targets", async ({ page }) => {
      await expect(page.locator("#fightSelect")).toContainText(
        "The Prophet Skeram - 3"
      );

      await page.getByRole("button", { name: "Fetch/Refresh" }).click();

      await expect(page.locator("#enemySelect")).toContainText(
        "The Prophet Skeram - 36"
      );

      // Initial target, alphabetically choosen
      await expect(page.locator("#targetSelect")).toContainText("Absÿ - 10");
      await expect(page.locator("#threatTableContainer")).toContainText(
        "Absÿ - Started fight with threat coeff 0.56"
      );

      // switch to a different target
      await page
        .locator("#targetSelect")
        .selectOption("JvA4KLpyZ1fxrPgN;3;36;9");

      await expect(page.locator("#threatTableContainer")).toContainText(
        "Sheenftw - Started fight with threat coeff 0.928"
      );
    });

    test("can switch fights", async ({ page }) => {
      await expect(page.locator("#fightSelect")).toContainText(
        "The Prophet Skeram - 3"
      );
      await page.getByRole("button", { name: "Fetch/Refresh" }).click();
      await expect(page.locator("#enemySelect")).toContainText(
        "The Prophet Skeram - 36"
      );
      await expect(page.locator("#targetSelect")).toContainText("Absÿ - 10");

      // switch to Ouro
      await page.locator("#fightSelect").selectOption("JvA4KLpyZ1fxrPgN;41");
      await page.getByRole("button", { name: "Fetch/Refresh" }).click();

      await expect(page.locator("#enemySelect")).toContainText("Ouro - 115");
      await expect(page.locator("#targetSelect")).toContainText("Absÿ - 10");
    });

    // Disabling for now since updating them via CI is painful
    test.skip("graph rendering", async ({ page }) => {
      await expect(page.locator("#fightSelect")).toContainText(
        "The Prophet Skeram - 3"
      );

      await page.getByRole("button", { name: "Fetch/Refresh" }).click();

      await expect(page.locator(".g-gtitle")).toContainText(
        "Threat - The Prophet Skeram"
      );

      await expect(page.locator("#targetSelect")).toContainText("Absÿ - 10");

      // MT
      await page
        .locator(".groups > .traces")
        .filter({ hasText: /Sheenftw/ })
        .locator(".legendtoggle")
        .dblclick();

      // Paladin
      await page
        .locator(".groups > .traces")
        .filter({ hasText: /Ascherìt/ })
        .locator(".legendtoggle")
        .click();

      // Rogue
      await page
        .locator(".groups > .traces")
        .filter({ hasText: /Wøj/ })
        .locator(".legendtoggle")
        .click();

      // Warlock
      await page
        .locator(".groups > .traces")
        .filter({ hasText: /Ratakor/ })
        .locator(".legendtoggle")
        .click();

      await expect(page.locator("#output")).toHaveScreenshot();
    });
  });
});
