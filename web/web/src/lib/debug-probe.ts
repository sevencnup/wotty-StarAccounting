"use client";

import { isNativeAppRuntime } from "./runtime-server";

export type DebugProbeEntry = {
  id: string;
  scope: string;
  message: string;
  time: string;
  timestamp: number;
  detail?: Record<string, unknown> | string;
};

const DEBUG_PROBE_STORAGE_KEY = "wotty_debug_probe_entries";
const DEBUG_PROBE_LIMIT = 120;
export const OPEN_NATIVE_DEBUG_PANEL_EVENT = "wotty:open-native-debug-panel";

function canUseStorage() {
  return typeof window !== "undefined";
}

function sanitizeDetail(detail?: Record<string, unknown> | string) {
  if (!detail) {
    return undefined;
  }

  if (typeof detail === "string") {
    return detail;
  }

  try {
    return JSON.parse(JSON.stringify(detail)) as Record<string, unknown>;
  } catch {
    return String(detail);
  }
}

function readEntriesFromStorage(): DebugProbeEntry[] {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(DEBUG_PROBE_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as DebugProbeEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeEntriesToStorage(entries: DebugProbeEntry[]) {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(DEBUG_PROBE_STORAGE_KEY, JSON.stringify(entries.slice(-DEBUG_PROBE_LIMIT)));
  } catch {
    // 调试日志写入失败时不影响主流程。
  }
}

export function logDebugProbe(scope: string, message: string, detail?: Record<string, unknown> | string) {
  if (!canUseStorage()) {
    return;
  }

  const entry: DebugProbeEntry = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    scope,
    message,
    time: new Date().toLocaleTimeString("zh-CN", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    timestamp: Date.now(),
    detail: sanitizeDetail(detail),
  };

  writeEntriesToStorage([...readEntriesFromStorage(), entry]);
}

export function readDebugProbeEntries() {
  return readEntriesFromStorage();
}

export function clearDebugProbeEntries() {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.removeItem(DEBUG_PROBE_STORAGE_KEY);
  } catch {
    // 调试日志清理失败时不影响主流程。
  }
}

export function isNativeDebugRuntime() {
  return canUseStorage() && isNativeAppRuntime();
}

export function requestOpenNativeDebugPanel() {
  if (!canUseStorage()) {
    return;
  }

  window.dispatchEvent(new CustomEvent(OPEN_NATIVE_DEBUG_PANEL_EVENT));
}
