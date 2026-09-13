import assert from "node:assert/strict";
import test from "node:test";
import { calculateBudgetSpent } from "./budget-period.ts";

function transaction(id, date, amount, category = "餐饮") {
  return { id, userId: "local-user", accountId: "book-a", amount, type: "EXPENSE", category, platform: "支付宝", merchant: "测试商户", date, description: null, createdAt: date, updatedAt: date };
}

test("monthly budgets only count expenses in the selected month", () => {
  assert.equal(calculateBudgetSpent([transaction("jan", "2026-01-15 12:00:00", 900), transaction("feb", "2026-02-15 12:00:00", 100)], { period: "MONTHLY", scopeType: "GLOBAL", category: "ALL", platform: null }, "2026-02", 100), 100);
});

test("yearly budgets count the whole selected year", () => {
  assert.equal(calculateBudgetSpent([transaction("jan", "2026-01-15 12:00:00", 900), transaction("feb", "2026-02-15 12:00:00", 100), transaction("other", "2025-12-15 12:00:00", 800)], { period: "YEARLY", scopeType: "GLOBAL", category: "ALL", platform: null }, "2026-02", 100), 1000);
});
