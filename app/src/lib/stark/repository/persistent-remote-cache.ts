/** Cloud read cache kept outside the local ledger database. */
const DB_NAME = "wotty-stark-remote-cache";
const STORE_NAME = "responses";
const DB_VERSION = 1;

type CacheRecord<T> = {
  id: string;
  savedAt: number;
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

export async function readPersistentRemoteCache<T>(scope: string, resource: string, key: string) {
  const db = await openCache();
  return new Promise<CacheRecord<T> | undefined>((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(recordPrefix(scope, resource, key));
    request.onsuccess = () => resolve(request.result as CacheRecord<T> | undefined);
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
