import assert from "node:assert/strict";
import test from "node:test";
import { buildSalaryBatchTransactions, salaryBatchMonthKeys, selectSalaryBatchMonths } from "./salary-batch.ts";

const income = (month, category = "工资") => ({
  id: `income-${month}`,
  userId: "local-user",
  accountId: "default",
  amount: 8000,
  type: "INCOME",
  category,
  platform: "银行卡",
  merchant: "公司",
  date: `${month}-15 09:00:00`,
  description: null,
  createdAt: "2026-01-01 00:00:00",
  updatedAt: "2026-01-01 00:00:00",
});

test("builds sorted unique salary batch months for the selected year", () => {
  assert.deepEqual(salaryBatchMonthKeys(2025, [12, 2, 2, 0, 13, 1]), ["2025-01", "2025-02", "2025-12"]);
});

test("skips months that already have salary income from manual or imported bills", () => {
  const selection = selectSalaryBatchMonths(
    ["2025-01", "2025-02", "2025-03"],
    [income("2025-01"), income("2025-02", "工资薪酬")],
  );

  assert.deepEqual(selection.pendingMonthKeys, ["2025-03"]);
  assert.deepEqual(selection.skippedMonthKeys, ["2025-01", "2025-02"]);
});

test("creates one stable salary income record for each pending month", () => {
  const records = buildSalaryBatchTransactions({
    monthKeys: ["2025-01", "2025-02"],
    amount: 9600,
    platform: "银行卡",
    payday: 31,
    merchant: "星会计科技",
    now: "2026-09-12 10:00:00",
    createTransactionId: (month) => `transaction-${month}`,
  });

  assert.deepEqual(records.map((record) => record.date), ["2025-01-28 09:00:00", "2025-02-28 09:00:00"]);
  assert.deepEqual(records.map((record) => record.orderId), ["salary-batch:2025-01", "salary-batch:2025-02"]);
  assert.equal(records[0].category, "工资");
  assert.equal(records[0].merchant, "星会计科技");
});
