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

test("splits a selected year from the previous year", () => {
  const result = splitReportingMonthTransactions([
    { id: "current-jan", date: "2025-01-12 10:00:00" },
    { id: "current-dec", date: "2025-12-31 23:59:59" },
    { id: "previous", date: "2024-06-01 12:00:00" },
    { id: "future", date: "2026-01-01 00:00:00" },
  ], "2025");

  assert.deepEqual(result.current.map((item) => item.id), ["current-jan", "current-dec"]);
  assert.deepEqual(result.previous.map((item) => item.id), ["previous"]);
});

test("builds twelve monthly trend ranges for a selected year", () => {
  assert.deepEqual(buildReportingMonthTrendRanges("2025"), [
    { label: "1月", start: 1, end: 1 },
    { label: "2月", start: 2, end: 2 },
    { label: "3月", start: 3, end: 3 },
    { label: "4月", start: 4, end: 4 },
    { label: "5月", start: 5, end: 5 },
    { label: "6月", start: 6, end: 6 },
    { label: "7月", start: 7, end: 7 },
    { label: "8月", start: 8, end: 8 },
    { label: "9月", start: 9, end: 9 },
    { label: "10月", start: 10, end: 10 },
    { label: "11月", start: 11, end: 11 },
    { label: "12月", start: 12, end: 12 },
  ]);
});
