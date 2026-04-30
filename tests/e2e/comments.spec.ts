import { expect, test } from "@playwright/test";

/**
 * Comments are opt-in per post via `comments: true` in frontmatter.
 *
 * The widget itself is lazy — the giscus client script only loads after
 * the section scrolls into view — but the `[data-comments]` placeholder
 * is part of the static HTML, so we can assert the gate purely from the
 * initial render.
 *
 * `welcome.md` carries `comments: true`; `how-m2-landed.mdx` does not.
 */
test.describe("comments gating", () => {
  test("renders the comments placeholder on a post that opts in", async ({ page }) => {
    await page.goto("/posts/welcome");
    // The placeholder is below-the-fold by design (it's a footer-region
    // element on a long-form post). We assert DOM presence, not viewport
    // visibility — the lazy-load is intentional and tested separately.
    await expect(page.locator("[data-comments]")).toHaveCount(1);
    await expect(
      page.getByRole("heading", { name: /comments/i, level: 2 }),
    ).toHaveCount(1);
  });

  test("omits the comments placeholder on a post that does not opt in", async ({
    page,
  }) => {
    await page.goto("/posts/how-m2-landed");
    await expect(page.locator("[data-comments]")).toHaveCount(0);
  });
});
