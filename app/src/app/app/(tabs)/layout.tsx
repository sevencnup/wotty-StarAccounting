"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MobileBottomNav } from "@/components/stark/MobileBottomNav";
import { LazyJournalPanel as JournalPanel, preloadJournalPanel } from "@/components/stark/LazyJournalPanel";
import { TabsTransitionSkeleton } from "@/components/stark/Skeleton";

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const isJournalRoute = pathname.startsWith("/app/journal");
  const isSavingsRoute = pathname.startsWith("/app/savings");
  const isAssetsRoute = pathname.startsWith("/app/assets");
  const isLoansRoute = pathname.startsWith("/app/loans");
  const isSettingsRoute = pathname.startsWith("/app/accounts");
  const [journalVariant, setJournalVariant] = useState<"journal" | "savings" | "asset" | "loan" | null>(null);
  const [navigationTarget, setNavigationTarget] = useState<string | null>(null);
  const journalHistoryRef = useRef(false);

  useEffect(() => {
    if (!navigationTarget) return;
    const reachedTarget = navigationTarget === "/app"
      ? pathname === "/app" || pathname === "/app/" || pathname.startsWith("/app/budgets")
      : pathname.startsWith(navigationTarget);
    if (reachedTarget) setNavigationTarget(null);
  }, [navigationTarget, pathname]);

  useEffect(() => {
    if (!navigationTarget) return;
    const timeout = window.setTimeout(() => setNavigationTarget(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [navigationTarget]);

  useEffect(() => {
    function handlePopState() {
      if (!journalHistoryRef.current) return;
      journalHistoryRef.current = false;
      setJournalVariant(null);
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function openJournal() {
    void preloadJournalPanel();
    const variant = isLoansRoute ? "loan" : isAssetsRoute ? "asset" : isSavingsRoute ? "savings" : "journal";
    window.history.pushState({ starkJournal: true }, "", window.location.href);
    journalHistoryRef.current = true;
    setJournalVariant(variant);
  }

  function closeJournal() {
    setJournalVariant(null);
    if (!journalHistoryRef.current) return;
    journalHistoryRef.current = false;
    window.history.back();
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        paddingTop: "env(safe-area-inset-top)",
        background: "var(--background)",
      }}
    >
      <main className="tabs-shell tabs-liquid-shell">{navigationTarget ? <TabsTransitionSkeleton /> : children}</main>
      {!isJournalRoute ? (
        <MobileBottomNav
          optimisticPathname={navigationTarget ?? undefined}
          onNavigateStart={setNavigationTarget}
        />
      ) : null}
      {!isJournalRoute && !isSettingsRoute && !journalVariant && !navigationTarget ? (
        <button type="button" className="global-journal-trigger" onPointerDown={() => void preloadJournalPanel()} onClick={openJournal}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>{isLoansRoute ? "新增贷款" : isAssetsRoute ? "新增资产" : isSavingsRoute ? "添加储蓄" : "记账"}</span>
        </button>
      ) : null}
      {journalVariant ? (
        <JournalPanel
          mode="page"
          variant={journalVariant}
          onClose={closeJournal}
          onSaved={closeJournal}
        />
      ) : null}
    </div>
  );
}
