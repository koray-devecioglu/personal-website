# Content plan — the editorial backlog

_The thing that didn't exist before: a written list of what to publish
next._

Until now this repo had the **machinery** for writing (post types, the
Zod schema, `pnpm new-post`, the AI-authoring workflow in `CLAUDE.md`,
and the walkthrough in [`AUTHORING.md`](./AUTHORING.md)) but no
**roadmap** — nothing that said "write these posts next." This is that
roadmap.

It's a living backlog, not a contract. Reorder it, delete rows, add
rows. When a post ships, strike it through or move it to _Published_.

> **Rule that governs this file:** items marked **🟡 needs your angle**
> depend on facts only Koray has (a real trip, a real cook, a real
> war story). They're framed as prompts, not claims. Don't let the
> site publish invented biography — fill these from real life or drop
> them.

---

## 1. Where the content stands today

**Published (real, load-bearing):**

- Series **_Building this site_** — `welcome`, `how-m2-landed`,
  `launch-day-lessons`.
- Series **_Software engineering in the age of AI_** —
  `software-engineering-changed`,
  `ai-writes-code-engineers-build-systems`, `knowing-what-to-build`,
  `everything-works-until-it-doesnt`.

**Placeholder / scaffold-only (still `draft: true`, `TODO` bodies).**
These exist only to exercise each schema + layout and must be resolved
before they can be considered "done" (see §2):

| Type       | File                             |
| ---------- | -------------------------------- |
| `note`     | `notes/site-notes.md`            |
| `til`      | `tils/astro-content-layer.md`    |
| `tutorial` | `tutorials/scaffold-a-post.md`   |
| `bookmark` | `bookmarks/zod-docs.md`          |
| `project`  | `projects/koraydevecioglu-com.md`|

**The structural gap.** `CLAUDE.md` promises the site "covers code,
food, BBQ, sport, travel," and the phase-2 redesign built the home
page as **three editorial doors**. Two of the three currently open
onto an empty room:

| Door                     | Maps to tags                     | Real posts today |
| ------------------------ | -------------------------------- | ---------------- |
| **Engineering**          | `architecture` `tooling` `ai` `astro` `typescript` `testing` `refactoring` `performance` `devops` | 7 |
| **Fire & food**          | `food` `bbq`                     | **0**            |
| **Away from the desk**   | `travel` `running` `books`       | **0**            |

Closing that gap is the point of this plan.

---

## 2. Immediate: resolve the five placeholders

These ship nothing but they clutter the collections and each one is a
decision, not a writing task. For each: **promote** (write it for real
and drop `draft`), or **delete**. Recommendation in the last column.

