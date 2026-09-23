import type { DataRepository } from "@/lib/stark/repository/DataRepository";

export async function loadAvailableTransactionMonths(repository: DataRepository, accountId: string) {
  const months = await repository.getTransactionMonths(accountId);
  return new Set(months.filter((month) => /^\d{4}-(0[1-9]|1[0-2])$/.test(month)));
}

/**
 * App/Web 各自保存月份筛选值。首次登录新设备时，若这个值在当前账本
 * 中不存在，自动落到最近有账单的月份，避免把“有数据的账本”显示成空白。
 * 年份筛选只要该年份存在任意月份就继续保留。
 */
export function resolveAvailableReportingMonth(selectedMonth: string, availableMonths: ReadonlySet<string>) {
  if (!availableMonths.size) return selectedMonth;
  if (/^\d{4}$/.test(selectedMonth)) {
    if ([...availableMonths].some((month) => month.startsWith(`${selectedMonth}-`))) return selectedMonth;
  } else if (availableMonths.has(selectedMonth)) {
    return selectedMonth;
  }
  return [...availableMonths].sort((left, right) => right.localeCompare(left))[0] ?? selectedMonth;
}
