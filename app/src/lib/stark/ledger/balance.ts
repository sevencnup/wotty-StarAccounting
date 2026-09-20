import type { Account, Transaction } from "../models/types";

export type LedgerCashflow = {
  income: number;
  expense: number;
  repayment: number;
  net: number;
  count: number;
};

function dateKey(value: string | null | undefined) {
  return value?.slice(0, 10) ?? "";
}

function isOnOrAfter(value: string, startDate: string) {
  return dateKey(value) >= dateKey(startDate);
}

/** 转账只改变资金所在账户，不改变整个账本的总余额。 */
export function transactionBalanceEffect(transaction: Pick<Transaction, "amount" | "type">) {
  if (transaction.type === "INCOME") return transaction.amount;
  if (transaction.type === "EXPENSE" || transaction.type === "REPAYMENT") return -transaction.amount;
  return 0;
}

export function calculateLedgerCashflow(transactions: Transaction[], openingBalanceDate?: string | null): LedgerCashflow {
  const scoped = openingBalanceDate
    ? transactions.filter((transaction) => isOnOrAfter(transaction.date, openingBalanceDate))
    : transactions;
  const income = scoped
    .filter((transaction) => transaction.type === "INCOME")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const expense = scoped
    .filter((transaction) => transaction.type === "EXPENSE")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const repayment = scoped
    .filter((transaction) => transaction.type === "REPAYMENT")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  return {
    income,
    expense,
    repayment,
    net: income - expense - repayment,
    count: scoped.length,
  };
}

export function calculateLedgerBalance(transactions: Transaction[], account?: Pick<Account, "openingBalance" | "openingBalanceDate"> | null) {
  const openingBalanceDate = account?.openingBalanceDate ?? null;
  const cashflow = calculateLedgerCashflow(transactions, openingBalanceDate);
  return {
    ...cashflow,
    openingBalance: Number(account?.openingBalance ?? 0),
    balance: Number(account?.openingBalance ?? 0) + cashflow.net,
  };
}

export function calculateOpeningBalanceForActual(actualBalance: number, transactions: Transaction[], openingBalanceDate?: string | null) {
  return actualBalance - calculateLedgerCashflow(transactions, openingBalanceDate).net;
}

export function earliestTransactionDate(transactions: Transaction[]) {
  return transactions
    .map((transaction) => dateKey(transaction.date))
    .filter((value) => /^\d{4}-\d{2}-\d{2}$/.test(value))
    .sort()[0] ?? "";
}
