// Nor Celis Automotriz - Service Worker para Notificaciones Push y Alertas de Mi Garaje
const CACHE_NAME = 'norcelis-garage-v1';

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activación y control inmediato de clientes
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Limpieza de cachés antiguas si fuera necesario
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              return caches.delete(cache);
            }
          })
        );
      }),
    ])
  );
});

// Manejo de eventos Push para alertas de precio y novedades de Mi Garaje
self.addEventListener('push', (event) => {
  let notificationData = {
    title: '🚨 Variación de Precio en Mi Garaje',
    body: 'Uno de tus vehículos guardados tiene una nueva cotización o precio actualizado en Nor Celis.',
    icon: '/logo-norcelis.svg',
    badge: '/logo-norcelis.svg',
    tag: 'norcelis-price-alert',
    data: {
      url: '/',
      timestamp: Date.now(),
    },
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = {
        title: payload.title || notificationData.title,
        body: payload.body || notificationData.body,
        icon: payload.icon || notificationData.icon,
        badge: payload.badge || notificationData.badge,
        tag: payload.tag || `price-alert-${Date.now()}`,
        data: payload.data || notificationData.data,
      };
    } catch (e) {
      notificationData.body = event.data.text() || notificationData.body;
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag,
    data: notificationData.data,
    vibrate: [200, 100, 200],
    renotify: true,
    requireInteraction: false,
    actions: [
      {
        action: 'open-garage',
        title: 'Ver en Mi Garaje',
      },
      {
        action: 'close',
        title: 'Descartar',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Interacción y clic en la notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si ya hay una ventana abierta, enfocarla y navegar
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          if ('navigate' in client && targetUrl !== '/') {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      // Si no hay ventana abierta, abrir una nueva
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Manejo de descarte de notificación
self.addEventListener('notificationclose', (event) => {
  // Registro silencioso o métricas si fuera necesario
});
