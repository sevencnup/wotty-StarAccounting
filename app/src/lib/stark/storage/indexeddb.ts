import type {
  Account,
  Asset,
  Budget,
  CategoryRule,
  ExchangeRate,
  ImportErrorLog,
  ImportResult,
  Loan,
  LoanRepaymentClassificationResult,
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

/** 在同一 IndexedDB 事务内删除储蓄目标及其全部月度计划。 */
export async function deleteSavingsGoalAndPlans(goalId: string) {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(["savingsGoals", "savingsPlans"], "readwrite");
    const goals = transaction.objectStore("savingsGoals");
    const plans = transaction.objectStore("savingsPlans");
    const request = plans.getAll();

    request.onsuccess = () => {
      const relatedPlans = (request.result as SavingsPlan[]).filter((plan) => plan.goalId === goalId);
      relatedPlans.forEach((plan) => plans.delete(plan.id));
      goals.delete(goalId);
    };
    request.onerror = () => transaction.abort();
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("IndexedDB 删除储蓄目标失败"));
    transaction.onabort = () => reject(transaction.error ?? new Error("IndexedDB 删除储蓄目标已取消"));
  });
}

/**
 * 在同一 IndexedDB 事务内导入账单，并对其中已关联贷款的还款更新贷款余额。
 * 只会处理本次通过订单号去重后真正写入的流水，避免重复导入再次冲销贷款。
 */
export async function importTransactionsAndApplyLoanRepayments(transactions: Transaction[]): Promise<ImportResult> {
  if (!transactions.length) return { imported: 0, skipped: 0, errors: 0, loanRepayments: 0, loanRepaymentAmount: 0 };
  const db = await openDb();
  return new Promise<ImportResult>((resolve, reject) => {
    const transaction = db.transaction(["transactions", "loans"], "readwrite");
    const transactionStore = transaction.objectStore("transactions");
    const loanStore = transaction.objectStore("loans");
    const existingRequest = transactionStore.getAll();
    const loansRequest = loanStore.getAll();
    let existingTransactions: Transaction[] | null = null;
    let loans: Loan[] | null = null;
    let result: ImportResult | null = null;

    const applyImport = () => {
      if (!existingTransactions || !loans) return;
      const accountId = transactions[0]?.accountId;
      const existingOrderIds = new Set(
        existingTransactions
          .filter((item) => item.accountId === accountId)
          .map((item) => item.orderId)
          .filter((item): item is string => Boolean(item)),
      );
      const pending = transactions.filter((item) => {
        if (!item.orderId) return true;
        if (existingOrderIds.has(item.orderId)) return false;
        existingOrderIds.add(item.orderId);
        return true;
      });
      const loanById = new Map(loans.filter((loan) => loan.accountId === accountId).map((loan) => [loan.id, { ...loan }]));
      let loanRepayments = 0;
      let loanRepaymentAmount = 0;

      pending.forEach((item) => {
        transactionStore.put(item);
        if (item.type !== "REPAYMENT" || !item.loanId) return;
        const loan = loanById.get(item.loanId);
        if (!loan || loan.status === "PAID_OFF" || loan.remainingAmount <= 0) return;
        const reducedAmount = Math.min(item.amount, loan.remainingAmount);
        if (reducedAmount <= 0) return;
        loan.remainingAmount = Math.max(0, loan.remainingAmount - reducedAmount);
        if (loan.monthlyPayment > 0 && item.amount >= loan.monthlyPayment) {
          loan.paidPeriods = Math.min(loan.periods, loan.paidPeriods + 1);
        }
        loan.status = loan.remainingAmount <= 0 ? "PAID_OFF" : loan.status;
        loan.updatedAt = item.updatedAt;
        loanRepayments += 1;
        loanRepaymentAmount += reducedAmount;
      });
      loanById.forEach((loan, id) => {
        const original = loans?.find((item) => item.id === id);
        if (original && original !== loan && (original.remainingAmount !== loan.remainingAmount || original.paidPeriods !== loan.paidPeriods || original.status !== loan.status)) {
          loanStore.put(loan);
        }
      });
      result = {
        imported: pending.length,
        skipped: transactions.length - pending.length,
        errors: 0,
        loanRepayments,
        loanRepaymentAmount,
      };
    };

    existingRequest.onsuccess = () => {
      existingTransactions = (existingRequest.result ?? []) as Transaction[];
      applyImport();
    };
    loansRequest.onsuccess = () => {
      loans = (loansRequest.result ?? []) as Loan[];
      applyImport();
    };
    existingRequest.onerror = () => transaction.abort();
    loansRequest.onerror = () => transaction.abort();
    transaction.oncomplete = () => resolve(result ?? { imported: 0, skipped: 0, errors: 0 });
    transaction.onerror = () => reject(transaction.error ?? new Error("IndexedDB 账单导入失败"));
    transaction.onabort = () => reject(transaction.error ?? new Error("IndexedDB 账单导入已取消"));
  });
}

