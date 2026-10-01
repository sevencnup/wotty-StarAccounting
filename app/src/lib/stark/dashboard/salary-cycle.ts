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

function rangeFromSalaryCycleStart(start: Date): SalaryCycleRange {
  const endExclusive = new Date(start.getFullYear(), start.getMonth() + 1, start.getDate());
  return {
    start,
    endExclusive,
    label: `${formatDate(start)} 至 ${formatDate(new Date(endExclusive.getTime() - 86_400_000))}`,
  };
}

/**
 * Returns the salary cycle for a selected reporting month. When the selected month is
 * the current month and the payday has not arrived yet, the active cycle began on the
 * previous month's payday rather than on an upcoming payday.
 */
export function salaryCycleRange(reportingMonth: string, salaryDay = 15, referenceDate = new Date()): SalaryCycleRange {
  const day = normalizeSalaryDay(salaryDay);
  const reportingDate = isReportingYearKey(reportingMonth) ? new Date(Number(reportingMonth), 0, 1) : reportingMonthDate(reportingMonth);
  if (isReportingYearKey(reportingMonth)) {
    return {
      start: reportingDate,
      endExclusive: new Date(Number(reportingMonth) + 1, 0, 1),
      label: `${reportingMonth}-01-01`,
    };
  }

  const validReferenceDate = Number.isNaN(referenceDate.getTime()) ? new Date() : referenceDate;
  const selectedIsCurrentMonth = reportingDate.getFullYear() === validReferenceDate.getFullYear()
    && reportingDate.getMonth() === validReferenceDate.getMonth();
  const startMonthOffset = selectedIsCurrentMonth && validReferenceDate.getDate() < day ? -1 : 0;
  const start = new Date(reportingDate.getFullYear(), reportingDate.getMonth() + startMonthOffset, day);
  return rangeFromSalaryCycleStart(start);
}

/** The complete salary cycle immediately before the resolved reporting cycle. */
export function previousSalaryCycleRange(reportingMonth: string, salaryDay = 15, referenceDate = new Date()): SalaryCycleRange {
  if (isReportingYearKey(reportingMonth)) {
    return salaryCycleRange(String(Number(reportingMonth) - 1), salaryDay, referenceDate);
  }
  const currentRange = salaryCycleRange(reportingMonth, salaryDay, referenceDate);
  const day = normalizeSalaryDay(salaryDay);
  return rangeFromSalaryCycleStart(new Date(
    currentRange.start.getFullYear(),
    currentRange.start.getMonth() - 1,
    day,
  ));
}

/**
 * The cash already changed during the calendar month before this salary cycle
 * began. It stays outside the salary-cycle detail rows, but affects how much
 * remains after payday.
 */
export function salaryCycleOpeningBalanceRange(reportingMonth: string, salaryDay = 15, referenceDate = new Date()): SalaryCycleRange {
  const cycle = salaryCycleRange(reportingMonth, salaryDay, referenceDate);
  const start = new Date(cycle.start.getFullYear(), cycle.start.getMonth(), 1);
  return {
    start,
    endExclusive: cycle.start,
    label: `${formatDate(start)} 至 ${formatDate(new Date(cycle.start.getTime() - 86_400_000))}`,
  };
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
  referenceDate = new Date(),
) {
  const range = salaryCycleRange(reportingMonth, salaryDay, referenceDate);
  return calculateCashflowForRange(transactions, savingsPlans, range);
}

export function calculatePreviousSalaryCycleCashflow(
  transactions: Transaction[],
  savingsPlans: SavingsPlan[] = [],
  reportingMonth: string,
  salaryDay = 15,
  referenceDate = new Date(),
) {
  const range = previousSalaryCycleRange(reportingMonth, salaryDay, referenceDate);
  return calculateCashflowForRange(transactions, savingsPlans, range);
}

export function calculateSalaryCycleOpeningCashflow(
  transactions: Transaction[],
  savingsPlans: SavingsPlan[] = [],
  reportingMonth: string,
  salaryDay = 15,
  referenceDate = new Date(),
) {
  const range = salaryCycleOpeningBalanceRange(reportingMonth, salaryDay, referenceDate);
  return calculateCashflowForRange(transactions, savingsPlans, range);
}

/**
 * Combines the balance already on hand when a salary cycle began with that
 * cycle's net cashflow. The opening balance is deliberately separate from the
 * cycle details: transactions before payday affect what remains in the account,
 * but do not become this cycle's income or spending.
 */
export function calculateSalaryCycleAvailableBalance(openingBalance: number, cycleCashflow: Pick<ReturnType<typeof calculateSalaryCycleCashflow>, "balance">) {
  return openingBalance + cycleCashflow.balance;
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
