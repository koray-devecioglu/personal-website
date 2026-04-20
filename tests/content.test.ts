import { describe, expect, it } from "vitest";
import { SITE, SOCIAL } from "../src/data/links";

/**
 * M1 placeholder tests.
 *
 * These exist so `pnpm test` exits zero out of the box and CI has a
 * non-empty target. M3 replaces this file with the real Zod content-
 * schema validation harness.
 */

describe("site identity", () => {
  it("has the correct domain", () => {
    expect(SITE.domain).toBe("koraydevecioglu.com");
    expect(SITE.url).toBe("https://koraydevecioglu.com");
  });

  it("has a valid email", () => {
    expect(SITE.email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
  });
});

describe("social links", () => {
  it.each(Object.entries(SOCIAL))("%s URL is well-formed", (_key, social) => {
    expect(() => new URL(social.url)).not.toThrow();
    expect(social.url).toMatch(/^https:\/\//);
  });
});
