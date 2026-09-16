import type { StoreName } from "@/lib/stark/storage/indexeddb";

export const LOCAL_DEMO_SAVINGS_GOAL_IDS = [
  "goal-travel",
  "goal-emergency",
  "goal-demo-travel",
  "goal-demo-emergency",
] as const;

export const LOCAL_DEMO_RECORD_IDS: Partial<Record<StoreName, readonly string[]>> = {
  transactions: [
    "txn-demo-salary",
    "txn-demo-food",
    "txn-demo-shop",
    "txn-demo-traffic",
    "txn-demo-entertain",
  ],
  assets: ["asset-demo-bank", "asset-demo-wechat", "asset-demo-alipay"],
  budgets: ["budget-demo-global", "budget-demo-food"],
  loans: ["loan-demo-home", "loan-demo-car"],
  savingsGoals: LOCAL_DEMO_SAVINGS_GOAL_IDS,
  savingsPlans: ["plan-travel-2026-07", "plan-emergency-2026-08", "plan-demo-travel-1"],
};

export function isLocalDemoRecord(storeName: StoreName, id: string) {
  const recordIds = LOCAL_DEMO_RECORD_IDS[storeName];
  return recordIds?.includes(id) ?? false;
}

export function isLocalDemoSavingsGoal(id: string) {
  return (LOCAL_DEMO_SAVINGS_GOAL_IDS as readonly string[]).includes(id);
}
