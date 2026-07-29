"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const NAV_ITEMS = [
  { href: "/", label: "首页", icon: "home" },
  { href: "/consumption", label: "消费", icon: "plane" },
  { href: "/savings", label: "储蓄", icon: "game" },
  { href: "/loans", label: "贷款", icon: "bank" },
  { href: "/accounts", label: "账户", icon: "user" },
] as const;

type NavIconName = (typeof NAV_ITEMS)[number]["icon"];

function NavSvg({ name, active }: { name: NavIconName; active: boolean }) {
  const color = active ? "#3485ff" : "#b9c1ce";
  const fill = active ? "#3485ff" : "#c7ced8";
  const common = { stroke: color, strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  if (name === "home") {
    return (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3.8 10.8 12 4l8.2 6.8" {...common} fill="none" />
        <path d="M6.2 10.4v8.1h4.1v-4.9h3.4v4.9h4.1v-8.1" fill={active ? "#3485ff" : "#c7ced8"} stroke={color} strokeWidth="2.2" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "plane") {
    return (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 12.6 20 5l-5.4 15-3.2-6.2L4 12.6Z" fill={fill} stroke={color} strokeWidth="2" strokeLinejoin="round" />
        <path d="m11.3 13.8 3.4-3.7" {...common} />
      </svg>
    );
  }

  if (name === "game") {
    return (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="8" fill={fill} stroke={color} strokeWidth="2" />
        <circle cx="9" cy="9.5" r="1" fill="#fff" />
        <circle cx="15" cy="9.5" r="1" fill="#fff" />
        <circle cx="9" cy="14.5" r="1" fill="#fff" />
        <circle cx="15" cy="14.5" r="1" fill="#fff" />
      </svg>
    );
  }

  if (name === "bank") {
    return (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 4.3 4.7 8.1h14.6L12 4.3Z" fill={fill} stroke={color} strokeWidth="2" strokeLinejoin="round" />
        <path d="M6.5 9.1v7.2M10.2 9.1v7.2M13.8 9.1v7.2M17.5 9.1v7.2M5 18.2h14" {...common} />
      </svg>
    );
  }

  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8.2" r="3.3" fill={fill} stroke={color} strokeWidth="2" />
      <path d="M5.5 20c.8-4 3.1-6 6.5-6s5.7 2 6.5 6" fill={active ? "#e6f0ff" : "#eef1f5"} stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="mobile-bottom-nav"
      aria-label="主导航"
    >
      <div className="mobile-bottom-nav-inner">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={active ? "mobile-bottom-nav-item active" : "mobile-bottom-nav-item"}
            >
              <NavSvg name={item.icon} active={active} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
