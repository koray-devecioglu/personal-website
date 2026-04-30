/**
 * giscus comments configuration.
 *
 * Source of truth for the four IDs and the rendering options. The
 * `<Comments>` island reads these and renders the giscus client script
 * on demand. Updating the repo, category, or theme is a one-file edit
 * — the markup is generated, not hand-maintained.
 *
 * IDs are obtained once from https://giscus.app/. They're public — they
 * point to the comments backend, not to any private data.
 */

export const GISCUS = {
  repo: "koray-devecioglu/personal-website",
  repoId: "R_kgDOSH_fXA",
  category: "Announcements",
  categoryId: "DIC_kwDOSH_fXM4C8EWF",

  /** Maps a page to a discussion. `pathname` keys threads to the post
   *  URL — survives slug-stable renames, doesn't depend on titles or
   *  meta tags. */
  mapping: "pathname" as const,

  /** Strict-match avoids cross-collision when post pathnames share a
   *  prefix, e.g. /posts/welcome vs /posts/welcome-back. */
  strict: true,

  /** Reactions on the main post (👍 / ❤️ / etc.) — low effort, useful
   *  signal even when no one comments. */
  reactionsEnabled: true,

  /** Don't broadcast discussion metadata back to the parent page —
   *  we don't render comment counts anywhere yet. */
  emitMetadata: false,

  /** "bottom": comment box below the existing thread (less disruptive;
   *  readers see the conversation before a blank input). */
  inputPosition: "bottom" as const,

  /** Interface language — locked to English for now. Site i18n is
   *  English-only at launch (see src/lib/i18n.ts). */
  lang: "en" as const,
} as const;

/**
 * Map the site's three-state theme into a giscus theme identifier.
 *
 * The site stores "system" as `undefined` on `<html data-theme>`, and
 * "light"/"dark" as the literal value. giscus accepts those plus the
 * special `preferred_color_scheme` which lets the iframe follow the
 * OS-level preference.
 */
export function giscusThemeFor(siteTheme: string | undefined): string {
  if (siteTheme === "light") return "light";
  if (siteTheme === "dark") return "dark";
  return "preferred_color_scheme";
}
