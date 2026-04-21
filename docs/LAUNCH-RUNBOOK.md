# Launch runbook — M8

End-to-end checklist for taking `koraydevecioglu.com` from private repo +
unpointed DNS to fully live on Cloudflare Pages. Every step is executed
in a web UI or at a registrar, not in this codebase; the code-side work
already shipped in the M8 PR (`feat/m8-launch`).

**Estimated wall time:** 45–90 minutes, plus up to 24h of DNS propagation
slack.

**Prerequisites:**

- Access to the Squarespace account that registered `koraydevecioglu.com`.
- Access to the Gmail account you want `hi@koraydevecioglu.com` to
  forward into.
- A Cloudflare account (free tier is fine — create one at
  <https://dash.cloudflare.com/sign-up> if you don't already have one).
- Access to the Google account that will own Search Console.
- Access to the Microsoft account that will own Bing Webmaster Tools.
- The M8 PR merged into `main` (so the canonical build has robots.txt,
  CF analytics beacon slot, and the updated colophon).

If any step below fails, stop and fix that step before moving on. The
order is deliberate — DNS has to be on Cloudflare before Pages can
issue SSL; the repo has to be public before Pages can read it; email
routing needs the domain already active in Cloudflare.

---

## Step 1 — Add the site to Cloudflare (~5 min)

1. Sign in at <https://dash.cloudflare.com>.
2. In the top-right, click **+ Add** → **Connect a domain** (Cloudflare
   renamed "Add a site" → "Connect a domain"; same flow). Enter
   `koraydevecioglu.com` (apex only, without `www`) → **Continue**.
   - Do **not** pick "Transfer a domain" (that would move the
     registration away from Squarespace — separate decision, can be
     done later) or "Register a domain" (that's for new domains).
3. Pick the **Free** plan → **Continue**.
4. Cloudflare scans the current DNS records from Squarespace. Review
   the imported records — at minimum you should see whatever Squarespace
   put there. If you're not using Squarespace for email or a website,
   there's probably nothing worth keeping; deleting everything is fine
   and we'll rebuild the record set in Step 4.
5. On the next screen, Cloudflare will show **two nameservers** that
   look like `<name>.ns.cloudflare.com` — for example
   `val.ns.cloudflare.com` and `lars.ns.cloudflare.com`. **Copy both.**
   You'll paste them into Squarespace in the next step.

Do **not** continue past this screen in Cloudflare yet. Leave it open.

---

## Step 2 — Swap nameservers at Squarespace (~5 min + propagation)

1. Sign in at <https://account.squarespace.com/domains>.
2. Click `koraydevecioglu.com` → **DNS settings** (or **Nameservers**
   depending on the UI version).
3. Switch from "Use Squarespace nameservers" to **Use custom
   nameservers**.
4. Paste the two Cloudflare nameservers from Step 1.
5. Save.

Propagation is usually 5–30 minutes but Squarespace warns up to 48h.
Go back to the Cloudflare tab and click **Done, check nameservers**.
Cloudflare will poll and email you when the transfer completes.

You can continue with the next steps in parallel — most of them don't
require the NS swap to be fully propagated.

**Rollback:** Go back to Squarespace → DNS → select "Use Squarespace
nameservers". DNS reverts within an hour. The Cloudflare site can sit
dormant at zero cost.

---

## Step 3 — Create the Cloudflare Pages project (~10 min)

1. In the Cloudflare dashboard, sidebar → **Workers & Pages** → **Create**
   → **Pages** → **Connect to Git**.
2. Authorise the **Cloudflare Pages** GitHub App on
   `koray-devecioglu/personal-website`. Grant access to this repo only.
3. After the repo is selected, configure the build:
   - **Project name:** `koraydevecioglu-com`
   - **Production branch:** `main`
   - **Framework preset:** **Astro**
   - **Build command:** `pnpm build`
   - **Build output directory:** `dist`
   - **Root directory:** _(leave blank)_
4. **Environment variables** (click the dropdown):
   - Leave `PUBLIC_CF_ANALYTICS_TOKEN` unset for now — you'll add it in
     Step 6 after you've created the analytics site. Production will
     simply not ship the beacon until then, which is the correct
     fail-open behaviour.
   - No other vars needed.
5. **Node version:** set `NODE_VERSION` = `22` in the environment
   variables section. (Pages defaults to Node 18, our `.node-version`
   says 22.)
6. Click **Save and Deploy**. The first build will run through
   `pnpm install --frozen-lockfile && pnpm build && npx pagefind ...`.
   Watch the logs — failure now is cheaper to fix than at midnight.
7. When the build succeeds, Pages gives you a
   `koraydevecioglu-com.pages.dev` URL. Open it. Everything should
   look identical to the local `pnpm preview` output.

**Rollback:** Workers & Pages → your project → **Deployments** → pick
an older green build → **Rollback to this deployment**. No DNS impact.

---

## Step 4 — Rebuild DNS on Cloudflare (~10 min)

Goal: apex `koraydevecioglu.com` + `www` both serve the Pages site with
automatic HTTPS.

1. Sidebar → your site → **DNS** → **Records**.
2. Delete any imported records you don't intend to keep (Squarespace
   parking pages, leftover A records, etc.) — **except** any MX or
   TXT records for mail that you know you still want.
3. Add the apex record:
   - **Type:** `CNAME`
   - **Name:** `@`
   - **Target:** `koraydevecioglu-com.pages.dev`
   - **Proxy status:** **Proxied** (orange cloud)
   - **TTL:** Auto
   - Cloudflare auto-flattens the apex CNAME — that's why you don't
     need an A record here.
4. Add the `www` record:
   - **Type:** `CNAME`
   - **Name:** `www`
   - **Target:** `koraydevecioglu-com.pages.dev`
   - **Proxy status:** **Proxied**
   - **TTL:** Auto

Now tell Pages about both hostnames:

5. Workers & Pages → your project → **Custom domains** → **Set up a
   custom domain**.
6. Enter `koraydevecioglu.com` → follow the prompt. Pages will verify
   the CNAME and provision a free TLS certificate automatically
   (Universal SSL / ACME on Cloudflare's side). Allow 2–5 minutes.
7. Repeat for `www.koraydevecioglu.com`.
8. In the Pages custom-domain UI, set the primary as
   `koraydevecioglu.com` and Pages will auto-redirect `www` → apex.

Smoke test: `https://koraydevecioglu.com` in an incognito tab. Expect
a valid padlock, the home page, and `curl -I https://www.koraydevecioglu.com`
returning `301` pointing at the apex.

**Rollback:** DNS → delete the two CNAMEs → the domain stops resolving
until you re-add them. Or in Cloudflare DNS, toggle the proxy off
(grey cloud) to bypass Cloudflare entirely.

---

## Step 5 — Enable Cloudflare Email Routing (~5 min)

1. Sidebar → your site → **Email** → **Email Routing** →
   **Get started** (or **Enable Email Routing**).
2. Cloudflare will propose a set of MX records and one TXT record for
   SPF. Click **Add records and enable** — Cloudflare writes them into
   the zone for you. Verify in DNS → Records that you now see:
   - MX `@` → `route1.mx.cloudflare.net` (priority 10 or similar)
   - Two more MX records for redundancy
   - TXT `@` → `v=spf1 include:_spf.mx.cloudflare.net ~all`
3. **Destination addresses** → **Add destination address** → enter
   your real Gmail → hit the confirmation link Google sends.
4. **Routes** → **Create address** → enter `hi` as the local part
   (full address: `hi@koraydevecioglu.com`) → **Send to** the Gmail
   address you just verified → **Save**.
5. _(Optional, recommended)_ Also set a **catch-all** route in the same
   UI → **Send to** your Gmail. Means typos like `hello@...` still
   reach you.
6. Test by sending a message from a different address to
   `hi@koraydevecioglu.com`. It should land in Gmail within a minute.

**Rollback:** Email Routing → **Settings** → **Disable Email Routing**.
MX records are automatically removed. Inbound mail silently drops
until you re-enable.

---

## Step 6 — Cloudflare Web Analytics (~5 min + one redeploy)

Cloudflare Pages-attached sites get Web Analytics for free, but it's
**not** enabled automatically — you get a token and inject the beacon.
We already wired the beacon behind `PUBLIC_CF_ANALYTICS_TOKEN` in the
M8 PR; this step just produces the token.

1. Sidebar → **Analytics & Logs** → **Web Analytics** → **Add a site**.
2. **Hostname:** `koraydevecioglu.com`.
3. **Automatic setup** vs **Manual setup**: pick **Manual**. Automatic
   injects a beacon via a Cloudflare-side JS rewrite; manual lets us
   ship it from the Astro build, which respects the `noindex` and
   `is:inline` conventions we already use. Our BaseLayout does this.
4. Copy the site token — a 32-char lowercase hex string.
5. Back in **Workers & Pages** → your project → **Settings** →
   **Variables and Secrets** → **Production** → add:
   - Name: `PUBLIC_CF_ANALYTICS_TOKEN`
   - Value: the 32-char token from step 4
6. **Deployments** → find the latest build → **Retry deployment** (or
   trigger a new push, but retry is faster). The new build will
   include the `<script>` beacon in every page.
7. Verify: `view-source:https://koraydevecioglu.com` → search for
   `static.cloudflareinsights.com`. One hit = wired correctly.

**Rollback:** Delete the env var and retry a deploy. The build will
omit the script (the BaseLayout guards on the variable being truthy).

---

## Step 7 — Google Search Console (~5 min + verification wait)

1. Go to <https://search.google.com/search-console>.
2. **Add property** → choose **Domain** (not URL prefix) → enter
   `koraydevecioglu.com` → **Continue**.
3. Google shows a `TXT` record starting with `google-site-verification=...`.
   Copy it.
4. Cloudflare DNS → **Records** → **Add record**:
   - **Type:** `TXT`
   - **Name:** `@`
   - **Content:** paste the full `google-site-verification=...` value
     (keep the quotes if Cloudflare asks, drop them if not — the UI
     stores the raw string).
   - **TTL:** Auto.
5. Back in Search Console, click **Verify**. If it fails, wait 5 minutes
   (Cloudflare DNS propagates fast but not instantly) and try again.
6. Once verified: **Sitemaps** (left sidebar) → **Add a new sitemap** →
   enter `sitemap-index.xml` → **Submit**.
7. Expect Google to crawl the site within 24–72 hours. Coverage data
   appears in **Indexing → Pages** as each URL is discovered.

**Rollback:** Delete the TXT record. Search Console stops verifying
the property and stops receiving any control signals (but Google will
still crawl; `noindex` is how you suppress pages, not verification).

---

## Step 8 — Bing Webmaster Tools (~5 min)

1. <https://www.bing.com/webmasters/> → **Sign in** with a Microsoft
   account.
2. **Add site** → enter `https://koraydevecioglu.com/` → **Next**.
3. Bing offers three verification methods. Pick **DNS verification
   (CNAME record)** or **Domain verification (TXT record)** — easier
   than the meta tag option.
4. Bing shows a TXT value like `verify.bing.com` or a random token.
   Follow the pattern you chose:
   - If TXT: add `TXT` at `@` with the provided value in Cloudflare
     DNS.
   - If CNAME: add the CNAME at the exact subdomain Bing specifies.
5. Back in Bing Webmaster → **Verify**.
6. Once verified: **Sitemaps** → **Submit sitemap** → enter
   `https://koraydevecioglu.com/sitemap-index.xml` → **Submit**.
7. _(Bonus)_ **Settings → Import from Google Search Console** lets you
   skip the above entirely by trusting your GSC verification. Fine if
   you already completed Step 7.

Bing also feeds DuckDuckGo, Ecosia, Yahoo, and ChatGPT's browsing, so
this covers more discoverability than its market share suggests.

---

## Step 9 — Post-launch cleanup PR (~10 min)

After Steps 1–8 are done and `https://koraydevecioglu.com` responds
correctly, a small follow-up PR removes the last pre-launch
workaround:

1. `git checkout main && git pull && git checkout -b chore/post-launch-cleanup`.
2. Edit `lychee.toml` — delete this line and its preceding comment block:
   ```toml
   # Held open until DNS is live — see the comment block above.
   "^https?://(www\\.)?koraydevecioglu\\.com/",
   ```
3. Open a PR. The lychee CI job now actually hits the canonical URL
   and should pass (since DNS + SSL are live).
4. Merge.

At that point M8 is done and every link on the site — internal,
canonical, OG, feed, GitHub repo — gets a real 200 check on every PR.

---

## Smoke-test checklist (post-launch, run through once)

- [ ] `https://koraydevecioglu.com` loads with a valid TLS cert.
- [ ] `https://www.koraydevecioglu.com` 301-redirects to the apex.
- [ ] `/robots.txt` returns the expected content.
- [ ] `/sitemap-index.xml` returns XML listing every public route.
- [ ] `/cv.pdf` downloads and opens cleanly.
- [ ] `/cv.json` returns JSON Resume 1.0.0 with the current data.
- [ ] `/rss.xml` and `/feed.json` both parse.
- [ ] `<link rel="canonical">` on the home page points at the apex.
- [ ] Dark mode toggles and persists across a reload.
- [ ] ⌘K opens the command palette and Pagefind hits resolve.
- [ ] Sending a test email to `hi@koraydevecioglu.com` lands in Gmail.
- [ ] Search Console reports the property as "Verified".
- [ ] Bing Webmaster reports the site as "Verified".
- [ ] Cloudflare Web Analytics dashboard shows at least one page-view
      from your smoke-test traffic.
- [ ] Cloudflare Pages → Deployments shows the current main-branch
      build as "Deployed".
- [ ] The post-launch cleanup PR from Step 9 is merged and CI is green.

---

## Incident playbook (saved for future you)

If the site goes down post-launch, check these in order:

1. **Cloudflare Pages dashboard** — is the latest deployment green? If
   red, click into the failed build and read the logs. 90% of the time
   it's a build regression; rollback to the last green deployment one
   click away.
2. **Cloudflare DNS** — are the apex + `www` CNAMEs still pointing at
   `koraydevecioglu-com.pages.dev`? Did someone (you) accidentally grey-cloud them?
3. **Cloudflare SSL / TLS → Overview** — is SSL mode set to **Full
   (strict)**? Pages requires it.
4. **Nameservers at Squarespace** — still pointing at the Cloudflare
   pair from Step 1? A registrar auto-renewal can occasionally reset
   them.
5. **GitHub repo visibility** — if the repo flipped back to private for
   any reason, Pages builds will start 404ing on clone. Flip it back
   to public.

If all five are green and the site still isn't reachable, open the
Cloudflare status page (<https://www.cloudflarestatus.com>). Personal
sites rarely need more debugging than that.
