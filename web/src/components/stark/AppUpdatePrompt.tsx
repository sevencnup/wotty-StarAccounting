"use client";

import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { getCloudApiUrl } from "@/lib/stark/storage/local-config";
import { appVersionEndpoint, CURRENT_APP_VERSION_CODE, CURRENT_APP_VERSION_NAME, hasNewerAppVersion, type AppVersionInfo } from "@/lib/stark/app-version";

type UpdateState = { info: AppVersionInfo; unavailable: boolean } | null;
type NoticeState = { title: string; message: string } | null;

export function AppUpdatePrompt() {
  const [update, setUpdate] = useState<UpdateState>(null);
  const [notice, setNotice] = useState<NoticeState>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const native = Capacitor.isNativePlatform();

    async function checkForUpdate(manual: boolean) {
      if (!native) {
        if (manual && !cancelled) setNotice({ title: "版本检查", message: "浏览器版不提供 APK 更新检查，请在 Android App 中使用。" });
        return;
      }

      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 5000);
      if (manual) {
        setNotice(null);
        setChecking(true);
      }
      try {
        const response = await fetch(appVersionEndpoint(getCloudApiUrl()), { signal: controller.signal, cache: "no-store" });
        if (!response.ok) {
          if (manual && !cancelled) setNotice({ title: "版本检查失败", message: "暂时无法连接版本服务，请稍后重试。" });
          return;
        }
        const info = await response.json() as AppVersionInfo;
        if (cancelled) return;
        if (hasNewerAppVersion(CURRENT_APP_VERSION_CODE, info)) {
          setUpdate({ info, unavailable: !info.apkUrl });
        } else if (manual) {
          setNotice({ title: "已是最新版本", message: "当前 App 版本为 " + CURRENT_APP_VERSION_NAME + "。" });
        }
      } catch {
        if (manual && !cancelled) setNotice({ title: "版本检查失败", message: "暂时无法连接版本服务，请稍后重试。" });
        // Version checks are optional and must never block the app.
      } finally {
        window.clearTimeout(timer);
        if (manual && !cancelled) setChecking(false);
      }
    }

    function handleManualCheck() {
      void checkForUpdate(true);
    }

    window.addEventListener("stark:check-app-update", handleManualCheck);
    void checkForUpdate(false);
    return () => {
      cancelled = true;
      window.removeEventListener("stark:check-app-update", handleManualCheck);
    };
  }, []);

  if (checking) {
    return (
      <div className="app-update-overlay" role="status" aria-live="polite">
        <section className="app-update-card">
          <p className="app-update-kicker">版本检查</p>
          <h2>正在检查更新…</h2>
          <p className="app-update-copy">正在连接版本服务，请稍候。</p>
        </section>
      </div>
    );
  }

  if (notice) {
    return (
      <div className="app-update-overlay" role="dialog" aria-modal="true" aria-labelledby="app-update-notice-title">
        <section className="app-update-card">
          <div className="app-update-icon" aria-hidden="true">i</div>
          <p className="app-update-kicker">{notice.title}</p>
          <h2 id="app-update-notice-title">{notice.message}</h2>
          <div className="app-update-actions single">
            <button type="button" className="app-update-primary" onClick={() => setNotice(null)}>知道了</button>
          </div>
        </section>
      </div>
    );
  }

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
