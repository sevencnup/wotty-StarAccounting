import assert from "node:assert/strict";
import test from "node:test";
import {
  buildReportingMonthTrendRanges,
  splitReportingMonthTransactions,
} from "./reporting-month.ts";

test("splits the selected month from its actual previous month", () => {
  const result = splitReportingMonthTransactions([
    { id: "current", date: "2026-01-12 10:00:00" },
    { id: "previous", date: "2025-12-31 23:59:59" },
    { id: "older", date: "2025-11-30 12:00:00" },
    { id: "future", date: "2026-02-01 00:00:00" },
  ], "2026-01");

  assert.deepEqual(result.current.map((item) => item.id), ["current"]);
  assert.deepEqual(result.previous.map((item) => item.id), ["previous"]);
});

test("returns empty arrays for a month without records", () => {
  const result = splitReportingMonthTransactions([
    { id: "other", date: "2026-01-12 10:00:00" },
  ], "2024-02");

  assert.deepEqual(result, { current: [], previous: [] });
});

test("builds trend ranges through the actual month end", () => {
  assert.deepEqual(
    buildReportingMonthTrendRanges("2024-02"),
    [
      { label: "1", start: 1, end: 4 },
      { label: "5", start: 5, end: 9 },
      { label: "10", start: 10, end: 14 },
      { label: "15", start: 15, end: 19 },
      { label: "20", start: 20, end: 24 },
      { label: "25", start: 25, end: 29 },
    ],
  );
  assert.deepEqual(
    buildReportingMonthTrendRanges("2025-02").at(-1),
    { label: "25", start: 25, end: 28 },
  );
  assert.deepEqual(
    buildReportingMonthTrendRanges("2026-04").at(-1),
    { label: "30", start: 30, end: 30 },
  );
  assert.deepEqual(
    buildReportingMonthTrendRanges("2026-01").at(-1),
    { label: "30", start: 30, end: 31 },
  );
});