| File                              | Promote into…                                                        | Recommendation |
| --------------------------------- | -------------------------------------------------------------------- | -------------- |
| `projects/koraydevecioglu-com.md` | A real case study of this site (stack, decisions, what you'd redo)   | **Promote** — you have all the material; it anchors the `/projects` surface. |
| `tutorials/scaffold-a-post.md`    | Real how-to, or fold into `AUTHORING.md` and delete                  | **Delete** — the docs already cover this; a public tutorial on your own tooling is thin. |
| `tils/astro-content-layer.md`     | Keep as the template; write real TILs alongside it                   | **Delete** once one real TIL exists to prove the type. |
| `notes/site-notes.md`             | —                                                                    | **Delete** — a placeholder note has no reason to become real. |
| `bookmarks/zod-docs.md`           | A real linkroll entry                                                | **Delete or replace** — bookmarks only earn their place once you're actually keeping a linkroll. |

**Net:** promote the project write-up; delete the other four when their
type has a real example.

---

## 3. Backlog — Door 1: Engineering

You have the strongest material here and it's all drawn from real work,
so nothing is blocked on new life-facts.

| # | Title (working)                                          | Type       | Tags                              | Series |
| - | -------------------------------------------------------- | ---------- | --------------------------------- | ------ |
| E1 | koraydevecioglu.com — building a personal site that isn't a template | `project`  | `astro` `architecture` `site-news` | — |
| E2 | Self-hosting variable fonts in Astro without a CLS tax   | `tutorial` | `astro` `performance` `tooling`   | Building this site |
| E3 | A Zod-first content schema that fails the build on bad frontmatter | `tutorial` | `astro` `typescript` `tooling`    | Building this site |
| E4 | Why I enforce a controlled tag vocabulary                | `essay`    | `writing` `tooling` `architecture`| — |
| E5 | The quality gates that let me merge on green with no anxiety | `essay`  | `testing` `devops` `tooling`      | Building this site |
| E6 | 🟡 needs your angle — a real refactoring war story        | `essay`    | `refactoring` `architecture`      | — |
| E7 | Rolling TILs — capture small learnings as they happen (aim: 1–2/mo) | `til` | _per-topic_                       | — |
| E8 | A linkroll worth keeping — start `/bookmarks` for real    | `bookmark` | _per-link_                        | — |

**Series note.** _Building this site_ has three posts and plenty of
runway (E2, E3, E5 all fit). _Software engineering in the age of AI_ is
a complete four-part arc — leave it closed unless a genuine fifth beat
appears; don't pad it.

---

## 4. Backlog — Door 2: Fire & food

This is where the site's personality lives, and it's the emptiest. The
design was tuned so a BBQ essay sits beside a refactoring deep-dive
without either looking out of place — so this door matters as much as
Door 1. Everything here needs your real cooking; the angles are
prompts.

| # | Title (working)                                       | Type     | Tags          | Notes |
| - | ----------------------------------------------------- | -------- | ------------- | ----- |
| F1 | 🟡 What low-and-slow taught me that stand-ups didn't  | `essay`  | `bbq` `food`  | The bridge post — patience/systems thinking via smoke. Lands with the engineering audience too. Strong candidate for the **first** food post. |
| F2 | 🟡 A weekend brisket, start to finish                 | `tutorial`| `bbq` `food` | Your actual method, timings, the failure modes. Needs a cover photo. |
| F3 | 🟡 The one dish I make when I can't be bothered to think | `essay` | `food`        | Short, warm, personal. Proves the range isn't all engineering. |
| F4 | 🟡 Kit that earned its place at the grill             | `note` or `uses`-adjacent | `bbq` | Could feed `/uses` instead of a standalone post — your call. |

---

## 5. Backlog — Door 3: Away from the desk

Travel, running, books, life. All 🟡 — these are yours to fill.

| # | Title (working)                                        | Type    | Tags      | Notes |
| - | ------------------------------------------------------ | ------- | --------- | ----- |
| A1 | 🟡 What running taught me about shipping               | `essay` | `running` | The discipline crossover the `/now` page already hints at. Good second life-post. |
| A2 | 🟡 A trip that changed how I think about \<x\>          | `essay` | `travel`  | A real journey with a real takeaway — travel log or essay. Cover photo. |
| A3 | 🟡 Books that actually changed how I work              | `essay` | `books`   | Graduates the `/reading` list into a real post. You already list _DDIA_, _Deep Work_, _The Pragmatic Programmer_. |
| A4 | 🟡 A note from somewhere that isn't my desk            | `note`  | `travel` or `running` | Low-stakes, in-the-moment. Proves notes work. |

---

## 6. Loose ends this plan also closes

- **Indie-web pages.** `/now`, `/uses`, `/reading` read as filled-in but
  `CLAUDE.md` still lists them as placeholder. Confirm the details are
  actually yours, then update the status note in `CLAUDE.md`'s
  _"Residual info"_ section. (`/colophon` is already accurate.)
- **First covers.** Doors 2 and 3 want real photography — F2, A2 in
  particular. The schema is ready (`cover` + required `coverAlt`); no
  real post ships one yet.

---

## 7. Suggested first moves (if you want a sequence)

A realistic ordering that closes the structural gap fastest without
front-loading the posts that need photos:

1. **E1** — promote the project write-up (unblocks `/projects`, zero new facts).
2. **F1** — the first food post; the bridge essay that proves the range.
3. **A3** — books post; graduates `/reading`, low production cost.
4. Delete the four dead placeholders (§2).
5. Then pick from the rest as material and time allow; keep TILs (E7)
   and the linkroll (E8) running in the background.

That takes the site from _"seven engineering posts and two empty
doors"_ to _"all three doors open"_ in three posts.

---

## 8. Definition of done (per post)

Before a post loses its draft flag:

- [ ] `description` is distinct from the title (OG + search preview).
- [ ] Tags are all in `src/content/_tags.ts`.
- [ ] If `cover` is set, `coverAlt` is meaningful (schema enforces it).
- [ ] `comments: true` only if the post invites discussion.
- [ ] `pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build` is green.
- [ ] Reads well in six months — no dated "as of today" without a date.

See [`AUTHORING.md`](./AUTHORING.md) for the full write-and-ship loop.
