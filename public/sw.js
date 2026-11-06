// Service Worker do FuelGest — PWA
// Estratégias:
// - App shell: cache-first (HTML, JS, CSS, ícones)
// - APIs: network-first com fallback de cache
// - Imagens: cache-first
// - Offline fallback: página de aviso quando sem rede

const CACHE_VERSION = "fuelgest-v1";
const STATIC_CACHE = "fuelgest-static-v1";
const API_CACHE = "fuelgest-api-v1";
const IMAGE_CACHE = "fuelgest-images-v1";

const APP_SHELL = [
  "/",
  "/app/login",
  "/app/cadastro",
  "/offline.html",
  "/manifest.json",
  "/logo.svg",
  "/favicon.svg",
  "/apple-touch-icon.png",
  "/icons/icon-192.png",
  "/icons/icon-256.png",
  "/icons/icon-384.png",
  "/icons/icon-512.png",
];

// Instala: pré-cachedo do app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return Promise.all(
        APP_SHELL.map((url) =>
          cache.add(url).catch((err) => {
            console.warn("[SW] Falha ao cachear:", url, err.message);
          })
        )
      );
    })
  );
  self.skipWaiting();
});

// Ativa: limpa caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => ![STATIC_CACHE, API_CACHE, IMAGE_CACHE].includes(key))
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Helper: é uma API?
function isApiRequest(url) {
  return url.pathname.startsWith("/api/");
}

// Helper: é um asset estático?
function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/icons/") ||
    ["/logo.svg", "/favicon.svg", "/apple-touch-icon.png", "/manifest.json"].includes(
      url.pathname
    )
  );
}

// Helper: é uma imagem?
function isImageRequest(url, request) {
  return (
    request.destination === "image" ||
    /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(url.pathname)
  );
}

// Helper: é uma rota do app (HTML)?
function isAppRoute(url) {
  return (
    url.pathname.startsWith("/app/") ||
    url.pathname.startsWith("/admin/") ||
    url.pathname === "/"
  );
}

// Estratégia: Network-first com fallback de cache (para APIs GET)
async function networkFirst(request) {
  const cache = await caches.open(API_CACHE);
  try {
    const networkResponse = await fetch(request);
    // Só cacheda GETs bem-sucedidos
    if (request.method === "GET" && networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (err) {
    // Sem rede: tenta cache
    const cached = await cache.match(request);
    if (cached) return cached;
    throw err;
  }
}

// Estratégia: Cache-first (assets estáticos)
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) {
    // Atualiza em background (stale-while-revalidate)
    fetch(request)
      .then((res) => {
        if (res && res.ok) cache.put(request, res.clone());
      })
      .catch(() => {});
    return cached;
  }
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (err) {
    // Sem cache e sem rede
    throw err;
  }
}

// Estratégia: Stale-while-revalidate (HTML routes)
async function staleWhileRevalidate(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse && networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => cached);

  return cached || fetchPromise;
}

// Fetch principal
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  // Ignora requests de outras origens (ex: Google Fonts, analytics)
  if (url.origin !== self.location.origin) return;

  // Estratégias por tipo
  if (isApiRequest(url)) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (isImageRequest(url, request)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  if (isAppRoute(url)) {
    event.respondWith(
      staleWhileRevalidate(request).catch(async () => {
        // Fallback: se for rota do app, mostra offline.html
        const cache = await caches.open(STATIC_CACHE);
        const offline = await cache.match("/offline.html");
        return offline || Response.error();
      })
    );
    return;
  }

  // Default: try network, fallback to cache
  event.respondWith(
    fetch(request).catch(() => caches.match(request).then((r) => r || Response.error()))
  );
});

// Mensagens (para forçar update)
self.addEventListener("message", (event) => {
  if (event.data === "skipWaiting") self.skipWaiting();
});

// Background sync (placeholder — para futura fila de abastecimentos offline)
self.addEventListener("sync", (event) => {
  if (event.tag === "fuelgest-sync") {
    event.waitUntil(
      self.clients.matchAll().then((clients) =>
        clients.forEach((client) =>
          client.postMessage({ type: "BACKGROUND_SYNC" })
        )
      )
    );
  }
});

// Push notifications (placeholder)
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {}

  const title = data.title || "FuelGest";
  const options = {
    body: data.body || "Nova notificação do FuelGest",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    vibrate: [100, 50, 100],
    data: { url: data.url || "/app/inicio" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Click em notificação
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/app/inicio";
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
