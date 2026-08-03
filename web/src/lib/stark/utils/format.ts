export const REPORTING_MONTH_KEY = "2026-01";

export function reportingMonthDate(day = 1) {
  const [year, month] = REPORTING_MONTH_KEY.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function reportingMonthEndDate() {
  const [year, month] = REPORTING_MONTH_KEY.split("-").map(Number);
  return new Date(year, month, 0);
}

export function reportingMonthLabel() {
  const [year, month] = REPORTING_MONTH_KEY.split("-");
  return `${year}年${Number(month)}月`;
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
