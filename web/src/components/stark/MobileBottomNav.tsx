"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const NAV_ITEMS = [
  { href: "/", label: "首页", icon: "/nav-icons/home.png" },
  { href: "/consumption", label: "消费", icon: "/nav-icons/Consumption.png" },
  { href: "/savings", label: "储蓄", icon: "/nav-icons/Savings.png" },
  { href: "/loans", label: "贷款", icon: "/nav-icons/loan.png" },
  { href: "/assets", label: "资产", icon: "/nav-icons/assets.png" },
  { href: "/accounts", label: "账户", icon: "/nav-icons/setup.png" },
] as const;

export function MobileBottomNav({ onNavigateStart }: { onNavigateStart?: (target: string) => void }) {
  const pathname = usePathname();

  return (
    <nav className="mobile-bottom-nav" aria-label="主导航">
      <div className="mobile-bottom-nav-inner">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={active ? "mobile-bottom-nav-item active" : "mobile-bottom-nav-item"}
              onClick={() => onNavigateStart?.(item.href)}
            >
              <Image src={item.icon} alt="" width={24} height={24} className={active ? "mobile-bottom-nav-icon active" : "mobile-bottom-nav-icon"} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
