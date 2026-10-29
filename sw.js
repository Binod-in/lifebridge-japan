/* LifeBridge Japan service worker: offline guides + offline fallback page.
 * Registered on every page by i18n.js. Version the CACHE name to update.
 */
const CACHE = "lifebridge-v9";
const CORE = [
    "/",
    "offline.html",
    "about.html",
    "documents.html",
    "emergency.html",
    "explain.html",
    "guide.html",
    "health.html",
    "housing.html",
    "important-dates.html",
    "index.html",
    "japanese.html",
    "jobs.html",
    "login.html",
    "money.html",
    "privacy.html",
    "questions.html",
    "saved-guides.html",
    "saved-phrases.html",
    "search.html",
    "settings.html",
    "start.html",
    "terms.html",
    "tracker.html",
    "transport.html",
    "style.css",
    "i18n.js",
    "app.js",
    "main.js",
    "guide-data.js",
    "phrases-data.js",
    "saved-phrases.js",
    "chatbot.js",
    "site.webmanifest",
    "logo/logo.png",

    "images/documents.webp",
    "images/emergency.webp",
    "images/health.webp",
    "images/hero-mobile.jpg",
    "images/hero-wide.jpg",
    "images/housing.webp",
    "images/japanese.webp",
    "images/jobs.webp",
    "images/money.webp",
    "images/transport.webp",
    "icons/alert.svg",
    "icons/ambulance.svg",
    "icons/bookmark.svg",
    "icons/briefcase.svg",
    "icons/calendar.svg",
    "icons/cap.svg",
    "icons/card.svg",
    "icons/chat.svg",
    "icons/checklist.svg",
    "icons/copy.svg",
    "icons/document.svg",
    "icons/heart.svg",
    "icons/home.svg",
    "icons/icon-192.png",
    "icons/icon-512.png",
    "icons/idcard.svg",
    "icons/medical.svg",
    "icons/move.svg",
    "icons/phone.svg",
    "icons/plane.svg",
    "icons/police.svg",
    "icons/settings.svg",
    "icons/speaker.svg",
    "icons/train.svg",
    "icons/yen.svg"
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

function isHtmlRequest(req) {
    if (req.mode === "navigate") return true;
    const type = req.headers.get("accept") || "";
    return type.indexOf("text/html") !== -1;
}

self.addEventListener("fetch", (event) => {
    const req = event.request;
    if (req.method !== "GET") return;
    const url = new URL(req.url);
    if (url.origin !== self.location.origin) return;
    if (url.pathname === "/explain" || url.pathname === "/ask" || url.pathname === "/sw.js" || url.pathname === "/lb-config.js") return;
    if (isHtmlRequest(req)) {
        // Pages: network first, so updates show right away.
        event.respondWith(
            fetch(req).then((res) => {
                if (res && res.ok) {
                    const copy = res.clone();
                    caches.open(CACHE).then((cache) => cache.put(req, copy));
                }
                return res;
            }).catch(() => {
                return caches.match(req).then((cached) => {
                    return cached || caches.match(req, { ignoreSearch: true });
                }).then((cached) => {
                    return cached || caches.match("offline.html");
                });
            })
        );
        return;
    }
    // Images, CSS and JS: cache first for speed and offline use.
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
