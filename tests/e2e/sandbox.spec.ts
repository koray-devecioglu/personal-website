import { expect, test } from "@playwright/test";

/**
 * Smoke for the M2 design-system showcase. Exercises:
 *   - the sandbox page itself renders
 *   - the theme toggle in the header cycles through its three states
 *     and persists the "dark" selection across reloads
 *   - the Footer exposes the three social links by role
 */

test.describe("sandbox", () => {
  test("renders and has M2 showcase sections", async ({ page }) => {
    await page.goto("/sandbox");
    await expect(
      page.getByRole("heading", { level: 1, name: /sandbox/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: /typography/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: /buttons/i }),
    ).toBeVisible();
  });

  test("theme toggle persists a dark selection", async ({ page }) => {
    await page.goto("/sandbox");
    const toggle = page.getByRole("button", { name: /theme/i });
    await expect(toggle).toBeVisible();

    // system → light → dark (three clicks from the default no-storage state)
    await toggle.click();
    await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("footer exposes social links", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /github profile/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /linkedin profile/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /instagram profile/i })).toBeVisible();
  });
});
