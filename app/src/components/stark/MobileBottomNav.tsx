"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { appRoute, shouldRecoverNavigation } from "@/lib/stark/navigation/routes";

const BACKGROUNDED_AT_STORAGE_KEY = "wotty:navigation-backgrounded-at";
const PENDING_NAVIGATION_STORAGE_KEY = "wotty:pending-navigation";

function readPersistedBackgroundedAt() {
  try {
    const value = Number(window.localStorage.getItem(BACKGROUNDED_AT_STORAGE_KEY));
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

function persistBackgroundedAt(value: number | null) {
  try {
    if (value === null) {
      window.localStorage.removeItem(BACKGROUNDED_AT_STORAGE_KEY);
    } else {
      window.localStorage.setItem(BACKGROUNDED_AT_STORAGE_KEY, String(value));
    }
  } catch {
    // Navigation recovery still works in memory when storage is unavailable.
  }
}

function readPendingNavigation() {
  try {
    const value = window.localStorage.getItem(PENDING_NAVIGATION_STORAGE_KEY);
    return value === "/app/" || value?.startsWith("/app/") ? value : null;
  } catch {
    return null;
  }
}

function persistPendingNavigation(value: string | null) {
  try {
    if (value === null) {
      window.localStorage.removeItem(PENDING_NAVIGATION_STORAGE_KEY);
    } else {
      window.localStorage.setItem(PENDING_NAVIGATION_STORAGE_KEY, value);
    }
  } catch {
    // A reload still restores the router even if the destination cannot be saved.
  }
}

export const NAV_ITEMS = [
  { href: "/app", label: "首页", icon: "/nav-icons/home.png" },
  { href: "/app/consumption", label: "消费", icon: "/nav-icons/Consumption.png" },
  { href: "/app/savings", label: "储蓄", icon: "/nav-icons/Savings.png" },
  { href: "/app/loans", label: "贷款", icon: "/nav-icons/loan.png" },
  { href: "/app/assets", label: "资产", icon: "/nav-icons/assets.png" },
  { href: "/app/accounts", label: "设置", icon: "/nav-icons/setup.png" },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const visiblePathname = pathname;
  const backgroundedAtRef = useRef<number | null>(null);
  const recoverOnNextNavigationRef = useRef(false);
  const visiblePathnameRef = useRef(visiblePathname);
  const recoveryTimerRef = useRef<number | null>(null);
  visiblePathnameRef.current = visiblePathname;

  useEffect(() => {
    const markBackgrounded = () => {
      const backgroundedAt = Date.now();
      backgroundedAtRef.current = backgroundedAt;
      persistBackgroundedAt(backgroundedAt);
    };
    const markResumed = (restoredFromPageCache = false) => {
      if (shouldRecoverNavigation(backgroundedAtRef.current, Date.now(), restoredFromPageCache)) {
        recoverOnNextNavigationRef.current = true;
      }
      backgroundedAtRef.current = null;
      persistBackgroundedAt(null);
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        markBackgrounded();
      } else if (document.visibilityState === "visible") {
        markResumed();
      }
    };
    const handlePageShow = (event: PageTransitionEvent) => {
      markResumed(event.persisted);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", markBackgrounded);
    window.addEventListener("pageshow", handlePageShow);

    backgroundedAtRef.current = readPersistedBackgroundedAt();
    if (document.visibilityState === "visible") markResumed();

    const pendingNavigation = readPendingNavigation();
    if (pendingNavigation) {
      persistPendingNavigation(null);
      router.replace(pendingNavigation);
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", markBackgrounded);
      window.removeEventListener("pageshow", handlePageShow);
      if (recoveryTimerRef.current !== null) window.clearTimeout(recoveryTimerRef.current);
    };
  }, [router]);

  useEffect(() => {
    const prefetchRoutes = () => {
      for (const item of NAV_ITEMS) {
        if (!visiblePathname.startsWith(item.href) || item.href === "/app") router.prefetch(item.href);
      }
    };
    const browser = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    if (browser.requestIdleCallback) {
      const handle = browser.requestIdleCallback(prefetchRoutes, { timeout: 1200 });
      return () => browser.cancelIdleCallback?.(handle);
    }
    const handle = window.setTimeout(prefetchRoutes, 250);
    return () => window.clearTimeout(handle);
  }, [router, visiblePathname]);

  return (
    <nav className="mobile-bottom-nav" aria-label="主导航">
      <div className="mobile-bottom-nav-inner">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/app"
            ? visiblePathname === "/app" || visiblePathname === "/app/" || visiblePathname.startsWith("/app/budgets")
            : visiblePathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={active ? "mobile-bottom-nav-item active" : "mobile-bottom-nav-item"}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              onPointerDown={() => router.prefetch(item.href)}
              onClick={(event) => {
                if (active) {
                  event.preventDefault();
                  return;
                }
                if (recoverOnNextNavigationRef.current) {
                  event.preventDefault();
                  recoverOnNextNavigationRef.current = false;
                  const target = appRoute(item.href);
                  router.replace(target);
                  if (recoveryTimerRef.current !== null) window.clearTimeout(recoveryTimerRef.current);
                  recoveryTimerRef.current = window.setTimeout(() => {
                    recoveryTimerRef.current = null;
                    if (appRoute(visiblePathnameRef.current) === target) return;
                    persistPendingNavigation(target);
                    window.location.replace(appRoute("/app"));
                  }, 800);
                }
              }}
            >
              <Image src={item.icon} alt="" width={24} height={24} className={active ? "mobile-bottom-nav-icon active" : "mobile-bottom-nav-icon"} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
