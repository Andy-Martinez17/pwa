// Cambia este número cada vez que modifiques archivos cacheados
const VERSION = 'v3';
const STATIC_CACHE = `coffee-static-${VERSION}`;
const RUNTIME_CACHE = `coffee-runtime-${VERSION}`;

// Archivos esenciales (app shell). Si alguno no existe, la instalación falla.
const APP_SHELL = [
  './',
  './index.html',
  './detalle.html',
  './css/style.css',
  './js/app.js',
  './manifest.json'
];

// INSTALL: guarda el app shell en caché
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// ACTIVATE: borra cachés de versiones anteriores
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// FETCH: estrategias según el tipo de petición
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Solo manejamos GET del mismo origen
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navegación (páginas): red primero, si falla -> caché de esa página o index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(request).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }


  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          return response;
        });
      })
    );
    return;
  }

  
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});