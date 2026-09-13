"use client";

import { useEffect, useRef, useState } from "react";
import packageInfo from "../../../../package.json";
import { PageTopBar } from "@/components/stark/PageTopBar";
import type { DataMode, ImportErrorLog, ImportFailedRow, Transaction } from "@/lib/stark/models";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { getCloudApiUrl, getCurrentAccountId, getCurrentDataMode, setCloudApiUrl } from "@/lib/stark/storage/local-config";
import { nowText } from "@/lib/stark/utils/format";
import { createId } from "@/lib/stark/utils/id";
import { applyCategoryRules } from "@/lib/stark/dashboard/remark";
import { serializeTransactionsToCsv } from "@/lib/stark/export/transaction-csv";
import { buildImportErrorLogs, selectFailedImportTransactions } from "@/lib/stark/import/import-errors";
import { BillRemarkSheet } from "@/components/stark/BillRemarkSheet";
import { applyUiSettings, defaultUiSettings, readUiSettings, saveUiSettings, type FontChoice, type LanguageChoice, type ThemeChoice, type UiSettings } from "@/lib/stark/storage/ui-settings";

type BillPlatform = "微信" | "支付宝";

const manager = new DataModeManager();
type PanelKey = "MODE" | "IMPORT" | "EXPORT" | "REMARK" | "THEME" | "LANGUAGE" | "FONT" | "HELP" | "ABOUT" | "UPDATE";
type ConnectionState = "IDLE" | "TESTING" | "SUCCESS" | "ERROR";
const themeLabels: Record<ThemeChoice, string> = { BLUE: "默认蓝", GREEN: "清新绿", AMBER: "暖阳橙" };
const languageLabels: Record<LanguageChoice, string> = { SYSTEM: "跟随系统", ZH_CN: "简体中文", EN_US: "English" };
const fontLabels: Record<FontChoice, string> = { SMALL: "较小", STANDARD: "标准", LARGE: "较大" };

type PendingBillImport = {
  fileName: string;
  platform: BillPlatform;
  transactions: Transaction[];
};

function SettingIcon({ type }: { type: PanelKey }) {
  const paths: Record<PanelKey, React.ReactNode> = {
    MODE: <><ellipse cx="12" cy="6" rx="7" ry="3" /><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6" /><path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" /></>,
    IMPORT: <><path d="M12 3v12" /><path d="m8 11 4 4 4-4" /><path d="M5 18v2h14v-2" /></>,
    EXPORT: <><path d="M12 15V3" /><path d="m8 7 4-4 4 4" /><path d="M5 20h14" /></>,
    REMARK: <><path d="M6 2h12a1 1 0 0 1 1 1v19l-7-4-7 4V3a1 1 0 0 1 1-1Z" /><path d="M9 8h6" /><path d="M9 12h4" /></>,
    THEME: <><path d="M12 3a9 9 0 1 0 0 18h1.4a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h3a6 6 0 0 0 0-12Z" /><circle cx="7.5" cy="10" r=".7" /><circle cx="9" cy="6.5" r=".7" /><circle cx="14" cy="6" r=".7" /></>,
    LANGUAGE: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.2 2.4 3.3 5.4 3.3 9S14.2 18.6 12 21c-2.2-2.4-3.3-5.4-3.3-9S9.8 5.4 12 3Z" /></>,
    FONT: <><path d="M4 6V4h10v2M9 4v16M6 20h6" /><path d="M15 10h5M17.5 10v10M15.5 20h4" /></>,
    HELP: <><circle cx="12" cy="12" r="9" /><path d="M9.7 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1.2.9-1.2 1.7" /><path d="M12 17h.01" /></>,
    ABOUT: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7h.01" /></>,
    UPDATE: <><path d="M20 12a8 8 0 1 1-2.3-5.7" /><path d="M20 4v6h-6" /><path d="M12 8v4l2.5 1.5" /></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[type]}</svg>;
}

function ChevronIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>;
}

