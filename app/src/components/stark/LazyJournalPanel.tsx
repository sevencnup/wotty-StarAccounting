"use client";

import dynamic from "next/dynamic";
import type { JournalPanelProps } from "@/components/stark/JournalPanel";

export const LazyJournalPanel = dynamic<JournalPanelProps>(
  () => import("@/components/stark/JournalPanel").then((module) => module.JournalPanel),
  { ssr: false, loading: () => null },
);

export function preloadJournalPanel() {
  return import("@/components/stark/JournalPanel");
}
