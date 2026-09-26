const CACHE_NAME = "spain-guide-static-v8";
const PRECACHE = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./plan.geo.json",
  "./pre-departure.json",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./assets/trip/seville-hero.jpg",
  "./assets/trip/seville-pose.jpg",
  "./assets/trip/route-map.jpg",
  "./assets/trip/tapas.jpg",
  "./assets/trip/references/barcelona/barcelona-69035b8e0000000004012896-01.jpg",
  "./assets/trip/references/barcelona/barcelona-69679455000000002203ad5e-01.jpg",
  "./assets/trip/references/barcelona/barcelona-69f1c63c000000003601dcee-02.jpg",
  "./assets/trip/references/granada/granada-6a032e9c0000000038021d4b-01.jpg",
  "./assets/trip/references/granada/granada-68de4ccd0000000007009706-01.jpg",
  "./assets/trip/references/granada/granada-6a8a70f70000000033022bfd-01.jpg",
  "./assets/trip/references/seville/seville-6a0861410000000038036572-01.jpg",
  "./assets/trip/references/seville/seville-6a031929000000000800056d-01.jpg",
  "./assets/trip/references/seville/seville-6a689e71000000000f01da95-01.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  // The itinerary is the one mutable payload: refresh it when online, but keep
  // the last known copy available when the phone is offline.
  if (requestUrl.pathname.endsWith("/plan.geo.json")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Keep the shell fresh whenever the phone is online. This lets a published
  // copy update its typography and interaction code without asking users to
  // clear Chrome storage. Offline, the last shell remains available.
  const shellAsset = /\.(?:html|css|js|webmanifest)$/.test(requestUrl.pathname);
  if (shellAsset) {
    event.respondWith(
      fetch(event.request, { cache: "no-store" })
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
