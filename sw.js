// Offline-Fähigkeit: erst Netz versuchen (damit Updates ankommen), sonst aus dem Cache
const CACHE = 'augentropfen-v1';
const DATEIEN = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(DATEIEN)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(namen =>
    Promise.all(namen.filter(n => n !== CACHE).map(n => caches.delete(n)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(antwort => {
        const kopie = antwort.clone();
        caches.open(CACHE).then(c => c.put(e.request, kopie));
        return antwort;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true })
        .then(r => r || caches.match('./index.html')))
  );
});
