import type { Transaction } from "../models/types";
import { matchesCategoryKeyword } from "../dashboard/remark";
import { isWithinSalaryCycle, salaryCycleRange } from "../dashboard/salary-cycle";
import type { SavingsPlanAllocationItem } from "./planner";

export type SavingsPlanExpenseBillMatch = SavingsPlanAllocationItem & {
  matchedAmount: number;
  matchedTransactionCount: number;
  matchStatus: "unmatched" | "partial" | "matched" | "over";
};

/** Match planned expense names against expense bills in the same salary cycle or calendar year. */
export function matchSavingsPlanExpensesWithBills(
  items: readonly SavingsPlanAllocationItem[],
  transactions: readonly Transaction[],
  reportingPeriod: string,
  salaryDay: number,
  referenceDate = new Date(),
): SavingsPlanExpenseBillMatch[] {
  const isYear = /^\d{4}$/.test(reportingPeriod);
  const cycle = isYear ? null : salaryCycleRange(reportingPeriod, salaryDay, referenceDate);
  const periodExpenses = transactions.filter((transaction) => (
    transaction.type === "EXPENSE"
    && (isYear
      ? transaction.date.slice(0, 4) === reportingPeriod
      : cycle !== null && isWithinSalaryCycle(transaction.date, cycle))
  ));

  return items.map((item) => {
    const matches = periodExpenses.filter((transaction) => matchesCategoryKeyword(transaction, item.name));
    const matchedCents = matches.reduce((sum, transaction) => sum + Math.round(Number(transaction.amount) * 100), 0);
    const plannedCents = Math.round(Number(item.amount) * 100);
    return {
      ...item,
      matchedAmount: matchedCents / 100,
      matchedTransactionCount: matches.length,
      matchStatus: matches.length === 0
        ? "unmatched"
        : matchedCents < plannedCents
          ? "partial"
          : matchedCents > plannedCents
            ? "over"
            : "matched",
    };
  });
}
