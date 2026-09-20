"use client";

type NavigationDebugDetails = Record<string, unknown>;

type NavigationDebugEntry = {
  scope: string;
  event: string;
  details: NavigationDebugDetails;
  timestamp: string;
};

const NAVIGATION_DEBUG_KEY = "__wotty_navigation_debug__";
const MAX_DEBUG_ENTRIES = 12;

function readEntries() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = window.sessionStorage.getItem(NAVIGATION_DEBUG_KEY);
    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue) ? (parsedValue as NavigationDebugEntry[]) : [];
  } catch {
    return [];
  }
}

function writeEntries(entries: NavigationDebugEntry[]) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(NAVIGATION_DEBUG_KEY, JSON.stringify(entries.slice(-MAX_DEBUG_ENTRIES)));
  } catch {
    // Ignore sessionStorage failures in private mode or restricted browsers.
  }
}

export function persistNavigationDebug(scope: string, event: string, details: NavigationDebugDetails) {
  if (typeof window === "undefined") {
    return;
  }

  const entry: NavigationDebugEntry = {
    scope,
    event,
    details,
    timestamp: new Date().toISOString(),
  };

  console.info(`[wottyNav][${scope}] ${event}`, details);
  const entries = readEntries();
  entries.push(entry);
  writeEntries(entries);
}

export function flushNavigationDebug(scope: string) {
  if (typeof window === "undefined") {
    return;
  }

  const entries = readEntries();
  if (entries.length === 0) {
    return;
  }

  for (const entry of entries) {
    console.info(`[wottyNav][replay][${scope}] ${entry.event}`, entry.details);
  }

  try {
    window.sessionStorage.removeItem(NAVIGATION_DEBUG_KEY);
  } catch {
    // Ignore storage cleanup failures.
  }
}
