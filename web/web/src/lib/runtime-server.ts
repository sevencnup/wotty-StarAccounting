export const DEFAULT_API_BASE_URL = "";

const NATIVE_SERVER_URL_STORAGE_KEY = "wotty_native_api_base_url";
const NATIVE_SERVER_URL_CHANGE_EVENT = "wotty:native-server-url-change";

type NativeServerChangeDetail = {
  previousUrl: string;
  nextUrl: string;
};

type NativeDefaultSource = "env" | "bridge" | "window-origin" | "fallback";

type NativeRuntimeWindow = Window & {
  WEBVIEW_SERVER_URL?: string;
  Capacitor?: {
    isNativePlatform?: () => boolean;
    getServerUrl?: () => string;
  };
};

export type NativeServerDebugInfo = {
  storedUrl: string | null;
  activeUrl: string;
  defaultUrl: string;
  envUrl: string | null;
  bridgeUrl: string | null;
  windowOrigin: string | null;
  defaultSource: NativeDefaultSource;
  usingDefault: boolean;
};

export function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.trim().replace(/\/$/, "");
}

function getEnvironmentApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL;
}

function getNativeEnvironmentApiBaseUrl() {
  return process.env.NEXT_PUBLIC_NATIVE_DEFAULT_API_BASE_URL;
}

function getNormalizedEnvironmentApiBaseUrl() {
  const envBaseUrl = getEnvironmentApiBaseUrl();
  return envBaseUrl?.trim() ? normalizeBaseUrl(envBaseUrl) : null;
}

function getNormalizedNativeEnvironmentApiBaseUrl() {
  const envBaseUrl = getNativeEnvironmentApiBaseUrl();
  return envBaseUrl?.trim() ? normalizeBaseUrl(envBaseUrl) : null;
}

function normalizeHostname(hostname: string) {
  return hostname.replace(/^\[|\]$/g, "").toLowerCase();
}

export function isLocalHostname(hostname: string) {
  const value = normalizeHostname(hostname);
  return value === "localhost" || value === "127.0.0.1" || value === "0.0.0.0" || value === "::1";
}

function isIpv4Hostname(hostname: string) {
  return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(normalizeHostname(hostname));
}

function shouldUseHttpByDefault(hostname: string) {
  const value = normalizeHostname(hostname);
  return isLocalHostname(value) || isIpv4Hostname(value) || value.endsWith(".local");
}

function getNativeRuntimeWindow() {
  if (typeof window === "undefined") {
    return null;
  }

  return window as NativeRuntimeWindow;
}

function normalizeRuntimeUrl(rawValue?: string | null) {
  if (!rawValue?.trim()) {
    return null;
  }

  try {
    return normalizeBaseUrl(new URL(rawValue).origin);
  } catch {
    return null;
  }
}

function migrateLegacyNativeServerUrl(rawValue: string) {
  const normalizedValue = normalizeBaseUrl(rawValue);

  try {
    const parsedUrl = new URL(normalizedValue);
    const looksLikeLegacyFrontendServer =
      parsedUrl.port === "3000" &&
      (isLocalHostname(parsedUrl.hostname) || isIpv4Hostname(parsedUrl.hostname) || parsedUrl.hostname.endsWith(".local")) &&
      (parsedUrl.pathname === "/" || parsedUrl.pathname === "");

    if (!looksLikeLegacyFrontendServer) {
      return normalizedValue;
    }

    parsedUrl.port = "3006";
    return normalizeBaseUrl(parsedUrl.origin);
  } catch {
    return normalizedValue;
  }
}

export function isNativeAppRuntime() {
  const nativeWindow = getNativeRuntimeWindow();
  if (!nativeWindow) {
    return false;
  }

  return Boolean(
    nativeWindow.Capacitor?.isNativePlatform?.() ||
    nativeWindow.Capacitor?.getServerUrl?.() ||
    nativeWindow.WEBVIEW_SERVER_URL
  );
}

