// FIX (actualización PWA): se sube la versión del cache. Esto,
// sumado a la corrección de la ruta de registro en app.js
// (ahora "sw.js" en la raíz, con scope correcto sobre toda la
// app), hace que el navegador detecte el Service Worker nuevo
// como una versión distinta y dispare el flujo normal de
// actualización (evento "updatefound").
const CACHE_NAME = "academic-dashboard-v17";

const FILES_TO_CACHE = [
  "/Academic-Dashboard/",
  "/Academic-Dashboard/index.html",
  "/Academic-Dashboard/style.css",
  "/Academic-Dashboard/manifest.json"
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

// =========================================================
// FIX (actualización PWA): estrategia de cache.
//
// Antes era "cache-first" puro (caches.match(...) || fetch):
// una vez que un archivo quedaba cacheado, el fetch handler
// nunca volvía a pedirle nada al servidor mientras esa cache
// siguiera viva, así que ese archivo podía quedar "congelado"
// en una versión vieja. Era una de las causas de tener que
// desinstalar la app para forzar una actualización.
//
// Ahora es "stale-while-revalidate": se sigue sirviendo la
// respuesta desde cache al instante si existe (misma
// confiabilidad offline de antes, sin depender de la red para
// responder), pero en paralelo se pide igual la versión de
// red y se guarda en la cache para la próxima vez. La
// actualización "de golpe" a la versión nueva no depende de
// esto: la da el mecanismo de versionado de CACHE_NAME + el
// banner de actualización (instala la versión nueva en una
// cache aparte, y al aceptar se activa y recarga ya con esa
// cache fresca completa).
// =========================================================
self.addEventListener("fetch", event => {

  // Solo se maneja same-origin GET; todo lo demás (POST,
  // recursos externos como Google Fonts, etc.) pasa directo a
  // la red sin intervención del Service Worker.
  if (
    event.request.method !== "GET" ||
    new URL(event.request.url).origin !== self.location.origin
  ) {
    return;
  }

  event.respondWith(

    caches.match(event.request).then(cachedResponse => {

      const networkFetch =
        fetch(event.request)
          .then(networkResponse => {

            if(networkResponse && networkResponse.ok){

              const responseClone =
                networkResponse.clone();

              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseClone);
              });

            }

            return networkResponse;

          })
          .catch(() => cachedResponse);

      return cachedResponse || networkFetch;

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
