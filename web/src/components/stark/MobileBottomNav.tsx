"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const NAV_ITEMS = [
  { href: "/", label: "首页", icon: "/nav-icons/shouye.png" },
  { href: "/consumption", label: "消费", icon: "/nav-icons/xiaofei.png" },
  { href: "/savings", label: "储蓄", icon: "/nav-icons/chuxv.png" },
  { href: "/loans", label: "贷款", icon: "/nav-icons/daikuan.png" },
  { href: "/assets", label: "资产", icon: "/nav-icons/zichan.png" },
  { href: "/accounts", label: "账户", icon: "/nav-icons/zhanghu.png" },
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
