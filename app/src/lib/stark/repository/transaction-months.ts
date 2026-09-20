import type { DataRepository } from "@/lib/stark/repository/DataRepository";

export async function loadAvailableTransactionMonths(repository: DataRepository, accountId: string) {
  const months = new Set<string>();
  const pageSize = 500;

  for (let page = 1; page <= 1000; page += 1) {
    const transactions = await repository.getTransactions(accountId, page, pageSize);
    transactions.forEach((transaction) => {
      const month = transaction.date.slice(0, 7);
      if (/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) months.add(month);
    });
    if (transactions.length < pageSize) break;
  }

  return months;
}