function getNativeBridgeServerUrl() {
  const nativeWindow = getNativeRuntimeWindow();
  if (!nativeWindow) {
    return null;
  }

  const runtimeUrl = normalizeRuntimeUrl(
    nativeWindow.Capacitor?.getServerUrl?.() ?? nativeWindow.WEBVIEW_SERVER_URL ?? null
  );

  if (!runtimeUrl) {
    return null;
  }

  try {
    return isLocalHostname(new URL(runtimeUrl).hostname) ? null : runtimeUrl;
  } catch {
    return null;
  }
}

function getNativeWindowOriginUrl() {
  const nativeWindow = getNativeRuntimeWindow();
  if (!nativeWindow) {
    return null;
  }

  const runtimeOrigin = normalizeRuntimeUrl(nativeWindow.location.origin);
  if (!runtimeOrigin) {
    return null;
  }

  try {
    return isLocalHostname(new URL(runtimeOrigin).hostname) ? null : runtimeOrigin;
  } catch {
    return null;
  }
}

function resolveNativeDefaultApiBaseUrl() {
  const envUrl = getNormalizedNativeEnvironmentApiBaseUrl();
  const bridgeUrl = getNativeBridgeServerUrl();
  const windowOrigin = getNativeWindowOriginUrl();

  if (envUrl) {
    return {
      url: envUrl,
      source: "env" as const,
      envUrl,
      bridgeUrl,
      windowOrigin,
    };
  }

  if (bridgeUrl) {
    return {
      url: bridgeUrl,
      source: "bridge" as const,
      envUrl: null,
      bridgeUrl,
      windowOrigin,
    };
  }

  if (windowOrigin) {
    return {
      url: windowOrigin,
      source: "window-origin" as const,
      envUrl: null,
      bridgeUrl,
      windowOrigin,
    };
  }

  return {
    url: DEFAULT_API_BASE_URL,
    source: "fallback" as const,
    envUrl: null,
    bridgeUrl,
    windowOrigin,
  };
}

export function getNativeDefaultApiBaseUrl() {
  return resolveNativeDefaultApiBaseUrl().url;
}

export function hasConfiguredNativeServerUrl() {
  return Boolean(getActiveNativeServerUrl());
}

function inferServerUrl(rawValue: string) {
  const trimmedValue = rawValue.trim();
  if (!trimmedValue) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmedValue)) {
    return trimmedValue;
  }

  const hostCandidate = trimmedValue.split("/")[0] ?? trimmedValue;
  const hostname = hostCandidate.split(":")[0] ?? hostCandidate;
  const protocol = shouldUseHttpByDefault(hostname) ? "http" : "https";

  return `${protocol}://${trimmedValue}`;
}

export function normalizeServerUrlInput(rawValue: string) {
  const inferredValue = inferServerUrl(rawValue);

  if (!inferredValue) {
    throw new Error("请输入服务器地址，例如 https://demo.example.com 或 http://192.168.1.20:3006");
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(inferredValue);
  } catch {
    throw new Error("服务器地址格式不正确，请输入完整域名或 IP 地址");
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new Error("服务器地址只支持 http 或 https 协议");
  }

  if (parsedUrl.username || parsedUrl.password) {
    throw new Error("服务器地址中不需要包含账号和密码");
  }

  return normalizeBaseUrl(parsedUrl.origin);
}

export function getStoredNativeServerUrl() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedValue = window.localStorage.getItem(NATIVE_SERVER_URL_STORAGE_KEY);
    if (!storedValue?.trim()) {
      return null;
    }

    const migratedValue = migrateLegacyNativeServerUrl(storedValue);
    if (migratedValue !== normalizeBaseUrl(storedValue)) {
      window.localStorage.setItem(NATIVE_SERVER_URL_STORAGE_KEY, migratedValue);
    }

    return migratedValue;
  } catch {
    return null;
  }
}

export function isUsingDefaultNativeServerUrl() {
  return !getStoredNativeServerUrl();
}

export function getActiveNativeServerUrl() {
  return getStoredNativeServerUrl() ?? getNativeDefaultApiBaseUrl();
}

