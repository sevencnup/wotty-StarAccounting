import assert from "node:assert/strict";
import test from "node:test";
import { buildRemarkedExpenseSummary } from "./remark-summary.ts";

const base = {
  userId: "local-user",
  accountId: "default",
  platform: "微信",
  category: "转账",
  date: "2026-09-12 08:00:00",
  createdAt: "2026-09-12 08:00:00",
  updatedAt: "2026-09-12 08:00:00",
};

test("summarizes every non-income transaction that has been categorized as spending", () => {
  const summary = buildRemarkedExpenseSummary([
    { ...base, id: "rent", amount: 1800, type: "TRANSFER", merchant: "房东", remarkCategory: "房租水电" },
    { ...base, id: "food", amount: 32, type: "EXPENSE", merchant: "小吃店", remarkCategory: "餐饮", date: "2026-09-13 08:00:00" },
    { ...base, id: "salary", amount: 9000, type: "INCOME", merchant: "公司", remarkCategory: "工资" },
    { ...base, id: "plain", amount: 20, type: "TRANSFER", merchant: "朋友" },
  ]);

  assert.equal(summary.count, 2);
  assert.equal(summary.amount, 1832);
  assert.deepEqual(summary.categories, [
    { category: "房租水电", amount: 1800, count: 1 },
    { category: "餐饮", amount: 32, count: 1 },
  ]);
  assert.deepEqual(summary.transactions.map((item) => item.id), ["food", "rent"]);
});
