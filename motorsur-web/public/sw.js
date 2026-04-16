// MotorSur — Service Worker v1
// Este archivo debe estar en la raíz del sitio

const CACHE_NAME = 'motorsur-v1';
const OFFLINE_URL = '/';

// Archivos a cachear para modo offline
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
];

// ── INSTALL ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// ── ACTIVATE ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── FETCH — Network first, cache fallback ──
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('supabase.co')) return; // No cachear API calls
  if (event.request.url.includes('unsplash.com')) return; // No cachear imágenes externas

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Guardar copia en cache
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => {
        // Si falla la red, buscar en cache
        return caches.match(event.request).then(cached => {
          return cached || caches.match(OFFLINE_URL);
        });
      })
  );
});

// ── PUSH NOTIFICATIONS ──
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};

  const options = {
    body: data.body || 'Nuevo mensaje en MotorSur',
    icon: data.icon || '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [200, 100, 200, 100, 200],
    data: {
      url: data.url || '/',
      notificationId: data.id || Date.now()
    },
    actions: [
      { action: 'reply',  title: '💬 Responder' },
      { action: 'view',   title: '👁 Ver' },
      { action: 'close',  title: '✕ Cerrar' }
    ],
    requireInteraction: data.requireInteraction || false,
    tag: data.tag || 'motorsur-general',
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || 'MotorSur',
      options
    )
  );
});

// ── NOTIFICATION CLICK ──
self.addEventListener('notificationclick', event => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  if (event.action === 'close') return;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(list => {
        // Si ya hay una ventana abierta, enfocarla
        for (const client of list) {
          if (client.url.includes(self.location.origin)) {
            client.focus();
            client.postMessage({ type: 'NAVIGATE', url });
            return;
          }
        }
        // Si no hay ventana, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// ── BACKGROUND SYNC (para mensajes enviados offline) ──
self.addEventListener('sync', event => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(sincronizarMensajesPendientes());
  }
});

async function sincronizarMensajesPendientes() {
  // En producción: leer mensajes guardados en IndexedDB y enviarlos a Supabase
  console.log('MotorSur SW: sincronizando mensajes pendientes');
}
