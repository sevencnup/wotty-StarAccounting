"use client";

import { useEffect, useRef, useState } from "react";
import packageInfo from "../../../../package.json";
import { PageTopBar } from "@/components/stark/PageTopBar";
import { detectBillPlatform, parseBillCsv } from "@/lib/stark/import/bill-csv";
import type { BillPlatform } from "@/lib/stark/import/bill-csv";
import type { DataMode, Transaction } from "@/lib/stark/models";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { getCloudApiUrl, getCurrentDataMode, setCloudApiUrl } from "@/lib/stark/storage/local-config";
import { nowText } from "@/lib/stark/utils/format";

const manager = new DataModeManager();
const UI_SETTINGS_KEY = "wotty-stark:ui-settings";

type ThemeChoice = "BLUE" | "GREEN" | "AMBER";
type LanguageChoice = "SYSTEM" | "ZH_CN";
type FontChoice = "SMALL" | "STANDARD" | "LARGE";
type PanelKey = "MODE" | "IMPORT" | "THEME" | "LANGUAGE" | "FONT" | "HELP" | "ABOUT";
type ConnectionState = "IDLE" | "TESTING" | "SUCCESS" | "ERROR";

type UiSettings = {
  theme: ThemeChoice;
  language: LanguageChoice;
  font: FontChoice;
};

const defaultUiSettings: UiSettings = { theme: "BLUE", language: "SYSTEM", font: "STANDARD" };
const themeLabels: Record<ThemeChoice, string> = { BLUE: "默认蓝", GREEN: "清新绿", AMBER: "暖阳橙" };
const languageLabels: Record<LanguageChoice, string> = { SYSTEM: "跟随系统", ZH_CN: "简体中文" };
const fontLabels: Record<FontChoice, string> = { SMALL: "较小", STANDARD: "标准", LARGE: "较大" };

function applyUiSettings(settings: UiSettings) {
  document.documentElement.dataset.appTheme = settings.theme.toLowerCase();
  document.documentElement.dataset.fontSize = settings.font.toLowerCase();
  document.documentElement.lang = settings.language === "SYSTEM" ? navigator.language : "zh-CN";
}

function readUiSettings() {
  try {
    const stored = window.localStorage.getItem(UI_SETTINGS_KEY);
    return stored ? { ...defaultUiSettings, ...JSON.parse(stored) as Partial<UiSettings> } : defaultUiSettings;
  } catch {
    return defaultUiSettings;
  }
}

function SettingIcon({ type }: { type: PanelKey }) {
  const paths: Record<PanelKey, React.ReactNode> = {
    MODE: <><ellipse cx="12" cy="6" rx="7" ry="3" /><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6" /><path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" /></>,
    IMPORT: <><path d="M12 3v12" /><path d="m8 11 4 4 4-4" /><path d="M5 18v2h14v-2" /></>,
    THEME: <><path d="M12 3a9 9 0 1 0 0 18h1.4a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h3a6 6 0 0 0 0-12Z" /><circle cx="7.5" cy="10" r=".7" /><circle cx="9" cy="6.5" r=".7" /><circle cx="14" cy="6" r=".7" /></>,
    LANGUAGE: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.2 2.4 3.3 5.4 3.3 9S14.2 18.6 12 21c-2.2-2.4-3.3-5.4-3.3-9S9.8 5.4 12 3Z" /></>,
    FONT: <><path d="M4 6V4h10v2M9 4v16M6 20h6" /><path d="M15 10h5M17.5 10v10M15.5 20h4" /></>,
    HELP: <><circle cx="12" cy="12" r="9" /><path d="M9.7 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1.2.9-1.2 1.7" /><path d="M12 17h.01" /></>,
    ABOUT: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7h.01" /></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[type]}</svg>;
}

function ChevronIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>;
}

