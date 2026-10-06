"use client";

import { useCallback, useState } from "react";
import { usePathname } from "next/navigation";
import { MobileBottomNav } from "@/components/stark/MobileBottomNav";
import { LazyJournalPanel as JournalPanel, preloadJournalPanel } from "@/components/stark/LazyJournalPanel";
import { useLayeredHistoryMarker } from "@/components/stark/useLayeredHistoryMarker";

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const isJournalRoute = pathname.startsWith("/app/journal");
  const isSavingsRoute = pathname.startsWith("/app/savings");
  const isAssetsRoute = pathname.startsWith("/app/assets");
  const isLoansRoute = pathname.startsWith("/app/loans");
  const isSettingsRoute = pathname.startsWith("/app/accounts");
  const [journalVariant, setJournalVariant] = useState<"journal" | "savings" | "asset" | "loan" | null>(null);
  const dismissJournal = useCallback(() => setJournalVariant(null), []);
  const consumeJournalHistory = useLayeredHistoryMarker(Boolean(journalVariant), "starkJournal", dismissJournal);

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
      {!isJournalRoute ? (
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
