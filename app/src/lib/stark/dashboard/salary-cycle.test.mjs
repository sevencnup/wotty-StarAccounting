import assert from "node:assert/strict";
import test from "node:test";
import { calculateSalaryCycleCashflow, salaryCycleRange } from "./salary-cycle.ts";

const transaction = (id, type, date, amount, loanId = null) => ({
  id,
  userId: "local-user",
  accountId: "default",
  amount,
  type,
  category: type === "REPAYMENT" ? "还款" : type === "INCOME" ? "工资" : "餐饮",
  platform: "银行卡",
  date,
  loanId,
  createdAt: date,
  updatedAt: date,
});

test("salary cycle runs from the selected payday through the day before the next payday", () => {
  const range = salaryCycleRange("2026-01", 15);
  assert.deepEqual([range.start.getFullYear(), range.start.getMonth() + 1, range.start.getDate()], [2026, 1, 15]);
  assert.deepEqual([range.endExclusive.getFullYear(), range.endExclusive.getMonth() + 1, range.endExclusive.getDate()], [2026, 2, 15]);
});

test("salary cycle assigns transactions by actual date across a month boundary", () => {
  const result = calculateSalaryCycleCashflow([
    transaction("before", "EXPENSE", "2026-01-14 23:59:59", 100),
    transaction("income", "INCOME", "2026-01-15 09:00:00", 15000),
    transaction("spending", "EXPENSE", "2026-01-19 09:00:00", 500),
    transaction("repayment", "REPAYMENT", "2026-01-26 09:00:00", 2500, "loan-1"),
    transaction("after", "EXPENSE", "2026-02-14 23:59:59", 500),
    transaction("next", "EXPENSE", "2026-02-15 00:00:00", 700),
  ], [
    { status: "COMPLETED", amount: 2000, actualAmount: 2000, actualDate: "2026-01-19 12:00:00", updatedAt: "2026-01-20 12:00:00" },
  ], "2026-01", 15);

  assert.equal(result.income, 15000);
  assert.equal(result.expense, 1000);
  assert.equal(result.repayment, 2500);
  assert.equal(result.savings, 2000);
  assert.equal(result.balance, 9500);
  assert.deepEqual(result.transactions.map((item) => item.id), ["income", "spending", "repayment", "after"]);
});

test("planned savings and unpaid loans do not reduce salary-cycle cashflow", () => {
  const result = calculateSalaryCycleCashflow([
    transaction("income", "INCOME", "2026-01-15 09:00:00", 10000),
  ], [
    { status: "PENDING", amount: 3000, actualAmount: null, actualDate: null, updatedAt: "2026-01-20 12:00:00" },
  ], "2026-01", 15);

  assert.equal(result.balance, 10000);
  assert.equal(result.savings, 0);
  assert.equal(result.repayment, 0);
});
