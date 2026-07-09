# Content plan — the editorial backlog

_The written answer to "what should this site publish next?" — updated
2026-07 after Koray redefined the editorial scope._

This is a living backlog, not a contract. Reorder it, delete rows, add
rows. When a post ships, move it to _Published_.

> **Rule that governs this file:** items marked **🟡 needs Koray's
> specifics** depend on facts only he has (a real cook, a match he
> attended, a city he lived in). They're framed as prompts, not
> claims. The site never publishes invented biography — fill these
> from real life or drop them.

---

## 1. Editorial scope (decided 2026-07)

Five pillars. Everything the site publishes should hang off one of
these (or `site-news` / `writing` meta-posts about the site itself).

| #   | Pillar                                    | What it covers                                                                                                          | Tags                                                                                      |
| --- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| P1  | **Software engineering in the age of AI** | Systems thinking, architecture, AI-assisted development, tooling, what stays load-bearing when code generation is cheap | `ai` `architecture` `tooling` `typescript` `testing` `refactoring` `performance` `devops` |
| P2  | **Fire & food**                           | Low-and-slow BBQ, grilling, cooking, and restaurant recommendations                                                     | `bbq` `food` `restaurants`                                                                |
| P3  | **Football & sport**                      | The World Cup, stories behind players, major sport moments, stadiums visited and enjoyed — plus running                 | `football` `stadiums` `sports` `running`                                                  |
| P4  | **Travel & cities**                       | Cities visited, what's actually worth your time, notes from the road                                                    | `travel` `cities`                                                                         |
| P5  | **Living abroad**                         | The expat experience — moving, adapting, what home means from a distance                                                | `living-abroad` (+ `cities`, `food` as they overlap)                                      |

**Explicitly out of scope (decided 2026-07):** books / reading-log
content. The `/reading` page is retired (301 → home via
`public/_redirects`) and the `books` tag is removed from the
vocabulary. If book-adjacent thinking ever matters to a post, it lives
inside a pillar essay, not as its own genre.

**Formats:** the six post types all stay. Two format notes:

- **Lists & recommendations are first-class.** "Stadiums I've sat in,"
  "restaurants worth planning a day around," "cities ranked by
  livability-per-lira" — opinionated, maintained lists with an
  `updated` date. They start life as regular posts; see §6 for the
  dedicated-surface proposal.
- **Notes are the sports pressure-valve.** Big-match reactions and
  major-sport-news takes ship as `note` posts — fast, dated, no
  polish contract. Essays are for the stories that keep.

---

## 2. How this maps to the site (design implications)

Already shipped in this pass:

- Home-page topic doors went **3 → 4**, one per audience-facing pillar
  group: _Code & craft_ (P1) · _Fire & food_ (P2) · _The beautiful
  game_ (P3) · _Out in the world_ (P4+P5). Grid is now 2×2.
- Tag vocabulary extended: `restaurants`, `cities`, `living-abroad`,
  `football`, `stadiums`, `sports` added; `books` removed.
- `/reading` removed (page, palette entry, footer link, tests, LHCI
  URL) with a 301 in `public/_redirects`.

Free wins that need no design work: every new tag gets a hub page at
`/tags/<slug>` the moment its first post ships, and series pages give
any multi-part arc a home.

Bigger design moves are proposed in §6 — they need real content first.

---

## 3. Immediate housekeeping: the five placeholder posts

Scaffold-only sample posts, still `draft: true`. Each is a decision:

| File                              | Decision                                                                   |
| --------------------------------- | -------------------------------------------------------------------------- |
| `projects/koraydevecioglu-com.md` | **Promote** — write the real case study of this site; anchors `/projects`. |
| `tutorials/scaffold-a-post.md`    | **Delete** — `AUTHORING.md` already covers it.                             |
| `tils/astro-content-layer.md`     | **Delete** once the first real TIL ships.                                  |
| `notes/site-notes.md`             | **Delete** — a placeholder note has no future.                             |
| `bookmarks/zod-docs.md`           | **Delete or replace** when a real linkroll starts.                         |

---

## 4. Backlog by pillar

### P1 — Software engineering in the age of AI

The existing four-part series (_Software engineering in the age of
AI_) is a complete arc, but the pillar stays open — Koray wants more
here. New posts either extend the series (if they continue the
argument) or stand alone.

