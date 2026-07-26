import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

/** Dismiss empty-vault welcome without importing. */
export async function skipWelcome(page: Page): Promise<void> {
  await page.goto("/");
  const welcome = page.getByTestId("welcome-home");
  await welcome.waitFor({ state: "visible", timeout: 10_000 }).catch(() => undefined);
  if (await welcome.isVisible().catch(() => false)) {
    await welcome.getByRole("button", { name: "Skip for now" }).click();
    await expect(page.getByTestId("today-home")).toBeVisible({ timeout: 10_000 });
  }
}

/** Complete empty-vault welcome via bundled demo pack. */
export async function completeWelcomeDemo(page: Page): Promise<void> {
  await page.goto("/");
  const welcome = page.getByTestId("welcome-home");
  await welcome.waitFor({ state: "visible", timeout: 10_000 }).catch(() => undefined);
  if (!(await welcome.isVisible().catch(() => false))) return;
  await welcome.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByTestId("welcome-github")).toBeVisible();
  await page.getByRole("button", { name: /bundled demo pack/i }).click();
  await expect(page.getByTestId("welcome-review")).toBeVisible({ timeout: 15_000 });
  await page.getByRole("button", { name: "Commit to vault" }).click();
  await expect(page.getByTestId("welcome-done")).toBeVisible({ timeout: 10_000 });
  await page.getByRole("button", { name: "Open Today" }).click();
  await expect(page.getByTestId("today-home")).toBeVisible({ timeout: 10_000 });
}
