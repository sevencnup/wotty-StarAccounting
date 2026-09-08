"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { JournalPanel } from "@/components/stark/JournalPanel";

export function JournalRoute({ variant }: { variant?: "journal" | "savings" | "asset" | "loan" }) {
  const router = useRouter();
  const [resolvedVariant, setResolvedVariant] = useState<"journal" | "savings" | "asset" | "loan" | null>(variant ?? null);
  const [preset, setPreset] = useState<{ type: "INCOME"; category: "工资" } | undefined>(() => (
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("preset") === "salary"
      ? { type: "INCOME", category: "工资" }
      : undefined
  ));

  useEffect(() => {
    if (variant) {
      setResolvedVariant(variant);
      setPreset(undefined);
      return;
    }
    setResolvedVariant(window.sessionStorage.getItem("stark:journal-variant") === "savings" ? "savings" : "journal");
    setPreset(new URLSearchParams(window.location.search).get("preset") === "salary"
      ? { type: "INCOME", category: "工资" }
      : undefined);
  }, [variant]);

  if (!resolvedVariant) return null;

  function closePanel() {
    if (resolvedVariant === "savings") {
      router.replace("/savings");
      return;
    }
    router.back();
  }

  return <JournalPanel mode="page" variant={resolvedVariant} preset={preset} onClose={closePanel} onSaved={closePanel} />;
}
