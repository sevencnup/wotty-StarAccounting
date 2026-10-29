"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BudgetManagementSheet } from "@/components/stark/BudgetManagementSheet";
import type { Budget } from "@/lib/stark/models";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { getCurrentAccountId } from "@/lib/stark/storage/local-config";

export function BudgetManagementRouteSheet() {
  const router = useRouter();
  const [manager] = useState(() => new DataModeManager());
  const [budgets, setBudgets] = useState<Budget[]>([]);

  useEffect(() => {
    let active = true;
    void manager.getRepository().getBudgets(getCurrentAccountId()).then((items) => {
      if (active) setBudgets(items);
    }).catch(() => {
      if (active) setBudgets([]);
    });
    return () => {
      active = false;
    };
  }, [manager]);

  function handleBudgetsChange(nextBudgets: Budget[]) {
    setBudgets(nextBudgets);
  }

  function closeSheet() {
    // The budget screen is a route-backed sheet, but it can also be opened
    // directly (for example after a refresh). Replacing the route avoids
    // navigating back to an empty document or an unrelated history entry.
    router.replace("/app");
  }

  return (
    <BudgetManagementSheet
      budgets={budgets}
      onBudgetsChange={handleBudgetsChange}
      onClose={closeSheet}
      historyMode="route"
    />
  );
}
