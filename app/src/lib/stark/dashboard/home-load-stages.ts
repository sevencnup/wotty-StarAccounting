import { isReportingYearKey, nextMonthKey, previousMonthKey, reportingMonthSequence, reportingPeriodMonths } from "../utils/format";

export function homeCoreTransactionMonths(reportingMonth: string) {
  return [...new Set([
    ...reportingPeriodMonths(previousMonthKey(reportingMonth)),
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
