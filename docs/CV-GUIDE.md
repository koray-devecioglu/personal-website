# CV guide

Everything you need to know to edit the CV that ships at `/cv`,
`/cv/print`, `/cv.json`, and `public/cv.pdf`.

## One file, three surfaces

The résumé has exactly one source of truth:

```
src/data/resume.json
```

This file is validated at build time against `src/lib/resume.ts`
(a Zod schema over [JSON Resume 1.0.0](https://jsonresume.org/schema/)).
A failing validation fails the build with a pointer to the offending
path — there's no world in which a broken `resume.json` ships.

From that one file, three routes are built:

| Route       | What it is                                                      |
| ----------- | --------------------------------------------------------------- |
| `/cv`       | Editorial screen layout — same typography as the blog.          |
| `/cv/print` | Print-optimised HTML, `noindex`, used as the PDF source.        |
| `/cv.json`  | Machine-readable JSON Resume payload, strips `_`-prefixed keys. |

A fourth artifact — `public/cv.pdf` — is regenerated locally from
`/cv/print` by `pnpm build:cv` and committed to the repo.

## Editing

### Anatomy of `resume.json`

```jsonc
{
  "_placeholder": true,          // remove once real content is in
  "_note": "free-form human note — scrubbed from /cv.json output",
  "basics": {
    "name":    "...",
    "label":   "...",            // short tagline, one line
    "email":   "...",
    "url":     "...",
    "summary": "...",            // 2–3 sentences
    "location": { "city": "...", "countryCode": "NL" },
    "profiles": [
      { "network": "GitHub",   "username": "...", "url": "..." }
    ]
  },
  "work":         [ { ... } ],   // newest first (enforced)
  "education":    [ { ... } ],
  "skills":       [ { ... } ],
  "languages":    [ { ... } ],
  "publications": [ { ... } ],
  "projects":     [ { ... } ],
  "awards":       [ { ... } ]
}
```

All sections except `basics` are optional — empty arrays simply omit the
section from the rendered CV. `basics.name`, `basics.label`,
`basics.email`, and `basics.summary` are the only hard requirements.

### Work entry

```jsonc
{
  "name": "Company name",
  "position": "Your role",
  "url": "https://company.example", // optional
  "location": "City or 'Remote'", // optional
  "startDate": "2023-06", // YYYY / YYYY-MM / YYYY-MM-DD
  "endDate": "2024-03", // omit for current roles
  "summary": "One-line role framing.", // optional
  "highlights": [
    "Bullet one — lead with the outcome, then the approach.",
    "Bullet two — numbers where you have them.",
  ],
}
```

**Invariants enforced at build time:**

- Partial-ISO dates only (`YYYY`, `YYYY-MM`, `YYYY-MM-DD`).
- `endDate >= startDate`.
- Work entries are ordered newest-first. Swap two entries out of order
  and the build fails.

### Education, projects, publications, awards, languages

All follow JSON Resume conventions; see the existing placeholder file
for a live example of each.

### Skills

Grouped, not a flat list. Each group has a `name` (the label) and
`keywords` (the tokens). Example:

```jsonc
{
  "name": "Languages",
  "keywords": ["TypeScript", "Go", "Python"],
}
```

## Workflow

1. Edit `src/data/resume.json`.
2. Run `pnpm dev` and look at `http://localhost:4321/cv`.
   Iterate until it reads the way you want.
3. Check the print version: open `http://localhost:4321/cv/print`,
   zoom out, verify pagination in the browser's print preview.
4. Once you're happy:

   ```sh
   pnpm build          # required — build:cv needs the built site
   pnpm build:cv       # renders public/cv.pdf
   ```

5. Commit both the JSON edit _and_ the regenerated `public/cv.pdf` in
   the same PR, so reviewers see the rendered output.

## Why commit the PDF?

Cloudflare Pages doesn't ship with Chromium preinstalled. Installing
Playwright's browsers on every build is 300+MB of download for a file
that changes twice a year. Committing `public/cv.pdf`:

- Keeps deploys fast and reproducible.
- Makes CV changes visible in the diff (GitHub can't render the binary,
  but file-size deltas are a useful smell).
- Lets `/cv.pdf` resolve as a real static file at the edge.

The cost is a one-command local step (`pnpm build:cv`). Acceptable.

## Schema reference

Authoritative types live in `src/lib/resume.ts`. If you try to add a
field JSON Resume supports that we don't, the loader will reject the
document — extend the schema first, then the data.

## Related surfaces

- **Print stylesheet:** `src/styles/cv-print.css`. Designed for A4,
  2-page maximum for a mid-career CV. Ink-friendly — dark grays, no
  colour fills, preserved underlines on links.
- **Screen stylesheet:** `src/styles/cv.css`. Shares type with the
  blog; shares `--fg`, `--rule`, `--accent` etc. from `tokens.css`.
- **Tests:** `tests/resume.test.ts` (Zod), `tests/e2e/cv.spec.ts`
  (Playwright). Both run in the default gate.
