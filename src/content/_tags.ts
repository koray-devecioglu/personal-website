/**
 * The controlled tag vocabulary.
 *
 * Keeping this list closed — enforced in the Zod schema — prevents tag
 * drift (four spellings of "typescript", "ts", "TypeScript"...). Adding
 * a new tag is a deliberate one-line PR, which is the right friction.
 *
 * Keep the list broad on purpose: the site's subject matter spans code,
 * food, BBQ, football, travel, living abroad, and site-meta. The design
 * system is explicitly tuned so a BBQ essay and a refactoring deep-dive
 * sit next to each other without either looking out of place.
 *
 * Conventions:
 *   - kebab-case only
 *   - lowercase only
 *   - singular nouns unless the plural is idiomatic
 *   - no acronyms expanded ("bbq", not "barbecue")
 */

export const ALLOWED_TAGS = [
  // Engineering craft
  "testing",
  "typescript",
  "astro",
  "tooling",
  "architecture",
  "performance",
  "refactoring",
  "devops",
  "ai",

  // Writing craft + meta
  "writing",
  "site-news",

  // Fire & food
  "food",
  "bbq",
  "restaurants",

  // Travel + living abroad
  "travel",
  "cities",
  "living-abroad",

  // Sport
  "football",
  "stadiums",
  "sports",
  "running",
] as const;

export type Tag = (typeof ALLOWED_TAGS)[number];
