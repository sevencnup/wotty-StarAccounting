"use client";

import { HomeDashboard } from "@/app/(tabs)/page";
import { BudgetManagementRouteSheet } from "@/components/stark/BudgetManagementRouteSheet";

export default function BudgetsPage() {
  return (
    <>
      <HomeDashboard />
      <BudgetManagementRouteSheet />
    </>
  );
}
