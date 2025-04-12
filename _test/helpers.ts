import type { Page } from "@playwright/test";
import fs from "fs";
import path from "path";

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

  // Setup request interception
  await page.route("**/**/v1/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const apiPath = url.pathname.replace("/v1/", "");
    const searchParams = url.searchParams;

    // Determine mock file path based on API endpoint
    let mockFile: string;
    if (apiPath.startsWith("report/fights/")) {
      // Base report fights endpoint
      mockFile = path.join("_test", "mock", "report", reportId, "fights.json");
    } else if (
      apiPath.startsWith("report/events/") &&
      searchParams.get("filter") === 'type IN ("combatantinfo")'
    ) {
      // Events endpoint with filter
      const start = searchParams.get("start");

      if (!start) {
        throw new Error("Missing 'start' parameter in events request");
      }

      mockFile = path.join(
        "_test",
        "mock",
        "report",
        reportId,
        "fights",
        start,
        "combatantinfo.json"
      );
    } else if (apiPath.startsWith("report/events/")) {
      // Events endpoint with filter
      const start = searchParams.get("start");

      if (!start) {
        throw new Error("Missing 'start' parameter in events request");
      }

      mockFile = path.join(
        "_test",
        "mock",
        "report",
        reportId,
        "fights",
        start,
        "events.json"
      );
    } else if (apiPath.startsWith("report/tables/buffs/")) {
      // Events endpoint with filter
      const start = searchParams.get("start");
      const sourceId = searchParams.get("sourceid");

      if (!start) {
        throw new Error("Missing 'start' parameter in events request");
      }

      if (!sourceId) {
        throw new Error("Missing 'sourceid' parameter in buffs request");
      }

      mockFile = path.join(
        "_test",
        "mock",
        "report",
        reportId,
        "fights",
        start,
        "buffs",
        `${sourceId}.json`
      );
    } else {
      throw new Error(`Unhandled API endpoint: ${apiPath}`);
    }

    try {
      // Try to load existing mock data
      const mockData = JSON.parse(fs.readFileSync(mockFile, "utf-8"));
      await route.fulfill({ json: mockData });
    } catch (error) {
      // If mock file doesn't exist, let the request through and save the response
      console.log(
        `No mock data found for ${apiPath}, saving response to ${mockFile}`
      );

      // Create directory if it doesn't exist
      const dir = path.dirname(mockFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Let the request through and get the response
      const response = await route.fetch();
      const responseData = await response.json();

      // Save the response as mock data
      fs.writeFileSync(mockFile, JSON.stringify(responseData, null, 2));

      // Fulfill the route with the response
      await route.fulfill({ json: responseData });
    }
  });

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
