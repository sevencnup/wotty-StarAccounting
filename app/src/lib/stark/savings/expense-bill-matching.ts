import type { Transaction } from "../models/types";
import { matchesCategoryKeyword } from "../dashboard/remark";
import { isWithinSalaryCycle, salaryCycleRange } from "../dashboard/salary-cycle";
import type { SavingsPlanAllocationItem } from "./planner";

export type SavingsPlanExpenseBillMatch = SavingsPlanAllocationItem & {
  matched: boolean;
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
    return {
      ...item,
      matched: periodExpenses.some((transaction) => matchesCategoryKeyword(transaction, item.name)),
    };
  });
}
