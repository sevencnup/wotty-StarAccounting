import assert from "node:assert/strict";
import test from "node:test";
import { selectTransactionsForImport } from "./transaction-import.ts";

const transaction = (id, orderId) => ({
  id,
  userId: "local-user",
  accountId: "default",
  amount: 10,
  type: "EXPENSE",
  category: "餐饮",
  platform: "微信",
  merchant: "测试商户",
  date: "2026-08-01 12:00:00",
  description: null,
  orderId,
  paymentMethod: null,
  status: "支付成功",
  loanId: null,
  createdAt: "2026-08-01 12:00:00",
  updatedAt: "2026-08-01 12:00:00",
});

test("cloud import selection skips existing and duplicate order IDs", () => {
  const result = selectTransactionsForImport([
    transaction("duplicate-existing", "order-existing"),
    transaction("new-record", "order-new"),
    transaction("duplicate-batch", "order-new"),
    transaction("no-order", null),
  ], [transaction("existing-record", "order-existing")]);

  assert.equal(result.skipped, 2);
  assert.deepEqual(result.pending.map((item) => item.id), ["new-record", "no-order"]);
});

test("local import selection also skips duplicate order IDs within one file", () => {
  const result = selectTransactionsForImport([
    transaction("first", "same-order"),
    transaction("second", "same-order"),
  ], []);

  assert.deepEqual(result.pending.map((item) => item.id), ["first"]);
  assert.equal(result.skipped, 1);
});
