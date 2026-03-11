const CACHE_NAME = 'gymtrainer-v1.0.4';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/data.js',
  './js/app.js',
  './manifest.json',
  './icons/icon.svg',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
];

// Install: pre-cache all assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first for assets, network-first for rest
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  // Cache-first strategy
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request)
        .then(response => {
          if (!response || response.status !== 200 || response.type === 'opaque') {
            return response;
          }
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
          return response;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});

// Handle background sync (future: sync measurements)
self.addEventListener('sync', (e) => {
  if (e.tag === 'sync-data') {
    e.waitUntil(Promise.resolve());
  }
});

// Push notifications
self.addEventListener('push', (e) => {
  const data = e.data ? e.data.json() : { title: 'GymTrainer Pro', body: 'Tienes actividad nueva' };
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: './icons/icon.svg',
      badge: './icons/icon.svg',
      tag: 'gym-notification'
    })
  );
});
