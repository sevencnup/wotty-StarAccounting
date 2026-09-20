"use client";

import { useEffect } from "react";
import { Capacitor, registerPlugin } from "@capacitor/core";
import { isEmbeddedStaticRuntime } from "@/lib/document-navigation";

const SYSTEM_BAR_COLOR = "#f8fafc";

interface SystemBarsPlugin {
  show(): Promise<void>;
  setStyle(options: { style: "LIGHT" | "DARK" | "DEFAULT" }): Promise<void>;
}

const SystemBars = registerPlugin<SystemBarsPlugin>("SystemBars");

function upsertThemeColorMeta(color: string) {
  const selector = 'meta[name="theme-color"]';
  let meta = document.querySelector<HTMLMetaElement>(selector);

  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }

  meta.content = color;
}

export function SystemBarsSync() {
  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    upsertThemeColorMeta(SYSTEM_BAR_COLOR);
    document.documentElement.style.backgroundColor = SYSTEM_BAR_COLOR;
    document.body.style.backgroundColor = SYSTEM_BAR_COLOR;

    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android" || !isEmbeddedStaticRuntime()) {
      return;
    }

    void SystemBars.show().catch(() => undefined);
    void SystemBars.setStyle({ style: "LIGHT" }).catch(() => undefined);
  }, []);

  return null;
}
