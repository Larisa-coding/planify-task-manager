const CACHE_NAME = 'planify-v4';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(Promise.resolve());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
    await self.clients.claim();
    const windowClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    await Promise.all(windowClients.map((client) => {
      if (!client.url || typeof client.navigate !== 'function') return Promise.resolve();
      return client.navigate(client.url).catch(() => undefined);
    }));
  })());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
