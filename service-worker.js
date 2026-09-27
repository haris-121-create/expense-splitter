const CACHE_NAME = 'expense-splitter-v3';
const FILES_TO_CACHE = [
  './index.html',
  './style.css',
  './script.js',
  './manifest.json'
];

// Install: files ko cache mein daalo
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// Activate: purane cache hatao
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// Fetch: pehle cache se try karo, warna network se
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});