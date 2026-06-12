const DB_NAME = "sajilo-offline-db";
const DB_VERSION = 3;
const STORE_NAME = "cacheMeta";
const MAX_CACHE_SIZE = 50 * 1024 * 1024;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "url" });
        store.createIndex("timestamp", "timestamp", { unique: false });
        store.createIndex("size", "size", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function evictIfNeeded() {
  const db = await openDb();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  const all = await new Promise((res) => {
    const items = [];
    store.openCursor().onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        items.push(cursor.value);
        cursor.continue();
      } else {
        res(items);
      }
    };
  });

  const now = Date.now();
  let totalSize = 0;
  const outdated = [];

  for (const item of all) {
    totalSize += item.size || 0;
    if (now - item.timestamp > MAX_AGE_MS) {
      outdated.push(item.url);
    }
  }

  outdated.sort((a, b) => a.timestamp - b.timestamp);
  let currentSize = totalSize;
  for (const url of outdated) {
    if (currentSize <= MAX_CACHE_SIZE) break;
    store.delete(url);
    currentSize -= outdated.find((i) => i.url === url)?.size || 0;
  }

  return { evicted: outdated.length, freedBytes: totalSize - currentSize };
}