| #   | Working title                                                               | Type                  | Notes                                                                                                   |
| --- | --------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------- |
| E1  | koraydevecioglu.com — building a personal site that isn't a template        | `project`             | Promote the placeholder. All material exists in-repo.                                                   |
| E2  | Reviewing code you didn't write: taste is the new bottleneck                | `essay`               | Natural part 5 of the series — verification replaces generation as the craft.                           |
| E3  | The junior task is dead. The junior engineer isn't.                         | `essay`               | What entry-level growth looks like when agents do the entry-level work.                                 |
| E4  | Specification is the new syntax — writing requirements a machine can act on | `essay`               | Prompting-as-engineering; pairs with `knowing-what-to-build`.                                           |
| E5  | How I build with an AI pair: the actual workflow                            | `essay` or `tutorial` | 🟡 needs Koray's specifics — his real Claude Code / Cursor loop, not a generic one. Bridges to `/uses`. |
| E6  | A production incident caused by code nobody typed                           | `essay`               | 🟡 needs a real war story.                                                                              |
| E7  | Self-hosting variable fonts in Astro without a CLS tax                      | `tutorial`            | Drawn from this repo; joins _Building this site_.                                                       |
| E8  | A Zod-first content schema that fails the build on bad frontmatter          | `tutorial`            | Same — real, shippable now.                                                                             |
| E9  | Rolling TILs (aim 1–2/month)                                                | `til`                 | Capture small learnings while fresh.                                                                    |

### P2 — Fire & food

| #   | Working title                                     | Type           | Notes                                                                               |
| --- | ------------------------------------------------- | -------------- | ----------------------------------------------------------------------------------- |
| F1  | What low-and-slow taught me that stand-ups didn't | `essay`        | 🟡 The bridge post — patience and systems thinking via smoke. Best first food post. |
| F2  | A weekend brisket, start to finish                | `tutorial`     | 🟡 Real method, timings, failure modes. Wants a cover photo.                        |
| F3  | Grill kit that earned its place                   | `essay` (list) | 🟡 Opinionated gear list; `updated` yearly.                                         |
| F4  | Restaurants worth planning a day around — ⟨city⟩  | `essay` (list) | 🟡 One list per city Koray knows well. Repeatable format; feeds §6.                 |
| F5  | The dish I cook first in every new kitchen        | `essay`        | 🟡 Bridges P5 (living abroad) — food as continuity.                                 |
| F6  | Quick recipes / techniques                        | `til`          | Recipe-as-TIL: one technique, one idea, dated.                                      |

### P3 — Football & sport

**Seasonal note: the 2026 World Cup is happening _now_** (June–July
2026, North America — the final is mid-July). This is the single best
content window of the year for this pillar. Match/tournament reactions
should ship as `note`s while it runs; the retrospective essay lands
the week after the final while search interest peaks.

| #   | Working title                                                         | Type              | Notes                                                                                                                |
| --- | --------------------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------- |
| S1  | World Cup 2026 diary                                                  | `note` series     | 🟡 Timely — running notes on the knockout rounds, ordered by a new series entry. Ship fast, polish later.            |
| S2  | What the 2026 World Cup will be remembered for                        | `essay`           | The post-final retrospective. Draft skeleton now, finish after the final.                                            |
| S3  | The stadiums I've sat in, ranked                                      | `essay` (list)    | 🟡 needs the list — which grounds, which matches, what made each one. Flagship list post; feeds §6.                  |
| S4  | ⟨Player⟩: the story behind the player                                 | `essay`           | 🟡 A repeatable format — one player, one arc, told well. Needs Koray's picks (childhood heroes? current favorites?). |
| S5  | Why I support ⟨club⟩                                                  | `essay`           | 🟡 The fan-origin story. Personal anchor for the whole pillar.                                                       |
| S6  | Watching football from abroad                                         | `essay`           | 🟡 Bridges P5 — time zones, streams, finding your bar in a foreign city.                                             |
| S7  | What football analytics gets right that engineering metrics get wrong | `essay`           | The P1×P3 crossover — xG as a lesson in proxy metrics.                                                               |
| S8  | Major-moment reactions (transfers, finals, retirements)               | `note`            | Ongoing — the pressure-valve format.                                                                                 |
| S9  | Running: negotiating with my pace                                     | `essay` or `note` | 🟡 The `/now` page already teases this.                                                                              |

### P4 — Travel & cities

| #   | Working title                              | Type           | Notes                                                                                                  |
| --- | ------------------------------------------ | -------------- | ------------------------------------------------------------------------------------------------------ |
| T1  | ⟨City⟩, honestly — what's worth your time  | `essay` (list) | 🟡 The repeatable city-guide format: eat / walk / skip. One per city visited. Needs Koray's city list. |
| T2  | Cities I keep comparing everywhere else to | `essay` (list) | 🟡 The ranked meta-list; links out to each T1 guide as they ship.                                      |
| T3  | Travel TILs                                | `til`          | Airport tricks, booking lessons, packing — small and dated.                                            |
| T4  | A trip that changed how I think about ⟨x⟩  | `essay`        | 🟡 One real journey, one real takeaway.                                                                |

