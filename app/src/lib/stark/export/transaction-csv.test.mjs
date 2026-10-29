import assert from "node:assert/strict";
import test from "node:test";
import { serializeTransactionsToCsv, transactionExportRows } from "./transaction-csv.ts";

const transaction = {
  id: "tx-1", userId: "local-user", accountId: "book-a", amount: 35.5, type: "EXPENSE",
  category: "餐饮", remarkCategory: "工作餐", merchant: "示例餐厅,一店", platform: "微信",
  date: "2026-09-13 12:30:00", description: "午餐\n备注", orderId: "order-1",
  paymentMethod: "零钱", status: "支付成功", loanId: null, createdAt: "2026-09-13 12:30:00", updatedAt: "2026-09-13 12:30:00",
};

test("exports all transaction fields needed to inspect a bill", () => {
  const rows = transactionExportRows([transaction]);
  assert.equal(rows.length, 1);
  assert.deepEqual(rows[0].slice(0, 8), ["tx-1", "2026-09-13 12:30:00", "支出", "餐饮", "工作餐", "示例餐厅,一店", "微信", 35.5]);
});

test("escapes commas, quotes, and line breaks for CSV", () => {
  const csv = serializeTransactionsToCsv([transaction]);
  assert.match(csv, /"示例餐厅,一店"/);
  assert.match(csv, /"午餐\r?\n?备注"|"午餐\n备注"/);
  assert.match(csv, /\r\n$/);
});
