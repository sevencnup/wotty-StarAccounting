"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { appRoute, planBackgroundResume } from "@/lib/stark/navigation/routes";
import { createTabNavigation } from "@/lib/stark/navigation/tab-navigation";
import { isNativeAppRuntime } from "@/lib/stark/storage/local-config";

const BACKGROUNDED_AT_STORAGE_KEY = "wotty:navigation-backgrounded-at";

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
  const [pendingTarget, setPendingTarget] = useState<string | null>(null);
  const navigationRef = useRef<ReturnType<typeof createTabNavigation> | null>(null);
  const lifecycleRef = useRef(0);
  const routerRef = useRef(router);
  const backgroundedAtRef = useRef<number | null>(null);
  const restartStartedRef = useRef(false);
  routerRef.current = router;

  const getNavigation = useCallback(() => {
    if (navigationRef.current) return navigationRef.current;
    const navigation = createTabNavigation({
      now: Date.now,
      schedule: (callback, delay) => window.setTimeout(callback, delay),
      cancel: (timer) => window.clearTimeout(timer),
      // Native App routes are bundled locally and can recover while offline.
      canRecover: () => document.visibilityState === "visible" && (navigator.onLine || isNativeAppRuntime()),
      replace: (target) => routerRef.current.replace(target),
      replaceDocument: (target) => window.location.replace(target),
      onPendingChange: setPendingTarget,
    });
    navigationRef.current = navigation;
    return navigation;
  }, []);

  useEffect(() => {
    const markBackgrounded = () => {
      const backgroundedAt = Date.now();
      backgroundedAtRef.current = backgroundedAt;
      persistBackgroundedAt(backgroundedAt);
    };
    const markResumed = (restoredFromPageCache = false) => {
      const resume = planBackgroundResume(
        backgroundedAtRef.current,
        Date.now(),
        window.location.pathname,
        window.location.search,
        window.location.hash,
        restoredFromPageCache,
      );
      backgroundedAtRef.current = null;
      persistBackgroundedAt(null);
      if (resume.mode === "restart" && !restartStartedRef.current) {
        restartStartedRef.current = true;
        // Capacitor serves its static root document reliably, while a direct
        // document navigation to a nested Next route may fall back to root.
        // The access gate consumes this recovery URL and client-navigates back
        // to the original tab with a fresh Next router.
        window.location.replace(resume.target);
      }
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") markBackgrounded();
      else if (document.visibilityState === "visible") markResumed();
    };
    const handlePageShow = (event: PageTransitionEvent) => markResumed(event.persisted);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", markBackgrounded);
    window.addEventListener("pageshow", handlePageShow);
    backgroundedAtRef.current = readPersistedBackgroundedAt();
    if (document.visibilityState === "visible") markResumed();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", markBackgrounded);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  useEffect(() => {
    const lifecycle = ++lifecycleRef.current;
    const navigation = getNavigation();
    document.addEventListener("visibilitychange", navigation.resume);
    window.addEventListener("pageshow", navigation.resume);
    window.addEventListener("online", navigation.resume);
    navigation.resume();

    return () => {
      document.removeEventListener("visibilitychange", navigation.resume);
      window.removeEventListener("pageshow", navigation.resume);
      window.removeEventListener("online", navigation.resume);
      // Strict Mode replays effects after mount. Keep an already received
      // first tap alive across that replay; still dispose on a real unmount.
      queueMicrotask(() => {
        if (lifecycleRef.current !== lifecycle) return;
        navigation.dispose();
        navigationRef.current = null;
      });
    };
  }, [getNavigation]);

  useEffect(() => {
    // A changed address bar alone is not proof that the rendered route arrived.
    navigationRef.current?.committed(pathname);
  }, [pathname]);

  return (
    <nav className="mobile-bottom-nav" aria-label="主导航" aria-busy={pendingTarget !== null}>
      <div className="mobile-bottom-nav-inner">
        {NAV_ITEMS.map((item) => {
          const target = appRoute(item.href);
          const active = item.href === "/app"
            ? pathname === "/app" || pathname === "/app/" || pathname.startsWith("/app/budgets")
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={target}
              // Main tabs are peers. Do not make an edge-back gesture walk
              // through each prior tab; overlays and detail routes retain
              // their own history entries.
              replace
              // Forced full prefetch uses dynamic RSC requests in Next 16.
              // Auto prefetch reads the files emitted by our static export.
              prefetch="auto"
              className={`mobile-bottom-nav-item${active ? " active" : ""}${pendingTarget === target ? " is-pending" : ""}`}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              onNavigate={(event) => {
                // Next invokes this only for same-tab client navigation;
                // modified clicks and opening a new tab keep native behavior.
                event.preventDefault();
                // A first tap can arrive before passive mount effects run.
                getNavigation().select(target, pathname);
              }}
            >
              <Image src={item.icon} alt="" width={24} height={24} className={active ? "mobile-bottom-nav-icon active" : "mobile-bottom-nav-icon"} />
            </Link>
          );
        })}
      </div>
      <span className="sr-only" role="status">
        {pendingTarget ? `正在切换到${NAV_ITEMS.find((item) => appRoute(item.href) === pendingTarget)?.label ?? "目标页面"}` : ""}
      </span>
    </nav>
  );
}
