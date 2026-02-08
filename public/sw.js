// Dayla Service Worker - Offline-First Strategy
const CACHE_NAME = 'dayla-v1';
const RUNTIME_CACHE = 'dayla-runtime-v1';

// App shell files to pre-cache on install
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap',
];

// Install: cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching app shell');
      return cache.addAll(APP_SHELL);
    })
  );
  // Activate immediately, don't wait for old SW to finish
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch: network-first for API, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip socket.io and chrome-extension requests
  if (url.pathname.startsWith('/socket.io') || url.protocol === 'chrome-extension:') return;

  // API requests: network-first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Static assets (JS, CSS, images, fonts): cache-first
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff2?|ttf|eot|ico)$/)
  ) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Navigation requests (HTML pages): network-first, fall back to cached shell
  if (request.mode === 'navigate') {
    event.respondWith(navigationStrategy(request));
    return;
  }

  // Everything else: network-first
  event.respondWith(networkFirstStrategy(request));
});

// Strategy: Cache First (for static assets)
async function cacheFirstStrategy(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return a basic offline fallback for images
    if (request.destination === 'image') {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="#f7f3ee" width="200" height="200"/><text x="50%" y="50%" font-family="sans-serif" font-size="14" fill="#a3b18a" text-anchor="middle" dy=".3em">Offline</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    return new Response('Offline', { status: 503 });
  }
}

// Strategy: Network First (for API calls and dynamic content)
async function networkFirstStrategy(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(
      JSON.stringify({ success: false, offline: true, message: 'You are offline. Data will sync when reconnected.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Strategy: Navigation (SPA shell fallback)
async function navigationStrategy(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Fall back to cached index.html for SPA routing
    const cached = await caches.match('/index.html');
    if (cached) return cached;

    return new Response(offlinePage(), {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });
  }
}

// Offline fallback page
function offlinePage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>Dayla - Offline</title>
  <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Quicksand', sans-serif;
      background: #f7f3ee;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      min-height: 100dvh;
      padding: 2rem;
      text-align: center;
    }
    .container { max-width: 320px; }
    .icon { font-size: 64px; margin-bottom: 1rem; }
    h1 { color: #3a5a40; font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; }
    p { color: #6b7280; font-size: 0.875rem; line-height: 1.5; margin-bottom: 1.5rem; }
    button {
      background: #3a5a40; color: white; border: none; padding: 0.75rem 2rem;
      border-radius: 9999px; font-family: inherit; font-weight: 700; font-size: 0.875rem;
      cursor: pointer; transition: background 0.2s;
    }
    button:hover { background: #588157; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">🌲</div>
    <h1>You're Off the Grid</h1>
    <p>Looks like you've wandered into an area with no connection. Don't worry — Dayla will be right here when you're back online.</p>
    <button onclick="window.location.reload()">Try Again</button>
  </div>
</body>
</html>`;
}

// Listen for messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((names) => names.forEach((name) => caches.delete(name)));
  }
});
