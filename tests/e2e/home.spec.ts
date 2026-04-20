import { expect, test } from "@playwright/test";

test.describe("home", () => {
  test("renders with a descriptive title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Koray Devecioglu/);
  });

  test("has an h1", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("skip-link is reachable by keyboard", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skipLink = page.getByRole("link", { name: /skip to content/i });
    await expect(skipLink).toBeFocused();
  });
});
