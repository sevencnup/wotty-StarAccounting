const CONFIG_PREFIX = "wotty-stark:";
const DEFAULT_REPORTING_MONTH = "2026-01";
const DEFAULT_CLOUD_API_PORT = 12367;
const DEFAULT_CLOUD_API_HOST = "localhost";
const REPORTING_MONTH_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/;
const REPORTING_YEAR_PATTERN = /^\d{4}$/;

function readValue(key: string) {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(`${CONFIG_PREFIX}${key}`);
}

function writeValue(key: string, value: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(`${CONFIG_PREFIX}${key}`, value);
}

export function getCurrentAccountId() {
  return readValue("current-account-id") ?? "default";
}

export function setCurrentAccountId(accountId: string) {
  writeValue("current-account-id", accountId);
}

export function getCurrentDataMode() {
  return readValue("data-mode") ?? "LOCAL";
}

export function setCurrentDataMode(mode: "LOCAL" | "CLOUD") {
  writeValue("data-mode", mode);
}

function getDefaultCloudApiUrl() {
  if (typeof window === "undefined") {
    return `http://${DEFAULT_CLOUD_API_HOST}:${DEFAULT_CLOUD_API_PORT}`;
  }

  const hostname = window.location.hostname || DEFAULT_CLOUD_API_HOST;
  const protocol = window.location.protocol === "https:" ? "https:" : "http:";
  return `${protocol}//${hostname}:${DEFAULT_CLOUD_API_PORT}`;
}

function migrateCloudApiUrl(url: string) {
  return url.trim().replace(/\/$/, "").replace(
    /:8080(?=\/|$)/,
    `:${DEFAULT_CLOUD_API_PORT}`,
  );
}

export function getCloudApiUrl() {
  const saved = readValue("cloud-api-url");
  if (!saved) return getDefaultCloudApiUrl();

  const migrated = migrateCloudApiUrl(saved);
  if (migrated !== saved) writeValue("cloud-api-url", migrated);
  return migrated;
}

export function setCloudApiUrl(url: string) {
  writeValue("cloud-api-url", url.replace(/\/$/, ""));
}

export function getSelectedReportMonth() {
  const value = readValue("reporting-month");
  return value && (REPORTING_MONTH_PATTERN.test(value) || REPORTING_YEAR_PATTERN.test(value)) ? value : DEFAULT_REPORTING_MONTH;
}

export function setSelectedReportMonth(month: string) {
  if (REPORTING_MONTH_PATTERN.test(month) || REPORTING_YEAR_PATTERN.test(month)) {
    writeValue("reporting-month", month);
  }
}

export function getSeededFlag() {
  return readValue("seeded") === "1";
}

export function setSeededFlag() {
  writeValue("seeded", "1");
}

export function getSalaryDay() {
  const value = readValue("salary-day");
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 15;
  return Math.max(1, Math.min(28, Math.round(parsed)));
}

export function setSalaryDay(day: number) {
  const safeDay = Math.max(1, Math.min(28, Math.round(day)));
  writeValue("salary-day", String(safeDay));
}
