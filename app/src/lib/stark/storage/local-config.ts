import { Capacitor } from "@capacitor/core";

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

export function getCurrentDataMode(): "LOCAL" | "CLOUD" {
  if (!isNativeAppRuntime()) return "CLOUD";
  return readValue("data-mode") === "CLOUD" ? "CLOUD" : "LOCAL";
}

export function setCurrentDataMode(mode: "LOCAL" | "CLOUD") {
  writeValue("data-mode", mode);
}

/** 浏览器版只使用云端数据；本地模式仅对 Capacitor 套壳 App 开放。 */
export function isNativeAppRuntime() {
  return typeof window !== "undefined" && Capacitor.isNativePlatform();
}

function isStandardWebOrigin(protocol: string, port: string) {
  return port === ""
    || (protocol === "https:" && port === "443")
    || (protocol === "http:" && port === "80");
}

function getDefaultCloudApiUrl() {
  if (typeof window === "undefined") {
    return `http://${DEFAULT_CLOUD_API_HOST}:${DEFAULT_CLOUD_API_PORT}`;
  }

  const hostname = window.location.hostname || DEFAULT_CLOUD_API_HOST;
  const protocol = window.location.protocol === "https:" ? "https:" : "http:";
  if (!isNativeAppRuntime() && isStandardWebOrigin(protocol, window.location.port)) return window.location.origin;

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

  if (typeof window !== "undefined" && !isNativeAppRuntime()) {
    try {
      const savedUrl = new URL(saved);
      const isCurrentHost = savedUrl.hostname === window.location.hostname;
      const shouldUseSameOrigin = isCurrentHost
        && isStandardWebOrigin(window.location.protocol, window.location.port)
        && savedUrl.port === String(DEFAULT_CLOUD_API_PORT);
      if (shouldUseSameOrigin) {
        const origin = window.location.origin;
        writeValue("cloud-api-url", origin);
        return origin;
      }
      // Earlier builds incorrectly rewrote the development Web port (12366)
      // into the API address. Repair that persisted value automatically.
      if (isCurrentHost && savedUrl.port === window.location.port && !isStandardWebOrigin(window.location.protocol, window.location.port)) {
        const apiUrl = `${window.location.protocol}//${window.location.hostname}:${DEFAULT_CLOUD_API_PORT}`;
        writeValue("cloud-api-url", apiUrl);
        return apiUrl;
      }
    } catch {
      // Keep invalid values editable on the API connection screen.
    }
  }

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
