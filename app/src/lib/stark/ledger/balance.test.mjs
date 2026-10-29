import assert from "node:assert/strict";
import test from "node:test";
import { calculateLedgerBalance, calculateOpeningBalanceForActual } from "./balance.ts";

const base = {
  userId: "local-user",
  accountId: "default",
  platform: "银行卡",
  category: "其他",
  createdAt: "2026-01-01 00:00:00",
  updatedAt: "2026-01-01 00:00:00",
};

function transaction(id, amount, type, date) {
  return { ...base, id, amount, type, date };
}

test("calculates current ledger balance from opening balance and cumulative cashflow", () => {
  const result = calculateLedgerBalance([
    transaction("salary", 6000, "INCOME", "2026-01-01 09:00:00"),
    transaction("side-income", 800, "INCOME", "2026-01-02 09:00:00"),
    transaction("food", 1200, "EXPENSE", "2026-01-03 12:00:00"),
    transaction("transfer", 500, "TRANSFER", "2026-01-04 12:00:00"),
    transaction("loan", 1000, "REPAYMENT", "2026-01-05 12:00:00"),
  ], { openingBalance: 2000, openingBalanceDate: "2026-01-01" });

  assert.equal(result.income, 6800);
  assert.equal(result.expense, 1200);
  assert.equal(result.repayment, 1000);
  assert.equal(result.balance, 6600);
});

test("can infer opening balance without creating a correction transaction", () => {
  const transactions = [
    transaction("old", 1000, "INCOME", "2026-01-01 09:00:00"),
    transaction("spend", 300, "EXPENSE", "2026-01-02 09:00:00"),
  ];

  assert.equal(calculateOpeningBalanceForActual(5700, transactions, "2026-01-01"), 5000);
});

test("does not include transactions before the opening date", () => {
  const result = calculateLedgerBalance([
    transaction("before", 9000, "INCOME", "2025-12-31 09:00:00"),
    transaction("after", 1000, "INCOME", "2026-01-01 09:00:00"),
  ], { openingBalance: 500, openingBalanceDate: "2026-01-01" });

  assert.equal(result.balance, 1500);
});
