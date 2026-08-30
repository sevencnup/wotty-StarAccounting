import type { Transaction } from "../models/types";

export function selectTransactionsForImport(
  transactions: Transaction[],
  existing: Transaction[],
) {
  const orderIds = new Set(
    existing
      .map((transaction) => transaction.orderId)
      .filter((orderId): orderId is string => Boolean(orderId)),
  );
  const pending = transactions.filter((transaction) => {
    if (!transaction.orderId) return true;
    if (orderIds.has(transaction.orderId)) return false;
    orderIds.add(transaction.orderId);
    return true;
  });

  return {
    pending,
    skipped: transactions.length - pending.length,
  };
}
