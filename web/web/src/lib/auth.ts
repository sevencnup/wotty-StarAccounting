export const TOKEN_KEY = "wotty_access_token";

let cachedToken: string | null | undefined;

function readTokenFromStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getAccessToken() {
  if (cachedToken !== undefined) {
    return cachedToken;
  }

  cachedToken = readTokenFromStorage();
  return cachedToken;
}

export function hasAccessToken() {
  return Boolean(getAccessToken());
}

export function setAccessToken(token: string) {
  cachedToken = token;
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Keep the in-memory token when storage is unavailable.
  }
}

export function clearAccessToken() {
  cachedToken = null;
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Ignore storage clear failures.
  }
}
