const CONFIG_PREFIX = "wotty-stark:";

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

export function getCloudApiUrl() {
  return readValue("cloud-api-url") ?? "http://localhost:8080";
}

export function setCloudApiUrl(url: string) {
  writeValue("cloud-api-url", url.replace(/\/$/, ""));
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