/**
 * 将已存在的账单转为关联贷款的还款流水，并在同一 IndexedDB 事务内更新贷款。
 * 仅处理尚未关联贷款的账单，规则重复应用不会再次冲销。
 */
export async function applyLoanRepaymentClassifications(transactions: Transaction[]): Promise<LoanRepaymentClassificationResult> {
  if (!transactions.length) return { applied: 0, amount: 0, skipped: 0 };
  const db = await openDb();
  return new Promise<LoanRepaymentClassificationResult>((resolve, reject) => {
    const transaction = db.transaction(["transactions", "loans"], "readwrite");
    const transactionStore = transaction.objectStore("transactions");
    const loanStore = transaction.objectStore("loans");
    const currentTransactionsRequest = transactionStore.getAll();
    const loansRequest = loanStore.getAll();
    let currentTransactions: Transaction[] | null = null;
    let loans: Loan[] | null = null;
    let result: LoanRepaymentClassificationResult | null = null;

    const applyClassifications = () => {
      if (!currentTransactions || !loans) return;
      const currentById = new Map(currentTransactions.map((item) => [item.id, item]));
      const loanById = new Map(loans.map((loan) => [loan.id, { ...loan }]));
      let applied = 0;
      let amount = 0;
      let skipped = 0;

      transactions.forEach((item) => {
        const current = currentById.get(item.id);
        if (!current || current.accountId !== item.accountId || current.loanId || item.type !== "REPAYMENT" || !item.loanId) {
          skipped += 1;
          return;
        }
        const loan = loanById.get(item.loanId);
        if (!loan || loan.accountId !== item.accountId || loan.status === "PAID_OFF" || loan.remainingAmount <= 0) {
          skipped += 1;
          return;
        }
        const updatedTransaction = { ...current, ...item };
        const reducedAmount = Math.min(updatedTransaction.amount, loan.remainingAmount);
        if (reducedAmount <= 0) {
          skipped += 1;
          return;
        }
        transactionStore.put(updatedTransaction);
        loan.remainingAmount = Math.max(0, loan.remainingAmount - reducedAmount);
        if (loan.monthlyPayment > 0 && updatedTransaction.amount >= loan.monthlyPayment) {
          loan.paidPeriods = Math.min(loan.periods, loan.paidPeriods + 1);
        }
        loan.status = loan.remainingAmount <= 0 ? "PAID_OFF" : loan.status;
        loan.updatedAt = updatedTransaction.updatedAt;
        applied += 1;
        amount += reducedAmount;
      });
      loanById.forEach((loan, id) => {
        const original = loans?.find((item) => item.id === id);
        if (original && (original.remainingAmount !== loan.remainingAmount || original.paidPeriods !== loan.paidPeriods || original.status !== loan.status)) {
          loanStore.put(loan);
        }
      });
      result = { applied, amount, skipped };
    };

    currentTransactionsRequest.onsuccess = () => {
      currentTransactions = (currentTransactionsRequest.result ?? []) as Transaction[];
      applyClassifications();
    };
    loansRequest.onsuccess = () => {
      loans = (loansRequest.result ?? []) as Loan[];
      applyClassifications();
    };
    currentTransactionsRequest.onerror = () => transaction.abort();
    loansRequest.onerror = () => transaction.abort();
    transaction.oncomplete = () => resolve(result ?? { applied: 0, amount: 0, skipped: transactions.length });
    transaction.onerror = () => reject(transaction.error ?? new Error("IndexedDB 贷款还款归类失败"));
    transaction.onabort = () => reject(transaction.error ?? new Error("IndexedDB 贷款还款归类已取消"));
  });
}
