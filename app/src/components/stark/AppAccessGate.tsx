"use client";

import { useEffect, useRef, useState } from "react";
import type { DataMode } from "@/lib/stark/models";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { cloudLogin, cloudLogout, cloudMe, cloudRegister } from "@/lib/stark/repository/cloud-auth";
import { getCloudAuthUser, type CloudAuthUser } from "@/lib/stark/storage/cloud-auth";
import { getCloudApiUrl, getCurrentDataMode, isNativeAppRuntime, setCloudApiUrl } from "@/lib/stark/storage/local-config";

type ConnectionState = "IDLE" | "TESTING" | "SUCCESS" | "ERROR";
type AccessPhase = "BOOTING" | "LOCAL" | "AUTH";

const manager = new DataModeManager();

function normalizeUrl(value: string) {
  return value.trim().replace(/\/$/, "");
}

function isProtectedDestination(value: string) {
  return value === "/app" || value.startsWith("/app/") || value === "/web" || value.startsWith("/web/");
}

function getDestination() {
  if (typeof window === "undefined") return "/app";
  const requested = new URLSearchParams(window.location.search).get("next") ?? "";
  return isProtectedDestination(requested) ? requested : "/app";
}

function isModeSwitchRequested() {
  return typeof window !== "undefined" && new URLSearchParams(window.location.search).get("switchMode") === "1";
}

/** 检测后端和数据库；根入口与受保护路由共用。 */
export async function verifyCloudConnection(urlValue: string) {
  const url = normalizeUrl(urlValue);
  if (!url) throw new Error("请输入云端 API 地址");

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(`${url}/api/health`, { signal: controller.signal });
    const payload = await response.json() as { status?: string; db?: boolean };
    if (!response.ok || payload.status !== "ok") throw new Error("后端服务返回异常");
    if (!payload.db) throw new Error("后端服务可访问，但数据库尚未连接");
  } finally {
    window.clearTimeout(timer);
  }
}

