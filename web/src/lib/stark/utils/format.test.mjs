import assert from "node:assert/strict";
import test from "node:test";
import {
  REPORTING_MONTH_KEY,
  isReportingMonthKey,
  previousMonthKey,
  reportingMonthDate,
  reportingMonthEndDate,
  reportingMonthLabel,
  reportingMonthSequence,
  reportingPeriodMonths,
  isReportingYearKey,
} from "./format.ts";

test("keeps January 2026 as the default reporting month", () => {
  assert.equal(REPORTING_MONTH_KEY, "2026-01");
  assert.equal(reportingMonthLabel(), "2026年1月");
});

test("validates strict reporting month keys", () => {
  assert.equal(isReportingMonthKey("2026-01"), true);
  assert.equal(isReportingMonthKey("2024-02"), true);
  assert.equal(isReportingMonthKey("2026-1"), false);
  assert.equal(isReportingMonthKey("2026-13"), false);
  assert.equal(isReportingMonthKey("not-a-month"), false);
});

test("supports a whole reporting year without requiring a month", () => {
  assert.equal(isReportingYearKey("2025"), true);
  assert.equal(reportingMonthLabel("2025"), "2025年全年");
  assert.equal(reportingMonthEndDate("2024").getDate(), 31);
  assert.deepEqual(reportingPeriodMonths("2025").slice(0, 2), ["2025-01", "2025-02"]);
  assert.deepEqual(
    [reportingMonthDate("2025").getFullYear(), reportingMonthDate("2025").getMonth(), reportingMonthDate("2025").getDate()],
    [2025, 0, 1],
  );
});

test("derives labels and month boundaries from an explicit month", () => {
  assert.equal(reportingMonthLabel("2024-02"), "2024年2月");
  const leapMonthStart = reportingMonthDate("2024-02");
  assert.deepEqual(
    [leapMonthStart.getFullYear(), leapMonthStart.getMonth() + 1, leapMonthStart.getDate()],
    [2024, 2, 1],
  );
  assert.equal(reportingMonthEndDate("2024-02").getDate(), 29);
  assert.equal(reportingMonthEndDate("2025-02").getDate(), 28);
  assert.equal(reportingMonthEndDate("2026-04").getDate(), 30);
  assert.equal(reportingMonthEndDate("2026-01").getDate(), 31);
});

test("derives the previous month across a year boundary", () => {
  assert.equal(previousMonthKey("2026-01"), "2025-12");
  assert.equal(previousMonthKey("2026-08"), "2026-07");
});

test("builds an oldest-to-newest reporting month sequence", () => {
  assert.deepEqual(
    reportingMonthSequence("2026-01", 5),
    ["2025-09", "2025-10", "2025-11", "2025-12", "2026-01"],
  );
});
