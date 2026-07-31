import assert from "node:assert/strict";
import test from "node:test";
import { buildSavingsMonths, calculateSavingsRow } from "./planner.ts";

test("monthly mode contains all twelve months", () => {
  assert.equal(buildSavingsMonths(2026, "MONTHLY").length, 12);
});

test("alternate mode contains six every-other-month rows", () => {
  assert.deepEqual(buildSavingsMonths(2026, "ALTERNATE"), [
    "2026-01", "2026-03", "2026-05", "2026-07", "2026-09", "2026-11",
  ]);
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