/** 根路径统一入口：选择模式、检测 API 并完成云端登录。 */
export function AppAccessGate() {
  const [native, setNative] = useState(false);
  const [mode, setMode] = useState<DataMode>("CLOUD");
  const [phase, setPhase] = useState<AccessPhase>("BOOTING");
  const [apiUrl, setApiUrl] = useState("");
  const [connectionState, setConnectionState] = useState<ConnectionState>("IDLE");
  const [connectionMessage, setConnectionMessage] = useState("登录前请检测 API 地址");
  const [apiVerified, setApiVerified] = useState(false);
  const [cloudUser, setCloudUser] = useState<CloudAuthUser | null>(() => getCloudAuthUser());
  const [authMode, setAuthMode] = useState<"LOGIN" | "REGISTER">("LOGIN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [authError, setAuthError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [shellHeight, setShellHeight] = useState<number | null>(null);
  const destinationRef = useRef("/app");
  const mountedRef = useRef(true);

  function completeAccess() {
    window.location.replace(destinationRef.current);
  }

  async function checkCloud(urlValue: string, resumeIfAuthenticated: boolean) {
    const url = normalizeUrl(urlValue);
    setApiUrl(url);
    setPhase("AUTH");
    setConnectionState("TESTING");
    setConnectionMessage("正在检测云端服务...");
    setApiVerified(false);
    setAuthError("");
    try {
      await verifyCloudConnection(url);
      if (!mountedRef.current) return;
      manager.setCloudApiUrl(url);
      setCloudApiUrl(url);
      setConnectionState("SUCCESS");
      setConnectionMessage("API 和数据库连接正常");
      setApiVerified(true);
      const user = await cloudMe(url);
      if (!mountedRef.current) return;
      setCloudUser(user);
      if (user && resumeIfAuthenticated) {
        await manager.switchMode("CLOUD");
        completeAccess();
        return;
      }
      setPhase("AUTH");
    } catch (error) {
      if (!mountedRef.current) return;
      setConnectionState("ERROR");
      setConnectionMessage(error instanceof Error && error.message ? error.message : "连接失败，请检查 API 地址和网络权限");
      setApiVerified(false);
      setPhase("AUTH");
    }
  }

  useEffect(() => {
    mountedRef.current = true;
    setShellHeight(window.innerHeight);
    destinationRef.current = getDestination();
    const nativeRuntime = isNativeAppRuntime();
    const initialMode: DataMode = nativeRuntime ? getCurrentDataMode() : "CLOUD";
    const initialUrl = getCloudApiUrl();
    setNative(nativeRuntime);
    setMode(initialMode);
    setApiUrl(initialUrl);

    if (nativeRuntime && initialMode === "LOCAL") {
      setPhase("LOCAL");
    } else {
      void checkCloud(initialUrl, !isModeSwitchRequested());
    }

    function updateShellHeightForOrientation() {
      window.requestAnimationFrame(() => {
        if (mountedRef.current) setShellHeight(window.innerHeight);
      });
    }

    window.addEventListener("orientationchange", updateShellHeightForOrientation);

    return () => {
      mountedRef.current = false;
      window.removeEventListener("orientationchange", updateShellHeightForOrientation);
    };
  }, []);

  async function enterLocalMode() {
    if (!native) return;
    await manager.switchMode("LOCAL");
    completeAccess();
  }

  async function continueCloud() {
    if (!cloudUser) return;
    if (!apiVerified) {
      await checkCloud(apiUrl, true);
      return;
    }
    const url = normalizeUrl(apiUrl);
    setCloudApiUrl(url);
    manager.setCloudApiUrl(url);
    await manager.switchMode("CLOUD");
    completeAccess();
  }

  async function submitAuth() {
    if (!apiVerified) return;
    if (!email.trim() || !password) {
      setAuthError("请输入邮箱和密码");
      return;
    }
    setSubmitting(true);
    setAuthError("");
    try {
      const url = normalizeUrl(apiUrl);
      manager.setCloudApiUrl(url);
      const user = authMode === "LOGIN"
        ? await cloudLogin(url, email.trim(), password)
        : await cloudRegister(url, email.trim(), password, name);
      setCloudUser(user);
      setCloudApiUrl(url);
      await manager.switchMode("CLOUD");
      completeAccess();
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "登录失败，请检查云端服务");
    } finally {
      if (mountedRef.current) setSubmitting(false);
    }
  }

  function changeApiUrl(value: string) {
    setApiUrl(value);
    setApiVerified(false);
    setConnectionState("IDLE");
    setConnectionMessage("请先检测当前 API 地址");
    setAuthError("");
  }

  function switchToCloud() {
    setMode("CLOUD");
    setPhase("AUTH");
  }

  function logoutCloud() {
    cloudLogout();
    setCloudUser(null);
    setAuthError("");
    setAuthMode("LOGIN");
    setPhase("AUTH");
  }

  return (
    <div className="app-access-shell" style={shellHeight ? { height: `${shellHeight}px`, minHeight: `${shellHeight}px` } : undefined}>
      <main className="app-access-card" aria-busy={phase === "BOOTING" || connectionState === "TESTING"}>
        {mode === "LOCAL" && native ? (
          <section className="app-access-local-panel">
            <strong>本地模式</strong>
            <p>数据只保存在这台设备，不需要服务器或登录。</p>
            <button type="button" className="app-access-primary" onClick={() => void enterLocalMode()}>进入本地账本</button>
          </section>
        ) : (
          <section className="app-access-cloud-panel">
            <div className="app-access-auth">
              {!apiVerified ? (
                <>
                  <label className="app-access-field"><span>云端 API 地址</span><input value={apiUrl} onChange={(event) => changeApiUrl(event.target.value)} placeholder="http://127.0.0.1:12367" autoComplete="url" /></label>
                  <div className={`app-access-status ${connectionState.toLowerCase()}`} role="status">{connectionMessage}</div>
                  <button type="button" className="app-access-secondary" disabled={connectionState === "TESTING" || !apiUrl.trim()} onClick={() => void checkCloud(apiUrl, false)}>{connectionState === "TESTING" ? "检测中..." : "检测 API 地址"}</button>
                </>
              ) : cloudUser ? (
                <div className="app-access-current-user">
                  <strong>已登录：{cloudUser.name || cloudUser.email}</strong>
                  <div><button type="button" className="app-access-primary" onClick={() => void continueCloud()}>{apiVerified ? "继续使用云端" : "检测并继续使用"}</button><button type="button" className="app-access-link" onClick={logoutCloud}>退出并更换账户</button></div>
                </div>
              ) : (
                <div className="app-access-credentials">
                  <div className="app-access-auth-tabs">
                    <button type="button" className={authMode === "LOGIN" ? "active" : ""} onClick={() => { setAuthMode("LOGIN"); setAuthError(""); }}>登录</button>
                    <button type="button" className={authMode === "REGISTER" ? "active" : ""} onClick={() => { setAuthMode("REGISTER"); setAuthError(""); }}>注册</button>
                  </div>
                  {authMode === "REGISTER" ? <label className="app-access-field"><span>昵称（可选）</span><input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" /></label> : null}
                  <label className="app-access-field app-access-login-field"><span>邮箱</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></label>
                  <label className="app-access-field app-access-login-field"><span>密码</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={authMode === "LOGIN" ? "current-password" : "new-password"} /></label>
                  {authError ? <div className="app-access-status error">{authError}</div> : null}
                  <button type="button" className="app-access-primary" disabled={submitting || !apiVerified} onClick={() => void submitAuth()}>{submitting ? "提交中..." : !apiVerified ? "请先检测 API 地址" : authMode === "LOGIN" ? "登录并进入" : "注册并进入"}</button>
                </div>
              )}
            </div>
          </section>
        )}

        {native ? (
          <div className="app-access-mode-switch" aria-label="选择数据模式">
            <button type="button" className={mode === "LOCAL" ? "active" : ""} onClick={() => { setMode("LOCAL"); setPhase("LOCAL"); }}>本地模式</button>
            <button type="button" className={mode === "CLOUD" ? "active" : ""} onClick={switchToCloud}>云端模式</button>
          </div>
        ) : null}
      </main>
    </div>
  );
}
