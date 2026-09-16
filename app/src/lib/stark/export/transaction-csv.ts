import type { Transaction } from "@/lib/stark/models/types";

export const TRANSACTION_EXPORT_HEADERS = [
  "流水ID",
  "日期",
  "类型",
  "分类",
  "备注归类",
  "商户",
  "平台",
  "金额",
  "支付方式",
  "状态",
  "订单号",
  "说明",
  "贷款ID",
] as const;

const transactionTypeLabels: Record<Transaction["type"], string> = {
  INCOME: "收入",
  EXPENSE: "支出",
  TRANSFER: "转账",
  REPAYMENT: "还款",
};

function csvCell(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function transactionExportRows(transactions: Transaction[]) {
  return transactions.map((transaction) => [
    transaction.id,
    transaction.date,
    transactionTypeLabels[transaction.type] ?? transaction.type,
    transaction.category,
    transaction.remarkCategory,
    transaction.merchant,
    transaction.platform,
    transaction.amount,
    transaction.paymentMethod,
    transaction.status,
    transaction.orderId,
    transaction.description,
    transaction.loanId,
  ]);
}

/** Serialize all selected transactions as an Excel-compatible UTF-8 CSV body. */
export function serializeTransactionsToCsv(transactions: Transaction[]) {
  const rows = [TRANSACTION_EXPORT_HEADERS, ...transactionExportRows(transactions)];
  return rows.map((row) => row.map(csvCell).join(",")).join("\r\n") + "\r\n";
}