### P5 — Living abroad

Strong candidate for the site's **third series** — an ordered
narrative arc, which is what series exist for.

| #   | Working title                                 | Type    | Notes                                                                |
| --- | --------------------------------------------- | ------- | -------------------------------------------------------------------- |
| L1  | Leaving: what I packed and what I should have | `essay` | 🟡 Series opener. Needs the real story — when, where from, where to. |
| L2  | The first ninety days somewhere new           | `essay` | 🟡 Bureaucracy, language, the supermarket problem.                   |
| L3  | What "home" means from a distance             | `essay` | 🟡 The reflective one.                                               |
| L4  | The expat food problem (and the BBQ solution) | `essay` | 🟡 Bridges P2.                                                       |
| L5  | Working across time zones and cultures        | `essay` | Bridges P1 — remote engineering life abroad.                         |

---

## 5. Series roster (current + proposed)

| Series                                | Status        | Next step                                                      |
| ------------------------------------- | ------------- | -------------------------------------------------------------- |
| Building this site                    | Open, 3 posts | E7/E8 fit when written.                                        |
| Software engineering in the age of AI | Open, 4 posts | E2 is the natural part 5.                                      |
| **World Cup 2026** (proposed)         | Not created   | 🟡 Create with S1 — timely, do first if the pillar starts now. |
| **Living abroad** (proposed)          | Not created   | 🟡 Create with L1 once the real arc is known.                  |

---

## 6. Proposal: recommendation surfaces (Phase 3 / M11 candidate)

Once the list posts exist (S3 stadiums, F4 restaurants, T1/T2 cities),
they deserve better than a prose page: a **structured recommendation
surface** — the same Zod-first pattern as the CV:

- Data: `src/data/{stadiums,restaurants,cities}.json`, each validated
  by a Zod schema in `src/lib/`.
- Routes: `/stadiums`, `/restaurants`, `/cities` — card grids with
  filters (city, country, "would return?"), rendered statically.
- Each card: name, place, one-line verdict, optional photo, link to
  the essay that tells the story.
- Home page and the relevant topic door link to them.
- Constraints hold: no external map tiles or embeds (no cookies, no
  third-party scripts) — static imagery only.

**Sequencing rule: content before chrome.** Build these surfaces only
after ≥2 real list posts exist per surface — otherwise it's empty
shelving. Until then, list posts are ordinary essays with `updated`
dates. When the trigger is met, write a Phase-3 proposal doc
(`docs/phase-3-recommendation-surfaces.md`) before building.

---

## 7. Suggested sequence

1. **S1 / S2 — World Cup 2026.** The window closes mid-July; nothing
   else on this list is time-sensitive. 🟡 needs Koray's takes.
2. **E1 — promote the site case study.** Zero new facts; unblocks
   `/projects`; delete the other four placeholders in the same PR.
3. **F1 — the low-and-slow essay.** Opens the food door with the
   bridge post both audiences can read.
4. **S3 — stadiums ranked.** The flagship list; starts the §6 data
   trail.
5. **L1 — living-abroad series opener.** Then alternate pillars so no
   door goes stale.
6. Keep E9 TILs and S8 match notes flowing in the background.

---

## 8. What Koray owes this plan (ask, don't invent)

The 🟡 items block on these facts — collect once, write for months:

- Football: club(s) supported and why; stadiums visited (which match,
  what year, what stood out); favorite players and the stories that
  hooked him; his World Cup 2026 experience so far.
- Living abroad: the actual arc — from where, to where, when, and the
  honest highs/lows.
- Cities: the list of cities visited/lived in, and per city the
  restaurants he'd send a friend to.
- Food: the BBQ setup, one real cook that went right and one that went
  wrong, the default dish.
- Running: current relationship with it (the `/now` page hints;
  confirm).

---

## 9. Definition of done (per post)

- [ ] `description` distinct from the title (OG + search preview).
- [ ] Tags all in `src/content/_tags.ts`.
- [ ] If `cover` is set, `coverAlt` is meaningful (schema enforces it).
- [ ] `comments: true` only if the post invites discussion.
- [ ] List posts carry `updated` when revised.
- [ ] `pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build` green.

See [`AUTHORING.md`](./AUTHORING.md) for the write-and-ship loop.
