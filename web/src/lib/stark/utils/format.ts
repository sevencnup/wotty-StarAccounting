export const REPORTING_MONTH_KEY = "2026-01";

const REPORTING_MONTH_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/;

export function isReportingMonthKey(value: string): boolean {
  return REPORTING_MONTH_PATTERN.test(value);
}

function reportingMonthParts(month: string) {
  if (!isReportingMonthKey(month)) {
    throw new Error(`Invalid reporting month: ${month}`);
  }
  const [year, monthNumber] = month.split("-").map(Number);
  return { year, monthNumber };
}

export function reportingMonthDate(month = REPORTING_MONTH_KEY, day = 1) {
  const { year, monthNumber } = reportingMonthParts(month);
  return new Date(year, monthNumber - 1, day);
}

export function reportingMonthEndDate(month = REPORTING_MONTH_KEY) {
  const { year, monthNumber } = reportingMonthParts(month);
  return new Date(year, monthNumber, 0);
}

export function reportingMonthLabel(month = REPORTING_MONTH_KEY) {
  const { year, monthNumber } = reportingMonthParts(month);
  return `${year}年${monthNumber}月`;
}

export function previousMonthKey(month: string) {
  const date = reportingMonthDate(month);
  const previous = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  return `${previous.getFullYear()}-${String(previous.getMonth() + 1).padStart(2, "0")}`;
}

export function reportingMonthSequence(month: string, count: number) {
  const end = reportingMonthDate(month);
  const safeCount = Math.max(0, Math.floor(count));
  return Array.from({ length: safeCount }, (_, index) => {
    const offset = safeCount - index - 1;
    const date = new Date(end.getFullYear(), end.getMonth() - offset, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  });
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
