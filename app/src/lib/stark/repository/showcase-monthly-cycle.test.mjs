import assert from "node:assert/strict";
import test from "node:test";
import { buildShowcaseMonth } from "./showcase-monthly-cycle.ts";

function transactions(month) {
  return buildShowcaseMonth(month).events.filter((event) => event.kind === "transaction");
}

test("showcase income is fixed per month, varied across months and always 10k–20k", () => {
  const months = Array.from({ length: 36 }, (_, offset) => {
    const year = 2026 + Math.floor((10 + offset) / 12);
    const number = (10 + offset) % 12 + 1;
    return `${year}-${String(number).padStart(2, "0")}`;
  });
  const amounts = months.map((month) => buildShowcaseMonth(month).income);
  for (const [index, month] of months.entries()) {
    assert.deepEqual(buildShowcaseMonth(month), buildShowcaseMonth(month));
    assert(amounts[index] >= 10_000 && amounts[index] <= 20_000, month);
  }
  assert(new Set(amounts).size > 30);
});

test("the existing October example gains only later spending, without duplicate paydays or repayments", () => {
  const october = buildShowcaseMonth("2026-10");
  assert.equal(october.income, 19_680);
  assert(october.events.every((event) => event.date > "2026-10-18"));
  assert(october.events.every((event) => event.kind === "transaction" && event.record.type === "EXPENSE"));
});

test("a generated month has one salary, both loans, a pending plan and one dated completion", () => {
  const month = "2026-12";
  const { income, events } = buildShowcaseMonth(month);
  const salaries = transactions(month).filter((event) => event.record.type === "INCOME");
  const repayments = transactions(month).filter((event) => event.record.type === "REPAYMENT");
  const plan = events.find((event) => event.kind === "plan-create");
  const completion = events.find((event) => event.kind === "plan-complete");
  assert.equal(salaries.length, 1);
  assert.equal(salaries[0].record.amount, income);
  assert.deepEqual(repayments.map((event) => event.loanId).sort(), ["showcase-loan-car", "showcase-loan-home"]);
  assert.equal(plan.record.status, "PENDING");
  assert.equal(completion.planId, plan.record.id);
  assert.equal(completion.expectedAmount, plan.record.amount);
  assert.equal(completion.date, "2026-12-20");
  assert.equal(new Set(events.filter((event) => event.kind === "transaction").map((event) => event.record.id)).size, transactions(month).length);
});

test("cash asset changes reconcile to income less spending and repayments; transfers net to zero", () => {
  for (const month of ["2026-11", "2027-01", "2027-08"]) {
    const { income, events } = buildShowcaseMonth(month);
    const ledger = transactions(month);
    const expense = ledger.filter((event) => event.record.type === "EXPENSE").reduce((sum, event) => sum + event.record.amount, 0);
    const repayment = ledger.filter((event) => event.record.type === "REPAYMENT").reduce((sum, event) => sum + event.record.amount, 0);
    const cashAssetChange = ledger.reduce((sum, event) => sum + Object.values(event.assetDelta).reduce((subtotal, value) => subtotal + value, 0), 0);
    assert.equal(Math.round(cashAssetChange * 100), Math.round((income - expense - repayment) * 100), month);
    for (const transfer of ledger.filter((event) => event.record.type === "TRANSFER")) {
      assert.equal(Object.values(transfer.assetDelta).reduce((sum, value) => sum + value, 0), 0);
    }
    const plan = events.find((event) => event.kind === "plan-create").record;
    const expected = JSON.parse(plan.expenses);
    for (const [label, suffix] of [["房租", "rent"], ["水电", "utilities"], ["网费", "internet"], ["通勤", "commute"], ["会员订阅", "membership"]]) {
      const bill = ledger.find((event) => event.record.id === `showcase-auto-expense-${month}-${suffix}`);
      assert.equal(expected[label], bill.record.amount, `${month} ${label}`);
    }
  }
});

test("November's existing travel plan completes instead of creating a duplicate", () => {
  const { events } = buildShowcaseMonth("2026-11");
  assert(events.some((event) => event.kind === "plan-complete" && event.planId === "showcase-plan-nov-travel"));
  assert(!events.some((event) => event.kind === "plan-create" && event.record.goalId === "showcase-goal-travel"));
});
