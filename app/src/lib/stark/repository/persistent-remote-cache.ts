/** Cloud read cache kept outside the local ledger database. */
const DB_NAME = "wotty-stark-remote-cache";
const STORE_NAME = "responses";
const DB_VERSION = 1;
// Increase when the client-side API response model changes incompatibly.
const CACHE_DATA_VERSION = 1;

type CacheRecord<T> = {
  id: string;
  savedAt: number;
  dataVersion: number;
  value: T;
};

let dbPromise: Promise<IDBDatabase> | null = null;

function openCache() {
  if (!dbPromise) {
    dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE_NAME)) {
          request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("无法打开云端缓存"));
    }).catch((error) => {
      dbPromise = null;
      throw error;
    });
  }
  return dbPromise;
}

function recordPrefix(scope: string, resource: string, key = "") {
  return `${scope}\u0000${resource}\u0000${key}`;
}

/** Clear a user's cached API responses when the server's database/API schema changes. */
export async function synchronizePersistentRemoteCacheSchema(scope: string, schemaVersion: string) {
  const db = await openCache();
  const scopePrefix = `${scope}\u0000`;
  const metadataId = recordPrefix(scope, "__metadata__", "schema-version");
  return new Promise<boolean>((resolve, reject) => {
    let changed = false;
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const currentRequest = store.get(metadataId);
    currentRequest.onsuccess = () => {
      const current = currentRequest.result as CacheRecord<string> | undefined;
      if (current?.dataVersion === CACHE_DATA_VERSION && current.value === schemaVersion) return;

      changed = true;
      const cursorRequest = store.openKeyCursor(IDBKeyRange.bound(scopePrefix, `${scopePrefix}\uffff`));
      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
        if (!cursor) return;
        if (cursor.primaryKey !== metadataId) store.delete(cursor.primaryKey);
        cursor.continue();
      };
      cursorRequest.onerror = () => transaction.abort();
      store.put({ id: metadataId, savedAt: Date.now(), dataVersion: CACHE_DATA_VERSION, value: schemaVersion } satisfies CacheRecord<string>);
    };
    currentRequest.onerror = () => transaction.abort();
    transaction.oncomplete = () => resolve(changed);
    transaction.onerror = () => reject(transaction.error ?? new Error("同步云端缓存版本失败"));
    transaction.onabort = () => reject(transaction.error ?? new Error("同步云端缓存版本失败"));
  });
}

export async function readPersistentRemoteCache<T>(scope: string, resource: string, key: string) {
  const db = await openCache();
  return new Promise<CacheRecord<T> | undefined>((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(recordPrefix(scope, resource, key));
    request.onsuccess = () => {
      const record = request.result as CacheRecord<T> | undefined;
      resolve(record?.dataVersion === CACHE_DATA_VERSION ? record : undefined);
    };
    request.onerror = () => reject(request.error ?? new Error("读取云端缓存失败"));
  });
}

export async function writePersistentRemoteCache<T>(scope: string, resource: string, key: string, value: T) {
  const db = await openCache();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put({
      id: recordPrefix(scope, resource, key),
      savedAt: Date.now(),
      dataVersion: CACHE_DATA_VERSION,
      value,
    } satisfies CacheRecord<T>);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("写入云端缓存失败"));
    transaction.onabort = () => reject(transaction.error ?? new Error("写入云端缓存失败"));
  });
}

export async function deletePersistentRemoteCache(scope: string, resource: string, keyPrefix = "") {
  const db = await openCache();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const prefix = recordPrefix(scope, resource, keyPrefix);
    const request = store.openKeyCursor(IDBKeyRange.bound(prefix, `${prefix}\uffff`));
    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) return;
      store.delete(cursor.primaryKey);
      cursor.continue();
    };
    request.onerror = () => transaction.abort();
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("清除云端缓存失败"));
    transaction.onabort = () => reject(transaction.error ?? new Error("清除云端缓存失败"));
  });
}
