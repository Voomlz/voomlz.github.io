import { test, expect } from "@playwright/test";

const TEST_LOG_URL =
  "https://vanilla.warcraftlogs.com/reports/qXDrpmFfHg3dNjzt";

test.describe("/era/", () => {
  test.describe("no url param", () => {
    test("can load a report", async ({ page }) => {
      await page.goto(`/era/`);
      await page.locator("#reportSelect").fill(TEST_LOG_URL);
      await page.getByRole("button", { name: "Fetch", exact: true }).click();
      await page.getByRole("button", { name: "Fetch/Refresh" }).click();
    });
  });

  test.describe("with url param", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/era/?id=${TEST_LOG_URL}`);
    });

    test("can switch targets", async ({ page }) => {
      await expect(page.locator("#fightSelect")).toContainText(
        "Anub'Rekhan - 1"
      );

      await page.getByRole("button", { name: "Fetch/Refresh" }).click();

      await expect(page.locator("#enemySelect")).toContainText(
        "Anub'Rekhan - 43"
      );

      // Initial target, alphabetically choosen
      await expect(page.locator("#targetSelect")).toContainText("Amii - 29");

      await expect(page.locator("#threatTableContainer")).toContainText(
        "Amii - Started fight with threat coeff 0.56"
      );

      // switch to a different target
      await page
        .locator("#targetSelect")
        .selectOption("qXDrpmFfHg3dNjzt;1;43;23");

      await expect(page.locator("#threatTableContainer")).toContainText(
        "Arvoxd - Started fight with threat coeff 0.56"
      );
    });

    test("can switch fights", async ({ page }) => {
      await expect(page.locator("#fightSelect")).toContainText(
        "Anub'Rekhan - 1"
      );
      await page.getByRole("button", { name: "Fetch/Refresh" }).click();
      await expect(page.locator("#targetSelect")).toContainText("Amii - 29");
      await page.locator("#fightSelect").selectOption("qXDrpmFfHg3dNjzt;29");
      await expect(page.locator("#enemySelect")).toContainText(
        "Anub'Rekhan - 43"
      );
      await page.getByRole("button", { name: "Fetch/Refresh" }).click();
      await expect(page.locator("#enemySelect")).toContainText(
        "Sapphiron - 236"
      );
      await expect(page.locator("#targetSelect")).toContainText("Amii - 29");
    });

    test.describe("threat values", () => {
      test("Warrior MT", async ({ page }) => {
        await page.getByRole("button", { name: "Fetch/Refresh" }).click();
        await page
          .locator("#targetSelect")
          .selectOption("qXDrpmFfHg3dNjzt;1;43;38"); // Tragortf

        await expect(page.locator("#threatTableContainer")).toMatchAriaSnapshot(
          {
            name: "threat-warrior-mt.yml",
          }
        );
      });
    });
  });
});
