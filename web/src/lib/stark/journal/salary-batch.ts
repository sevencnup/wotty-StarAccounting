import type { Transaction } from "@/lib/stark/models/types";

export const SALARY_BATCH_MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function salaryBatchMonthKeys(year: number, months: number[]) {
  const safeYear = Math.max(2000, Math.min(9999, Math.trunc(year)));
  return [...new Set(months)]
    .filter((month) => Number.isInteger(month) && month >= 1 && month <= 12)
    .sort((left, right) => left - right)
    .map((month) => `${safeYear}-${pad(month)}`);
}

export function isSalaryIncome(transaction: Transaction) {
  if (transaction.type !== "INCOME") return false;
  return /工资|薪资|薪酬/.test([transaction.category, transaction.merchant, transaction.description].filter(Boolean).join(" "));
}

export function selectSalaryBatchMonths(monthKeys: string[], existing: Transaction[]) {
  const existingSalaryMonths = new Set(
    existing.filter(isSalaryIncome).map((transaction) => transaction.date.slice(0, 7)),
  );
  const pendingMonthKeys = monthKeys.filter((monthKey) => !existingSalaryMonths.has(monthKey));

  return {
    pendingMonthKeys,
    skippedMonthKeys: monthKeys.filter((monthKey) => existingSalaryMonths.has(monthKey)),
  };
}

export function buildSalaryBatchTransactions({
  monthKeys,
  amount,
  platform,
  payday,
  merchant,
  now,
  createTransactionId,
}: {
  monthKeys: string[];
  amount: number;
  platform: string;
  payday: number;
  merchant?: string;
  now: string;
  createTransactionId: (monthKey: string) => string;
}): Transaction[] {
  const safePayday = Math.max(1, Math.min(28, Math.round(payday)));
  const safeAmount = Math.max(0, amount);

  return monthKeys.map((monthKey) => ({
    id: createTransactionId(monthKey),
    userId: "local-user",
    accountId: "default",
    amount: safeAmount,
    type: "INCOME",
    category: "工资",
    platform,
    merchant: merchant?.trim() || "工资补录",
    date: `${monthKey}-${pad(safePayday)} 09:00:00`,
    description: "历史工资补录",
    orderId: `salary-batch:${monthKey}`,
    paymentMethod: null,
    status: "已补录",
    loanId: null,
    createdAt: now,
    updatedAt: now,
  }));
}
