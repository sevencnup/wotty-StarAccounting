"use client";

import { useEffect } from "react";
import { applyUiSettings, readUiSettings } from "@/lib/stark/storage/ui-settings";

export function AppPreferences() {
  useEffect(() => {
    applyUiSettings(readUiSettings());
  }, []);

  return null;
}
