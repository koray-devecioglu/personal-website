/**
 * Résumé schema + loader.
 *
 * Source of truth is `src/data/resume.json`, conforming (optionally) to
 * the JSON Resume 1.0.0 spec — https://jsonresume.org/schema/
 *
 * Why this file exists:
 *   1. Zod schema catches structural drift — missing fields, wrong
 *      date formats, reordered work history — at typecheck + test
 *      time, not in production.
 *   2. Callers (the /cv HTML page, /cv/print, /cv.json endpoint) get
 *      a single typed `loadResume()` entry point. They never reach
 *      into the raw JSON.
 *   3. Swapping placeholder data for real content is a one-file edit:
 *      replace resume.json, the schema and all three surfaces pick up
 *      the change.
 *
 * What's *not* in scope here:
 *   - Rendering. Components under src/components/cv/ own that.
 *   - PDF export. scripts/build-cv-pdf.ts owns that.
 */

import rawResume from "../data/resume.json" with { type: "json" };
// `astro/zod` is the single Zod instance the whole project shares —
// content schemas, SEO helpers, and resume validation stay in lock-step.
import { z } from "astro/zod";

// ── Primitives ─────────────────────────────────────────────────────────

/**
 * Partial-ISO date. Accepts "2024", "2024-03", or "2024-03-01".
 * Keeps the CV honest — we don't require precision we don't have.
 */
const partialIsoDate = z
  .string()
  .regex(
    /^\d{4}(-\d{2}(-\d{2})?)?$/,
    'Expected a partial ISO date ("YYYY", "YYYY-MM", or "YYYY-MM-DD").',
  );

const optionalUrl = z.string().url().optional();

// ── Sections ───────────────────────────────────────────────────────────

const profileSchema = z.object({
  network: z.string().min(1),
  username: z.string().min(1),
  url: z.string().url(),
});

const locationSchema = z
  .object({
    address: z.string().optional(),
    postalCode: z.string().optional(),
    city: z.string().optional(),
    region: z.string().optional(),
    countryCode: z
      .string()
      .length(2, "ISO 3166-1 alpha-2, e.g. NL, TR, US.")
      .optional(),
  })
  .strict();

const basicsSchema = z
  .object({
    name: z.string().min(1),
    label: z.string().min(1),
    image: optionalUrl,
    email: z.string().email(),
    phone: z.string().optional(),
    url: optionalUrl,
    summary: z.string().min(1),
    location: locationSchema.optional(),
    profiles: z.array(profileSchema).default([]),
  })
  .strict();

const workSchema = z
  .object({
    name: z.string().min(1),
    position: z.string().min(1),
    url: optionalUrl,
    location: z.string().optional(),
    startDate: partialIsoDate,
    endDate: partialIsoDate.optional(),
    summary: z.string().optional(),
    highlights: z.array(z.string().min(1)).default([]),
  })
  .strict()
  .refine(
    (w) => !w.endDate || w.endDate >= w.startDate,
    "Work endDate must be on or after startDate.",
  );

const educationSchema = z
  .object({
    institution: z.string().min(1),
    url: optionalUrl,
    area: z.string().min(1),
    studyType: z.string().min(1),
    startDate: partialIsoDate,
    endDate: partialIsoDate.optional(),
    score: z.string().optional(),
    courses: z.array(z.string()).default([]),
  })
  .strict();

const skillSchema = z
  .object({
    name: z.string().min(1),
    level: z.string().optional(),
    keywords: z.array(z.string()).default([]),
  })
  .strict();

const languageSchema = z
  .object({
    language: z.string().min(1),
    fluency: z.string().min(1),
  })
  .strict();

const publicationSchema = z
  .object({
    name: z.string().min(1),
    publisher: z.string().min(1),
    releaseDate: partialIsoDate,
    url: optionalUrl,
    summary: z.string().optional(),
  })
  .strict();

const projectSchema = z
  .object({
    name: z.string().min(1),
    description: z.string().optional(),
    url: optionalUrl,
    startDate: partialIsoDate.optional(),
    endDate: partialIsoDate.optional(),
    highlights: z.array(z.string()).default([]),
    keywords: z.array(z.string()).default([]),
  })
  .strict();

const awardSchema = z
  .object({
    title: z.string().min(1),
    date: partialIsoDate,
    awarder: z.string().optional(),
    summary: z.string().optional(),
  })
  .strict();

// ── Root ───────────────────────────────────────────────────────────────

export const resumeSchema = z
  .object({
    _placeholder: z.boolean().optional(),
    _note: z.string().optional(),
    basics: basicsSchema,
    work: z.array(workSchema).default([]),
    education: z.array(educationSchema).default([]),
    skills: z.array(skillSchema).default([]),
    languages: z.array(languageSchema).default([]),
    publications: z.array(publicationSchema).default([]),
    projects: z.array(projectSchema).default([]),
    awards: z.array(awardSchema).default([]),
  })
  .strict()
  .superRefine((r, ctx) => {
    // Work history must be newest-first. Mistakes in the JSON should be
    // a build-time failure, not a silently out-of-order /cv.
    const withStart = r.work.map((w, i) => ({ i, start: w.startDate }));
    for (let k = 1; k < withStart.length; k++) {
      const prev = withStart[k - 1]!;
      const curr = withStart[k]!;
      if (prev.start < curr.start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["work", curr.i, "startDate"],
          message:
            "Work entries must be newest-first (startDate descending). " +
            `Found ${curr.start} after ${prev.start}.`,
        });
      }
    }
  });

export type Resume = z.infer<typeof resumeSchema>;
export type Work = Resume["work"][number];
export type Education = Resume["education"][number];
export type Skill = Resume["skills"][number];
export type Project = Resume["projects"][number];
export type Publication = Resume["publications"][number];
export type Language = Resume["languages"][number];
export type Profile = Resume["basics"]["profiles"][number];

// ── Loader ─────────────────────────────────────────────────────────────

let cached: Resume | undefined;

/**
 * Validate + return the résumé. Throws with a formatted path/message on
 * the first schema failure — makes the Astro build fail fast with a
 * helpful pointer, rather than rendering a broken page.
 */
export function loadResume(): Resume {
  if (cached) return cached;
  const parsed = resumeSchema.safeParse(rawResume);
  if (!parsed.success) {
    const first = parsed.error.issues[0]!;
    throw new Error(
      `resume.json failed validation at \`${first.path.join(".")}\`: ${first.message}`,
    );
  }
  cached = parsed.data;
  return cached;
}

// ── Small display helpers ─────────────────────────────────────────────

/**
 * Humanise a partial ISO date ("2024-03" → "Mar 2024", "2024" → "2024").
 * Returns "Present" for `undefined`. Month-only precision is intentional —
 * CV dates above monthly are usually noise.
 */
export function formatResumeDate(date: string | undefined): string {
  if (!date) return "Present";
  if (/^\d{4}$/.test(date)) return date;
  const [year, month, day] = date.split("-");
  const d = new Date(Number(year), Number(month) - 1, day ? Number(day) : 1);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

/**
 * Render a date range ("2021-06 – 2024-03" → "Jun 2021 – Mar 2024").
 * Handles open-ended ranges with "Present".
 */
export function formatDateRange(start: string, end: string | undefined): string {
  return `${formatResumeDate(start)} – ${formatResumeDate(end)}`;
}
