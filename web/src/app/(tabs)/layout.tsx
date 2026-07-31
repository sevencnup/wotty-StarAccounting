"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MobileBottomNav } from "@/components/stark/MobileBottomNav";
import { TabsTransitionSkeleton } from "@/components/stark/Skeleton";

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isJournalRoute = pathname.startsWith("/journal");
  const isSavingsRoute = pathname.startsWith("/savings");
  const hideJournalTrigger = isJournalRoute;
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const lastTabContentRef = useRef<React.ReactNode | null>(null);

  if (!isJournalRoute) {
    lastTabContentRef.current = children;
  }

  useEffect(() => {
    setPendingPath(null);
  }, [pathname]);

  useEffect(() => {
    if (!pendingPath) return;
    const timer = window.setTimeout(() => setPendingPath(null), 1200);
    return () => window.clearTimeout(timer);
  }, [pendingPath]);

  function beginNavigation(target: string) {
    if (target === pathname || target === "/journal") return;
    setPendingPath(target);
  }

  function openJournal() {
    if (isSavingsRoute) {
      window.sessionStorage.setItem("stark:journal-variant", "savings");
      router.push("/journal/savings");
      return;
    }
    window.sessionStorage.removeItem("stark:journal-variant");
    router.push("/journal");
  }

  const mainContent = pendingPath
    ? <TabsTransitionSkeleton />
    : isJournalRoute
      ? lastTabContentRef.current
      : children;

  return (
    <div
      style={{
        minHeight: "100dvh",
        paddingTop: "env(safe-area-inset-top)",
        background: isJournalRoute ? "transparent" : "#ffffff",
      }}
    >
      <main className="tabs-shell">{mainContent}</main>
      {!isJournalRoute ? <MobileBottomNav onNavigateStart={beginNavigation} /> : null}
      {!hideJournalTrigger ? (
        <button type="button" className="global-journal-trigger" onClick={openJournal}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>{isSavingsRoute ? "添加储蓄" : "记账"}</span>
        </button>
      ) : null}
      {isJournalRoute ? children : null}
    </div>
  );
}