function SettingsRow({ type, title, value, onClick }: { type: PanelKey; title: string; value?: string; onClick: () => void }) {
  return (
    <button type="button" className="settings-center-row" onClick={onClick}>
      <span className={`settings-center-icon ${type.toLowerCase()}`}><SettingIcon type={type} /></span>
      <strong>{title}</strong>
      {value ? <span className="settings-center-value">{value}</span> : null}
      <span className="settings-center-chevron"><ChevronIcon /></span>
    </button>
  );
}

export default function AccountsPage() {
  const [activePanel, setActivePanel] = useState<PanelKey | null>(null);
  const [mode, setMode] = useState<DataMode>("CLOUD");
  const [pendingMode, setPendingMode] = useState<DataMode>("CLOUD");
  const [cloudUrl, setCloudUrl] = useState("http://localhost:8080");
  const [connectionState, setConnectionState] = useState<ConnectionState>("IDLE");
  const [connectionMessage, setConnectionMessage] = useState("请先测试云端服务是否可连接");
  const [testedUrl, setTestedUrl] = useState("");
  const [uiSettings, setUiSettings] = useState<UiSettings>(defaultUiSettings);
  const [importPlatform, setImportPlatform] = useState<BillPlatform>("微信");
  const [importMessage, setImportMessage] = useState("支持微信、支付宝导出的 CSV 账单");
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = readUiSettings();
    setUiSettings(saved);
    applyUiSettings(saved);
    const savedMode = getCurrentDataMode() as DataMode;
    setMode(savedMode);
    setPendingMode(savedMode);
    setCloudUrl(getCloudApiUrl());
  }, []);

  function updateUiSetting<K extends keyof UiSettings>(key: K, value: UiSettings[K]) {
    setUiSettings((current) => {
      const next = { ...current, [key]: value };
      window.localStorage.setItem(UI_SETTINGS_KEY, JSON.stringify(next));
      applyUiSettings(next);
      return next;
    });
  }

  function openModePanel() {
    setPendingMode(mode);
    setConnectionState("IDLE");
    setConnectionMessage("请先测试云端服务是否可连接");
    setTestedUrl("");
    setActivePanel("MODE");
  }

  function selectImportPlatform(platform: BillPlatform) {
    setImportPlatform(platform);
    setImportMessage(`请选择${platform}官方导出的 CSV 账单`);
  }

  async function testCloudConnection() {
    const url = (cloudUrl.trim() || "http://localhost:8080").replace(/\/$/, "");
    setConnectionState("TESTING");
    setConnectionMessage("正在测试连接...");
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(`${url}/api/health`, { signal: controller.signal });
      const payload = await response.json() as { status?: string };
      if (!response.ok || payload.status !== "ok") throw new Error("Invalid health response");
      setConnectionState("SUCCESS");
      setConnectionMessage("连接成功，可以切换到云端模式");
      setTestedUrl(url);
    } catch {
      setConnectionState("ERROR");
      setConnectionMessage("连接失败，请检查地址、后端服务和网络权限");
      setTestedUrl("");
    } finally {
      window.clearTimeout(timer);
    }
  }

  async function confirmMode() {
    const url = (cloudUrl.trim() || "http://localhost:8080").replace(/\/$/, "");
    if (pendingMode === "CLOUD" && (connectionState !== "SUCCESS" || testedUrl !== url)) {
      setConnectionState("ERROR");
      setConnectionMessage("请先测试当前云端地址，连接成功后才能确定");
      return;
    }
    if (pendingMode === "CLOUD") setCloudApiUrl(url);
    await manager.switchMode(pendingMode);
    setMode(pendingMode);
    setActivePanel(null);
    window.location.reload();
  }

  async function importBill(file: File) {
    setImporting(true);
    setImportMessage("正在读取账单...");
    try {
      const bytes = await file.arrayBuffer();
      let content = new TextDecoder("utf-8").decode(bytes);
      if (content.includes("�")) content = new TextDecoder("gb18030").decode(bytes);
      const detectedPlatform = detectBillPlatform(content, file.name);
      const rows = parseBillCsv(content, importPlatform);
      if (!rows.length) {
        setImportMessage(detectedPlatform !== importPlatform
          ? `当前选择的是${importPlatform}，但文件看起来是${detectedPlatform}账单`
          : `没有识别到有效${importPlatform}流水，请检查 CSV 文件格式`);
        return;
      }

      const now = nowText();
      const transactions: Transaction[] = rows.map((row) => ({
        id: crypto.randomUUID(), userId: "local-user", accountId: "default",
        amount: row.amount, type: row.type, category: row.category, platform: row.platform,
        merchant: row.merchant, date: row.date, description: row.description,
        orderId: null, paymentMethod: row.paymentMethod, status: row.status, loanId: null,
        createdAt: now, updatedAt: now,
      }));
      const result = await manager.getRepository().importTransactions(transactions);
      setImportMessage(`已导入 ${result.imported} 笔，跳过 ${result.skipped} 笔，失败 ${result.errors} 笔`);
    } catch {
      setImportMessage("账单导入失败，请检查文件编码和数据格式");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="page-stack settings-center-page">
      <PageTopBar title="账户" />

      <section className="settings-center-group">
        <SettingsRow type="MODE" title="切换模式" value={mode === "LOCAL" ? "本地模式" : "云端模式"} onClick={openModePanel} />
        <SettingsRow type="IMPORT" title="导入账单" value="微信 / 支付宝" onClick={() => setActivePanel("IMPORT")} />
      </section>

      <section className="settings-center-group">
        <SettingsRow type="THEME" title="主题" value={themeLabels[uiSettings.theme]} onClick={() => setActivePanel("THEME")} />
        <SettingsRow type="LANGUAGE" title="语言" value={languageLabels[uiSettings.language]} onClick={() => setActivePanel("LANGUAGE")} />
        <SettingsRow type="FONT" title="字体大小" value={fontLabels[uiSettings.font]} onClick={() => setActivePanel("FONT")} />
      </section>

      <section className="settings-center-group">
        <SettingsRow type="HELP" title="帮助与反馈" onClick={() => setActivePanel("HELP")} />
        <SettingsRow type="ABOUT" title="关于" value={`v${packageInfo.version}`} onClick={() => setActivePanel("ABOUT")} />
      </section>

      {activePanel ? (
        <div className="settings-sheet-overlay visible" onClick={() => setActivePanel(null)}>
          <section className="settings-sheet" onClick={(event) => event.stopPropagation()}>
            <div className="settings-sheet-handle" />
            <header><strong>{activePanel === "MODE" ? "切换模式" : activePanel === "IMPORT" ? "导入账单" : activePanel === "THEME" ? "主题" : activePanel === "LANGUAGE" ? "语言" : activePanel === "FONT" ? "字体大小" : activePanel === "HELP" ? "帮助与反馈" : "关于"}</strong><button type="button" onClick={() => setActivePanel(null)}>×</button></header>

            {activePanel === "MODE" ? <div className="settings-sheet-body">
              <p className="settings-sheet-note">本地模式可离线使用；云端模式连接后端数据库，并在失败时自动读取本地数据。</p>
              <div className="settings-choice-grid">
                <button type="button" className={pendingMode === "LOCAL" ? "active" : ""} onClick={() => setPendingMode("LOCAL")}><strong>本地模式</strong><span>数据保存在当前设备</span></button>
                <button type="button" className={pendingMode === "CLOUD" ? "active" : ""} onClick={() => setPendingMode("CLOUD")}><strong>云端模式</strong><span>连接 MySQL 后端服务</span></button>
              </div>
              {pendingMode === "CLOUD" ? <>
                <label className="settings-url-field"><span>云端服务地址</span><input value={cloudUrl} onChange={(event) => { setCloudUrl(event.target.value); setConnectionState("IDLE"); setTestedUrl(""); }} placeholder="http://localhost:8080" /></label>
                <div className={`cloud-test-status ${connectionState.toLowerCase()}`}>{connectionMessage}</div>
              </> : null}
              <div className="settings-mode-actions">
                {pendingMode === "CLOUD" ? <button type="button" className="settings-test-button" disabled={connectionState === "TESTING"} onClick={() => void testCloudConnection()}>{connectionState === "TESTING" ? "测试中..." : "测试连接"}</button> : null}
                <button type="button" className="settings-confirm-button" onClick={() => void confirmMode()}>确定</button>
              </div>
            </div> : null}

            {activePanel === "IMPORT" ? <div className="settings-sheet-body">
              <div className="bill-platform-picker">
                <button type="button" className={importPlatform === "微信" ? "active wechat" : "wechat"} onClick={() => selectImportPlatform("微信")}><span>微</span><div><strong>微信账单</strong><small>微信支付 CSV 格式</small></div></button>
                <button type="button" className={importPlatform === "支付宝" ? "active alipay" : "alipay"} onClick={() => selectImportPlatform("支付宝")}><span>支</span><div><strong>支付宝账单</strong><small>支付宝交易记录 CSV</small></div></button>
              </div>
              <div className={`bill-import-message ${importMessage.startsWith("已导入") ? "success" : ""}`}>{importMessage}</div>
              <input ref={fileInputRef} type="file" hidden accept=".csv,text/csv" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importBill(file); }} />
              <button type="button" className="settings-sheet-primary" disabled={importing} onClick={() => fileInputRef.current?.click()}>{importing ? "导入中..." : `选择${importPlatform} CSV 账单`}</button>
              <p className="settings-sheet-tip">两个平台字段不同，请先选择正确平台，再上传对应官方 CSV 文件。</p>
            </div> : null}

            {activePanel === "THEME" ? <div className="settings-option-list">{(["BLUE", "GREEN", "AMBER"] as ThemeChoice[]).map((item) => <button type="button" key={item} className={uiSettings.theme === item ? "active" : ""} onClick={() => updateUiSetting("theme", item)}><i className={`theme-dot ${item.toLowerCase()}`} /><span><strong>{themeLabels[item]}</strong><small>{item === "BLUE" ? "清爽、稳定的默认配色" : item === "GREEN" ? "更柔和的自然配色" : "温暖醒目的强调配色"}</small></span><em>{uiSettings.theme === item ? "✓" : ""}</em></button>)}</div> : null}
            {activePanel === "LANGUAGE" ? <div className="settings-option-list">{(["SYSTEM", "ZH_CN"] as LanguageChoice[]).map((item) => <button type="button" key={item} className={uiSettings.language === item ? "active" : ""} onClick={() => updateUiSetting("language", item)}><span><strong>{languageLabels[item]}</strong><small>{item === "SYSTEM" ? "使用设备的语言偏好" : "固定使用简体中文"}</small></span><em>{uiSettings.language === item ? "✓" : ""}</em></button>)}</div> : null}
            {activePanel === "FONT" ? <div className="settings-font-options">{(["SMALL", "STANDARD", "LARGE"] as FontChoice[]).map((item) => <button type="button" key={item} className={uiSettings.font === item ? "active" : ""} onClick={() => updateUiSetting("font", item)}><span style={{ fontSize: item === "SMALL" ? 13 : item === "LARGE" ? 19 : 16 }}>Aa</span><strong>{fontLabels[item]}</strong></button>)}</div> : null}
            {activePanel === "HELP" ? <div className="settings-sheet-body help-sheet-body"><div><strong>数据没有加载出来怎么办？</strong><p>先在切换模式中确认当前数据源，云端模式还需要后端服务可访问。</p></div><div><strong>账单导入支持什么格式？</strong><p>支持微信和支付宝官方导出的 CSV 文件。</p></div><a href="https://github.com/sevencnup/wotty-StarAccounting/issues" target="_blank" rel="noreferrer">前往 GitHub 提交反馈 <ChevronIcon /></a></div> : null}
            {activePanel === "ABOUT" ? <div className="settings-about"><span><SettingIcon type="ABOUT" /></span><strong>星记账</strong><p>版本 {packageInfo.version}</p><small>本地优先、可连接云端的个人财务管理工具</small><div>Next.js · Capacitor · Kotlin</div></div> : null}
          </section>
        </div>
      ) : null}
    </div>
  );
}
