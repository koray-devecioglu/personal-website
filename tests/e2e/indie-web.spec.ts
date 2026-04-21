/**
 * E2E coverage for the M6 indie-web surfaces:
 *   - /now, /uses, /colophon, /reading all render their content pages.
 *   - /404 serves a custom noindex page with signposts.
 *   - Footer exposes the indie-web pages as navigable links.
 */
import { expect, test } from "@playwright/test";

const PAGES = [
  { path: "/now", heading: /Now/i },
  { path: "/uses", heading: /Uses/i },
  { path: "/colophon", heading: /Colophon/i },
  { path: "/reading", heading: /Reading/i },
] as const;

test.describe("indie-web pages", () => {
  for (const { path, heading } of PAGES) {
    test(`${path} renders its h1 and a prose body`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.ok()).toBe(true);
      await expect(
        page.getByRole("heading", { level: 1, name: heading }),
      ).toBeVisible();
      // PageLayout always ships a prose region below the header.
      await expect(page.locator(".page__prose")).toBeVisible();
    });
  }

  test("footer links to every indie-web page", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: /Indie-web pages/i });
    await expect(nav).toBeVisible();
    for (const label of ["Now", "Uses", "Reading", "Colophon"]) {
      await expect(
        nav.getByRole("link", { name: new RegExp(`^${label}$`, "i") }),
      ).toBeVisible();
    }
  });

  test("colophon surfaces the stack story", async ({ page }) => {
    await page.goto("/colophon");
    const prose = page.locator(".page__prose");
    await expect(prose.getByRole("link", { name: "Astro 5" })).toBeVisible();
    await expect(prose.getByText(/Cloudflare Pages/)).toBeVisible();
  });
});

test.describe("404 page", () => {
  test("an unknown path returns a 404 status and a custom shell", async ({ page }) => {
    const res = await page.goto("/definitely-not-a-real-url");
    expect(res?.status()).toBe(404);
    await expect(page.getByText(/Lost a page somewhere\./)).toBeVisible();
    // Scope to the in-page jump list, since the header nav also exposes
    // these links.
    const nav = page.getByRole("navigation", { name: /Site navigation/i });
    await expect(nav.getByRole("link", { name: /^Home$/ })).toBeVisible();
    await expect(nav.getByRole("link", { name: /^CV$/ })).toBeVisible();
  });

  test("/404 is explicitly noindex", async ({ page }) => {
    await page.goto("/404");
    const robots = await page.locator('meta[name="robots"]').getAttribute("content");
    expect(robots).toMatch(/noindex/);
  });
});
