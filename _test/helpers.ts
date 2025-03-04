import { Page } from "@playwright/test";

/**
 * Loads a target from a report.
 *
 * Run the local server with `npm run start`
 *
 * @param page - The Playwright Page
 * @param url - The URL of the report.
 * @param unitKey - The `fight;enemy;target` key to select
 */
export async function loadTargetFromReport(
  page: Page,
  url: string,
  unitKey: string
) {
  const [, reportId] = /reports\/(\w+)$/.exec(url)!;

  await page.goto(url);

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
