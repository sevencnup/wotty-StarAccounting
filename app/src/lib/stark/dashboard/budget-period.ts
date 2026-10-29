import type { Budget, Transaction } from "../models/types";

function isYearKey(value: string) {
  return /^\d{4}$/.test(value);
}

function normalizeCategory(category: string) {
  if (category.includes("生活")) return "生活消费";
  if (category.includes("交") || category.includes("车")) return "交通出行";
  if (category.includes("餐") || category.includes("饮")) return "餐饮美食";
  if (category.includes("娱")) return "休闲娱乐";
  if (category.includes("购")) return "购物消费";
  if (category.includes("工")) return "工资收入";
  return category || "其他";
}

export function calculateBudgetSpent(
  transactions: readonly Transaction[],
  budget: Pick<Budget, "period" | "scopeType" | "category" | "platform">,
  reportingMonth: string,
  monthlyExpense = 0,
) {
  const year = isYearKey(reportingMonth) ? reportingMonth : reportingMonth.slice(0, 4);
  const periodTransactions = budget.period === "YEARLY"
    ? transactions.filter((item) => item.type === "EXPENSE" && item.date.slice(0, 4) === year)
    : transactions.filter((item) => item.type === "EXPENSE" && (isYearKey(reportingMonth) ? item.date.slice(0, 4) === reportingMonth : item.date.slice(0, 7) === reportingMonth));

  if (budget.scopeType === "GLOBAL") {
    return budget.period === "YEARLY"
      ? periodTransactions.reduce((sum, item) => sum + item.amount, 0)
      : monthlyExpense;
  }
  if (budget.scopeType === "PLATFORM") {
    return periodTransactions.filter((item) => item.platform === budget.platform).reduce((sum, item) => sum + item.amount, 0);
  }
  return periodTransactions
    .filter((item) => normalizeCategory(item.category) === normalizeCategory(budget.category))
    .reduce((sum, item) => sum + item.amount, 0);
}
