export class BackgroundSyncManager {
  constructor(tag, options = {}) {
    this.tag = tag
    this.maxRetries = options.maxRetries || 3
    this.retryDelay = options.retryDelay || 60000
  }

  async register() {
    if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
      console.warn('Background sync not supported')
      return false
    }
    const registration = await navigator.serviceWorker.ready
    await registration.sync.register(this.tag)
    return true
  }

  async getPendingSyncs() {
    const registration = await navigator.serviceWorker.ready
    const tags = await registration.sync.getTags()
    return tags
  }
}

export function createSyncPayload(data) {
  return {
    id: crypto.randomUUID(),
    payload: data,
    timestamp: Date.now(),
    retryCount: 0
  }
}