function SettingsRow({ type, title, value, onClick, disabled = false }: { type: PanelKey; title: string; value?: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" className={`settings-center-row${disabled ? " disabled" : ""}`} onClick={onClick} disabled={disabled} aria-disabled={disabled}>
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
  const [cloudUrl, setCloudUrl] = useState("");
  const [connectionState, setConnectionState] = useState<ConnectionState>("IDLE");
  const [connectionMessage, setConnectionMessage] = useState("请先测试云端服务是否可连接");
  const [testedUrl, setTestedUrl] = useState("");
  const [uiSettings, setUiSettings] = useState<UiSettings>(defaultUiSettings);
  const [importPlatform, setImportPlatform] = useState<BillPlatform>("微信");
  const [importMessage, setImportMessage] = useState("支持微信、支付宝官方导出的 CSV / Excel 账单");
  const [importing, setImporting] = useState(false);
  const [readingBill, setReadingBill] = useState(false);
  const [pendingBillImport, setPendingBillImport] = useState<PendingBillImport | null>(null);
  const [importErrors, setImportErrors] = useState<ImportErrorLog[]>([]);
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState("账单会导出为 CSV 文件，可用 Excel 或 WPS 打开");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = readUiSettings();
    setUiSettings(saved);
    applyUiSettings(saved);
    const savedMode = getCurrentDataMode() as DataMode;
    setMode(savedMode);
    setPendingMode(savedMode);
    setCloudUrl(getCloudApiUrl());
    void manager.getRepository().getImportErrorLogs(getCurrentAccountId()).then(setImportErrors).catch(() => setImportErrors([]));
  }, []);

  function updateUiSetting<K extends keyof UiSettings>(key: K, value: UiSettings[K]) {
    setUiSettings((current) => {
      const next = { ...current, [key]: value };
      saveUiSettings(next);
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
    setPendingBillImport(null);
    setImportMessage(`请选择${platform}官方导出的 CSV / Excel 账单`);
  }

  async function testCloudConnection() {
    const url = (cloudUrl.trim() || getCloudApiUrl()).replace(/\/$/, "");
    setConnectionState("TESTING");
    setConnectionMessage("正在测试连接...");
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(`${url}/api/health`, { signal: controller.signal });
      const payload = await response.json() as { status?: string; db?: boolean };
      if (!response.ok || payload.status !== "ok") throw new Error("Invalid health response");
      if (!payload.db) {
        setConnectionState("ERROR");
        setConnectionMessage("后端服务可访问，但数据库尚未连接");
        setTestedUrl("");
        return;
      }
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
    const url = (cloudUrl.trim() || getCloudApiUrl()).replace(/\/$/, "");
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

  async function prepareBillImport(file: File) {
    setReadingBill(true);
    setPendingBillImport(null);
    setImportMessage("正在读取账单...");
    try {
      const { detectBillFilePlatform, parseBillFile } = await import("@/lib/stark/import/bill-csv");
      const detectedPlatform = await detectBillFilePlatform(file);
      const rows = await parseBillFile(file, detectedPlatform);
      if (!rows.length) {
        setImportMessage(`没有识别到有效${detectedPlatform}流水，请确认这是官方导出的 CSV / Excel 账单`);
        return;
      }

      const now = nowText();
      const transactions: Transaction[] = rows.map((row) => ({
        id: createId("transaction"), userId: "local-user", accountId: getCurrentAccountId(),
        amount: row.amount, type: row.type, category: row.category, platform: row.platform,
        merchant: row.merchant, date: row.date, description: row.description,
        orderId: row.orderId, paymentMethod: row.paymentMethod, status: row.status, loanId: null,
        createdAt: now, updatedAt: now,
      }));
      setImportPlatform(detectedPlatform);
      setPendingBillImport({ fileName: file.name, platform: detectedPlatform, transactions });
      setImportMessage(`已识别 ${file.name}：${detectedPlatform}账单，共 ${transactions.length} 笔。确认后才会导入。`);
    } catch (error) {
      const detail = error instanceof Error && error.message ? `：${error.message}` : "";
      setImportMessage(`读取账单失败${detail}。请确认文件未损坏且为 CSV / XLS / XLSX 格式。`);
    } finally {
      setReadingBill(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function confirmBillImport() {
    if (!pendingBillImport || importing) return;
    setImporting(true);
    setImportMessage(`正在导入 ${pendingBillImport.transactions.length} 笔${pendingBillImport.platform}账单...`);
    try {
      const repository = manager.getRepository();
      const rules = await repository.getCategoryRules(getCurrentAccountId());
      const result = await repository.importTransactions(applyCategoryRules(pendingBillImport.transactions, rules));
      setImportMessage(`已导入 ${result.imported} 笔，跳过 ${result.skipped} 笔，失败 ${result.errors} 笔${result.errors ? "，失败行可再次确认导入" : ""}`);
      if (result.errors > 0) {
        const now = nowText();
        const failedRows: ImportFailedRow[] = result.failedRows?.length
          ? result.failedRows
          : [{ lineNumber: 0, rawData: `${pendingBillImport.transactions.length} rows`, errorMessage: `${result.errors} rows failed to import`, errorType: "IMPORT" }];
        const failedLogs: ImportErrorLog[] = buildImportErrorLogs(failedRows, { fileName: pendingBillImport.fileName, accountId: getCurrentAccountId(), createdAt: now });
        await Promise.all(failedLogs.map((log) => repository.saveImportErrorLog(log)));
        setImportErrors((current) => [...failedLogs, ...current]);
        if (result.failedRows?.length) {
          const failedTransactions = selectFailedImportTransactions(pendingBillImport.transactions, result.failedRows);
          if (failedTransactions.length) setPendingBillImport({ ...pendingBillImport, transactions: failedTransactions });
        }
      }
      if (!result.errors) {
        const resolvedLogs = importErrors
          .filter((item) => item.fileName === pendingBillImport.fileName && !item.resolved)
          .map((item) => ({ ...item, resolved: true }));
        if (resolvedLogs.length) {
          await Promise.all(resolvedLogs.map((log) => repository.saveImportErrorLog(log)));
          const resolvedIds = new Map(resolvedLogs.map((log) => [log.id, log]));
          setImportErrors((current) => current.map((item) => resolvedIds.get(item.id) ?? item));
        }
        setPendingBillImport(null);
      }
    } catch (error) {
      const detail = error instanceof Error && error.message ? `：${error.message}` : "";
      setImportMessage(`账单导入失败${detail}`);
    } finally {
      setImporting(false);
    }
  }

  async function exportBills() {
    if (exporting) return;
    setExporting(true);
    setExportMessage("正在整理当前账本的账单...");
    try {
      const repository = manager.getRepository();
      const accountId = getCurrentAccountId();
      const pageSize = 500;
      const transactions: Transaction[] = [];
      for (let page = 1; page <= 1000; page += 1) {
        const batch = await repository.getTransactions(accountId, page, pageSize);
        transactions.push(...batch);
        if (batch.length < pageSize) break;
      }
      const csv = `\uFEFF${serializeTransactionsToCsv(transactions)}`;
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const date = new Date().toISOString().slice(0, 10);
      anchor.href = url;
      anchor.download = `star-accounting-bills-${date}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
      setExportMessage(`已导出 ${transactions.length} 笔账单，文件已开始下载`);
    } catch (error) {
      const detail = error instanceof Error && error.message ? `：${error.message}` : "";
      setExportMessage(`导出账单失败${detail}`);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="page-stack settings-center-page">
      <PageTopBar title="设置" />

      <section className="settings-center-group">
        <SettingsRow type="MODE" title="切换模式" value={mode === "LOCAL" ? "本地模式" : "云端模式"} onClick={openModePanel} />
        <SettingsRow type="IMPORT" title="导入账单" value="微信 / 支付宝" onClick={() => setActivePanel("IMPORT")} />
        <SettingsRow type="EXPORT" title="导出账单" value="CSV 文件" onClick={() => { setExportMessage("账单会导出为 CSV 文件，可用 Excel 或 WPS 打开"); setActivePanel("EXPORT"); }} />
      </section>

      <section className="settings-center-group">
        <SettingsRow type="REMARK" title="账单归类" value="转账可归入支出分类" onClick={() => setActivePanel("REMARK")} />
        <SettingsRow type="ABOUT" title="预算管理" value="待开发" onClick={() => undefined} disabled />
      </section>

      <section className="settings-center-group">
        <SettingsRow type="THEME" title="主题" value={themeLabels[uiSettings.theme]} onClick={() => setActivePanel("THEME")} />
        <SettingsRow type="LANGUAGE" title="语言" value={languageLabels[uiSettings.language]} onClick={() => setActivePanel("LANGUAGE")} />
        <SettingsRow type="FONT" title="字体大小" value={fontLabels[uiSettings.font]} onClick={() => setActivePanel("FONT")} />
      </section>

      <section className="settings-center-group">
        <SettingsRow type="HELP" title="帮助与反馈" onClick={() => setActivePanel("HELP")} />
        <SettingsRow type="UPDATE" title="检查更新" value="检查 App 版本" onClick={() => window.dispatchEvent(new Event("stark:check-app-update"))} />
        <SettingsRow type="ABOUT" title="关于" value={`v${packageInfo.version}`} onClick={() => setActivePanel("ABOUT")} />
      </section>

      {activePanel ? (
        <div className="settings-sheet-overlay visible" onClick={() => setActivePanel(null)}>
          <section className="settings-sheet" onClick={(event) => event.stopPropagation()}>
            <div className="settings-sheet-handle" />
            <header><strong>{activePanel === "MODE" ? "切换模式" : activePanel === "IMPORT" ? "导入账单" : activePanel === "EXPORT" ? "导出账单" : activePanel === "REMARK" ? "账单归类" : activePanel === "THEME" ? "主题" : activePanel === "LANGUAGE" ? "语言" : activePanel === "FONT" ? "字体大小" : activePanel === "HELP" ? "帮助与反馈" : "关于"}</strong><button type="button" onClick={() => setActivePanel(null)}>×</button></header>

            {activePanel === "MODE" ? <div className="settings-sheet-body">
              <p className="settings-sheet-note">本地模式将数据保存在当前设备；云端模式只读取后端数据库，连接失败时不会混用本地数据。</p>
              <div className="settings-choice-grid">
                <button type="button" className={pendingMode === "LOCAL" ? "active" : ""} onClick={() => setPendingMode("LOCAL")}><strong>本地模式</strong><span>数据保存在当前设备</span></button>
                <button type="button" className={pendingMode === "CLOUD" ? "active" : ""} onClick={() => setPendingMode("CLOUD")}><strong>云端模式</strong><span>连接 MySQL 后端服务</span></button>
              </div>
              {pendingMode === "CLOUD" ? <>
                <label className="settings-url-field"><span>云端服务地址</span><input value={cloudUrl} onChange={(event) => { setCloudUrl(event.target.value); setConnectionState("IDLE"); setTestedUrl(""); }} placeholder="http://localhost:12367" /></label>
                <div className={`cloud-test-status ${connectionState.toLowerCase()}`}>{connectionMessage}</div>
              </> : null}
              <div className="settings-mode-actions">
                {pendingMode === "CLOUD" ? <button type="button" className="settings-test-button" disabled={connectionState === "TESTING"} onClick={() => void testCloudConnection()}>{connectionState === "TESTING" ? "测试中..." : "测试连接"}</button> : null}
                <button type="button" className="settings-confirm-button" onClick={() => void confirmMode()}>确定</button>
              </div>
            </div> : null}

            {activePanel === "IMPORT" ? <div className="settings-sheet-body">
              <div className="bill-platform-picker">
                <button type="button" className={importPlatform === "微信" ? "active wechat" : "wechat"} onClick={() => selectImportPlatform("微信")}><span>微</span><div><strong>微信账单</strong><small>微信支付 CSV / Excel 格式</small></div></button>
                <button type="button" className={importPlatform === "支付宝" ? "active alipay" : "alipay"} onClick={() => selectImportPlatform("支付宝")}><span>支</span><div><strong>支付宝账单</strong><small>支付宝交易记录 CSV / Excel</small></div></button>
              </div>
              <div className={`bill-import-message ${importMessage.startsWith("已导入") ? "success" : ""}`}>{importMessage}</div>
              <input ref={fileInputRef} type="file" hidden accept=".csv,.xls,.xlsx,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={(event) => { const file = event.target.files?.[0]; if (file) void prepareBillImport(file); }} />
              <button type="button" className="settings-sheet-primary" disabled={readingBill || importing} onClick={() => fileInputRef.current?.click()}>{readingBill ? "正在读取..." : pendingBillImport ? "重新选择账单文件" : "选择账单文件"}</button>
              {pendingBillImport ? <button type="button" className="settings-confirm-button bill-import-confirm" disabled={importing} onClick={() => void confirmBillImport()}>{importing ? "导入中..." : `确认导入 ${pendingBillImport.transactions.length} 笔`}</button> : null}
              <p className="settings-sheet-tip">支持微信、支付宝官方导出的 CSV / XLS / XLSX 文件；选择后会自动识别平台，确认导入前不会写入数据。</p>
              {importErrors.length ? <div className="import-error-list"><strong>最近导入问题</strong>{importErrors.slice(0, 5).map((item) => <div key={item.id}><span>{item.fileName}{item.lineNumber > 0 ? ` · 第 ${item.lineNumber} 行` : ""}</span><small>{item.resolved ? "已解决" : item.errorMessage}</small></div>)}</div> : null}
            </div> : null}

            {activePanel === "EXPORT" ? <div className="settings-sheet-body">
              <p className="settings-sheet-note">导出当前账本的全部流水，不会修改本地或云端数据。CSV 文件包含日期、类型、分类、备注归类、商户、平台、金额、支付方式、状态和订单号等字段。</p>
              <div className="bill-import-message">{exportMessage}</div>
              <button type="button" className="settings-sheet-primary" disabled={exporting} onClick={() => void exportBills()}>{exporting ? "正在导出..." : "导出全部账单"}</button>
              <p className="settings-sheet-tip">文件使用 UTF-8 编码并兼容 Excel / WPS；导出范围仅限当前账本。</p>
            </div> : null}

            {activePanel === "REMARK" ? <div className="settings-sheet-body remark-sheet-body">
              <BillRemarkSheet />
            </div> : null}

            {activePanel === "THEME" ? <div className="settings-option-list">{(["BLUE", "GREEN", "AMBER"] as ThemeChoice[]).map((item) => <button type="button" key={item} className={uiSettings.theme === item ? "active" : ""} onClick={() => updateUiSetting("theme", item)}><i className={`theme-dot ${item.toLowerCase()}`} /><span><strong>{themeLabels[item]}</strong><small>{item === "BLUE" ? "清爽、稳定的默认配色" : item === "GREEN" ? "更柔和的自然配色" : "温暖醒目的强调配色"}</small></span><em>{uiSettings.theme === item ? "✓" : ""}</em></button>)}</div> : null}
            {activePanel === "LANGUAGE" ? <div className="settings-option-list">{(["SYSTEM", "ZH_CN", "EN_US"] as LanguageChoice[]).map((item) => <button type="button" key={item} className={uiSettings.language === item ? "active" : ""} onClick={() => updateUiSetting("language", item)}><span><strong>{languageLabels[item]}</strong><small>{item === "SYSTEM" ? "使用设备的语言偏好" : item === "ZH_CN" ? "固定使用简体中文" : "固定使用英文"}</small></span><em>{uiSettings.language === item ? "✓" : ""}</em></button>)}</div> : null}
            {activePanel === "FONT" ? <div className="settings-font-options">{(["SMALL", "STANDARD", "LARGE"] as FontChoice[]).map((item) => <button type="button" key={item} className={uiSettings.font === item ? "active" : ""} onClick={() => updateUiSetting("font", item)}><span style={{ fontSize: item === "SMALL" ? 13 : item === "LARGE" ? 19 : 16 }}>Aa</span><strong>{fontLabels[item]}</strong></button>)}</div> : null}
            {activePanel === "HELP" ? <div className="settings-sheet-body help-sheet-body"><div><strong>数据没有加载出来怎么办？</strong><p>先在切换模式中确认当前数据源，云端模式还需要后端服务可访问。</p></div><div><strong>账单导入支持什么格式？</strong><p>支持微信和支付宝官方导出的 CSV、XLS、XLSX 文件。</p></div><div><strong>Web 端和 App 有何不同？</strong><p>Web 端主要面向电脑端查看和操作账单；部署后也可以直接在浏览器使用，便于暂未开发 iOS、鸿蒙等平台时跨设备访问。App 端目前只开发 Android 版本，适合在安卓手机上使用。</p></div><a href="https://github.com/sevencnup/wotty-StarAccounting/issues" target="_blank" rel="noreferrer">前往 GitHub 提交反馈 <ChevronIcon /></a></div> : null}
            {activePanel === "ABOUT" ? <div className="settings-about"><span><SettingIcon type="ABOUT" /></span><strong>星会计</strong><p>版本 {packageInfo.version}</p><small>本地优先、可连接云端的个人财务管理工具</small><div>Next.js · Capacitor · Kotlin</div><nav className="settings-about-links" aria-label="相关网站"><a href="https://sevencn.com" target="_blank" rel="noreferrer"><span>博客主站</span><strong>sevencn.com</strong><ChevronIcon /></a><a href="https://staraccounting.wotty.app" target="_blank" rel="noreferrer"><span>项目宣发地址</span><strong>staraccounting.wotty.app</strong><ChevronIcon /></a><a href="https://github.com/sevencnup/wotty-StarAccounting" target="_blank" rel="noreferrer"><span>开源地址</span><strong>github.com/sevencnup/wotty-StarAccounting</strong><ChevronIcon /></a></nav></div> : null}
          </section>
        </div>
      ) : null}
    </div>
  );
}
