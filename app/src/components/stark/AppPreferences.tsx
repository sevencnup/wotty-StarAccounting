"use client";

import { useLayoutEffect } from "react";
import { applyUiSettings, readUiSettings } from "@/lib/stark/storage/ui-settings";
import { resolveLocale, translateDocument } from "@/lib/stark/i18n";

export function AppPreferences() {
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
    // Keep the server-rendered Chinese markup from flashing before the saved
    // language has been applied and translated on the client.
    document.body.style.visibility = "visible";
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
