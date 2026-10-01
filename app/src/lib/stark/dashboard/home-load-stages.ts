import { isReportingMonthKey, isReportingYearKey, nextMonthKey, previousMonthKey, reportingMonthDate, reportingMonthSequence, reportingPeriodMonths } from "../utils/format";

function balanceBaselineTransactionMonths(reportingMonth: string, balanceBaselineDate?: string | null) {
  const baselineMonth = balanceBaselineDate?.slice(0, 7) ?? "";
  if (!isReportingMonthKey(baselineMonth)) return [];

  const start = reportingMonthDate(baselineMonth);
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  // The hero always shows the current account balance once a baseline exists,
  // even while the user inspects an older reporting month. Load through today,
  // never through a selected future month.
  const end = reportingMonthDate(currentMonth);
  if (start > end) return [];

  const months: string[] = [];
  for (let cursor = start; cursor <= end; cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)) {
    months.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`);
  }
  return months;
}

export function homeCoreTransactionMonths(reportingMonth: string, balanceBaselineDate?: string | null) {
  if (isReportingYearKey(reportingMonth)) {
    return [...new Set([
      ...reportingPeriodMonths(previousMonthKey(reportingMonth)),
      ...reportingPeriodMonths(reportingMonth),
    ])];
  }

  const previousMonth = previousMonthKey(reportingMonth);
  return [...new Set([
    // The previous completed salary cycle can span two preceding calendar months.
    ...reportingPeriodMonths(previousMonthKey(previousMonth)),
    ...reportingPeriodMonths(previousMonth),
    ...reportingPeriodMonths(reportingMonth),
    ...balanceBaselineTransactionMonths(reportingMonth, balanceBaselineDate),
  ])];
}

export function homeSupplementalTransactionMonths(reportingMonth: string, hasYearlyBudget: boolean, balanceBaselineDate?: string | null) {
  if (isReportingYearKey(reportingMonth)) return homeCoreTransactionMonths(reportingMonth, balanceBaselineDate);

  const reportingYearMonths = reportingPeriodMonths(reportingMonth.slice(0, 4));
  return [...new Set([
    ...homeCoreTransactionMonths(reportingMonth, balanceBaselineDate),
    ...reportingMonthSequence(reportingMonth, 5),
    nextMonthKey(reportingMonth),
    ...(hasYearlyBudget ? reportingYearMonths : []),
  ])];
}
