/**
 * UI string dictionary.
 *
 * Centralised now so every user-facing label in the chrome flows
 * through one file. When Turkish (or any other locale) lands, this
 * same file grows a `tr` branch — components don't change, they just
 * call `t("key")` against the active locale.
 *
 * M4 ships only `en`. The seam exists so M5+ can add translations
 * without touching components.
 */

import { PROFILE_LABEL, SITE } from "../data/links";

const dictionaries = {
  en: {
    "nav.home": "Home",
    "nav.posts": "Posts",
    "nav.tags": "Tags",
    "nav.series": "Series",
    "nav.cv": PROFILE_LABEL.nav,

    "home.hero.eyebrow": "Writing · CV · Notes",
    "home.hero.title": "Thinking out loud, in public.",
    "home.hero.subtitle":
      "Koray Devecioglu — engineer. Essays on code and craft, notes from the kitchen and the trail, projects I've shipped.",
    "home.latest.title": "Latest",
    "home.latest.viewAll": "All posts →",

    "post.readingTime": "{{minutes}} min read",
    "post.updated": "Updated {{date}}",
    "post.published": "Published {{date}}",
    "post.series.banner": "Part {{index}} of {{total}} in",
    "post.prev": "Previous",
    "post.next": "Next",
    "post.tableOfContents": "On this page",
    "post.back": "Back to posts",

    "posts.title": "Posts",
    "posts.empty": "Nothing published yet — the first post lands soon.",
    "posts.count.one": "1 post",
    "posts.count.many": "{{count}} posts",

    "tags.title": "Tags",
    "tags.subtitle":
      "Every post carries a handful of tags drawn from a short, deliberate vocabulary.",
    "tags.page.title": "Tagged {{tag}}",

    "series.title": "Series",
    "series.subtitle": "Connected posts that make more sense read in order.",
    "series.page.subtitle": "{{count}} posts in this series",

    "feed.rss": "RSS feed",
    "feed.json": "JSON feed",

    "footer.colophon":
      "Built with Astro, Fraunces, Inter, and JetBrains Mono. Hosted on Cloudflare Pages.",

    "draft.badge": "Draft",
    "scheduled.badge": "Scheduled",
  },
} as const satisfies Record<string, Record<string, string>>;

type Locale = keyof typeof dictionaries;
type Key = keyof (typeof dictionaries)["en"];

const DEFAULT_LOCALE: Locale = (SITE.locale as Locale) ?? "en";

/**
 * Look up a string, optionally interpolating `{{name}}` placeholders.
 * Silently returns the key itself on a miss — shipping `post.prev`
 * verbatim is a louder regression than a missing translation fallback.
 */
export function t(
  key: Key,
  vars?: Record<string, string | number>,
  locale: Locale = DEFAULT_LOCALE,
): string {
  const dict = dictionaries[locale] ?? dictionaries.en;
  const template = (dict as Record<string, string>)[key] ?? key;
  if (!vars) return template;
  return template.replace(/{{\s*(\w+)\s*}}/g, (_, name: string) =>
    String(vars[name] ?? `{{${name}}}`),
  );
}

export type TranslationKey = Key;
