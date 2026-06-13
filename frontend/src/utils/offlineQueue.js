/**
 * Offline Queue Utility
 * Uses IndexedDB to store reports when the user is offline.
 * Auto-syncs when connectivity returns.
 */

const DB_NAME = "sajilo-offline-db";
const DB_VERSION = 3; // Bumped version for contacts store
const STORE_NAME = "offlineReports";
const CONTACTS_STORE = "offlineContacts";

/**
 * Registers a background sync event with the service worker.
 * This ensures pending reports sync even if the user closes the app.
 */
async function registerBackgroundSync() {
  try {
    if ("serviceWorker" in navigator && "SyncManager" in window) {
      const reg = await navigator.serviceWorker.ready;
      await reg.sync.register("sync-reports");
    }
  } catch {
    // Background sync not supported — will rely on online event + polling
  }
}

/**
 * Opens (or creates) the IndexedDB database.
 * @returns {Promise<IDBDatabase>}
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(CONTACTS_STORE)) {
        const contactStore = db.createObjectStore(CONTACTS_STORE, { keyPath: "cacheKey" });
        contactStore.createIndex("localGov", "localGov", { unique: false });
        contactStore.createIndex("department", "department", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Converts a File/Blob to a base64 data URL string.
 * Required because File objects can't be stored in IndexedDB directly.
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Converts a base64 data URL back to a Blob for FormData reconstruction.
 */
function base64ToBlob(base64, mimeType = "image/jpeg") {
  try {
    const parts = base64.split(",");
    if (parts.length === 2) {
      const mime = parts[0].match(/:(.*?);/)?.[1] || mimeType;
      const bstr = atob(parts[1]);
      const u8arr = new Uint8Array(bstr.length);
      for (let i = 0; i < bstr.length; i++) {
        u8arr[i] = bstr.charCodeAt(i);
      }
      return new Blob([u8arr], { type: mime });
    }
  } catch (e) {
    console.error("[OfflineQueue] Failed to convert base64 to blob:", e);
  }
  return null;
}

/**
 * Saves a report to IndexedDB for later sync.
 * @param {Object} reportData - { type, description, location, imageBase64, imageName }
 */
export async function saveReportOffline(reportData) {
  const db = await openDB();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    const record = {
      ...reportData,
      createdAt: new Date().toISOString(),
    };

    const request = store.add(record);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  // Register background sync so the SW can trigger sync even if tab is closed
  registerBackgroundSync();
}

/**
 * Retrieves all pending offline reports.
 * @returns {Promise<Array>}
 */
export async function getPendingReports() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Removes a successfully synced report from IndexedDB.
 * @param {number} id - The auto-incremented key
 */
export async function removePendingReport(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Attempts to sync all pending offline reports to the server.
 * Returns { synced: number, failed: number }
 */
export async function syncPendingReports(apiInstance) {
  const pending = await getPendingReports();
  if (pending.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;

  for (const report of pending) {
    try {
      const formData = new FormData();
      formData.append("type", report.type);
      formData.append("description", report.description);
      formData.append("location", report.location); // Already JSON stringified

      // Reconstruct image blob from base64
      if (report.imageBase64) {
        const blob = base64ToBlob(report.imageBase64);
        if (blob) {
          formData.append("image", blob, report.imageName || "offline-photo.jpg");
        }
      }

      await apiInstance.post("/reports", formData);
      await removePendingReport(report.id);
      synced++;
    } catch (err) {
      console.warn(`[OfflineQueue] Failed to sync report ${report.id}:`, err.message);
      failed++;
    }
  }

  return { synced, failed };
}

/**
 * Converts a File object to a serializable record for IndexedDB.
 * @param {Object} params - { type, description, location (JSON string), photoFile (File) }
 * @returns {Promise<Object>} - Serializable report object
 */
export async function prepareOfflineReport({ type, description, location, photoFile }) {
  let imageBase64 = null;
  let imageName = null;

  if (photoFile) {
    imageBase64 = await fileToBase64(photoFile);
    imageName = photoFile.name || "camera-photo.jpg";
  }

  return {
    type,
    description,
    location, // Already JSON.stringify'd [lng, lat]
    imageBase64,
    imageName,
  };
}

/* ══════════════════════════════════════════
   Offline Contacts Cache
   ══════════════════════════════════════════ */

/**
 * Stores emergency contacts in IndexedDB for offline access.
 * @param {string} localGov - VDC/municipality name
 * @param {string} department - fire, police, flood, etc.
 * @param {Array} contacts - Array of contact objects
 */
export async function cacheContacts(localGov, department, contacts) {
  const db = await openDB();
  const cacheKey = `${localGov.toLowerCase()}/${department.toLowerCase()}`;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CONTACTS_STORE, "readwrite");
    const store = tx.objectStore(CONTACTS_STORE);
    const record = {
      cacheKey,
      localGov: localGov.toLowerCase(),
      department: department.toLowerCase(),
      contacts,
      cachedAt: new Date().toISOString(),
    };
    store.put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Retrieves cached contacts from IndexedDB.
 * @returns {Promise<Array|null>} - Contacts array or null if not cached
 */
export async function getCachedContacts(localGov, department) {
  const db = await openDB();
  const cacheKey = `${localGov.toLowerCase()}/${department.toLowerCase()}`;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CONTACTS_STORE, "readonly");
    const store = tx.objectStore(CONTACTS_STORE);
    const request = store.get(cacheKey);
    request.onsuccess = () => resolve(request.result?.contacts || null);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Proactively fetches contacts from the API and caches only the ones
 * for the user's specific local government.
 */
export async function prefetchLocalContacts(apiInstance, userLocalGov) {
  if (!userLocalGov || userLocalGov === "Unknown") return;

  try {
    const res = await apiInstance.get("/contacts");
    if (res.data && Array.isArray(res.data)) {
      let cachedCount = 0;
      for (const record of res.data) {
        if (
          record.localGovName && 
          record.department && 
          record.contacts &&
          record.localGovName.toLowerCase() === userLocalGov.toLowerCase()
        ) {
          await cacheContacts(record.localGovName, record.department, record.contacts);
          cachedCount++;
        }
      }
      if (cachedCount > 0) {
        console.log(`[Offline] Proactively cached ${cachedCount} emergency departments for ${userLocalGov}.`);
      }
    }
  } catch (err) {
    console.warn("[Offline] Failed to prefetch contacts:", err.message);
  }
}
