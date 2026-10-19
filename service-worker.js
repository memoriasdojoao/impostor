const CACHE = "impostor-medico-v6";
const ASSETS = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png", "./icon-180.png"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS.map((u)=>new Request(u,{cache:"reload"})))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET" || !r.url.startsWith("http")) return;
  const fresh = r.mode === "navigate" || r.url.endsWith(".html") || r.url.endsWith("manifest.json");
  if (fresh) {
    e.respondWith(fetch(r,{cache:"reload"}).then((res) => { const cp = res.clone(); caches.open(CACHE).then((c) => c.put(r, cp)); return res; }).catch(() => caches.match(r)));
  } else {
    e.respondWith(caches.match(r).then((c) => c || fetch(r).then((res) => { const cp = res.clone(); caches.open(CACHE).then((x) => x.put(r, cp)); return res; })));
  }
});
