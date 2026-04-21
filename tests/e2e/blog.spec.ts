import { expect, test } from "@playwright/test";

// Astro's preview server enforces `trailingSlash: "never"` strictly —
// so these tests navigate to the canonical, slash-free forms.

test.describe("blog surface", () => {
  test("/posts lists posts with meta", async ({ page }) => {
    await page.goto("/posts");
    await expect(page.getByRole("heading", { level: 1, name: /posts/i })).toBeVisible();
    const cards = page.locator("article.post-card");
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test("a post page renders prose and meta", async ({ page }) => {
    await page.goto("/posts/welcome");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator(".prose")).toBeVisible();
  });

  test("/tags renders the tag cloud", async ({ page }) => {
    await page.goto("/tags");
    await expect(page.getByRole("heading", { level: 1, name: /tags/i })).toBeVisible();
  });

  test("a tag page filters the stream", async ({ page }) => {
    await page.goto("/tags/astro");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("astro");
  });

  test("/series lists series", async ({ page }) => {
    await page.goto("/series");
    await expect(
      page.getByRole("heading", { level: 1, name: /series/i }),
    ).toBeVisible();
  });

  test("a series page lists its posts in order", async ({ page }) => {
    await page.goto("/series/building-this-site");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const cards = page.locator("article.post-card");
    expect(await cards.count()).toBeGreaterThanOrEqual(2);
  });

  test("/rss.xml is served with XML content-type", async ({ request }) => {
    const res = await request.get("/rss.xml");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toMatch(/xml/);
    const body = await res.text();
    expect(body).toContain("<rss");
  });

  test("/feed.json is a valid JSON Feed 1.1 document", async ({ request }) => {
    const res = await request.get("/feed.json");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.version).toBe("https://jsonfeed.org/version/1.1");
    expect(Array.isArray(body.items)).toBe(true);
  });

  test("an OG card is served as PNG", async ({ request }) => {
    const res = await request.get("/og/welcome.png");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toMatch(/image\/png/);
  });

  test("primary nav marks the current section as active", async ({ page }) => {
    await page.goto("/posts");
    const activeLink = page.locator('nav[aria-label="Primary"] a[aria-current="page"]');
    await expect(activeLink).toHaveText(/posts/i);
  });
});
