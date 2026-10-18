export const SHOWCASE_DEMO_MODE = process.env.NEXT_PUBLIC_SHOWCASE_DEMO === "1";

export const APP_BASE_PATH = (process.env.NEXT_PUBLIC_APP_BASE_PATH ?? "").replace(/\/+$/, "");

export function withAppBasePath(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (!APP_BASE_PATH || normalized === APP_BASE_PATH || normalized.startsWith(`${APP_BASE_PATH}/`)) {
    return normalized;
  }
  return `${APP_BASE_PATH}${normalized}`;
}

export function showcaseStorageKey(key: string) {
  return SHOWCASE_DEMO_MODE ? `showcase:${key}` : key;
}
