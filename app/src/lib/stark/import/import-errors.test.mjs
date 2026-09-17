import assert from "node:assert/strict";
import test from "node:test";
import { buildImportErrorLogs, selectFailedImportTransactions } from "./import-errors.ts";

const transactions = [
  { id: "tx-1", accountId: "book-a" },
  { id: "tx-2", accountId: "book-a" },
  { id: "tx-3", accountId: "book-a" },
];

test("maps failed import rows to persisted error logs", () => {
  const logs = buildImportErrorLogs([
    { lineNumber: 2, rawData: "bad row", errorMessage: "日期无效", errorType: "IMPORT" },
  ], { fileName: "账单.csv", accountId: "book-a", createdAt: "2026-09-13 12:00:00" });

  assert.equal(logs.length, 1);
  assert.equal(logs[0].lineNumber, 2);
  assert.equal(logs[0].rawData, "bad row");
  assert.equal(logs[0].accountId, "book-a");
  assert.equal(logs[0].resolved, false);
});

test("selects only failed rows for retry and ignores invalid indexes", () => {
  const selected = selectFailedImportTransactions(transactions, [
    { lineNumber: 3, rawData: "row 3", errorMessage: "保存失败", errorType: "IMPORT" },
    { lineNumber: 99, rawData: "missing", errorMessage: "保存失败", errorType: "IMPORT" },
  ]);

  assert.deepEqual(selected.map((item) => item.id), ["tx-3"]);
});
