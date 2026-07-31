"use client";

import { PageTopBar } from "@/components/stark/PageTopBar";
import { PageSkeleton } from "@/components/stark/Skeleton";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { SavingsPlanner } from "@/components/stark/SavingsPlanner";

const repo = new DataModeManager().getRepository();
import { useEffect, useState } from "react";

export default function SavingsPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void repo.getSavingsGoals("default").finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <PageSkeleton title="储蓄" cards={3} />;

  return (
    <div className="page-stack savings-planner-page">
      <PageTopBar title="储蓄计划" />
      <SavingsPlanner />
    </div>
  );
}
