export const BACKGROUND_NAVIGATION_RECOVERY_MS = 60_000;
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

export function planTabNavigation(path: string, recovering: boolean) {
  return {
    // Main tabs are peers, not a drill-down route hierarchy. Replacing the
    // current entry keeps Android edge-back from walking through every tab.
    mode: recovering ? "reload" as const : "replace" as const,
    target: appRoute(path),
  };
}

export function planBackgroundResume(
  backgroundedAt: number | null,
  resumedAt: number,
  restoredFromPageCache = false,
) {
  return shouldRecoverNavigation(backgroundedAt, resumedAt, restoredFromPageCache)
    ? { mode: "reload-current" as const }
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
