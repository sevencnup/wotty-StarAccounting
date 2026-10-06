export const BACKGROUND_NAVIGATION_RECOVERY_MS = 60_000;

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
