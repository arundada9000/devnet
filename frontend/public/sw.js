const CACHE_NAME = "sajilo-sahayata-v3";

// Injected at build time by vite-plugin-pwa (auto-generated hashed filenames)
const BUILD_MANIFEST = self.__WB_MANIFEST;

// Assets to pre-cache on install (static + build manifest)
function getPrecacheAssets() {
  const staticAssets = [
    "/",
    "/favicon.ico",
    "/logos/icon-192x192.png",
    "/logos/icon-512x512.png",
  ];
  if (BUILD_MANIFEST && Array.isArray(BUILD_MANIFEST)) {
    return [...staticAssets, ...BUILD_MANIFEST.map((e) => e.url)];
  }
  return staticAssets;
}

// Install: Pre-cache all known assets
// New SW waits for user confirmation (SKIP_WAITING message) instead of auto-activating.
// This lets the UpdateBanner prompt the user before refreshing.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      const urls = getPrecacheAssets();
      await Promise.allSettled(urls.map((url) => cache.add(url)));
    })
  );
});

// Activate: Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: Network-first for API, Cache-first for static assets & map tiles
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip chrome-extension and other non-http(s)
  if (!url.protocol.startsWith("http")) return;

  // ── Map tiles (CARTO): Cache-first, fallback to network ──
  if (url.hostname.includes("basemaps.cartocdn.com")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (!response || response.status !== 200) return response;
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        });
      })
    );
    return;
  }

  // API calls: Network first, fallback to cache
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Static assets & pages: Cache first, fallback to network
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          // Don't cache opaque responses or errors
          if (!response || response.status !== 200 || response.type === "opaque") {
            return response;
          }

          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => {
          // For navigation requests, serve the cached index.html (SPA fallback)
          if (request.mode === "navigate") {
            return caches.match("/index.html");
          }
        });
    })
  );
});

// ═══ Push Notifications ═══
self.addEventListener("push", (event) => {
  let data = { title: "Sajilo Sahayata", body: "You have a new notification." };

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch {
    // If parse fails, use defaults
  }

  const options = {
    body: data.body,
    icon: data.icon || "/logos/icon-192x192.png",
    badge: data.badge || "/logos/icon-96x96.png",
    vibrate: [100, 50, 100, 50, 200],
    data: {
      url: data.url || "/dashboard/home",
    },
    actions: [
      { action: "open", title: "View" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const targetUrl = event.notification.data?.url || "/dashboard/home";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and navigate
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.focus();
          client.navigate(targetUrl);
          return;
        }
      }
      // Otherwise open a new window
      return clients.openWindow(targetUrl);
    })
  );
});

// ═══ Background Sync (for offline report queue) ═══
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-reports") {
    event.waitUntil(
      // Notify main thread to trigger sync
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: "SYNC_REPORTS" });
        });
      })
    );
  }
});

// Listen for messages from main thread
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
