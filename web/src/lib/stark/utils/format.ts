export const REPORTING_MONTH_KEY = "2026-01";

const REPORTING_MONTH_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/;
const REPORTING_YEAR_PATTERN = /^\d{4}$/;

export function isReportingMonthKey(value: string): boolean {
  return REPORTING_MONTH_PATTERN.test(value);
}

export function isReportingYearKey(value: string): boolean {
  return REPORTING_YEAR_PATTERN.test(value);
}

export function isReportingPeriodKey(value: string): boolean {
  return isReportingMonthKey(value) || isReportingYearKey(value);
}

function reportingMonthParts(month: string) {
  if (!isReportingMonthKey(month)) {
    throw new Error(`Invalid reporting month: ${month}`);
  }
  const [year, monthNumber] = month.split("-").map(Number);
  return { year, monthNumber };
}

export function reportingMonthDate(month = REPORTING_MONTH_KEY, day = 1) {
  if (isReportingYearKey(month)) return new Date(Number(month), 0, day);
  const { year, monthNumber } = reportingMonthParts(month);
  return new Date(year, monthNumber - 1, day);
}

export function reportingMonthEndDate(month = REPORTING_MONTH_KEY) {
  if (isReportingYearKey(month)) return new Date(Number(month), 12, 0);
  const { year, monthNumber } = reportingMonthParts(month);
  return new Date(year, monthNumber, 0);
}

export function reportingMonthLabel(month = REPORTING_MONTH_KEY) {
  if (isReportingYearKey(month)) return `${month}年全年`;
  const { year, monthNumber } = reportingMonthParts(month);
  return `${year}年${monthNumber}月`;
}

export function reportingPeriodDate(period = REPORTING_MONTH_KEY, day = 1) {
  if (isReportingYearKey(period)) return new Date(Number(period), 0, day);
  return reportingMonthDate(period, day);
}

export function reportingPeriodEndDate(period = REPORTING_MONTH_KEY) {
  if (isReportingYearKey(period)) return new Date(Number(period), 12, 0);
  return reportingMonthEndDate(period);
}

export function reportingPeriodYear(period = REPORTING_MONTH_KEY) {
  if (isReportingYearKey(period)) return Number(period);
  return reportingMonthDate(period).getFullYear();
}

export function previousMonthKey(month: string) {
  if (isReportingYearKey(month)) return String(Number(month) - 1);
  const date = reportingMonthDate(month);
  const previous = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  return `${previous.getFullYear()}-${String(previous.getMonth() + 1).padStart(2, "0")}`;
}

export function nextMonthKey(month: string) {
  if (isReportingYearKey(month)) return String(Number(month) + 1);
  const date = reportingMonthDate(month);
  const next = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
}

export function reportingMonthSequence(month: string, count: number) {
  if (isReportingYearKey(month)) {
    const safeCount = Math.max(0, Math.floor(count));
    const year = Number(month);
    return Array.from({ length: safeCount }, (_, index) => String(year - safeCount + index + 1));
  }
  const end = reportingMonthDate(month);
  const safeCount = Math.max(0, Math.floor(count));
  return Array.from({ length: safeCount }, (_, index) => {
    const offset = safeCount - index - 1;
    const date = new Date(end.getFullYear(), end.getMonth() - offset, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  });
}

export function reportingPeriodMonths(period = REPORTING_MONTH_KEY) {
  if (isReportingYearKey(period)) {
    return Array.from({ length: 12 }, (_, index) => `${period}-${String(index + 1).padStart(2, "0")}`);
  }
  return [period];
}

export function nowText() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  const second = String(date.getSeconds()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day} ${hour}:${minute}:${second}`;
}

export function monthKey(input: string) {
  return input.slice(0, 7);
}

export function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
