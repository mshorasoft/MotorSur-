// MotorSur Service Worker v2
const CACHE_NAME = 'motorsur-v2';
const CACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// ── INSTALL: cachear assets principales ──
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CACHE_ASSETS).catch(() => {
        // Si falla algún asset, continuar igual
        return cache.add('/');
      });
    })
  );
  self.skipWaiting();
});

// ── ACTIVATE: limpiar caches viejas ──
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── FETCH: network first, cache fallback ──
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  // No cachear llamadas a Supabase ni APIs externas
  const url = new URL(e.request.url);
  if (
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('mercadopago.com') ||
    url.hostname.includes('resend.com') ||
    url.hostname.includes('anthropic.com') ||
    url.hostname.includes('ipify.org')
  ) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // Cachear respuesta exitosa
        if (res && res.status === 200) {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone));
        }
        return res;
      })
      .catch(() => {
        // Sin red — servir desde cache
        return caches.match(e.request).then((cached) => {
          if (cached) return cached;
          // Para navegación, servir la app principal
          if (e.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});

// ── PUSH NOTIFICATIONS ──
self.addEventListener('push', (e) => {
  const data = e.data ? e.data.json() : {};
  const opts = {
    body: data.body || 'Nuevo mensaje en MotorSur',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' },
    actions: [
      { action: 'reply', title: '💬 Ver mensaje' },
      { action: 'close', title: 'Cerrar' }
    ],
    requireInteraction: true,
    tag: data.tag || 'motorsur-notif'
  };
  e.waitUntil(
    self.registration.showNotification(data.title || 'MotorSur', opts)
  );
});

// ── NOTIFICATION CLICK ──
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = e.notification.data?.url || '/';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
