import type { DataRepository } from "@/lib/stark/repository/DataRepository";

export async function loadAvailableTransactionMonths(repository: DataRepository, accountId: string) {
  const months = await repository.getTransactionMonths(accountId);
  return new Set(months.filter((month) => /^\d{4}-(0[1-9]|1[0-2])$/.test(month)));
}
