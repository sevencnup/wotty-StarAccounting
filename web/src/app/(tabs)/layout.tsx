"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MobileBottomNav } from "@/components/stark/MobileBottomNav";
import { TabsTransitionSkeleton } from "@/components/stark/Skeleton";

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isJournalRoute = pathname === "/journal";
  const isSavingsRoute = pathname === "/savings";
  const hideJournalTrigger = isJournalRoute;
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const [cachedContent, setCachedContent] = useState<React.ReactNode | null>(isJournalRoute ? null : children);

  useEffect(() => {
    setPendingPath(null);
  }, [pathname]);

  useEffect(() => {
    if (!isJournalRoute) {
      setCachedContent(children);
    }
  }, [children, isJournalRoute]);

  function beginNavigation(target: string) {
    if (target === pathname || target === "/journal") return;
    setPendingPath(target);
  }

  function openJournal() {
    if (isSavingsRoute) {
      window.dispatchEvent(new Event("stark:add-savings"));
      return;
    }
    router.push("/journal");
  }

  const mainContent = pendingPath
    ? <TabsTransitionSkeleton />
    : isJournalRoute
      ? cachedContent
      : children;

  return (
    <div
      style={{
        minHeight: "100dvh",
        paddingTop: "env(safe-area-inset-top)",
        background: "#ffffff",
      }}
    >
      <main className="tabs-shell">{mainContent}</main>
      <MobileBottomNav onNavigateStart={beginNavigation} />
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
