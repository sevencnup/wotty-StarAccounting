"use client";

import { useRouter } from "next/navigation";
import { JournalPanel } from "@/components/stark/JournalPanel";

export default function JournalPage() {
  const router = useRouter();

  return <JournalPanel mode="page" onClose={() => router.back()} onSaved={() => router.back()} />;
}
