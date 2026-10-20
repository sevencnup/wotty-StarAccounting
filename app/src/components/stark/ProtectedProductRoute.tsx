"use client";

import { useEffect, useRef, useState } from "react";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { cloudMe } from "@/lib/stark/repository/cloud-auth";
import { getCloudAuthToken, getCloudAuthUser } from "@/lib/stark/storage/cloud-auth";
import { getCloudApiUrl, getCurrentDataMode, isNativeAppRuntime } from "@/lib/stark/storage/local-config";
import { SHOWCASE_DEMO_MODE, withAppBasePath } from "@/lib/stark/runtime";
import { seedShowcaseDemoData } from "@/lib/stark/repository/showcase-demo";

const manager = new DataModeManager();

function getEntryUrl() {
  const requested = `${window.location.pathname}${window.location.search}`;
  return `${withAppBasePath("/")}?next=${encodeURIComponent(requested)}`;
}

/** 保护 App 与未来 Web 的业务路由，避免绕过根路径入口。 */
export function ProtectedProductRoute({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const [loadError, setLoadError] = useState("");
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    let cloudValidationTimer: number | null = null;

    async function authorize() {
      try {
        if (SHOWCASE_DEMO_MODE) {
          await manager.switchMode("LOCAL");
          await manager.getLocalRepository().getCurrentUser();
          await seedShowcaseDemoData();
          if (mountedRef.current) setAuthorized(true);
          return;
        }
        const mode = isNativeAppRuntime() ? getCurrentDataMode() : "CLOUD";
        if (mode === "LOCAL") {
          await manager.switchMode("LOCAL");
        } else {
          const url = getCloudApiUrl();
          const token = getCloudAuthToken();
          const cachedUser = getCloudAuthUser();
          if (!token || !cachedUser) throw new Error("未登录云端账户");
          manager.setCloudApiUrl(url);
          await manager.switchMode("CLOUD");
          if (mountedRef.current) setAuthorized(true);
          cloudValidationTimer = window.setTimeout(() => {
            void cloudMe(url).then((user) => {
              if (!user && mountedRef.current) window.location.replace(getEntryUrl());
            }).catch(() => {
              // A sleeping Android network must not turn a valid cached login into a logout.
            });
          }, 500);
          return;
        }
        if (mountedRef.current) setAuthorized(true);
      } catch {
        if (SHOWCASE_DEMO_MODE) {
          if (mountedRef.current) setLoadError("演示账本暂时无法打开，请检查浏览器是否允许本地存储。");
          return;
        }
        window.location.replace(getEntryUrl());
      }
    }

    void authorize();
    return () => {
      mountedRef.current = false;
      if (cloudValidationTimer !== null) window.clearTimeout(cloudValidationTimer);
    };
  }, []);

  if (authorized) return <>{children}</>;
  if (loadError) return <main className="app-route-access-loading" role="alert">{loadError}</main>;

  return null;
}
