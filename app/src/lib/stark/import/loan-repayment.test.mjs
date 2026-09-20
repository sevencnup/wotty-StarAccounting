import assert from "node:assert/strict";
import test from "node:test";
import { findLoanForBillRepayment, matchImportedLoanRepayments } from "./loan-repayment.ts";

function loan(overrides = {}) {
  return {
    id: "loan-cmb",
    userId: "local-user",
    accountId: "default",
    platform: "招商银行",
    totalAmount: 24000,
    remainingAmount: 18000,
    periods: 24,
    paidPeriods: 6,
    monthlyPayment: 1000,
    dueDate: 20,
    status: "ACTIVE",
    matchKeywords: null,
    createdAt: "2026-01-01 00:00:00",
    updatedAt: "2026-01-01 00:00:00",
    ...overrides,
  };
}

function transaction(overrides = {}) {
  return {
    id: "bill-1",
    userId: "local-user",
    accountId: "default",
    amount: 1000,
    type: "EXPENSE",
    category: "信用卡还款",
    platform: "微信",
    merchant: "信用卡还款",
    date: "2026-09-20 12:00:00",
    description: null,
    orderId: "order-1",
    paymentMethod: "招商银行储蓄卡(1234)",
    status: "支付成功",
    loanId: null,
    createdAt: "2026-09-20 12:00:00",
    updatedAt: "2026-09-20 12:00:00",
    ...overrides,
  };
}

test("matches a repayment bill using the loan name and converts it to a linked repayment", () => {
  const result = matchImportedLoanRepayments([transaction()], [loan()]);

  assert.equal(result.matchedCount, 1);
  assert.equal(result.matchedAmount, 1000);
  assert.equal(result.transactions[0].type, "REPAYMENT");
  assert.equal(result.transactions[0].category, "还款");
  assert.equal(result.transactions[0].loanId, "loan-cmb");
});

test("does not match ordinary bank spending without repayment wording", () => {
  const result = findLoanForBillRepayment(transaction({ category: "餐饮", merchant: "招商银行生活缴费", paymentMethod: "招商银行储蓄卡" }), [loan()]);
  assert.equal(result, null);
});

test("does not automatically match an ambiguous loan name", () => {
  const result = findLoanForBillRepayment(transaction(), [loan(), loan({ id: "loan-cmb-2" })]);
  assert.equal(result, null);
});

test("uses a more specific keyword to distinguish loans from the same bank", () => {
  const result = findLoanForBillRepayment(
    transaction({ merchant: "招商银行信用卡还款", paymentMethod: "微信零钱" }),
    [loan({ id: "loan-car", matchKeywords: "招行车贷" }), loan({ id: "loan-card", matchKeywords: "招商银行信用卡" })],
  );
  assert.equal(result?.id, "loan-card");
});
