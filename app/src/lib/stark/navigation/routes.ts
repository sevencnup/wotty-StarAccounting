export const PRIMARY_TAB_PATHS = [
  "/app",
  "/app/consumption",
  "/app/savings",
  "/app/loans",
  "/app/assets",
  "/app/accounts",
] as const;

export const BACKGROUND_NAVIGATION_RECOVERY_MS = 60_000;

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

export function navigationRecoveryUrl(pathname: string, search = "", hash = "") {
  const target = `${appRoute(pathname)}${search}${hash}`;
  return `/?next=${encodeURIComponent(target)}&resume-navigation=1`;
}

export function planBackgroundResume(
  backgroundedAt: number | null,
  resumedAt: number,
  pathname: string,
  search = "",
  hash = "",
  restoredFromPageCache = false,
) {
  return shouldRecoverNavigation(backgroundedAt, resumedAt, restoredFromPageCache)
    ? { mode: "restart" as const, target: navigationRecoveryUrl(pathname, search, hash) }
    : { mode: "none" as const };
}

export function shouldRecoverNavigation(
  backgroundedAt: number | null,
  resumedAt: number,
  restoredFromPageCache = false,
) {
  if (restoredFromPageCache) return true;
  if (backgroundedAt === null) return false;
  return resumedAt - backgroundedAt >= BACKGROUND_NAVIGATION_RECOVERY_MS;
}
