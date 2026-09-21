const AUTH_PREFIX = "wotty-stark:cloud-auth:";

export type CloudAuthUser = {
  id: string;
  email: string;
  name?: string | null;
  defaultAccountId?: string | null;
  role: "USER" | "ADMIN" | string;
  createdAt: string;
  updatedAt: string;
};

function read(key: string) {
  if (typeof window === "undefined") return null;
  const storage = window.localStorage.getItem(`${AUTH_PREFIX}token`)
    ? window.localStorage
    : window.sessionStorage.getItem(`${AUTH_PREFIX}token`)
      ? window.sessionStorage
      : null;
  return storage?.getItem(`${AUTH_PREFIX}${key}`) ?? null;
}

function persistentRead(key: string) {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(`${AUTH_PREFIX}${key}`);
}

function write(key: string, value: string, remember: boolean) {
  if (typeof window === "undefined") return;
  const target = remember ? window.localStorage : window.sessionStorage;
  const other = remember ? window.sessionStorage : window.localStorage;
  other.removeItem(`${AUTH_PREFIX}${key}`);
  target.setItem(`${AUTH_PREFIX}${key}`, value);
}

function remove(key: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(`${AUTH_PREFIX}${key}`);
  window.sessionStorage.removeItem(`${AUTH_PREFIX}${key}`);
}

export function getCloudAuthToken() {
  return read("token");
}

/** True only when the active sign-in was explicitly kept across browser sessions. */
export function isCloudAuthRemembered() {
  return Boolean(persistentRead("token"));
}

export function getCloudAuthUser(): CloudAuthUser | null {
  const value = read("user");
  if (!value) return null;
  try {
    return JSON.parse(value) as CloudAuthUser;
  } catch {
    clearCloudAuth();
    return null;
  }
}

export function setCloudAuth(token: string, user: CloudAuthUser, remember = isCloudAuthRemembered()) {
  write("token", token, remember);
  write("user", JSON.stringify(user), remember);
}

export function clearCloudAuth() {
  remove("token");
  remove("user");
}