export function getNativeServerDebugInfo(): NativeServerDebugInfo {
  const storedUrl = getStoredNativeServerUrl();
  const resolvedDefault = resolveNativeDefaultApiBaseUrl();
  const activeUrl = storedUrl ?? resolvedDefault.url;

  return {
    storedUrl,
    activeUrl,
    defaultUrl: resolvedDefault.url,
    envUrl: resolvedDefault.envUrl,
    bridgeUrl: resolvedDefault.bridgeUrl,
    windowOrigin: resolvedDefault.windowOrigin,
    defaultSource: resolvedDefault.source,
    usingDefault: !storedUrl,
  };
}

function dispatchNativeServerChange(previousUrl: string, nextUrl: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<NativeServerChangeDetail>(NATIVE_SERVER_URL_CHANGE_EVENT, {
      detail: { previousUrl, nextUrl },
    })
  );
}

export function setStoredNativeServerUrl(rawValue: string | null) {
  const defaultUrl = getNativeDefaultApiBaseUrl();
  const normalizedInput = rawValue?.trim() ? normalizeServerUrlInput(rawValue) : "";
  const nextUrl = normalizedInput && normalizedInput !== defaultUrl ? normalizedInput : defaultUrl;

  if (typeof window !== "undefined") {
    const previousUrl = getActiveNativeServerUrl();

    try {
      if (nextUrl === defaultUrl) {
        window.localStorage.removeItem(NATIVE_SERVER_URL_STORAGE_KEY);
      } else {
        window.localStorage.setItem(NATIVE_SERVER_URL_STORAGE_KEY, nextUrl);
      }
    } catch {
      // 存储失败时仍然返回解析后的地址，让调用方能给出明确提示。
    }

    if (previousUrl !== nextUrl) {
      dispatchNativeServerChange(previousUrl, nextUrl);
    }
  }

  return nextUrl;
}

export function subscribeNativeServerUrlChange(listener: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleChange = () => listener();
  window.addEventListener(NATIVE_SERVER_URL_CHANGE_EVENT, handleChange as EventListener);

  return () => {
    window.removeEventListener(NATIVE_SERVER_URL_CHANGE_EVENT, handleChange as EventListener);
  };
}

function getUrlPort(url: URL) {
  if (url.port) {
    return url.port;
  }

  return url.protocol === "https:" ? "443" : "80";
}

function resolveBrowserApiBaseUrl(envBaseUrl?: string) {
  if (isNativeAppRuntime()) {
    return getActiveNativeServerUrl();
  }

  const { protocol, hostname } = window.location;
  const isBrowserLocal = isLocalHostname(hostname);

  if (!envBaseUrl?.trim()) {
    return isBrowserLocal ? `${protocol}//${hostname}:3006` : "";
  }

  const normalizedBaseUrl = normalizeBaseUrl(envBaseUrl);

  try {
    const configuredUrl = new URL(normalizedBaseUrl);

    if (isLocalHostname(configuredUrl.hostname) && !isBrowserLocal) {
      if (process.env.NODE_ENV === "development") {
        return `${configuredUrl.protocol}//${hostname}:${getUrlPort(configuredUrl)}`;
      }

      // 部署后的浏览器统一走同域 `/api` 反向代理，避免暴露裸端口。
      return "";
    }
  } catch {
    return normalizedBaseUrl;
  }

  return normalizedBaseUrl;
}

export function resolveApiBaseUrl() {
  const envBaseUrl = getEnvironmentApiBaseUrl();

  if (typeof window === "undefined") {
    return envBaseUrl?.trim() ? normalizeBaseUrl(envBaseUrl) : DEFAULT_API_BASE_URL;
  }

  return resolveBrowserApiBaseUrl(envBaseUrl);
}

export function getApiBaseUrlLabel() {
  const resolvedBaseUrl = resolveApiBaseUrl();
  if (resolvedBaseUrl) {
    return resolvedBaseUrl;
  }

  return isNativeAppRuntime() ? "未配置服务器" : "same-origin /api";
}

export function getApiScopeKey() {
  const apiBaseUrl = resolveApiBaseUrl();
  if (apiBaseUrl) {
    return `url::${apiBaseUrl}`;
  }

  if (typeof window !== "undefined") {
    return `origin::${window.location.origin}`;
  }

  return "default";
}
