import assert from "node:assert/strict";
import test from "node:test";
import { savingsPlanRecordedAmount, summarizeSavingsPlanAllocation } from "../savings/planner.ts";
import { groupRecentSavingsPlans } from "../savings/recent-plans.ts";
import { missingShowcaseSavingsHistory, showcaseHistoricalSavingsPlans, showcaseSavingsGoals, showcaseSavingsPlans } from "./showcase-savings.ts";

const historyIds = new Set(showcaseHistoricalSavingsPlans.map((plan) => plan.id));
const legacyPlans = showcaseSavingsPlans.filter((plan) => !historyIds.has(plan.id));
const savedFor = (plans, goalId) => plans.filter((plan) => plan.goalId === goalId).reduce((sum, plan) => sum + savingsPlanRecordedAmount(plan), 0);

test("every showcase goal reconciles to its completed deposits", () => {
  assert.deepEqual(Object.fromEntries(showcaseSavingsGoals.map((goal) => [goal.name, goal.currentAmount])), {
    新家首付: 22100,
    年度旅行: 4200,
    紧急备用金: 15400,
  });
  for (const goal of showcaseSavingsGoals) assert.equal(goal.currentAmount, savedFor(showcaseSavingsPlans, goal.id), goal.name);
  assert.equal(showcaseSavingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0), 41700);
  assert.equal(showcaseSavingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0), 78000);
  assert.equal(new Set(showcaseSavingsPlans.map((plan) => plan.id)).size, showcaseSavingsPlans.length);
});

test("historical deposits do not change October allocation or count November's pending deposit", () => {
  const october = summarizeSavingsPlanAllocation(showcaseSavingsGoals, showcaseSavingsPlans, "2026-10");
  assert.equal(october.recordedDeposit, 7000);
  assert.equal(october.plannedDeposit, 7000);
  assert.equal(october.fixedExpense, 5468);
  assert.deepEqual(october.expenseItems.find((item) => item.name === "水电"), { name: "水电", kind: "FIXED", amount: 460 });
  const november = summarizeSavingsPlanAllocation(showcaseSavingsGoals, showcaseSavingsPlans, "2026-11");
  assert.equal(november.recordedDeposit, 0);
  assert.equal(november.pendingDeposit, 800);
});

test("home plan sources identify the same goals and period as the original monthly plans", () => {
  const { planSources } = summarizeSavingsPlanAllocation(showcaseSavingsGoals, showcaseSavingsPlans, "2026-10");
  assert.deepEqual(planSources, [
    { goalId: "showcase-goal-home", goalName: "新家首付", period: "2026-10" },
    { goalId: "showcase-goal-travel", goalName: "年度旅行", period: "2026-10" },
  ]);
  for (const source of planSources) assert(showcaseSavingsPlans.some((plan) => plan.goalId === source.goalId && plan.month === source.period));
});

test("migration fills exactly the missing legacy history and is idempotent", () => {
  const history = missingShowcaseSavingsHistory(showcaseSavingsGoals, legacyPlans);
  assert.equal(history.length, 3);
  assert.equal(history.reduce((sum, plan) => sum + plan.actualAmount, 0), 31500);
  const migrated = [...legacyPlans, ...history];
  for (const goal of showcaseSavingsGoals) assert.equal(savedFor(migrated, goal.id), goal.currentAmount);
  assert.deepEqual(missingShowcaseSavingsHistory(showcaseSavingsGoals, migrated), []);
});

test("migration leaves an edited goal with an unrecognized balance alone", () => {
  const goals = structuredClone(showcaseSavingsGoals);
  goals.find((goal) => goal.id === "showcase-goal-home").currentAmount += 1;
  const before = structuredClone(goals);
  const history = missingShowcaseSavingsHistory(goals, legacyPlans);
  assert(!history.some((plan) => plan.goalId === "showcase-goal-home"));
  assert.deepEqual(goals, before);
});

test("migration preserves visitor deposits and existing historical records", () => {
  const goals = structuredClone(showcaseSavingsGoals);
  const plans = structuredClone(legacyPlans);
  const home = goals.find((goal) => goal.id === "showcase-goal-home");
  home.currentAmount += 500;
  plans.push({ ...plans.find((plan) => plan.goalId === home.id), id: "visitor-deposit", month: "2026-12", amount: 500, actualAmount: 500 });
  const before = structuredClone(plans);
  const history = missingShowcaseSavingsHistory(goals, plans);
  assert.equal(savedFor([...plans, ...history], home.id), home.currentAmount);
  assert.deepEqual(plans, before);
  const editedHistory = { ...showcaseHistoricalSavingsPlans[0], actualAmount: 14000 };
  assert(!missingShowcaseSavingsHistory(goals, [...plans, editedHistory]).some((plan) => plan.id === editedHistory.id));
});

test("the visible default plan list includes all eight showcase records", () => {
  const visible = groupRecentSavingsPlans(showcaseSavingsPlans).flatMap((group) => group.plans);
  assert.equal(visible.length, showcaseSavingsPlans.length);
  for (const goal of showcaseSavingsGoals) assert.equal(savedFor(visible, goal.id), goal.currentAmount);
});

test("the full record list retains a visitor's later deposit beyond the default preview", () => {
  const plans = [...showcaseSavingsPlans, {
    ...showcaseSavingsPlans.find((plan) => plan.goalId === "showcase-goal-home"),
    id: "visitor-later-deposit", month: "2026-12", amount: 500, actualAmount: 500,
  }];
  const visible = groupRecentSavingsPlans(plans, plans.length).flatMap((group) => group.plans);
  assert.equal(visible.length, 9);
  assert.equal(savedFor(visible, "showcase-goal-home"), 22600);
});
