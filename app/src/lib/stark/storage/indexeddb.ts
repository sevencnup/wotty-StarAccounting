import type {
  Account,
  Asset,
  Budget,
  CategoryRule,
  ExchangeRate,
  ImportErrorLog,
  Loan,
  SavingsGoal,
  SavingsPlan,
  ThemeConfig,
  Transaction,
  User,
} from "@/lib/stark/models/types";

export const DB_NAME = "wotty-stark-web";
export const DB_VERSION = 1;

export type StoreName =
  | "users"
  | "accounts"
  | "transactions"
  | "assets"
  | "budgets"
  | "loans"
  | "savingsGoals"
  | "savingsPlans"
  | "categoryRules"
  | "importErrorLogs"
  | "exchangeRates"
  | "themeConfigs";

export interface StarkDbSchema {
  users: User;
  accounts: Account;
  transactions: Transaction;
  assets: Asset;
  budgets: Budget;
  loans: Loan;
  savingsGoals: SavingsGoal;
  savingsPlans: SavingsPlan;
  categoryRules: CategoryRule;
  importErrorLogs: ImportErrorLog;
  exchangeRates: ExchangeRate;
  themeConfigs: ThemeConfig;
}

const STORE_NAMES: StoreName[] = [
  "users",
  "accounts",
  "transactions",
  "assets",
  "budgets",
  "loans",
  "savingsGoals",
  "savingsPlans",
  "categoryRules",
  "importErrorLogs",
  "exchangeRates",
  "themeConfigs",
];

let dbPromise: Promise<IDBDatabase> | null = null;

function createStore(db: IDBDatabase, name: StoreName) {
  if (!db.objectStoreNames.contains(name)) {
    db.createObjectStore(name, { keyPath: "id" });
  }
}

export function openDb() {
  if (typeof window === "undefined") {
    throw new Error("IndexedDB is only available in the browser.");
  }

  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        STORE_NAMES.forEach((name) => createStore(db, name));
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB."));
    });
  }

  return dbPromise;
}

async function withStore<T>(storeName: StoreName, mode: IDBTransactionMode, action: (store: IDBObjectStore) => void | Promise<T>) {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);

    Promise.resolve(action(store))
      .then((result) => {
        transaction.oncomplete = () => resolve(result as T);
        transaction.onerror = () => reject(transaction.error ?? new Error(`IndexedDB transaction failed: ${storeName}`));
        transaction.onabort = () => reject(transaction.error ?? new Error(`IndexedDB transaction aborted: ${storeName}`));
      })
      .catch(reject);
  });
}

export async function getAllRecords<T>(storeName: StoreName) {
  return withStore<T[]>(storeName, "readonly", (store) =>
    new Promise<T[]>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve((request.result ?? []) as T[]);
      request.onerror = () => reject(request.error ?? new Error(`Failed to getAll from ${storeName}`));
    }),
  );
}

export async function getRecord<T>(storeName: StoreName, id: string) {
  return withStore<T | undefined>(storeName, "readonly", (store) =>
    new Promise<T | undefined>((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result as T | undefined);
      request.onerror = () => reject(request.error ?? new Error(`Failed to get record from ${storeName}`));
    }),
  );
}

export async function putRecord<T extends { id: string }>(storeName: StoreName, value: T) {
  return withStore<void>(storeName, "readwrite", (store) => {
    store.put(value);
  });
}

export async function putManyRecords<T extends { id: string }>(storeName: StoreName, values: T[]) {
  return withStore<void>(storeName, "readwrite", (store) => {
    values.forEach((value) => store.put(value));
  });
}

export async function deleteRecord(storeName: StoreName, id: string) {
  return withStore<void>(storeName, "readwrite", (store) => {
    store.delete(id);
  });
}
