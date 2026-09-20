import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { preloadAssetsData } from "@/features/assets/data-loader";
import { preloadConsumptionData } from "@/features/consumption/data-loader";
import { preloadDashboardData } from "@/features/dashboard/data-loader";
import { preloadLoansData } from "@/features/loans/data-loader";
import { preloadSavingsData } from "@/features/savings/data-loader";
import { preloadDashboardThemeComponent } from "@/themes/dashboard-registry";
import { isDashboardRoutePath } from "@/themes/dashboard-routes";
import type { ThemeId } from "@/themes/registry";
import { NAV_ITEMS, normalizeNavigationPath, resolveNavigationHref } from "@/components/shared/navigation";

const PRIMARY_ROUTE_ORDER = ["/", "/consumption", "/assets"];

const ROUTE_DATA_PRELOADERS: Partial<Record<string, () => void>> = {
  "/": preloadDashboardData,
  "/assets/": () => preloadAssetsData("CNY"),
  "/consumption/": () => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0).toISOString();
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();
    const compareStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0).toISOString();
    const compareEndDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999).toISOString();

    preloadConsumptionData({
      startDate,
      endDate,
      compareStartDate,
      compareEndDate,
      bucketMode: "day",
    });
  },
  "/savings/": preloadSavingsData,
  "/loans/": preloadLoansData,
};

const ROUTE_COMPONENT_PRELOADERS: Partial<Record<string, () => void>> = {
  "/assets/": () => {
    void import("@/features/assets/components/themes/DefaultAssets");
  },
  "/consumption/": () => {
    void import("@/features/consumption/components/ConsumptionDefaultTheme");
  },
  "/savings/": () => {
    void import("@/features/savings/components/themes/DefaultSavings");
  },
  "/loans/": () => {
    void import("@/features/loans/components/themes/DefaultLoans");
  },
};

const warmedRouteKeys = new Set<string>();
const compiledRouteKeys = new Set<string>();

function getWarmRouteKey(href: string, themeId: ThemeId) {
  if (isDashboardRoutePath(href)) {
    return `dashboard:${themeId}:${href}`;
  }

  return href;
}

export function getNavigationPrefetchPlan(pathname: string, themeId: ThemeId) {
  const allRoutes = NAV_ITEMS.map((item) => resolveNavigationHref(item.href, themeId));
  const primaryRoutes = PRIMARY_ROUTE_ORDER
    .map((href) => resolveNavigationHref(href, themeId))
    .filter((href, index, routes) => href !== pathname && routes.indexOf(href) === index);
  const secondaryRoutes = allRoutes.filter((href) => href !== pathname && !primaryRoutes.includes(href));

  return { primaryRoutes, secondaryRoutes };
}

export function warmNavigationRoute({
  href,
  themeId,
  router,
}: {
  href: string;
  themeId: ThemeId;
  router?: AppRouterInstance;
}) {
  router?.prefetch(href);

  const key = getWarmRouteKey(href, themeId);
  if (warmedRouteKeys.has(key)) {
    return;
  }
  warmedRouteKeys.add(key);

  const normalizedHref = normalizeNavigationPath(href);
  const dataPreloader = isDashboardRoutePath(normalizedHref) ? preloadDashboardData : ROUTE_DATA_PRELOADERS[normalizedHref];
  const componentPreloader = isDashboardRoutePath(href)
    ? () => preloadDashboardThemeComponent(themeId)
    : ROUTE_COMPONENT_PRELOADERS[normalizedHref];

  dataPreloader?.();
  componentPreloader?.();

  if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
    const compileKey = `compile:${key}`;
    if (compiledRouteKeys.has(compileKey)) {
      return;
    }
    compiledRouteKeys.add(compileKey);

    const warmUrl = new URL(href, window.location.origin);
    void fetch(warmUrl.toString(), {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
      headers: {
        "x-wotty-route-warmup": "1",
      },
    }).catch(() => {
      compiledRouteKeys.delete(compileKey);
    });
  }
}
