const DB_NAME = "sajilo-offline-db";
const DB_VERSION = 2;
const STORE_NAME = "offlineReports";
const CONTACTS_STORE = "offlineContacts";

async function registerBackgroundSync() {
  try {
    if ("serviceWorker" in navigator && "SyncManager" in window) {
      const reg = await navigator.serviceWorker.ready;
      await reg.sync.register("sync-reports");
    }
  } catch {
  }
}

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

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

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

  registerBackgroundSync();
}

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
      formData.append("location", report.location);

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
    location,
    imageBase64,
    imageName,
  };
}

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
