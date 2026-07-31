"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { JournalPanel } from "@/components/stark/JournalPanel";

export function JournalRoute({ variant }: { variant?: "journal" | "savings" }) {
  const router = useRouter();
  const [resolvedVariant, setResolvedVariant] = useState<"journal" | "savings" | null>(variant ?? null);

  useEffect(() => {
    if (variant) {
      setResolvedVariant(variant);
      return;
    }
    setResolvedVariant(window.sessionStorage.getItem("stark:journal-variant") === "savings" ? "savings" : "journal");
  }, [variant]);

  if (!resolvedVariant) return null;

  function closePanel() {
    if (resolvedVariant === "savings") {
      router.replace("/savings");
      return;
    }
    router.back();
  }

  return <JournalPanel mode="page" variant={resolvedVariant} onClose={closePanel} onSaved={closePanel} />;
}
