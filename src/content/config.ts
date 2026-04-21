/**
 * Astro Content Collections wiring.
 *
 * Thin shim: each collection picks a loader (glob over the type's
 * folder) and hands Astro the corresponding Zod schema from
 * `_schemas.ts`. Keeping the schemas in a plain .ts file means the
 * vitest harness can validate them without spinning up Astro.
 *
 * Schemas receive `{ image }` from the loader context so `image()`
 * resolves to Astro's asset-aware validator; our `_schemas.ts`
 * factories pass it straight through.
 */

import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";

import {
  bookmarkSchema,
  essaySchema,
  noteSchema,
  projectSchema,
  seriesSchema,
  tilSchema,
  tutorialSchema,
} from "./_schemas";

const postLoader = (folder: string) =>
  glob({
    pattern: "**/*.{md,mdx}",
    base: `./src/content/${folder}`,
  });

const essays = defineCollection({
  loader: postLoader("essays"),
  schema: ({ image }) => essaySchema(image),
});

const tutorials = defineCollection({
  loader: postLoader("tutorials"),
  schema: ({ image }) => tutorialSchema(image),
});

const tils = defineCollection({
  loader: postLoader("tils"),
  schema: ({ image }) => tilSchema(image),
});

const notes = defineCollection({
  loader: postLoader("notes"),
  schema: ({ image }) => noteSchema(image),
});

const projects = defineCollection({
  loader: postLoader("projects"),
  schema: ({ image }) => projectSchema(image),
});

const bookmarks = defineCollection({
  loader: postLoader("bookmarks"),
  schema: ({ image }) => bookmarkSchema(image),
});

const series = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/series",
  }),
  schema: seriesSchema,
});

export const collections = {
  essays,
  tutorials,
  tils,
  notes,
  projects,
  bookmarks,
  series,
};
