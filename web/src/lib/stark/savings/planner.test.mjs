import assert from "node:assert/strict";
import test from "node:test";
import { addSavingsMonth, buildSavingsMonths, calculateSavingsRow, parseSavingsExpenses, parseSavingsJsonObject, PREVIOUS_BALANCE_COLUMN, recordSavingsPlanDeposit, removeSavingsMonth, resolveSavingsMonths, sanitizeSavingsExpenseColumns, savingsPlanRecordedAmount, selectSavingsGoal, shouldSyncSavingsExpense, validateSavingsExpenseColumn } from "./planner.ts";

test("monthly mode contains all twelve months", () => {
  assert.equal(buildSavingsMonths(2026, "MONTHLY").length, 12);
});

test("alternate mode contains six every-other-month rows", () => {
  assert.deepEqual(buildSavingsMonths(2026, "ALTERNATE"), [
    "2026-01", "2026-03", "2026-05", "2026-07", "2026-09", "2026-11",
  ]);
});

test("editing a goal hides empty history but keeps current and future plan months", () => {
  const plans = buildSavingsMonths(2026, "MONTHLY").map((month) => ({
    month,
    amount: ["2026-09", "2026-10", "2026-11"].includes(month) ? 6900 : 0,
    salary: 0,
    actualAmount: null,
    status: "PENDING",
    expenses: "{}",
  }));
  assert.deepEqual(resolveSavingsMonths(2026, "MONTHLY", undefined, plans, "2026-09"), [
    "2026-09", "2026-10", "2026-11", "2026-12",
  ]);
});

test("explicit saved month configuration wins over leftover persisted plan rows", () => {
  const plans = buildSavingsMonths(2026, "MONTHLY").map((month) => ({
    month,
    amount: month === "2026-09" ? 6900 : 0,
    salary: 0,
    actualAmount: null,
    status: "PENDING",
    expenses: "{}",
  }));
  assert.deepEqual(resolveSavingsMonths(2026, "MONTHLY", ["2026-09", "2026-10"], plans, "2026-09"), [
    "2026-09", "2026-10",
  ]);
});

test("removes a month while keeping one editable row", () => {
  assert.deepEqual(removeSavingsMonth(["2026-01", "2026-02", "2026-03"], "2026-02"), ["2026-01", "2026-03"]);
  assert.deepEqual(removeSavingsMonth(["2026-01"], "2026-01"), ["2026-01"]);
});

test("adds a removed month back in natural order without duplicates", () => {
  const supported = buildSavingsMonths(2026, "MONTHLY");
  assert.deepEqual(addSavingsMonth(["2026-01", "2026-03"], "2026-02", supported), ["2026-01", "2026-02", "2026-03"]);
  assert.deepEqual(addSavingsMonth(["2026-01", "2026-02"], "2026-02", supported), ["2026-01", "2026-02"]);
  assert.deepEqual(addSavingsMonth(["2026-01"], "2025-12", supported), ["2026-01"]);
});

test("remaining uses the full balance when expected savings is empty", () => {
  const result = calculateSavingsRow({
    salary: 6000,
    expenses: { "房租": 1500, "水电": 300, "其他": 500, "购物": 1000 },
    expected: "",
  });
  assert.equal(result.available, 2700);
  assert.equal(result.remaining, 2700);
});

test("remaining deducts expected savings when entered", () => {
  const result = calculateSavingsRow({
    salary: 6000,
    expenses: { "房租": 1500, "水电": 300, "其他": 500, "购物": 1000 },
    expected: 2000,
  });
  assert.equal(result.remaining, 700);
});

test("previous balance contributes to the row remaining amount", () => {
  const result = calculateSavingsRow({
    salary: 6000,
    previousBalance: 500,
    expenses: { "房租": 1500 },
    expected: 2000,
  });
  assert.equal(result.available, 5000);
  assert.equal(result.remaining, 3000);
});

test("fixed expense columns sync from the first month", () => {
  assert.equal(shouldSyncSavingsExpense("2026-01", "2026-01", "房租", []), true);
});

test("temporary expense columns only update the edited month", () => {
  assert.equal(shouldSyncSavingsExpense("2026-01", "2026-01", "临时支出", ["临时支出"]), false);
  assert.equal(shouldSyncSavingsExpense("2026-02", "2026-01", "房租", []), false);
});

test("temporary expenses are included in the row remaining calculation", () => {
  const result = calculateSavingsRow({
    salary: 6000,
    expenses: { 房租: 1500, 临时医疗: 800 },
    expected: 2000,
  });
  assert.equal(result.expenseTotal, 2300);
  assert.equal(result.remaining, 1700);
});

