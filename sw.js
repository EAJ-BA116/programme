const DEFAULT_URL = './index.html';

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (error) {
    data = { body: event.data ? event.data.text() : '' };
  }

  const title = String(data.title || 'EAJ BA 116');
  const body = String(data.body || 'Nouvelle information disponible.');
  const kind = String(data.kind || 'information');
  const targetUrl = String(data.url || DEFAULT_URL);

  const options = {
    body,
    icon: new URL('./images/logo_eaj192.png', self.registration.scope).href,
    badge: new URL('./images/logo_eaj192.png', self.registration.scope).href,
    tag: data.tag || `eaj-${kind}`,
    renotify: kind === 'important' || kind === 'update',
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

    if (clients.openWindow) {
      await clients.openWindow(targetUrl);
    }
  })());
});
