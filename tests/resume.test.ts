/**
 * Résumé schema tests.
 *
 * Covers the invariants the Astro build leans on:
 *   - the real `src/data/resume.json` validates (otherwise the build
 *     will throw at page-generation time)
 *   - work entries must be newest-first
 *   - partial-ISO dates are accepted, malformed ones are not
 *   - the small date formatters stay stable
 *
 * Intentionally run outside the Astro runtime so CI is fast. The
 * loader imports the JSON via `import attributes` which Node 22
 * supports natively.
 */

import { describe, expect, it } from "vitest";
import {
  formatDateRange,
  formatResumeDate,
  loadResume,
  resumeSchema,
} from "../src/lib/resume";

const BASE = {
  basics: {
    name: "Test Person",
    label: "Tester",
    email: "t@example.com",
    summary: "One line summary.",
    profiles: [],
  },
  work: [],
  education: [],
  skills: [],
  languages: [],
  publications: [],
  projects: [],
  awards: [],
};

describe("resumeSchema", () => {
  it("validates the shipped placeholder résumé", () => {
    expect(() => loadResume()).not.toThrow();
    const r = loadResume();
    expect(r.basics.name).toBe("Koray Devecioglu");
    expect(r.work.length).toBeGreaterThan(0);
  });

  it("rejects out-of-order work history", () => {
    const out = resumeSchema.safeParse({
      ...BASE,
      work: [
        {
          name: "Old Co",
          position: "Eng",
          startDate: "2019-01",
          endDate: "2020-01",
          highlights: [],
        },
        {
          name: "New Co",
          position: "Eng",
          startDate: "2022-01",
          highlights: [],
        },
      ],
    });
    expect(out.success).toBe(false);
    if (!out.success) {
      expect(out.error.issues[0]?.path).toContain("startDate");
      expect(out.error.issues[0]?.message).toMatch(/newest-first/);
    }
  });

  it("accepts YYYY / YYYY-MM / YYYY-MM-DD date precisions", () => {
    const out = resumeSchema.safeParse({
      ...BASE,
      work: [
        {
          name: "A",
          position: "p",
          startDate: "2024-06-15",
          highlights: [],
        },
      ],
      education: [
        {
          institution: "Uni",
          area: "CS",
          studyType: "B.Sc.",
          startDate: "2018",
          endDate: "2022-06",
        },
      ],
    });
    expect(out.success).toBe(true);
  });

  it("rejects bad email and bad date formats", () => {
    const badEmail = resumeSchema.safeParse({
      ...BASE,
      basics: { ...BASE.basics, email: "not-an-email" },
    });
    expect(badEmail.success).toBe(false);

    const badDate = resumeSchema.safeParse({
      ...BASE,
      work: [
        {
          name: "A",
          position: "p",
          startDate: "June 2024",
          highlights: [],
        },
      ],
    });
    expect(badDate.success).toBe(false);
  });

  it("rejects work entries where endDate precedes startDate", () => {
    const out = resumeSchema.safeParse({
      ...BASE,
      work: [
        {
          name: "A",
          position: "p",
          startDate: "2022-01",
          endDate: "2021-06",
          highlights: [],
        },
      ],
    });
    expect(out.success).toBe(false);
  });
});

describe("date formatters", () => {
  it("humanises partial ISO dates", () => {
    expect(formatResumeDate("2024")).toBe("2024");
    expect(formatResumeDate("2024-03")).toBe("Mar 2024");
    expect(formatResumeDate(undefined)).toBe("Present");
  });

  it("formats ranges and handles open-ended roles", () => {
    expect(formatDateRange("2020-01", "2022-06")).toBe("Jan 2020 – Jun 2022");
    expect(formatDateRange("2023-06", undefined)).toBe("Jun 2023 – Present");
  });
});
