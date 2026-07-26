import { test, expect } from "@playwright/test";
import path from "node:path";
import { skipWelcome } from "./welcome";

const shotDir = path.resolve("..", "..", "smoke-screenshots", "playwright");

test.describe("route smoke + screenshots", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("skip welcome → primary routes", async ({ page }) => {
    await skipWelcome(page);
    await expect(page.getByRole("heading", { name: "SelfChronicle" })).toBeVisible();
    await page.screenshot({ path: path.join(shotDir, "01-today.png"), fullPage: true });

    await page.getByRole("button", { name: "Profile" }).click();
    await expect(page.getByTestId("profile-home")).toBeVisible({ timeout: 10_000 });
    await page.screenshot({ path: path.join(shotDir, "02-profile.png"), fullPage: true });

    await page.getByRole("button", { name: "Learn" }).click();
    await expect(page.getByTestId("learn-home")).toBeVisible();
    await page.screenshot({ path: path.join(shotDir, "03-learn.png"), fullPage: true });

    await page.getByRole("button", { name: "Vault" }).click();
    await expect(page.getByTestId("import-panel")).toBeVisible();
    await page.screenshot({ path: path.join(shotDir, "04-vault.png"), fullPage: true });

    await page.getByRole("button", { name: "Handoff" }).click();
    await expect(page.getByTestId("handoff-home")).toBeVisible();
    await page.getByTestId("handoff-home").getByRole("button", { name: /Build handoff/i }).click();
    await expect(page.getByTestId("handoff-preview")).not.toHaveText("");
    await page.screenshot({ path: path.join(shotDir, "05-handoff.png"), fullPage: true });

    await page.getByRole("button", { name: "Settings", exact: true }).click();
    await expect(page.getByTestId("trust-panel")).toBeVisible();
    await page.screenshot({ path: path.join(shotDir, "06-settings.png"), fullPage: true });

    await page.getByRole("button", { name: "Today" }).click();
    await page.getByTestId("note-draft").fill("Smoke note from Playwright");
    await page.getByTestId("note-save").click();
    await expect(page.getByText("Smoke note from Playwright")).toBeVisible({ timeout: 10_000 });
    await page.screenshot({ path: path.join(shotDir, "07-today-after-save.png"), fullPage: true });
  });
});
