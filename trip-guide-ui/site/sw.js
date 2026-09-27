const CACHE_NAME = "spain-guide-static-v14";
const PRECACHE = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./plan.geo.json",
  "./photo-references.json",
  "./pre-departure.json",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./assets/trip/seville-hero.jpg",
  "./assets/trip/seville-pose.jpg",
  "./assets/trip/route-map.jpg",
  "./assets/trip/tapas.jpg",
  "./assets/trip/daily-maps/d01-madrid-airport-1.jpg",
  "./assets/trip/daily-maps/d02-barcelona-modernisme-1.jpg",
  "./assets/trip/daily-maps/d03-barcelona-eixample-1.jpg",
  "./assets/trip/daily-maps/d04-barcelona-granada-1.jpg",
  "./assets/trip/daily-maps/d04-barcelona-granada-2.jpg",
  "./assets/trip/daily-maps/d05-granada-alhambra-1.jpg",
  "./assets/trip/daily-maps/d06-granada-seville-1.jpg",
  "./assets/trip/daily-maps/d06-granada-seville-2.jpg",
  "./assets/trip/daily-maps/d07-seville-old-town-1.jpg",
  "./assets/trip/daily-maps/d08-seville-madrid-1.jpg",
  "./assets/trip/daily-maps/d08-seville-madrid-2.jpg",
  "./assets/trip/daily-maps/d09-madrid-airport-1.jpg",
  "./assets/trip/references/barcelona/barcelona-69035b8e0000000004012896-01.jpg",
  "./assets/trip/references/barcelona/barcelona-69679455000000002203ad5e-01.jpg",
  "./assets/trip/references/barcelona/barcelona-69679455000000002203ad5e-02.jpg",
  "./assets/trip/references/barcelona/barcelona-69f1c63c000000003601dcee-02.jpg",
  "./assets/trip/references/granada/granada-6a032e9c0000000038021d4b-01.jpg",
  "./assets/trip/references/granada/granada-6a032e9c0000000038021d4b-02.jpg",
  "./assets/trip/references/granada/granada-68de4ccd0000000007009706-01.jpg",
  "./assets/trip/references/granada/granada-6a8a70f70000000033022bfd-01.jpg",
  "./assets/trip/references/seville/seville-6a0861410000000038036572-01.jpg",
  "./assets/trip/references/seville/seville-6a0861410000000038036572-02.jpg",
  "./assets/trip/references/seville/seville-6a031929000000000800056d-01.jpg",
  "./assets/trip/references/seville/seville-6a689e71000000000f01da95-01.jpg",
  "./assets/trip/references/licensed/barcelona/sagrada-nativity.jpg",
  "./assets/trip/references/licensed/barcelona/sant-pau.jpg",
  "./assets/trip/references/licensed/barcelona/casa-batllo.jpg",
  "./assets/trip/references/licensed/barcelona/la-pedrera.jpg",
  "./assets/trip/references/licensed/barcelona/arc-de-triomf.jpg",
  "./assets/trip/references/licensed/barcelona/park-guell.jpg",
  "./assets/trip/references/licensed/granada/generalife-garden.jpg",
  "./assets/trip/references/licensed/granada/generalife-interior.jpg",
  "./assets/trip/references/licensed/granada/nasrid-charles-v.jpg",
  "./assets/trip/references/licensed/granada/generalife-view.jpg",
  "./assets/trip/references/licensed/granada/alhambra-courtyard.jpg",
  "./assets/trip/references/licensed/seville/plaza-espana.jpg",
  "./assets/trip/references/licensed/seville/real-alcazar.jpg",
  "./assets/trip/references/licensed/seville/giralda.jpg",
  "./assets/trip/references/licensed/seville/cathedral-giralda.jpg"
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

  // JSON files are mutable trip data: refresh them when online, but keep the
  // last known copy available when the phone is offline. This covers the
  // itinerary, pre-departure checklist, and photo-reference index together.
  if (requestUrl.pathname.endsWith(".json")) {
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
  const shellAsset = requestUrl.pathname.endsWith("/") || /\.(?:html|css|js|webmanifest)$/.test(requestUrl.pathname);
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
