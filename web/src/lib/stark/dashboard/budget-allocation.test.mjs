import assert from "node:assert/strict";
import test from "node:test";
import { calculateBudgetAllocation } from "./budget-allocation.ts";

test("calculates the remaining budget after allocation categories", () => {
  assert.deepEqual(calculateBudgetAllocation({
    income: 10000,
    expense: 1800,
    repayment: 700,
    savings: 1200,
    assetTotal: 25500,
  }), {
    income: 10000,
    expense: 1800,
    repayment: 700,
    savings: 1200,
    available: 6300,
    assetTotal: 25500,
  });
});

test("keeps an overrun as a negative remaining budget", () => {
  assert.equal(calculateBudgetAllocation({
    income: 1000,
    expense: 1200,
    repayment: 0,
    savings: 0,
    assetTotal: 10000,
  }).available, -200);
});
