const CACHE_NAME = "academic-dashboard-v2";

const FILES_TO_CACHE = [

  "/",
  "/index.html",
  "/style.css",
  "/manifest.json"

];

self.addEventListener("install", event => {

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))

  );

});

self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys()
      .then(cacheNames =>
        Promise.all(

          // Elimina cachés de versiones anteriores. Esto NUNCA
          // toca localStorage/IndexedDB: solo borra los archivos
          // estáticos cacheados por el Service Worker.
          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => caches.delete(name))

        )
      )
      .then(() => self.clients.claim())

  );

});

self.addEventListener("fetch", event => {

  event.respondWith(

    caches.match(event.request)
      .then(response => {

        return response || fetch(event.request);

      })

  );

});

// =========================================================
// Actualización sin fricción: cuando app.js detecta un
// Service Worker nuevo "esperando", le pide activarse ya
// (en vez de esperar a que se cierren todas las pestañas).
// =========================================================
self.addEventListener("message", event => {

  if(event.data && event.data.type === "SKIP_WAITING"){

    self.skipWaiting();

  }

});
