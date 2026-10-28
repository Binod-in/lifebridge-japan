/* LifeBridge Japan service worker: offline guides + offline fallback page.
 * Registered on every page by i18n.js. Version the CACHE name to update.
 */
const CACHE = "lifebridge-v1";
const CORE = [
    "/",
    "offline.html",
    "index.html",
    "start.html",
    "guide.html",
    "emergency.html",
    "explain.html",
    "japanese.html",
    "style.css",
    "i18n.js",
    "app.js",
    "main.js",
    "guide-data.js",
    "phrases-data.js",
    "saved-phrases.js",
    "logo/logo.png"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE)
            .then((cache) => cache.addAll(CORE))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (event) => {
    const req = event.request;
    if (req.method !== "GET") return;
    const url = new URL(req.url);
    if (url.origin !== self.location.origin) return;
    if (url.pathname === "/explain" || url.pathname === "/ask" || url.pathname === "/sw.js") return;
    event.respondWith(
        caches.match(req).then((cached) => {
            if (cached) return cached;
            return fetch(req).then((res) => {
                if (res && res.ok) {
                    const copy = res.clone();
                    caches.open(CACHE).then((cache) => cache.put(req, copy));
                }
                return res;
            }).catch(() => {
                if (req.mode === "navigate") return caches.match("offline.html");
                throw new Error("offline");
            });
        })
    );
});
