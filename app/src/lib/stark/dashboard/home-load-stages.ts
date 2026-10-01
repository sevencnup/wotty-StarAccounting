import { isReportingYearKey, nextMonthKey, previousMonthKey, reportingMonthSequence, reportingPeriodMonths } from "../utils/format";

export function homeCoreTransactionMonths(reportingMonth: string) {
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
  ])];
}

export function homeSupplementalTransactionMonths(reportingMonth: string, hasYearlyBudget: boolean) {
  if (isReportingYearKey(reportingMonth)) return homeCoreTransactionMonths(reportingMonth);

  const reportingYearMonths = reportingPeriodMonths(reportingMonth.slice(0, 4));
  return [...new Set([
    ...reportingMonthSequence(reportingMonth, 5),
    nextMonthKey(reportingMonth),
    ...(hasYearlyBudget ? reportingYearMonths : []),
  ])];
}
