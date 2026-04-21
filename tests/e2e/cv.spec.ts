/**
 * E2E coverage for the CV surface.
 *
 * - /cv renders the editorial layout and surfaces links to the print
 *   and JSON variants.
 * - /cv/print is noindex and doesn't carry the site header/footer.
 * - /cv.json returns valid JSON with the expected JSON Resume shape.
 */
import { expect, test } from "@playwright/test";

test.describe("cv surface", () => {
  test("/cv shows the name, label, and format links", async ({ page }) => {
    await page.goto("/cv");
    await expect(
      page.getByRole("heading", { level: 1, name: /Koray Devecioglu/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /Print-friendly/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /JSON Resume/i })).toBeVisible();
  });

  test("/cv shows the experience section with at least one role", async ({ page }) => {
    await page.goto("/cv");
    const experience = page.getByRole("region", { name: /Experience/i });
    await expect(experience).toBeVisible();
    // Entries are <li> within the section's <ol>.
    await expect(experience.locator("li").first()).toBeVisible();
  });

  test("/cv/print is noindex and lacks site chrome", async ({ page }) => {
    const response = await page.goto("/cv/print");
    expect(response?.ok()).toBe(true);

    const robots = await page.locator('meta[name="robots"]').getAttribute("content");
    expect(robots).toMatch(/noindex/);

    // The print surface uses a minimal <html> shell — no site header.
    await expect(page.locator(".site-header")).toHaveCount(0);
    await expect(page.locator(".site-footer")).toHaveCount(0);

    // But does render the CV content.
    await expect(
      page.getByRole("heading", { level: 1, name: /Koray Devecioglu/i }),
    ).toBeVisible();
  });

  test("/cv.json serves a valid JSON Resume payload", async ({ request }) => {
    const res = await request.get("/cv.json");
    expect(res.ok()).toBe(true);
    expect(res.headers()["content-type"]).toMatch(/application\/json/);

    const body = await res.json();
    expect(body.basics?.name).toBe("Koray Devecioglu");
    expect(Array.isArray(body.work)).toBe(true);
    expect(body.meta?.version).toBe("v1.0.0");
    // Private meta fields must not leak.
    expect(body._placeholder).toBeUndefined();
    expect(body._note).toBeUndefined();
  });

  test("primary nav exposes the CV link and marks it active on /cv", async ({
    page,
  }) => {
    await page.goto("/cv");
    const link = page.locator(".site-nav__link.is-active", { hasText: /CV/i });
    await expect(link).toBeVisible();
  });
});
