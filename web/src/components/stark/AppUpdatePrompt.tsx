"use client";

import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { getCloudApiUrl } from "@/lib/stark/storage/local-config";
import { appVersionEndpoint, CURRENT_APP_VERSION_CODE, CURRENT_APP_VERSION_NAME, hasNewerAppVersion, type AppVersionInfo } from "@/lib/stark/app-version";

type UpdateState = { info: AppVersionInfo; unavailable: boolean } | null;

export function AppUpdatePrompt() {
  const [update, setUpdate] = useState<UpdateState>(null);
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let cancelled = false;
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 5000);

    async function checkForUpdate() {
      try {
        const response = await fetch(appVersionEndpoint(getCloudApiUrl()), { signal: controller.signal, cache: "no-store" });
        if (!response.ok) return;
        const info = await response.json() as AppVersionInfo;
        if (cancelled || !hasNewerAppVersion(CURRENT_APP_VERSION_CODE, info)) return;
        setUpdate({ info, unavailable: !info.apkUrl });
      } catch {
        // Version checks are optional and must never block the app.
      } finally {
        window.clearTimeout(timer);
      }
    }

    void checkForUpdate();
    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timer);
    };
  }, []);

  if (!update) return null;

  const { info } = update;
  function openDownload() {
    if (!info.apkUrl) return;
    window.open(info.apkUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="app-update-overlay" role="dialog" aria-modal="true" aria-labelledby="app-update-title">
      <section className="app-update-card">
        <div className="app-update-icon" aria-hidden="true">↗</div>
        <p className="app-update-kicker">发现新版本</p>
        <h2 id="app-update-title">星记账 {info.versionName}</h2>
        <p className="app-update-copy">当前版本 {CURRENT_APP_VERSION_NAME}，有新的 App 版本可用。</p>
        {info.changelog ? <p className="app-update-changelog">{info.changelog}</p> : null}
        {update.unavailable ? <p className="app-update-unavailable">服务器尚未配置 APK 下载地址，请稍后再试。</p> : null}
        <div className="app-update-actions">
          <button type="button" className="app-update-later" onClick={() => setUpdate(null)} disabled={info.forceUpdate && !update.unavailable}>稍后</button>
          <button type="button" className="app-update-primary" onClick={openDownload} disabled={update.unavailable}>下载更新</button>
        </div>
      </section>
    </div>
  );
}
