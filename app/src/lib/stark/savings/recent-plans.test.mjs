import assert from "node:assert/strict";
import test from "node:test";
import { groupRecentSavingsPlans } from "./recent-plans.ts";

function plan(id, month, updatedAt = "2026-10-01 09:00:00") {
  return {
    id,
    goalId: "goal-1",
    amount: 2000,
    actualAmount: null,
    status: "PENDING",
    month,
    createdAt: updatedAt,
    updatedAt,
  };
}

test("recent savings plans follow planned month rather than update time and separate years", () => {
  const groups = groupRecentSavingsPlans([
    plan("2027-02", "2027-02", "2026-10-05 12:00:00"),
    plan("2026-09", "2026-09", "2026-09-30 12:00:00"),
    plan("2027-01", "2027-01", "2026-10-05 12:00:00"),
    plan("2026-12", "2026-12", "2026-09-30 12:00:00"),
    plan("2026-10", "2026-10", "2026-09-30 12:00:00"),
    plan("2026-11", "2026-11", "2026-09-30 12:00:00"),
  ]);

  assert.deepEqual(groups.map((group) => group.year), ["2026", "2027"]);
  assert.deepEqual(groups[0].plans.map((item) => item.month), ["2026-09", "2026-10", "2026-11", "2026-12"]);
  assert.deepEqual(groups[1].plans.map((item) => item.month), ["2027-01", "2027-02"]);
});

test("recent savings plan limit is applied after chronological sorting", () => {
  const groups = groupRecentSavingsPlans([
    plan("future", "2027-01"),
    plan("first", "2026-10"),
    plan("second", "2026-11"),
  ], 2);

  assert.deepEqual(groups.flatMap((group) => group.plans.map((item) => item.month)), ["2026-10", "2026-11"]);
});
