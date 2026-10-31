import { CURRENT_APP_VERSION_CODE } from "@/lib/stark/app-version";

type Listener = () => void;

let updateAvailable = false;
let initialized = false;
const listeners = new Set<Listener>();
const storageKey = `wotty:stark:update-available:${CURRENT_APP_VERSION_CODE}`;

function initializeFromStorage() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  try {
    updateAvailable = window.localStorage.getItem(storageKey) === "1";
  } catch {
    // Update badges are best-effort and must not block the app.
  }
}

export function getAppUpdateAvailable() {
  initializeFromStorage();
  return updateAvailable;
}

export function subscribeAppUpdateAvailable(listener: Listener) {
  initializeFromStorage();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setAppUpdateAvailable(available: boolean) {
  initializeFromStorage();
  if (updateAvailable === available) return;
  updateAvailable = available;
  try {
    if (available) window.localStorage.setItem(storageKey, "1");
    else window.localStorage.removeItem(storageKey);
  } catch {
    // Keep the in-memory status available if browser storage is disabled.
  }
  for (const listener of listeners) listener();
}
