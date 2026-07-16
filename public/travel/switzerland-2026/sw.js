// Offline support for the Switzerland 2026 trip planner.
//
// Strategy: precache the page and its assets at install, then serve
// cache-first with a background refresh (stale-while-revalidate). The
// planner must keep working in alpine dead zones; slightly stale is
// fine — content only changes when we redeploy, which bumps VERSION.
const VERSION = 'swiss-2026-v4';
const SCOPE_PATH = '/travel/switzerland-2026/';
const PRECACHE = [
  `${SCOPE_PATH}manifest.webmanifest`,
  `${SCOPE_PATH}assets/hero.webp`,
  `${SCOPE_PATH}assets/heidelberg.webp`,
  `${SCOPE_PATH}assets/bern.webp`,
  `${SCOPE_PATH}assets/murren.webp`,
  `${SCOPE_PATH}assets/brienz.webp`,
  `${SCOPE_PATH}assets/maennlichen.webp`,
  `${SCOPE_PATH}assets/zurich.webp`,
  `${SCOPE_PATH}assets/icon-192.png`,
  `${SCOPE_PATH}assets/icon-512.png`,
];

// The page itself is cached under the canonical SCOPE_PATH key, but some
// servers only answer one spelling of a directory URL (with/without the
// trailing slash, or only index.html) — try each until one responds.
async function precachePage(cache) {
  for (const url of [SCOPE_PATH, `${SCOPE_PATH}index.html`]) {
    const response = await fetch(url).catch(() => null);
    if (response && response.ok) {
      await cache.put(SCOPE_PATH, response);
      return;
    }
  }
  throw new Error('trip page not reachable during install');
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => Promise.all([cache.addAll(PRECACHE), precachePage(cache)]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Navigations resolve to the single cached page so deep links with
  // #fragments or query strings still work offline.
  const cacheKey = event.request.mode === 'navigate' ? SCOPE_PATH : event.request;

  event.respondWith(
    caches.open(VERSION).then(async (cache) => {
      const cached = await cache.match(cacheKey);
      const refresh = fetch(event.request)
        .then((response) => {
          if (response.ok) cache.put(cacheKey, response.clone());
          return response;
        })
        .catch(() => cached);
      return cached || refresh;
    })
  );
});
