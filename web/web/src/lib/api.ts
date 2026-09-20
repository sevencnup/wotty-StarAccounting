import { clearAccessToken, getAccessToken } from "./auth";
import { logDebugProbe } from "./debug-probe";
import { getApiBaseUrlLabel, resolveApiBaseUrl } from "./runtime-server";

type ApiEnvelope<T> = {
  data: T;
  code?: number;
  message?: string;
};

type ApiError = {
  code?: number;
  message?: string;
  detail?: string;
};

const API_TIMEOUT_MS = 12000;

function shouldLogRequest(path: string) {
  return path.startsWith("/api/auth");
}

function buildApiUrl(path: string) {
  const apiBaseUrl = resolveApiBaseUrl();

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return apiBaseUrl ? `${apiBaseUrl}${path}` : path;
}

export { getApiBaseUrlLabel };

function createApiError(message: string, status?: number, code?: number) {
  const error = new Error(message) as Error & { status?: number; code?: number };
  error.status = status;
  error.code = code;
  return error;
}

function getApiErrorInfo<T>(body: ApiEnvelope<T> | ApiError | null, status: number) {
  const detailMessage = body && typeof body === "object" && "detail" in body && typeof body.detail === "string"
    ? body.detail
    : undefined;
  const messageText = body && typeof body === "object" && "message" in body && typeof body.message === "string"
    ? body.message
    : undefined;
  const codeValue = body && typeof body === "object" && "code" in body && typeof body.code === "number"
    ? body.code
    : undefined;

  return {
    message: detailMessage || messageText || (status === 401 ? "请先登录" : "请求失败"),
    code: codeValue ?? status,
  };
}

async function parseApiBody<T>(response: Response): Promise<ApiEnvelope<T> | ApiError | null> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return null;
  }

  try {
    return (await response.json()) as ApiEnvelope<T> | ApiError;
  } catch {
    return null;
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  const token = getAccessToken();
  const method = (init.method ?? "GET").toUpperCase();
  const apiBaseLabel = getApiBaseUrlLabel();
  const requestUrl = buildApiUrl(path);

  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }

  if (init.body && !(init.body instanceof FormData) && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const controller = new AbortController();
  const upstreamSignal = init.signal;
  const abortFromUpstream = () => controller.abort();

  if (upstreamSignal) {
    if (upstreamSignal.aborted) {
      controller.abort();
    } else {
      upstreamSignal.addEventListener("abort", abortFromUpstream, { once: true });
    }
  }

  const timeoutId = globalThis.setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  let response: Response;
  try {
    if (shouldLogRequest(path)) {
      logDebugProbe("api", "开始请求鉴权接口", { path, method, apiBase: apiBaseLabel, requestUrl });
    }

    response = await fetch(requestUrl, {
      ...init,
      headers,
      cache: init.cache ?? "no-store",
      signal: controller.signal,
    });
  } catch (error) {
    if (upstreamSignal) {
      upstreamSignal.removeEventListener("abort", abortFromUpstream);
    }
    globalThis.clearTimeout(timeoutId);

    if (error instanceof Error && error.name === "AbortError") {
      logDebugProbe("api", "接口请求超时", { path, method, apiBase: apiBaseLabel, requestUrl });
      throw createApiError(`Request timed out. Verify the backend is reachable at ${apiBaseLabel}.`, 408, 408);
    }

    logDebugProbe("api", "接口请求失败", { path, method, apiBase: apiBaseLabel, requestUrl });
    throw createApiError(`Unable to reach the backend service at ${apiBaseLabel}.`);
  }

  if (upstreamSignal) {
    upstreamSignal.removeEventListener("abort", abortFromUpstream);
  }
  globalThis.clearTimeout(timeoutId);

  const body = await parseApiBody<T>(response);

  if (!response.ok) {
    const { message, code } = getApiErrorInfo(body, response.status);

    logDebugProbe("api", "接口返回异常状态", {
      path,
      method,
      status: response.status,
      message,
      apiBase: apiBaseLabel,
      requestUrl,
    });

    if (response.status === 401) {
      clearAccessToken();
    }

    throw createApiError(message, response.status, code);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  if (!body || !("data" in body)) {
    logDebugProbe("api", "接口返回体格式异常", {
      path,
      method,
      status: response.status,
      apiBase: apiBaseLabel,
      requestUrl,
    });
    throw createApiError("Invalid API response payload.", response.status, response.status);
  }

  if (shouldLogRequest(path)) {
    logDebugProbe("api", "鉴权接口请求成功", {
      path,
      method,
      status: response.status,
      apiBase: apiBaseLabel,
      requestUrl,
    });
  }

  return body.data as T;
}
