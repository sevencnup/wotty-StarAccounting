"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

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
