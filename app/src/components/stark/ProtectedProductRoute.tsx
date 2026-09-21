"use client";

import { useEffect, useRef, useState } from "react";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { cloudMe } from "@/lib/stark/repository/cloud-auth";
import { getCloudApiUrl, getCurrentDataMode, isNativeAppRuntime } from "@/lib/stark/storage/local-config";

const manager = new DataModeManager();

function getEntryUrl() {
  const requested = `${window.location.pathname}${window.location.search}`;
  return `/?next=${encodeURIComponent(requested)}`;
}

/** 保护 App 与未来 Web 的业务路由，避免绕过根路径入口。 */
export function ProtectedProductRoute({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    async function authorize() {
      try {
        const mode = isNativeAppRuntime() ? getCurrentDataMode() : "CLOUD";
        if (mode === "LOCAL") {
          await manager.switchMode("LOCAL");
        } else {
          const url = getCloudApiUrl();
          manager.setCloudApiUrl(url);
          const user = await cloudMe(url);
          if (!user) throw new Error("未登录云端账户");
          await manager.switchMode("CLOUD");
        }
        if (mountedRef.current) setAuthorized(true);
      } catch {
        window.location.replace(getEntryUrl());
      }
    }

    void authorize();
    return () => {
      mountedRef.current = false;
    };
  }, []);

  if (authorized) return <>{children}</>;

  return <main className="app-route-access-loading" aria-busy="true">正在进入账本...</main>;
}
