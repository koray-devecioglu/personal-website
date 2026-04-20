/**
 * Central registry for site-wide links and identifiers.
 *
 * Anything that gets surfaced in the footer, About page, JSON-LD, or
 * `rel="me"` lives here. The placeholders below are intentional — Koray
 * will hand over the real LinkedIn and Instagram URLs and we replace
 * them with the real values in a one-line PR.
 *
 * TODO(koray): replace LINKEDIN_URL and INSTAGRAM_URL with real profile
 * URLs. GitHub handle is confirmed as `koray-devecioglu`.
 */

export const SITE = {
  name: "Koray Devecioglu",
  domain: "koraydevecioglu.com",
  url: "https://koraydevecioglu.com",
  description:
    "Personal site of Koray Devecioglu — essays, notes, projects, and a CV.",
  email: "hi@koraydevecioglu.com",
  copyright: "© Koray Devecioglu 2026",
  locale: "en",
} as const;

export const SOCIAL = {
  github: {
    handle: "koray-devecioglu",
    url: "https://github.com/koray-devecioglu",
    label: "GitHub",
  },
  linkedin: {
    // TODO(koray): replace with real LinkedIn URL
    handle: "koray-devecioglu",
    url: "https://www.linkedin.com/in/koray-devecioglu/",
    label: "LinkedIn",
    placeholder: true,
  },
  instagram: {
    // TODO(koray): replace with real Instagram URL
    handle: "koraydevecioglu",
    url: "https://www.instagram.com/koraydevecioglu/",
    label: "Instagram",
    placeholder: true,
  },
} as const;

export type SocialKey = keyof typeof SOCIAL;
