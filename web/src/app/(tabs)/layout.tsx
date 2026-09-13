"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MobileBottomNav } from "@/components/stark/MobileBottomNav";
import { JournalPanel } from "@/components/stark/JournalPanel";

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const isJournalRoute = pathname.startsWith("/journal");
  const isSavingsRoute = pathname.startsWith("/savings");
  const isAssetsRoute = pathname.startsWith("/assets");
  const isLoansRoute = pathname.startsWith("/loans");
  const isSettingsRoute = pathname.startsWith("/accounts");
  const [journalVariant, setJournalVariant] = useState<"journal" | "savings" | "asset" | "loan" | null>(null);
  const journalHistoryRef = useRef(false);

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
        background: "#ffffff",
      }}
    >
      <main className="tabs-shell tabs-liquid-shell">{children}</main>
      {!isJournalRoute ? <MobileBottomNav /> : null}
      {!isJournalRoute && !isSettingsRoute && !journalVariant ? (
        <button type="button" className="global-journal-trigger" onClick={openJournal}>
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
