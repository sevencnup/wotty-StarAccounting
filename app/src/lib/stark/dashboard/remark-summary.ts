import type { Transaction } from "@/lib/stark/models";

export type RemarkedExpenseCategory = {
  category: string;
  amount: number;
  count: number;
};

export type RemarkedExpenseSummary = {
  amount: number;
  count: number;
  categories: RemarkedExpenseCategory[];
  transactions: Transaction[];
};

/**
 * 为消费页单独汇总已手动/规则归类的非收入流水。
 * 这些流水仍参与常规支出统计，但这里保留原始类型以便用户确认归类来源。
 */
export function buildRemarkedExpenseSummary(transactions: Transaction[]): RemarkedExpenseSummary {
  const remarkedTransactions = transactions
    .filter((item) => item.type !== "INCOME" && Boolean(item.remarkCategory?.trim()))
    .sort((left, right) => right.date.localeCompare(left.date));
  const categoryMap = new Map<string, RemarkedExpenseCategory>();

  for (const item of remarkedTransactions) {
    const category = item.remarkCategory!.trim();
    const current = categoryMap.get(category) ?? { category, amount: 0, count: 0 };
    current.amount += item.amount;
    current.count += 1;
    categoryMap.set(category, current);
  }

  return {
    amount: remarkedTransactions.reduce((sum, item) => sum + item.amount, 0),
    count: remarkedTransactions.length,
    categories: [...categoryMap.values()].sort((left, right) => right.amount - left.amount),
    transactions: remarkedTransactions,
  };
}
