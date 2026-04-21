# Quality gates

Every PR and every push to `main` runs four parallel quality gates in
GitHub Actions (`.github/workflows/ci.yml`). A red gate blocks merge.

| Gate       | Tool                                                                         | Local command                                      | Budget / pass condition                                       |
| ---------- | ---------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------- |
| Verify     | pnpm · ESLint · Prettier · `astro check` · Vitest · `astro build` + Pagefind | `pnpm build` (after the per-command scripts)       | All green; lockfile must match (`--frozen-lockfile`)          |
| E2E + a11y | Playwright + `@axe-core/playwright`                                          | `pnpm test:e2e` (or `pnpm test:a11y` for axe only) | All Playwright specs pass; no serious/critical axe violations |
| Lighthouse | `@lhci/cli` against the preview build                                        | `pnpm lhci`                                        | perf ≥ 95 · a11y = 100 · best-practices ≥ 95 · SEO = 100      |
| Link check | `lychee`                                                                     | `pnpm lint:links` (needs `dist/`)                  | No 4xx/5xx; 429 is tolerated (rate-limited, not broken)       |

## What each gate checks

### Verify

The baseline job every other gate depends on. Reads `pnpm-lock.yaml`
with `--frozen-lockfile`, then walks:

1. `pnpm format:check`
2. `pnpm lint`
3. `pnpm typecheck`
4. `pnpm test` (Vitest — content schema, helpers, palette index)
5. `pnpm build` — `astro build` + `pagefind --site dist`. Uploads the
   resulting `dist/` as a workflow artifact so the lychee job can reuse
   it without rebuilding.

### E2E + a11y

Runs the full Playwright suite under Chromium against the production
preview build. `tests/e2e/a11y.spec.ts` additionally scans a curated
list of URLs with axe-core (`wcag2a`, `wcag2aa`, `wcag21a`,
`wcag21aa`) and fails on any violation whose `impact` is `serious` or
`critical`. Lower severities ("minor", "moderate") surface in the HTML
report but do not fail the job.

The curated URL list covers every page template the site ships —
home, posts index, post detail (MD + MDX), tag index, tag detail,
series index, series detail, CV, each indie-web page, and the custom 404.

### Lighthouse CI

Boots the built preview with `startServerCommand = pnpm preview`,
waits for Astro's `Local` marker, and runs Lighthouse three times per
URL (median wins). Budgets mirror
`docs/phase-1-architecture.md` §6:

```
categories:performance      >= 0.95   (error)
categories:accessibility    == 1.00   (error)
categories:best-practices   >= 0.95   (error)
categories:seo              == 1.00   (error)
```

URL list mirrors the a11y spec (minus dynamic detail pages whose
scores duplicate the template). Reports ship as an artifact named
`lighthouse-report` (`.lighthouseci/*.html`).

### Link check

Reuses the `dist/` artifact from the verify job and walks every HTML
file with `lychee` configured via [`lychee.toml`](../lychee.toml).
Fails on any 4xx/5xx; 429 (rate limit) is accepted. A few domains
reject headless user agents (LinkedIn, Instagram) and are listed
explicitly in the exclude list — document any addition in the config.

## Running the gates locally

```sh
pnpm install                  # uses the committed lockfile
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test
pnpm build                    # astro + pagefind, outputs to dist/
pnpm test:e2e                 # e2e + a11y (needs chromium installed once)
pnpm lhci                     # desktop preset, budgets mirror CI
brew install lychee           # one-time
pnpm lint:links               # walks dist/ with the same config CI uses
```

`pnpm test:e2e:install` downloads Chromium the first time. On CI the
job pulls the same browser via `actions/setup-node` + Playwright's
`--with-deps` installer.

## When a gate fails

| Symptom                               | Typical cause + fix                                                                                                                                                            |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `verify` fails on `--frozen-lockfile` | `pnpm-lock.yaml` drifted from `package.json`. Run `pnpm install` and commit the updated lockfile.                                                                              |
| `e2e` fails only on axe violations    | Check the Playwright report artifact. Most violations are colour-contrast or missing `alt=` — fix in the component, not the spec.                                              |
| `lighthouse` fails on performance     | Usually a large asset, render-blocking font, or a new JS island. Inspect the HTML report in the artifact — it pinpoints the offending resource.                                |
| `lighthouse` fails on SEO             | Almost always a missing canonical, meta description, or broken `lang` — `src/lib/seo.ts` is the single source of truth.                                                        |
| `lychee` fails                        | A link in content collections or a component rotted. Fix the link or, if the domain is legitimately flaky, add it to `exclude` in `lychee.toml` with a comment explaining why. |

## Changing a budget

Budgets are not sacred but they are intentional. Any change to the
assertions in `.lighthouserc.cjs` or the impact threshold in
`tests/e2e/a11y.spec.ts` should:

1. Reference the trade-off in the PR body.
2. Update the matching row in this document.
3. Keep accessibility at `1.0` and SEO at `1.0` — those are the two
   non-negotiables in `docs/phase-1-architecture.md` §3.

## What this doesn't cover

- **Visual regression.** Not worth the flake on a solo project of this
  size. Screenshots are taken only on E2E failure.
- **Load / scale testing.** Static site, edge-hosted. The test IS
  production.
- **Secrets / dependency scanning.** Renovate + GitHub's native
  Dependabot alerts cover this; lives outside CI.
