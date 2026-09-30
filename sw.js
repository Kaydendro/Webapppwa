/* Lookalike service worker.
   - Caches the app shell so the app opens instantly and works offline.
   - Never touches Gemini API calls (quiz generation needs a connection).
   - Bump VERSION whenever you change any file listed in SHELL_FILES. */

const VERSION = "v1";
const SHELL_CACHE = `lookalike-shell-${VERSION}`;
const RUNTIME_CACHE = `lookalike-runtime-${VERSION}`;

const SHELL_FILES = [
  "./",
  "index.html",
  "styles.css",
  "app.js",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "icons/apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_FILES)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith("lookalike-") && k !== SHELL_CACHE && k !== RUNTIME_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.hostname === "generativelanguage.googleapis.com") return; // API: always network

  const sameOrigin = url.origin === self.location.origin;
  const isFont = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (!sameOrigin && !isFont) return;

  event.respondWith(staleWhileRevalidate(event, sameOrigin ? SHELL_CACHE : RUNTIME_CACHE));
});

async function staleWhileRevalidate(event, cacheName) {
  const req = event.request;
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req, { ignoreSearch: req.mode === "navigate" });

  const network = fetch(req)
    .then((res) => {
      if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone());
      return res;
    })
    .catch(() => null);

  if (cached) {
    event.waitUntil(network);
    return cached;
  }

  const res = await network;
  if (res) return res;

  if (req.mode === "navigate") {
    const fallback = await cache.match("index.html");
    if (fallback) return fallback;
  }
  return new Response("Offline", { status: 503, statusText: "Offline" });
}