test("new expense column validation explains empty and duplicate names", () => {
  assert.equal(validateSavingsExpenseColumn("", ["房租"]), "请先输入支出名称");
  assert.equal(validateSavingsExpenseColumn(" 房租 ", ["房租"]), "列已存在，请换一个名称");
  assert.equal(validateSavingsExpenseColumn("临时医疗", ["房租"]), null);
  assert.equal(validateSavingsExpenseColumn(PREVIOUS_BALANCE_COLUMN, ["房租"]), "上月结余是专用列，请使用专用按钮");
});

test("legacy savings expense arrays do not become numeric columns", () => {
  assert.deepEqual(parseSavingsExpenses("[0, 0, 0]"), {});
  assert.deepEqual(parseSavingsExpenses(JSON.stringify({ "0": 100, "1": 200, 房租: 1500, [PREVIOUS_BALANCE_COLUMN]: 500 })), {
    房租: "1500",
    [PREVIOUS_BALANCE_COLUMN]: "500",
  });
});

test("legacy double-encoded savings configuration and expenses are restored", () => {
  const config = {
    frequency: "MONTHLY",
    columns: ["房租", "水电"],
    monthsByFrequency: { MONTHLY: ["2026-09", "2026-10"] },
  };
  assert.deepEqual(parseSavingsJsonObject(JSON.stringify(JSON.stringify(config))), config);
  assert.deepEqual(parseSavingsExpenses(JSON.stringify(JSON.stringify({ 房租: 1400, 水电: 350 }))), { 房租: "1400", 水电: "350" });
});

test("expense column sanitizing removes legacy array indexes but keeps named columns", () => {
  assert.deepEqual(sanitizeSavingsExpenseColumns(["0", "1", "106", "房租", " 房租 "]), ["房租"]);
});

test("savings goal selection uses the requested goal when editing", () => {
  const goals = [{ id: "goal-a" }, { id: "goal-b" }];
  assert.deepEqual(selectSavingsGoal(goals, "goal-b"), { id: "goal-b" });
  assert.equal(selectSavingsGoal(goals, "missing"), null);
  assert.equal(selectSavingsGoal(goals), null);
});

function savingsPlan(overrides = {}) {
  return {
    id: "plan-1",
    goalId: "goal-1",
    amount: 1000,
    status: "PENDING",
    month: "2026-01",
    createdAt: "2026-01-01 00:00:00",
    updatedAt: "2026-01-01 00:00:00",
    proofImage: null,
    ...overrides,
  };
}

function savingsGoal(overrides = {}) {
  return {
    id: "goal-1",
    userId: "local-user",
    accountId: "default",
    name: "旅行基金",
    targetAmount: 10000,
    currentAmount: 500,
    type: "YEARLY",
    status: "ACTIVE",
    depositType: "CASH",
    createdAt: "2026-01-01 00:00:00",
    updatedAt: "2026-01-01 00:00:00",
    ...overrides,
  };
}

test("recording a savings plan keeps its planned amount and records the actual amount", () => {
  const result = recordSavingsPlanDeposit(savingsPlan(), savingsGoal(), 860, "data:image/jpeg;base64,proof", "2026-01-10 12:00:00");
  assert.equal(result.plan.amount, 1000);
  assert.equal(result.plan.actualAmount, 860);
  assert.equal(result.plan.status, "COMPLETED");
  assert.equal(result.plan.proofImage, "data:image/jpeg;base64,proof");
  assert.equal(result.goal.currentAmount, 1360);
});

test("editing a completed plan changes the goal by the difference only", () => {
  const result = recordSavingsPlanDeposit(
    savingsPlan({ status: "COMPLETED", actualAmount: 860, proofImage: "old-proof" }),
    savingsGoal({ currentAmount: 1360 }),
    900,
    "new-proof",
    "2026-01-11 12:00:00",
  );
  assert.equal(result.goal.currentAmount, 1400);
  assert.equal(savingsPlanRecordedAmount(result.plan), 900);
});

test("completed legacy plans fall back to their planned amount", () => {
  const plan = savingsPlan({ status: "COMPLETED" });
  assert.equal(savingsPlanRecordedAmount(plan), 1000);
  const result = recordSavingsPlanDeposit(plan, savingsGoal({ currentAmount: 1500 }), 700, null, "2026-01-12 12:00:00");
  assert.equal(result.goal.currentAmount, 1200);
});
