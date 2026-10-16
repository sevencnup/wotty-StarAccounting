export const PRIMARY_TAB_PATHS = [
  "/app",
  "/app/consumption",
  "/app/savings",
  "/app/loans",
  "/app/assets",
  "/app/accounts",
] as const;

function normalizePathname(pathname: string) {
  if (!pathname) return "";
  const withLeadingSlash = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return withLeadingSlash.length > 1 ? withLeadingSlash.replace(/\/+$/, "") : withLeadingSlash;
}

export function isPrimaryTabPath(pathname: string) {
  const normalized = normalizePathname(pathname);
  return PRIMARY_TAB_PATHS.some((path) => path === normalized);
}

export function shouldRestorePrimaryTabAfterHistoryBack(
  currentPathname: string,
  restoredPathname: string,
  hasActiveLayer: boolean,
) {
  const current = normalizePathname(currentPathname);
  const restored = normalizePathname(restoredPathname);
  return !hasActiveLayer
    && current !== restored
    && isPrimaryTabPath(current)
    && isPrimaryTabPath(restored);
}

export function appRoute(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return normalized.endsWith("/") ? normalized : `${normalized}/`;
}
