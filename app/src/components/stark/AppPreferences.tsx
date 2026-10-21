"use client";

import { useCallback, useLayoutEffect, useEffect } from "react";
import { applyUiSettings, readUiSettings } from "@/lib/stark/storage/ui-settings";
import { resolveLocale, translateDocument } from "@/lib/stark/i18n";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { getCurrentAccountId } from "@/lib/stark/storage/local-config";
import { syncDueSubscriptionTransactions } from "@/lib/stark/subscriptions/recurring";
import { SHOWCASE_DEMO_MODE } from "@/lib/stark/runtime";

const dataManager = new DataModeManager();

export function AppPreferences() {
  const syncSubscriptions = useCallback(async () => {
    const repository = dataManager.getRepository();
    const accountId = getCurrentAccountId();
    try {
      const [user, subscriptions] = await Promise.all([
        repository.getCurrentUser(),
        repository.getSubscriptions(accountId),
      ]);
      if (!user) return;
      const created = await syncDueSubscriptionTransactions(repository, accountId, user, subscriptions);
      if (created > 0 && typeof window !== "undefined") window.dispatchEvent(new Event("stark:transaction-saved"));
    } catch {
      // 自动扣费不能阻断页面启动；下次启动或恢复时会再次尝试。
    }
  }, []);

  useEffect(() => {
    let running = false;
    const run = () => {
      if (running) return;
      running = true;
      void syncSubscriptions().finally(() => { running = false; });
    };
    run();
    const handleVisibility = () => { if (document.visibilityState === "visible") run(); };
    window.addEventListener("pageshow", run);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("stark:data-mode-changed", run);
    return () => {
      window.removeEventListener("pageshow", run);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("stark:data-mode-changed", run);
    };
  }, [syncSubscriptions]);

  useLayoutEffect(() => {
    let locale = resolveLocale(readUiSettings().language);
    let translating = false;
    const refresh = () => {
      const settings = readUiSettings();
      locale = resolveLocale(settings.language);
      applyUiSettings(settings);
      if (translating) return;
      translating = true;
      translateDocument(document.body, locale);
      translating = false;
    };
    const observer = new MutationObserver(() => {
      if (translating) return;
      translating = true;
      translateDocument(document.body, locale);
      translating = false;
    });

    applyUiSettings(readUiSettings());
    translateDocument(document.body, locale);
    document.documentElement.classList.toggle("showcase-demo", SHOWCASE_DEMO_MODE);
    // Keep the server-rendered Chinese markup from flashing before the saved
    // language has been applied and translated on the client.
    document.body.classList.add("app-ready");
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["aria-label", "title", "placeholder", "alt"],
    });
    window.addEventListener("stark:ui-settings-changed", refresh);
    return () => {
      observer.disconnect();
      window.removeEventListener("stark:ui-settings-changed", refresh);
    };
  }, []);

  return null;
}
