"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function ShowcaseEntryRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/app");
  }, [router]);

  return <main className="app-route-access-loading" aria-live="polite">正在打开演示账本...</main>;
}
