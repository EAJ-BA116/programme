// ======================================================
// Service Worker EAJ — v1.8.2
// Hors ligne + cache applicatif + notifications Web Push
// ======================================================

const SW_VERSION = '1.8.2';
const STATIC_CACHE = `eaj-static-${SW_VERSION}`;
const RUNTIME_CACHE = `eaj-runtime-${SW_VERSION}`;
const DEFAULT_URL = './index.html';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './style.css',
  './version-loader.js',
  './supabase-config.js',
  './planning.js',
  './planning-api.js',
  './script.js',
  './images/eaj.ico',
  './images/logo_eaj.png',
  './images/logo_eaj192.png',
  './images/logo_eaj512.png',
  './images/maskable-192.png',
  './images/maskable-512.png'
];

async function precacheAppShell() {
  const cache = await caches.open(STATIC_CACHE);
  // Un fichier optionnel manquant ne doit pas empêcher l'installation complète du SW.
  await Promise.allSettled(APP_SHELL.map(async (path) => {
    const request = new Request(new URL(path, self.registration.scope).href, { cache: 'reload' });
    const response = await fetch(request);
    if (response && response.ok) await cache.put(path, response.clone());
  }));
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    await precacheAppShell();
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names
      .filter((name) => (name.startsWith('eaj-static-') || name.startsWith('eaj-runtime-')) && ![STATIC_CACHE, RUNTIME_CACHE].includes(name))
      .map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

async function matchIgnoringVersion(request) {
  const staticCache = await caches.open(STATIC_CACHE);
  let cached = await staticCache.match(request, { ignoreSearch: true });
  if (cached) return cached;
  const runtimeCache = await caches.open(RUNTIME_CACHE);
  cached = await runtimeCache.match(request, { ignoreSearch: true });
  return cached || null;
}

async function networkFirstNavigation(request) {
  const runtime = await caches.open(RUNTIME_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) await runtime.put(new URL('./index.html', self.registration.scope).href, response.clone());
    return response;
  } catch (error) {
    return (await matchIgnoringVersion(new Request(new URL('./index.html', self.registration.scope).href))) || Response.error();
  }
}

async function localAsset(request) {
  const cached = await matchIgnoringVersion(request);
  const runtime = await caches.open(RUNTIME_CACHE);

  const networkPromise = fetch(request)
    .then(async (response) => {
      if (response && response.ok) await runtime.put(request, response.clone());
      return response;
    })
    .catch(() => null);

  if (cached) {
    // Mise à jour silencieuse du cache quand le réseau existe.
    networkPromise.catch(() => null);
    return cached;
  }

  return (await networkPromise) || Response.error();
}

async function externalLibrary(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    // Les réponses opaques d'un CDN peuvent tout de même être mises en cache.
    if (response && (response.ok || response.type === 'opaque')) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return Response.error();
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const ownOrigin = url.origin === self.location.origin;

  if (request.mode === 'navigate' && ownOrigin) {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (ownOrigin) {
    event.respondWith(localAsset(request));
    return;
  }

  // La librairie Supabase est chargée depuis jsDelivr. Après une première visite
  // en ligne, elle reste disponible au prochain lancement hors connexion.
  if (url.hostname === 'cdn.jsdelivr.net') {
    event.respondWith(externalLibrary(request));
  }
});

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (error) {
    data = { body: event.data ? event.data.text() : '' };
  }

  const rawTitle = String(data.title || 'EAJ BA 116');
  const body = String(data.body || 'Nouvelle information disponible.');
  const kind = String(data.kind || 'information');
  const targetUrl = String(data.url || DEFAULT_URL);

  const kindMeta = {
    information: ['ℹ️', 'Information'],
    programme: ['📅', 'Programme / activité'],
    modification: ['🔄', 'Modification'],
    cancellation: ['❌', 'Annulation'],
    document: ['📄', 'Document / consigne'],
    update: ['🆕', 'Mise à jour application'],
    important: ['🚨', 'Important']
  };
  const meta = kindMeta[kind] || kindMeta.information;
  const title = `${meta[0]} ${rawTitle}`;

  const options = {
    body,
    icon: new URL('./images/logo_eaj192.png', self.registration.scope).href,
    badge: new URL('./images/logo_eaj192.png', self.registration.scope).href,
    tag: data.tag || `eaj-${kind}`,
    renotify: ['important', 'update', 'modification', 'cancellation'].includes(kind),
    data: {
      url: targetUrl,
      kind
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const rawUrl = event.notification?.data?.url || DEFAULT_URL;
  const targetUrl = new URL(rawUrl, self.registration.scope).href;

  event.waitUntil((async () => {
    const windows = await clients.matchAll({ type: 'window', includeUncontrolled: true });

    for (const client of windows) {
      try {
        const current = new URL(client.url);
        const target = new URL(targetUrl);
        if (current.origin === target.origin) {
          await client.focus();
          if ('navigate' in client && client.url !== targetUrl) {
            await client.navigate(targetUrl);
          }
          return;
        }
      } catch (error) {}
    }

    if (clients.openWindow) await clients.openWindow(targetUrl);
  })());
});
