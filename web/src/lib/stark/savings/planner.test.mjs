import assert from "node:assert/strict";
import test from "node:test";
import { buildSavingsMonths, calculateSavingsRow, parseSavingsExpenses, PREVIOUS_BALANCE_COLUMN, removeSavingsMonth, sanitizeSavingsExpenseColumns, selectSavingsGoal, shouldSyncSavingsExpense, validateSavingsExpenseColumn } from "./planner.ts";

test("monthly mode contains all twelve months", () => {
  assert.equal(buildSavingsMonths(2026, "MONTHLY").length, 12);
});

test("alternate mode contains six every-other-month rows", () => {
  assert.deepEqual(buildSavingsMonths(2026, "ALTERNATE"), [
    "2026-01", "2026-03", "2026-05", "2026-07", "2026-09", "2026-11",
  ]);
});

test("removes a month while keeping one editable row", () => {
  assert.deepEqual(removeSavingsMonth(["2026-01", "2026-02", "2026-03"], "2026-02"), ["2026-01", "2026-03"]);
  assert.deepEqual(removeSavingsMonth(["2026-01"], "2026-01"), ["2026-01"]);
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

test("expense column sanitizing removes legacy array indexes but keeps named columns", () => {
  assert.deepEqual(sanitizeSavingsExpenseColumns(["0", "1", "106", "房租", " 房租 "]), ["房租"]);
});

test("savings goal selection uses the requested goal when editing", () => {
  const goals = [{ id: "goal-a" }, { id: "goal-b" }];
  assert.deepEqual(selectSavingsGoal(goals, "goal-b"), { id: "goal-b" });
  assert.equal(selectSavingsGoal(goals, "missing"), null);
  assert.deepEqual(selectSavingsGoal(goals), { id: "goal-a" });
});
