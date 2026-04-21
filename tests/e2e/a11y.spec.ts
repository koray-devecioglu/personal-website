import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// A curated route map that exercises every page template the site
// actually ships. axe-core runs against each one and fails the job if
// it reports a serious or critical violation under WCAG 2.1 A/AA.
//
// Lower severities ("minor", "moderate") surface as console output but
// do not fail the build — the gate here is "no blocker for a real user
// on assistive tech", not "absolute zero".
const NOT_FOUND_PATH = "/this-route-does-not-exist";

const ROUTES = [
  { name: "home", path: "/" },
  { name: "posts index", path: "/posts" },
  { name: "post detail (essay)", path: "/posts/welcome" },
  { name: "post detail (mdx)", path: "/posts/how-m2-landed" },
  { name: "tags index", path: "/tags" },
  { name: "tag detail", path: "/tags/astro" },
  { name: "series index", path: "/series" },
  { name: "series detail", path: "/series/building-this-site" },
  { name: "cv screen", path: "/cv" },
  { name: "now", path: "/now" },
  { name: "uses", path: "/uses" },
  { name: "colophon", path: "/colophon" },
  { name: "reading", path: "/reading" },
  { name: "404", path: NOT_FOUND_PATH },
] as const;

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
const BLOCKING_IMPACTS = new Set(["serious", "critical"]);

async function scan(page: Page, path: string) {
  const response = await page.goto(path, { waitUntil: "domcontentloaded" });
  // The only expected non-200 is the synthetic 404 route — everything
  // else must serve cleanly or the build itself has regressed.
  if (path === NOT_FOUND_PATH) {
    expect(response?.status()).toBe(404);
  } else {
    expect(response?.ok()).toBe(true);
  }
  // Wait until fonts and the theme script have settled so axe sees the
  // final rendered contrast.
  await page.waitForLoadState("networkidle");

  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

  const blockers = results.violations.filter(
    (v) => v.impact && BLOCKING_IMPACTS.has(v.impact),
  );

  if (blockers.length > 0) {
    const report = blockers
      .map((v) => {
        const nodes = v.nodes
          .slice(0, 3)
          .map((n) => n.target.join(" "))
          .join(", ");
        return `  - [${v.impact}] ${v.id}: ${v.help}\n    nodes: ${nodes}`;
      })
      .join("\n");
    throw new Error(
      `axe-core found ${blockers.length} serious/critical violation(s) on ${path}:\n${report}`,
    );
  }
}

test.describe("a11y gate (axe-core)", () => {
  for (const route of ROUTES) {
    test(`${route.name} (${route.path}) has no serious or critical violations`, async ({
      page,
    }) => {
      await scan(page, route.path);
    });
  }
});
