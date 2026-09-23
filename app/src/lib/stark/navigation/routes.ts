export const BACKGROUND_NAVIGATION_RECOVERY_MS = 60_000;

export function appRoute(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return normalized.endsWith("/") ? normalized : `${normalized}/`;
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
