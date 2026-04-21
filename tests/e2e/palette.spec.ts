/**
 * E2E coverage for the command palette island.
 *
 * Focused on observable behaviour, not implementation: the palette
 * opens via ⌘K and via the header button, renders results, arrows
 * between them, Enter navigates, Escape closes.
 */
import { expect, test } from "@playwright/test";

test.describe("command palette", () => {
  test("the trigger button is mounted in the header", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("[data-palette-trigger]")).toBeVisible();
  });

  test("clicking the trigger opens the palette and focuses the input", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("[data-palette-trigger]").first().click();
    const input = page.locator("[data-palette-input]");
    await expect(input).toBeFocused();
    // The list should be populated even with an empty query (jump targets).
    await expect(page.locator("[data-palette-item]").first()).toBeVisible();
  });

  test("⌘K / Ctrl+K opens the palette", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("ControlOrMeta+KeyK");
    await expect(page.locator("[data-palette-input]")).toBeFocused();
  });

  test("typing narrows results and Enter navigates", async ({ page }) => {
    await page.goto("/");
    await page.locator("[data-palette-trigger]").first().click();
    const input = page.locator("[data-palette-input]");
    await input.fill("colophon");
    // Matches the static /colophon jump target.
    const firstItem = page.locator("[data-palette-item]").first();
    await expect(firstItem).toContainText(/Colophon/i);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/colophon$/);
  });

  test("Escape closes the palette", async ({ page }) => {
    await page.goto("/");
    const dialog = page.locator("[data-palette]");
    await page.locator("[data-palette-trigger]").first().click();
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("the palette index includes every indie-web page", async ({ page }) => {
    await page.goto("/");
    const indexRaw = await page.locator("[data-palette-index]").first().textContent();
    expect(indexRaw).toBeTruthy();
    const payload = JSON.parse(indexRaw ?? "{}") as {
      items: { id: string }[];
    };
    const ids = payload.items.map((i) => i.id);
    expect(ids).toContain("jump:now");
    expect(ids).toContain("jump:uses");
    expect(ids).toContain("jump:colophon");
    expect(ids).toContain("jump:reading");
    expect(ids).toContain("jump:cv");
  });
});
