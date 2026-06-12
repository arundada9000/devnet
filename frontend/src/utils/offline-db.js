const DB_NAME = 'offline-experiment'
const DB_VERSION = 1

export function openOfflineDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains('pending')) {
        db.createObjectStore('pending', { keyPath: 'id', autoIncrement: true })
      }
      if (!db.objectStoreNames.contains('logs')) {
        db.createObjectStore('logs', { keyPath: 'timestamp' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function storeOffline(type, data) {
  const db = await openOfflineDB()
  const tx = db.transaction('pending', 'readwrite')
  tx.objectStore('pending').add({ type, data, timestamp: Date.now() })
  return new Promise((resolve) => {
    tx.oncomplete = () => resolve(true)
    tx.onerror = () => resolve(false)
  })
}

export async function flushOfflineQueue() {
  const db = await openOfflineDB()
  const tx = db.transaction('pending', 'readonly')
  const store = tx.objectStore('pending')
  const items = await new Promise((resolve) => {
    const req = store.getAll()
    req.onsuccess = () => resolve(req.result)
  })
  return items
}
