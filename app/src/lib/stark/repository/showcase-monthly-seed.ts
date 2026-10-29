import type { Asset, Loan, SavingsGoal, SavingsPlan, Transaction } from "../models/types";
import { openDb } from "../storage/indexeddb";
import { setShowcaseAutoReportMonth } from "../storage/local-config";
import { buildShowcaseMonth, SHOWCASE_AUTO_START_MONTH } from "./showcase-monthly-cycle";
import { reconcileShowcaseEvents } from "./showcase-monthly-state";

const WATERMARK_PREFIX = "wotty:showcase:auto-month-v1:";
const STORE_NAMES = ["transactions", "assets", "loans", "savingsGoals", "savingsPlans"] as const;

function localDate(now: Date) {
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  return { month, date: `${month}-${String(now.getDate()).padStart(2, "0")}` };
}

function nextMonth(month: string) {
  const [year, number] = month.split("-").map(Number);
  return `${number === 12 ? year + 1 : year}-${String(number === 12 ? 1 : number + 1).padStart(2, "0")}`;
}

function lastDate(month: string) {
  const [year, number] = month.split("-").map(Number);
  return `${month}-${new Date(year, number, 0).getDate()}`;
}

function readWatermark(month: string) {
  try {
    const value = window.localStorage.getItem(`${WATERMARK_PREFIX}${month}`) ?? "";
    return value.startsWith(`${month}-`) ? value : "";
  } catch {
    return "";
  }
}

function writeWatermark(month: string, date: string) {
  try { window.localStorage.setItem(`${WATERMARK_PREFIX}${month}`, date); } catch { /* IDs still prevent duplicate entries. */ }
}

async function applyMonth(month: string, afterDate: string, throughDate: string) {
  const recipe = buildShowcaseMonth(month);
  const events = recipe.events.filter((event) => event.date > afterDate && event.date <= throughDate);
  if (!events.length) return;
  const db = await openDb();

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAMES, "readwrite");
    const stores = Object.fromEntries(STORE_NAMES.map((name) => [name, transaction.objectStore(name)])) as Record<(typeof STORE_NAMES)[number], IDBObjectStore>;
    const requests = Object.fromEntries(STORE_NAMES.map((name) => [name, stores[name].getAll()])) as Record<(typeof STORE_NAMES)[number], IDBRequest<unknown[]>>;
    let pending = STORE_NAMES.length;

    function applyEvents() {
      const result = reconcileShowcaseEvents({
        transactions: requests.transactions.result as Transaction[],
        assets: requests.assets.result as Asset[],
        loans: requests.loans.result as Loan[],
        goals: requests.savingsGoals.result as SavingsGoal[],
        plans: requests.savingsPlans.result as SavingsPlan[],
      }, events, month, recipe.income);
      for (const record of result.newTransactions) stores.transactions.put(record);
      for (const record of result.changedAssets) stores.assets.put(record);
      for (const record of result.changedLoans) stores.loans.put(record);
      for (const record of result.changedGoals) stores.savingsGoals.put(record);
      for (const record of result.changedPlans) stores.savingsPlans.put(record);
    }

    for (const name of STORE_NAMES) {
      requests[name].onsuccess = () => { if (--pending === 0) applyEvents(); };
      requests[name].onerror = () => transaction.abort();
    }
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("演示账本自动补账失败"));
    transaction.onabort = () => reject(transaction.error ?? new Error("演示账本自动补账已中止"));
  });
}

/** Catch up on calendar events at each showcase entry; no server or background job is required. */
export async function advanceShowcaseMonthlyDemo(now = new Date()) {
  const today = localDate(now);
  if (today.month < SHOWCASE_AUTO_START_MONTH) return;
  for (let month = SHOWCASE_AUTO_START_MONTH; month <= today.month; month = nextMonth(month)) {
    const throughDate = month === today.month ? today.date : lastDate(month);
    const watermark = readWatermark(month);
    if (watermark >= throughDate) continue;
    await applyMonth(month, watermark, throughDate);
    writeWatermark(month, throughDate);
  }
  setShowcaseAutoReportMonth(today.month);
}
