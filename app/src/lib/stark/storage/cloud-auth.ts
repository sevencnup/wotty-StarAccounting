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
  return window.localStorage.getItem(`${AUTH_PREFIX}${key}`);
}

function write(key: string, value: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(`${AUTH_PREFIX}${key}`, value);
}

function remove(key: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(`${AUTH_PREFIX}${key}`);
}

export function getCloudAuthToken() {
  return read("token");
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

export function setCloudAuth(token: string, user: CloudAuthUser) {
  write("token", token);
  write("user", JSON.stringify(user));
}

export function clearCloudAuth() {
  remove("token");
  remove("user");
}
