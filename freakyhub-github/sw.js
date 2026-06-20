/* FreakyHub Service Worker — cache básico do app shell (offline) */
const CACHE = 'freakyhub-v1';
const SHELL = ['./', './index.html', './manifest.webmanifest'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Network-first para HTML, cache-first para o resto */
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});

/* Push real exige backend (VAPID + endpoint). Esqueleto pronto: */
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : { title: 'FreakyHub', body: 'Não perca sua ofensiva 🔥' };
  e.waitUntil(self.registration.showNotification(data.title, { body: data.body, icon: 'icons/icon-192.png' }));
});
