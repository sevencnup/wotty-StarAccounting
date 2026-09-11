"use client";

import { useEffect, useState } from "react";
import { JournalPanel } from "@/components/stark/JournalPanel";

export function JournalRoute({ variant }: { variant?: "journal" | "savings" | "asset" | "loan" }) {
  const [resolvedVariant, setResolvedVariant] = useState<"journal" | "savings" | "asset" | "loan" | null>(variant ?? null);
  const [preset, setPreset] = useState<{ type: "INCOME"; category: "工资" } | undefined>(() => (
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("preset") === "salary"
      ? { type: "INCOME", category: "工资" }
      : undefined
  ));
  const [savingsGoalId, setSavingsGoalId] = useState<string | undefined>(() => {
    if (typeof window === "undefined" || variant !== "savings") return undefined;
    return new URLSearchParams(window.location.search).get("goalId") || undefined;
  });

  useEffect(() => {
    if (variant) {
      setResolvedVariant(variant);
      setPreset(undefined);
      setSavingsGoalId(variant === "savings" ? new URLSearchParams(window.location.search).get("goalId") || undefined : undefined);
      return;
    }
    setResolvedVariant(window.sessionStorage.getItem("stark:journal-variant") === "savings" ? "savings" : "journal");
    setPreset(new URLSearchParams(window.location.search).get("preset") === "salary"
      ? { type: "INCOME", category: "工资" }
      : undefined);
    setSavingsGoalId(undefined);
  }, [variant]);

  if (!resolvedVariant) return null;

  function closePanel() {
    if (resolvedVariant === "savings") {
      window.location.replace("/savings/");
      return;
    }
    window.history.back();
  }

  return <JournalPanel mode="page" variant={resolvedVariant} preset={preset} savingsGoalId={savingsGoalId} onClose={closePanel} onSaved={closePanel} />;
}
