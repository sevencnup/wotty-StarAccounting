"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MobileBottomNav } from "@/components/stark/MobileBottomNav";
import { LazyJournalPanel as JournalPanel, preloadJournalPanel } from "@/components/stark/LazyJournalPanel";
import { useLayeredHistoryMarker } from "@/components/stark/useLayeredHistoryMarker";
import { usePrimaryTabBackGuard } from "@/components/stark/usePrimaryTabBackGuard";

const KT_HYBRID_TAB_PATHS = new Set([
  "/app",
  "/app/consumption",
  "/app/savings",
  "/app/loans",
  "/app/assets",
  "/app/accounts",
]);

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [ktHybridShell, setKtHybridShell] = useState(false);
  const tabsPrefetchedRef = useRef(false);
  usePrimaryTabBackGuard(pathname);
  const isJournalRoute = pathname.startsWith("/app/journal");
  const isSavingsRoute = pathname.startsWith("/app/savings");
  const isAssetsRoute = pathname.startsWith("/app/assets");
  const isLoansRoute = pathname.startsWith("/app/loans");
  const isSettingsRoute = pathname.startsWith("/app/accounts");
  const [journalVariant, setJournalVariant] = useState<"journal" | "savings" | "asset" | "loan" | null>(null);
  const dismissJournal = useCallback(() => setJournalVariant(null), []);
  const consumeJournalHistory = useLayeredHistoryMarker(Boolean(journalVariant), "starkJournal", dismissJournal);

  useEffect(() => {
    if (!navigator.userAgent.includes("WottyStarkKtHybrid")) return;
    setKtHybridShell(true);
    document.documentElement.classList.add("kt-hybrid-shell");
    return () => document.documentElement.classList.remove("kt-hybrid-shell");
  }, []);

  useEffect(() => {
    if (!ktHybridShell) return;
    const handleNativeTab = (event: Event) => {
      const path = (event as CustomEvent<{ path?: unknown }>).detail?.path;
      if (typeof path !== "string" || !KT_HYBRID_TAB_PATHS.has(path)) return;
      router.replace(path, { scroll: false });
    };
    window.addEventListener("stark:kt-hybrid-tab", handleNativeTab);
    return () => window.removeEventListener("stark:kt-hybrid-tab", handleNativeTab);
  }, [ktHybridShell, router]);

  useEffect(() => {
    if (!ktHybridShell || tabsPrefetchedRef.current) return;
    const timer = window.setTimeout(() => {
      tabsPrefetchedRef.current = true;
      for (const path of KT_HYBRID_TAB_PATHS) router.prefetch(path);
    }, 2500);
    return () => window.clearTimeout(timer);
  }, [ktHybridShell, router]);

  function openJournal() {
    void preloadJournalPanel();
    const variant = isLoansRoute ? "loan" : isAssetsRoute ? "asset" : isSavingsRoute ? "savings" : "journal";
    setJournalVariant(variant);
  }

  function closeJournal() {
    consumeJournalHistory();
    dismissJournal();
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        paddingTop: "env(safe-area-inset-top)",
        background: "var(--background)",
      }}
    >
      <main className="tabs-shell tabs-liquid-shell">{children}</main>
      {!isJournalRoute && !ktHybridShell ? (
        <MobileBottomNav />
      ) : null}
      {!isJournalRoute && !isSettingsRoute && !journalVariant ? (
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
          historyMode="route"
          onClose={closeJournal}
          onSaved={closeJournal}
        />
      ) : null}
    </div>
  );
}
