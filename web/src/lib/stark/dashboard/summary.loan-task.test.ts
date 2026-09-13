import assert from "node:assert/strict";
import test from "node:test";
import { buildHomeSummary } from "./summary";

const now = "2026-09-06T00:00:00.000Z";

function loan(overrides = {}) {
  return {
    id: "loan-1",
    userId: "local-user",
    accountId: "default",
    platform: "测试贷款",
    totalAmount: 30000,
    remainingAmount: 0,
    periods: 12,
    paidPeriods: 12,
    monthlyPayment: 2500,
    dueDate: 20,
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function summaryFor(loans: ReturnType<typeof loan>[]) {
  return buildHomeSummary({
    transactions: [],
    assets: [],
    budgets: [],
    loans,
    savingsGoals: [],
    reportingMonth: "2026-09",
  });
}

test("does not create a repayment task for an active loan with no balance left", () => {
  const summary = summaryFor([loan()]);

  assert.deepEqual(summary.tasks, []);
});

test("keeps repayment tasks for loans that still have a balance", () => {
  const summary = summaryFor([loan({ id: "loan-2", remainingAmount: 12000, paidPeriods: 7 })]);

  assert.equal(summary.tasks.length, 1);
  assert.equal(summary.tasks[0].id, "loan-loan-2");
  assert.equal(summary.tasks[0].source, "loan");
});

test("keeps savings deadlines separate from repayment tasks", () => {
  const summary = buildHomeSummary({
    transactions: [],
    assets: [],
    budgets: [],
    loans: [loan({ status: "PAID_OFF" })],
    savingsGoals: [{
      id: "saving-1",
      userId: "local-user",
      accountId: "default",
      name: "年度储蓄",
      targetAmount: 10000,
      currentAmount: 1000,
      deadline: "2026-12-31 00:00:00",
      type: "YEARLY",
      status: "ACTIVE",
      depositType: "CASH",
      createdAt: now,
      updatedAt: now,
    }],
    reportingMonth: "2026-09",
  });

  assert.equal(summary.tasks[0].source, "saving");
  assert.equal(summary.tasks.find((task) => task.source === "loan"), undefined);
});
