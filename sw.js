// Service worker: приложение открывается и без интернета.
// Стратегия network-first — сначала сеть (правки видны сразу), без сети — кеш.

const CACHE = 'rigas-satiksme-v2';

const PRECACHE = [
  './',
  'index.html',
  'menu.html',
  'my-tickets.html',
  'transactions.html',
  'trips.html',
  'buy-ticket.html',
  'style.css',
  'common.js',
  'app.js',
  'trips.js',
  'buy-ticket.js',
  'vendor/jsQR.js',
  'manifest.webmanifest',
  'img/rigas-satiksme-logo.png',
  'img/icons/icon-192.png',
  'img/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
  self.skipWaiting();
});

// удаляем кеши старых версий (когда поменяешь CACHE на v2 и т.д.)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request, { ignoreSearch: true }))
  );
});
