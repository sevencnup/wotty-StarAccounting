import assert from "node:assert/strict";
import test from "node:test";
import { datePickerDisplayLabel, datePickerMonthGrid, daysInDatePickerMonth, formatDatePickerValue, parseDatePickerValue, shiftDatePickerMonth } from "./date-picker.ts";

test("date picker recognizes leap-year dates and rejects invalid dates", () => {
  assert.equal(daysInDatePickerMonth(2028, 2), 29);
  assert.deepEqual(parseDatePickerValue("2028-02-29", "date"), {
    year: 2028, month: 2, day: 29, hour: 0, minute: 0,
  });
  assert.equal(parseDatePickerValue("2027-02-29", "date"), null);
  assert.equal(parseDatePickerValue("2028-02-29-invalid", "date"), null);
});

test("date picker accepts legacy spaced datetimes and emits local datetime input values", () => {
  const value = parseDatePickerValue("2027-02-28 09:05:00", "datetime");
  assert.deepEqual(value, { year: 2027, month: 2, day: 28, hour: 9, minute: 5 });
  assert.equal(formatDatePickerValue(value, "datetime"), "2027-02-28T09:05");
  assert.equal(datePickerDisplayLabel(value, "datetime"), "2027年2月28日 09:05");
});

test("date picker creates a Monday-first grid including adjacent month days", () => {
  const grid = datePickerMonthGrid(2027, 2);
  assert.equal(grid.length, 28);
  assert.deepEqual(grid[0], {
    year: 2027, month: 2, day: 1, hour: 0, minute: 0, key: "2027-02-01", inCurrentMonth: true,
  });
  const march = datePickerMonthGrid(2027, 3);
  assert.equal(march[0].key, "2027-03-01");
  assert.equal(march.at(-1).key, "2027-04-04");
  assert.equal(march.at(-1).inCurrentMonth, false);
});

test("date picker moves cleanly across year boundaries", () => {
  assert.deepEqual(shiftDatePickerMonth(2027, 1, -1), { year: 2026, month: 12 });
  assert.deepEqual(shiftDatePickerMonth(2027, 12, 1), { year: 2028, month: 1 });
});
