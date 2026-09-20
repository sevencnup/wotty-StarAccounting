import { clearCloudAuth, getCloudAuthToken, setCloudAuth, type CloudAuthUser } from "@/lib/stark/storage/cloud-auth";
import { setCurrentAccountId } from "@/lib/stark/storage/local-config";

type AuthResponse = { token: string; user: CloudAuthUser };

async function request<T>(baseUrl: string, path: string, init?: RequestInit): Promise<T> {
  const token = getCloudAuthToken();
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  const body = await response.json().catch(() => ({})) as { error?: string };
  if (!response.ok) throw new Error(body.error || `云端请求失败（${response.status}）`);
  return body as T;
}

export async function cloudLogin(baseUrl: string, email: string, password: string) {
  const result = await request<AuthResponse>(baseUrl, "/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setCloudAuth(result.token, result.user);
  if (result.user.defaultAccountId) setCurrentAccountId(result.user.defaultAccountId);
  return result.user;
}

export async function cloudRegister(baseUrl: string, email: string, password: string, name?: string) {
  const result = await request<AuthResponse>(baseUrl, "/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name: name?.trim() || null }),
  });
  setCloudAuth(result.token, result.user);
  if (result.user.defaultAccountId) setCurrentAccountId(result.user.defaultAccountId);
  return result.user;
}

export async function cloudMe(baseUrl: string) {
  if (!getCloudAuthToken()) return null;
  try {
    const user = await request<CloudAuthUser>(baseUrl, "/api/auth/me");
    const token = getCloudAuthToken();
    if (token) setCloudAuth(token, user);
    if (user.defaultAccountId) setCurrentAccountId(user.defaultAccountId);
    return user;
  } catch {
    clearCloudAuth();
    return null;
  }
}

export async function cloudResetPassword(baseUrl: string, currentPassword: string, newPassword: string, confirmPassword: string) {
  await request<{ message: string }>(baseUrl, "/api/auth/password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
  });
}

export function cloudLogout() {
  clearCloudAuth();
}
