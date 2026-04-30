/**
 * Central registry for site-wide links and identifiers.
 *
 * Anything that gets surfaced in the footer, About page, JSON-LD, or
 * `rel="me"` lives here. GitHub lives under a hyphenated handle;
 * LinkedIn and Instagram use the unhyphenated form. Keep both — the
 * footer / CV / JSON-LD all read from here, so one fix propagates.
 */

export const SITE = {
  name: "Koray Devecioglu",
  domain: "koraydevecioglu.com",
  url: "https://koraydevecioglu.com",
  description: "Personal site of Koray Devecioglu — essays, notes, projects, and a CV.",
  email: "hi@koraydevecioglu.com",
  copyright: "© Koray Devecioglu 2026",
  locale: "en",
} as const;

/**
 * Public label for the `/cv` surface.
 *
 * Route intentionally stays `/cv` for URL stability and existing links.
 */
export const PROFILE_LABEL = {
  nav: "Journey",
  heading: "Career Journey",
  doc: "Career Journey",
} as const;

export const SOCIAL = {
  github: {
    handle: "koray-devecioglu",
    url: "https://github.com/koray-devecioglu",
    label: "GitHub",
  },
  linkedin: {
    handle: "koraydevecioglu",
    url: "https://www.linkedin.com/in/koraydevecioglu/",
    label: "LinkedIn",
  },
  instagram: {
    handle: "koraydevecioglu",
    url: "https://www.instagram.com/koraydevecioglu/",
    label: "Instagram",
  },
} as const;

export type SocialKey = keyof typeof SOCIAL;
