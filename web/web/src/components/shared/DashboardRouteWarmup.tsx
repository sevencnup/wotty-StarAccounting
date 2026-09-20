"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/components/shared/theme-provider";
import { getNavigationPrefetchPlan, warmNavigationRoute } from "@/components/shared/navigation-warmup";

type IdleCallbackHandle = {
  type: "idle" | "timeout";
  id: number;
};

type IdleDeadlineLike = {
  didTimeout: boolean;
  timeRemaining: () => number;
};

type IdleWindow = Window & {
  requestIdleCallback?: (
    callback: (deadline: IdleDeadlineLike) => void,
    options?: { timeout: number },
  ) => number;
  cancelIdleCallback?: (id: number) => void;
};

type NetworkInformationLike = {
  saveData?: boolean;
  effectiveType?: string;
};

function scheduleWhenIdle(callback: () => void, timeoutMs: number): IdleCallbackHandle {
  const idleWindow = window as IdleWindow;
  if (idleWindow.requestIdleCallback) {
    const requestIdleCallbackFn = idleWindow.requestIdleCallback;

    return {
      type: "idle",
      id: requestIdleCallbackFn(() => callback(), { timeout: timeoutMs }),
    };
  }

  return {
    type: "timeout",
    id: window.setTimeout(callback, timeoutMs),
  };
}

function cancelScheduledTask(handle?: IdleCallbackHandle) {
  if (!handle) return;

  const idleWindow = window as IdleWindow;
  if (handle.type === "idle" && idleWindow.cancelIdleCallback) {
    const cancelIdleCallbackFn = idleWindow.cancelIdleCallback;
    cancelIdleCallbackFn(handle.id);
    return;
  }

  window.clearTimeout(handle.id);
}

function getNetworkProfile() {
  const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
  return {
    saveData: Boolean(connection?.saveData),
    effectiveType: connection?.effectiveType ?? "",
  };
}

export function DashboardRouteWarmup() {
  const router = useRouter();
  const pathname = usePathname();
  const { themeId } = useTheme();

  useEffect(() => {
    const { saveData, effectiveType } = getNetworkProfile();
    const { primaryRoutes, secondaryRoutes } = getNavigationPrefetchPlan(pathname, themeId);
    const allowSecondaryRoutes = !saveData && !["slow-2g", "2g", "3g"].includes(effectiveType);
    const queue = allowSecondaryRoutes ? [...primaryRoutes, ...secondaryRoutes] : primaryRoutes;

    let cancelled = false;
    let nextTask: IdleCallbackHandle | undefined;
    let index = 0;

    const warmNextRoute = () => {
      if (cancelled || index >= queue.length) {
        return;
      }

      const href = queue[index];
      index += 1;

      warmNavigationRoute({ href, themeId, router });

      const isStillPrimaryRoute = index < primaryRoutes.length;
      nextTask = scheduleWhenIdle(warmNextRoute, isStillPrimaryRoute ? 160 : 420);
    };

    nextTask = scheduleWhenIdle(warmNextRoute, 180);

    return () => {
      cancelled = true;
      cancelScheduledTask(nextTask);
    };
  }, [pathname, router, themeId]);

  return null;
}
