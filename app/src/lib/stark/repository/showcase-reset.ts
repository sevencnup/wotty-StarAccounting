import { openDb } from "../storage/indexeddb";
import { clearShowcaseStorage } from "./showcase-storage-keys";

const SHOWCASE_DEMO_MODE = process.env.NEXT_PUBLIC_SHOWCASE_DEMO === "1";

/** A full document load starts a fresh showcase; client-side navigation does not call this again. */
export async function resetShowcaseDemoForPageLoad() {
  if (!SHOWCASE_DEMO_MODE) return;
  const db = await openDb();
  const storeNames = Array.from(db.objectStoreNames);
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(storeNames, "readwrite");
    for (const name of storeNames) transaction.objectStore(name).clear();
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("演示账本重置失败"));
    transaction.onabort = () => reject(transaction.error ?? new Error("演示账本重置已取消"));
  });
  clearShowcaseStorage(window.localStorage);
  clearShowcaseStorage(window.sessionStorage);
}
