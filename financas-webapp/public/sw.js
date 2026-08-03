const CACHE_NAME = 'financas-cache-v3';
const OFFLINE_URL = '/offline.html';
const APP_SHELL_URLS = ['/index.html', OFFLINE_URL];
const API_ORIGIN = 'http://localhost:8080';

function isFinancasApiGet(url) {
  if (url.origin !== API_ORIGIN) {
    return false;
  }

  if (url.pathname === '/categories') {
    return true;
  }

  if (url.pathname === '/spending-limits' || url.pathname.startsWith('/spending-limits/')) {
    return true;
  }

  return url.pathname === '/transactions' || url.pathname.startsWith('/transactions/');
}

function getApiStrategy(pathname) {
  if (pathname === '/categories' || pathname === '/spending-limits' || pathname.startsWith('/spending-limits/')) {
    return 'cache-first';
  }

  if (pathname === '/transactions' || pathname.startsWith('/transactions/')) {
    return 'network-first';
  }

  return null;
}

async function offlineNavigationFallback() {
  const offlinePage = await caches.match(OFFLINE_URL);
  if (offlinePage) {
    return offlinePage;
  }

  const indexPage = await caches.match('/index.html');
  if (indexPage) {
    return indexPage;
  }

  return new Response('Você está offline.', {
    status: 503,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

async function offlineApiFallback() {
  return new Response(JSON.stringify([]), {
    status: 503,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

async function updateCache(request, response) {
  if (!response || !response.ok) {
    return;
  }

  const copy = response.clone();
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, copy);
}

async function networkFirstWithCache(request) {
  try {
    const response = await fetch(request);
    await updateCache(request, response);
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || offlineApiFallback();
  }
}

async function cacheFirstWithNetworkUpdate(request) {
  const cached = await caches.match(request);

  try {
    const response = await fetch(request);
    await updateCache(request, response);
    return cached ?? response;
  } catch {
    return cached || offlineApiFallback();
  }
}

async function invalidateCachePaths(paths) {
  const cache = await caches.open(CACHE_NAME);
  const requests = await cache.keys();

  await Promise.all(
    requests
      .filter((request) => {
        const pathname = new URL(request.url).pathname;
        return paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
      })
      .map((request) => cache.delete(request)),
  );
}

async function precacheAppShell() {
  const cache = await caches.open(CACHE_NAME);
  await Promise.all(
    APP_SHELL_URLS.map((url) => cache.add(url).catch(() => undefined)),
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(precacheAppShell());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  if (isFinancasApiGet(url)) {
    const strategy = getApiStrategy(url.pathname);

    if (strategy === 'cache-first') {
      event.respondWith(cacheFirstWithNetworkUpdate(request));
      return;
    }

    if (strategy === 'network-first') {
      event.respondWith(networkFirstWithCache(request));
      return;
    }
  }

  if (request.mode === 'navigate' && url.origin === self.location.origin) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          void updateCache(request, response);
          return response;
        })
        .catch(() => offlineNavigationFallback()),
    );
  }
});

self.addEventListener('message', (event) => {
  const data = event.data;

  if (!data || typeof data !== 'object') {
    return;
  }

  if (data.type === 'INVALIDATE_CACHE' && Array.isArray(data.paths)) {
    event.waitUntil(invalidateCachePaths(data.paths));
    return;
  }

  if (data.type === 'SHOW_NOTIFICATION' && self.registration.showNotification) {
    event.waitUntil(
      self.registration.showNotification(data.title ?? 'FinanceFlow', {
        body: data.body ?? '',
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: data.tag ?? 'spending-limit-alert',
      }),
    );
  }
});
