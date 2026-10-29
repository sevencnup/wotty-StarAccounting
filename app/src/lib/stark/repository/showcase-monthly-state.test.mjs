import assert from "node:assert/strict";
import test from "node:test";
import { showcaseSavingsGoals, showcaseSavingsPlans } from "./showcase-savings.ts";
import { buildShowcaseMonth } from "./showcase-monthly-cycle.ts";
import { reconcileShowcaseEvents } from "./showcase-monthly-state.ts";

function baseline() {
  return {
    transactions: [],
    assets: [
      { id: "showcase-asset-bank", balance: 54_500 },
      { id: "showcase-asset-wechat", balance: 8_300 },
      { id: "showcase-asset-alipay", balance: 8_897.7 },
    ],
    loans: [
      { id: "showcase-loan-home", remainingAmount: 320_000, paidPeriods: 86, periods: 240, monthlyPayment: 2_100, status: "ACTIVE" },
      { id: "showcase-loan-car", remainingAmount: 65_000, paidPeriods: 26, periods: 48, monthlyPayment: 900, status: "ACTIVE" },
    ],
    goals: structuredClone(showcaseSavingsGoals),
    plans: structuredClone(showcaseSavingsPlans),
  };
}

function mergeById(original, updated) {
  const records = new Map(original.map((record) => [record.id, record]));
  for (const record of updated) records.set(record.id, record);
  return [...records.values()];
}

function mergeResult(state, result) {
  return {
    transactions: mergeById(state.transactions, result.newTransactions),
    assets: mergeById(state.assets, result.changedAssets),
    loans: mergeById(state.loans, result.changedLoans),
    goals: mergeById(state.goals, result.changedGoals),
    plans: mergeById(state.plans, result.changedPlans),
  };
}

test("November events move loan, savings and cash balances together", () => {
  const month = "2026-11";
  const recipe = buildShowcaseMonth(month);
  const state = baseline();
  const result = reconcileShowcaseEvents(state, recipe.events, month, recipe.income);
  const after = mergeResult(state, result);
  assert.equal(after.loans.find((loan) => loan.id === "showcase-loan-home").remainingAmount, 317_900);
  assert.equal(after.loans.find((loan) => loan.id === "showcase-loan-car").remainingAmount, 64_100);
  assert.equal(after.loans.find((loan) => loan.id === "showcase-loan-home").paidPeriods, 87);
  const homePlan = after.plans.find((plan) => plan.id === "showcase-auto-plan-2026-11-home");
  const travelPlan = after.plans.find((plan) => plan.id === "showcase-plan-nov-travel");
  assert.equal(homePlan.status, "COMPLETED");
  assert.equal(travelPlan.status, "COMPLETED");
  assert.equal(travelPlan.salary, recipe.income);
  assert.equal(after.goals.find((goal) => goal.id === homePlan.goalId).currentAmount, 22_100 + homePlan.actualAmount);
  assert.equal(after.goals.find((goal) => goal.id === travelPlan.goalId).currentAmount, 4_200 + travelPlan.actualAmount);

  const income = result.newTransactions.filter((item) => item.type === "INCOME").reduce((sum, item) => sum + item.amount, 0);
  const spending = result.newTransactions.filter((item) => item.type === "EXPENSE").reduce((sum, item) => sum + item.amount, 0);
  const repayments = result.newTransactions.filter((item) => item.type === "REPAYMENT").reduce((sum, item) => sum + item.amount, 0);
  const beforeCash = state.assets.reduce((sum, item) => sum + item.balance, 0);
  const afterCash = after.assets.reduce((sum, item) => sum + item.balance, 0);
  assert.equal(Math.round((afterCash - beforeCash) * 100), Math.round((income - spending - repayments - homePlan.actualAmount - travelPlan.actualAmount) * 100));

  const repeated = reconcileShowcaseEvents(after, recipe.events, month, recipe.income);
  assert.deepEqual(repeated, { newTransactions: [], changedAssets: [], changedLoans: [], changedGoals: [], changedPlans: [] });
});

test("a savings plan stays pending until its date and visitor edits are not overwritten", () => {
  const month = "2026-12";
  const recipe = buildShowcaseMonth(month);
  const earlyEvents = recipe.events.filter((event) => event.date < "2026-12-20");
  const early = mergeResult(baseline(), reconcileShowcaseEvents(baseline(), earlyEvents, month, recipe.income));
  const pending = early.plans.find((plan) => plan.id === "showcase-auto-plan-2026-12-home");
  assert.equal(pending.status, "PENDING");
  assert.equal(early.loans.find((loan) => loan.id === "showcase-loan-car").remainingAmount, 65_000);

  const edited = { ...early, plans: early.plans.map((plan) => plan.id === pending.id ? { ...plan, amount: plan.amount + 1 } : plan) };
  const laterEvents = recipe.events.filter((event) => event.date >= "2026-12-20");
  const later = mergeResult(edited, reconcileShowcaseEvents(edited, laterEvents, month, recipe.income));
  assert.equal(later.plans.find((plan) => plan.id === pending.id).status, "PENDING");
  assert.equal(later.goals.find((goal) => goal.id === pending.goalId).currentAmount, 22_100);
  assert.equal(later.loans.find((loan) => loan.id === "showcase-loan-car").remainingAmount, 64_100);
});
