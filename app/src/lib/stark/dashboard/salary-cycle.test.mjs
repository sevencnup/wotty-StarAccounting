import assert from "node:assert/strict";
import test from "node:test";
import { calculatePreviousSalaryCycleCashflow, calculateSalaryCycleAvailableBalance, calculateSalaryCycleCashflow, calculateSalaryCycleOpeningCashflow, salaryCycleRange } from "./salary-cycle.ts";

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

test("uses the previous payday for the active current-month cycle before payday", () => {
  const range = salaryCycleRange("2026-10", 15, new Date(2026, 9, 1, 9));

  assert.deepEqual([range.start.getFullYear(), range.start.getMonth() + 1, range.start.getDate()], [2026, 9, 15]);
  assert.deepEqual([range.endExclusive.getFullYear(), range.endExclusive.getMonth() + 1, range.endExclusive.getDate()], [2026, 10, 15]);
});

test("starts a new active cycle on payday and keeps historical month ranges stable", () => {
  const currentRange = salaryCycleRange("2026-10", 15, new Date(2026, 9, 15, 0));
  const historicalRange = salaryCycleRange("2026-09", 15, new Date(2026, 9, 1, 9));

  assert.deepEqual([currentRange.start.getFullYear(), currentRange.start.getMonth() + 1, currentRange.start.getDate()], [2026, 10, 15]);
  assert.deepEqual([historicalRange.start.getFullYear(), historicalRange.start.getMonth() + 1, historicalRange.start.getDate()], [2026, 9, 15]);
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

test("reports the completed cycle immediately before the active salary cycle", () => {
  const referenceDate = new Date(2026, 9, 1, 9);
  const transactions = [
    transaction("previous-income", "INCOME", "2026-08-16 09:00:00", 5000),
    transaction("previous-expense", "EXPENSE", "2026-09-14 22:00:00", 1200),
    transaction("current-income", "INCOME", "2026-09-15 09:00:00", 6000),
    transaction("current-expense", "EXPENSE", "2026-09-20 09:00:00", 800),
  ];

  const current = calculateSalaryCycleCashflow(transactions, [], "2026-10", 15, referenceDate);
  const previous = calculatePreviousSalaryCycleCashflow(transactions, [], "2026-10", 15, referenceDate);

  assert.equal(current.balance, 5200);
  assert.equal(previous.balance, 3800);
  assert.equal(previous.range.label, "2026-08-15 至 2026-09-14");
});

test("keeps pre-payday cashflow out of salary details but includes it in what remains", () => {
  const referenceDate = new Date(2026, 9, 1, 20);
  const transactions = [
    transaction("pre-payday-income", "INCOME", "2026-09-11 23:38:20", 0.5),
    transaction("pre-payday-spending", "EXPENSE", "2026-09-14 04:41:11", 809.23),
    transaction("salary", "INCOME", "2026-09-15 17:35:00", 6917.17),
    transaction("cycle-income", "INCOME", "2026-10-01 18:10:00", 4.63),
    transaction("cycle-spending", "EXPENSE", "2026-09-16 12:00:00", 3696.72),
  ];
  const savingsPlans = [{ status: "COMPLETED", amount: 1500, actualAmount: 1500, actualDate: "2026-09-30 18:06:00", updatedAt: "2026-09-30 18:06:00" }];

  const cycle = calculateSalaryCycleCashflow(transactions, savingsPlans, "2026-10", 15, referenceDate);
  const opening = calculateSalaryCycleOpeningCashflow(transactions, savingsPlans, "2026-10", 15, referenceDate);

  assert.equal(cycle.expense, 3696.72);
  assert.equal(Math.round(cycle.balance * 100) / 100, 1725.08);
  assert.equal(Math.round(opening.balance * 100) / 100, -808.73);
  assert.equal(Math.round(calculateSalaryCycleAvailableBalance(opening.balance, cycle) * 100) / 100, 916.35);
});
