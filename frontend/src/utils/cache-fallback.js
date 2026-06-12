export function createCacheFallback(cacheName) {
  return {
    async tryCache(request) {
      const cache = await caches.open(cacheName)
      const cached = await cache.match(request)
      if (cached) return cached
      try {
        const response = await fetch(request)
        if (response.ok) cache.put(request, response.clone())
        return response
      } catch {
        return new Response(JSON.stringify({ offline: true }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    },
    async preCache(urls) {
      const cache = await caches.open(cacheName)
      const results = await Promise.allSettled(
        urls.map(url => fetch(url).then(r => cache.put(url, r)))
      )
      return results.filter(r => r.status === 'rejected').length
    }
  }
}
