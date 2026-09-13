import type { SavingsPlan, Transaction } from "../models/types";

const REPORTING_YEAR_PATTERN = /^\d{4}$/;

function isReportingYearKey(value: string) {
  return REPORTING_YEAR_PATTERN.test(value);
}

function reportingMonthDate(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  if (!Number.isInteger(year) || !Number.isInteger(monthNumber)) throw new Error(`Invalid reporting month: ${month}`);
  return new Date(year, monthNumber - 1, 1);
}

export type SalaryCycleRange = {
  start: Date;
  endExclusive: Date;
  label: string;
};

function parseDate(value: string | null | undefined) {
  if (!value) return null;
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function normalizeSalaryDay(value: number | null | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(1, Math.min(28, Math.round(parsed))) : 15;
}

export function salaryCycleRange(reportingMonth: string, salaryDay = 15): SalaryCycleRange {
  const day = normalizeSalaryDay(salaryDay);
  const reportingDate = isReportingYearKey(reportingMonth) ? new Date(Number(reportingMonth), 0, 1) : reportingMonthDate(reportingMonth);
  const start = isReportingYearKey(reportingMonth)
    ? reportingDate
    : new Date(reportingDate.getFullYear(), reportingDate.getMonth(), day);
  const endExclusive = isReportingYearKey(reportingMonth)
    ? new Date(Number(reportingMonth) + 1, 0, 1)
    : new Date(start.getFullYear(), start.getMonth() + 1, day);
  const label = isReportingYearKey(reportingMonth)
    ? `${reportingMonth}-01-01`
    : `${formatDate(start)} 至 ${formatDate(new Date(endExclusive.getTime() - 86_400_000))}`;
  return { start, endExclusive, label };
}

function formatDate(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}

function calendarPeriodRange(reportingPeriod: string): SalaryCycleRange {
  if (isReportingYearKey(reportingPeriod)) {
    const year = Number(reportingPeriod);
    return {
      start: new Date(year, 0, 1),
      endExclusive: new Date(year + 1, 0, 1),
      label: `${reportingPeriod}-01-01 至 ${reportingPeriod}-12-31`,
    };
  }
  const start = reportingMonthDate(reportingPeriod);
  const endExclusive = new Date(start.getFullYear(), start.getMonth() + 1, 1);
  return {
    start,
    endExclusive,
    label: `${formatDate(start)} 至 ${formatDate(new Date(endExclusive.getTime() - 86_400_000))}`,
  };
}

export function isWithinSalaryCycle(value: string | null | undefined, range: SalaryCycleRange) {
  const date = parseDate(value);
  return Boolean(date && date >= range.start && date < range.endExclusive);
}

export function savingsPlanActualDate(plan: Pick<SavingsPlan, "status" | "actualDate" | "updatedAt">) {
  if (plan.status !== "COMPLETED") return null;
  return plan.actualDate || plan.updatedAt;
}

export function calculateSalaryCycleCashflow(
  transactions: Transaction[],
  savingsPlans: SavingsPlan[] = [],
  reportingMonth: string,
  salaryDay = 15,
) {
  const range = salaryCycleRange(reportingMonth, salaryDay);
  return calculateCashflowForRange(transactions, savingsPlans, range);
}

export function calculateCalendarPeriodCashflow(
  transactions: Transaction[],
  savingsPlans: SavingsPlan[] = [],
  reportingPeriod: string,
) {
  return calculateCashflowForRange(transactions, savingsPlans, calendarPeriodRange(reportingPeriod));
}

function calculateCashflowForRange(
  transactions: Transaction[],
  savingsPlans: SavingsPlan[],
  range: SalaryCycleRange,
) {
  const cycleTransactions = transactions.filter((transaction) => isWithinSalaryCycle(transaction.date, range));
  const income = cycleTransactions
    .filter((transaction) => transaction.type === "INCOME")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const expense = cycleTransactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const repayment = cycleTransactions
    .filter((transaction) => transaction.type === "REPAYMENT")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const savings = savingsPlans
    .filter((plan) => isWithinSalaryCycle(savingsPlanActualDate(plan), range))
    .reduce((sum, plan) => sum + Number(plan.actualAmount ?? plan.amount ?? 0), 0);

  return {
    range,
    transactions: cycleTransactions,
    income,
    expense,
    repayment,
    savings,
    balance: income - expense - repayment - savings,
  };
}

export type SalaryCycleBreakdown = ReturnType<typeof calculateSalaryCycleCashflow>;
