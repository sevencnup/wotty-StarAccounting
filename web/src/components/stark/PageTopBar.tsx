"use client";

import type { PropsWithChildren } from "react";

type IconProps = { size?: number; color?: string; strokeWidth?: number };

function IconBase({ children, size = 24, color = "currentColor", strokeWidth = 2 }: PropsWithChildren<IconProps>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

function SearchIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4 4" />
    </IconBase>
  );
}

function BellIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </IconBase>
  );
}

function HeaderAction({ children, label }: PropsWithChildren<{ label: string }>) {
  return (
    <button type="button" className="home-header-action" aria-label={label} title={label}>
      {children}
    </button>
  );
}

function BellAction() {
  return (
    <HeaderAction label="通知">
      <BellIcon size={28} strokeWidth={1.9} />
      <span className="home-bell-dot" />
    </HeaderAction>
  );
}

export function PageTopBar({ title }: { title: string }) {
  return (
    <header className="home-topbar">
      <span />
      <h1>{title}</h1>
      <div className="home-actions">
        <HeaderAction label="搜索"><SearchIcon size={24} strokeWidth={1.8} /></HeaderAction>
        <BellAction />
      </div>
    </header>
  );
}
