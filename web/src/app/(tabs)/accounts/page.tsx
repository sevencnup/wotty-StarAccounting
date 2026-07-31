"use client";

import { useEffect, useMemo, useState } from "react";
import { PageTopBar } from "@/components/stark/PageTopBar";
import { PageSkeleton } from "@/components/stark/Skeleton";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { formatMoney, nowText } from "@/lib/stark/utils/format";
import type { Asset, AssetType, Transaction } from "@/lib/stark/models";

const repo = new DataModeManager().getRepository();
const ACCOUNT_SETTINGS_KEY = "wotty-stark:account-page-settings";
const assetTypes: AssetType[] = ["CASH", "BANK_CARD", "ALIPAY", "WECHAT", "INVESTMENT", "OTHER"];
const typeMeta: Record<AssetType, { label: string; short: string; className: string; platforms: string[] }> = {
  CASH: { label: "现金", short: "现", className: "cash", platforms: ["现金"] },
  BANK_CARD: { label: "银行卡", short: "卡", className: "bank", platforms: ["银行卡", "银行"] },
  ALIPAY: { label: "支付宝", short: "支", className: "alipay", platforms: ["支付宝"] },
  WECHAT: { label: "微信", short: "微", className: "wechat", platforms: ["微信"] },
  INVESTMENT: { label: "投资", short: "投", className: "investment", platforms: ["投资", "理财"] },
  OTHER: { label: "其他", short: "其", className: "other", platforms: ["其他"] },
};

type AccountSort = "BALANCE" | "UPDATED" | "NAME";
type AccountSettings = {
  defaultAccountId: string;
  sort: AccountSort;
  showBalance: boolean;
  autoMatch: boolean;
};

const defaultSettings: AccountSettings = {
  defaultAccountId: "",
  sort: "BALANCE",
  showBalance: true,
  autoMatch: true,
};

function readAccountSettings(): AccountSettings {
  try {
    const stored = window.localStorage.getItem(ACCOUNT_SETTINGS_KEY);
    return stored ? { ...defaultSettings, ...JSON.parse(stored) as Partial<AccountSettings> } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

function updatedLabel(value: string) {
  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return "暂无更新时间";
  const now = new Date();
  const days = Math.floor((now.getTime() - date.getTime()) / 86_400_000);
  if (days <= 0) return "今天更新";
  if (days === 1) return "昨天更新";
  if (days < 30) return `${days} 天前更新`;
  return `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} 更新`;
}

function accountActivity(asset: Asset, transactions: Transaction[]) {
  const keys = [...typeMeta[asset.type].platforms, asset.name].filter(Boolean);
  const records = transactions.filter((item) => keys.some((key) => item.platform.includes(key) || item.merchant?.includes(key)));
  const latest = [...records].sort((a, b) => b.date.localeCompare(a.date))[0];
  return { count: records.length, latest: latest?.date ?? asset.updatedAt };
}

export default function AccountsPage() {
  const [list, setList] = useState<Asset[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | AssetType>("ALL");
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [type, setType] = useState<AssetType>("ALIPAY");
  const [settings, setSettings] = useState<AccountSettings>(defaultSettings);

  const reload = () => void repo.getAssets("default").then(setList);

  useEffect(() => {
    setSettings(readAccountSettings());
  }, []);

  useEffect(() => {
    let active = true;
    void Promise.all([repo.getAssets("default"), repo.getTransactions("default", 1, 200)])
      .then(([assets, records]) => {
        if (!active) return;
        setList(assets);
        setTransactions(records);
      }).finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const summary = useMemo(() => {
    const positive = list.filter((item) => item.balance >= 0);
    const total = positive.reduce((sum, item) => sum + item.balance, 0);
    const average = positive.length ? total / positive.length : 0;
    const sorted = [...positive].sort((a, b) => b.balance - a.balance);
    const primary = positive.find((item) => item.id === settings.defaultAccountId) ?? sorted[0] ?? null;
    const topThree = sorted.slice(0, 3);
    const topThreeTotal = topThree.reduce((sum, item) => sum + item.balance, 0);
    const concentration = total > 0 ? (topThreeTotal / total) * 100 : 0;
    return { positive, total, average, primary, topThree, concentration };
  }, [list, settings.defaultAccountId]);

  const visibleAccounts = useMemo(() => (
    summary.positive
      .filter((item) => filter === "ALL" || item.type === filter)
      .sort((a, b) => {
        if (settings.sort === "UPDATED") return b.updatedAt.localeCompare(a.updatedAt);
        if (settings.sort === "NAME") return a.name.localeCompare(b.name, "zh-CN");
        return b.balance - a.balance;
      })
  ), [summary.positive, filter, settings.sort]);

  function updateSetting<K extends keyof AccountSettings>(key: K, value: AccountSettings[K]) {
    setSettings((current) => {
      const next = { ...current, [key]: value };
      window.localStorage.setItem(ACCOUNT_SETTINGS_KEY, JSON.stringify(next));
      return next;
    });
  }

  function money(value: number) {
    return settings.showBalance ? `¥ ${formatMoney(value)}` : "¥ ••••";
  }

  async function saveAsset() {
    const now = nowText();
    await repo.saveAsset({
      id: crypto.randomUUID(), userId: "local-user", accountId: "default",
      name: name.trim() || "新账户", type, balance: Number(balance) || 0, currency: "CNY",
      createdAt: now, updatedAt: now,
    });
    setName("");
    setBalance("");
    setType("ALIPAY");
    reload();
  }

  if (loading) return <PageSkeleton title="账户" cards={4} />;

  return (
    <div className="page-stack finance-page accounts-page">
      <PageTopBar title="账户" />

      <section className="account-wallet-hero">
        <div className="account-wallet-copy">
          <span>可用账户余额</span>
          <strong>{money(summary.total)}</strong>
          <p>{summary.positive.length} 个资金账户已纳入汇总</p>
        </div>
        <div className="account-wallet-orbit" aria-hidden="true">
          <i /><i /><i />
          <span>{summary.primary ? typeMeta[summary.primary.type].short : "账"}</span>
        </div>
        <div className="account-wallet-stats">
          <div><span>平均余额</span><strong>{money(summary.average)}</strong></div>
          <div><span>主账户</span><strong>{summary.primary?.name ?? "暂无"}</strong></div>
        </div>
      </section>

      <section className="account-browser-section">
        <div className="finance-section-head"><h2>我的账户</h2><span>{visibleAccounts.length} 个</span></div>
        <div className="account-filter-strip" role="tablist" aria-label="账户类型筛选">
          <button type="button" className={filter === "ALL" ? "active" : ""} onClick={() => setFilter("ALL")}>全部</button>
          {assetTypes.map((item) => <button type="button" key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{typeMeta[item].label}</button>)}
        </div>
        <div className="account-card-grid">
          {visibleAccounts.length ? visibleAccounts.map((asset) => {
            const meta = typeMeta[asset.type];
            const activity = settings.autoMatch ? accountActivity(asset, transactions) : { count: 0, latest: asset.updatedAt };
            const share = summary.total > 0 ? (asset.balance / summary.total) * 100 : 0;
            return (
              <article className={`account-wallet-card ${meta.className}`} key={asset.id}>
                <div className="account-wallet-head"><i>{meta.short}</i><span>{meta.label}</span><em>{share.toFixed(1)}%</em></div>
                <strong>{asset.name}</strong>
                <div className="account-wallet-balance">{money(asset.balance)}</div>
                <div className="account-wallet-foot"><span>{settings.autoMatch ? `${activity.count} 笔匹配流水` : "流水匹配已关闭"}</span><time>{updatedLabel(activity.latest)}</time></div>
              </article>
            );
          }) : <div className="finance-empty bordered">当前分类下暂无账户</div>}
        </div>
      </section>

      <section className="home-card finance-section account-focus-section">
        <div className="finance-section-head"><h2>资金集中度</h2><span>前 3 个账户</span></div>
        <div className="account-focus-summary">
          <strong>{Math.round(summary.concentration)}%</strong>
          <span>{summary.concentration <= 70 ? "资金分布较均衡" : "资金集中在少数账户"}</span>
        </div>
        <div className="account-focus-track">
          {summary.topThree.map((asset) => <span key={asset.id} className={typeMeta[asset.type].className} style={{ width: `${summary.total > 0 ? (asset.balance / summary.total) * 100 : 0}%` }} />)}
        </div>
        <div className="account-focus-list">
          {summary.topThree.map((asset, index) => (
            <div key={asset.id}><span><i>{index + 1}</i>{asset.name}</span><strong>{money(asset.balance)}</strong></div>
          ))}
          {!summary.topThree.length ? <div className="finance-empty">暂无账户余额</div> : null}
        </div>
      </section>

      <section className="home-card finance-section account-settings-section">
        <div className="finance-section-head"><h2>账户设置</h2><span>自动保存在本机</span></div>
        <div className="account-settings-list">
          <label className="account-setting-row">
            <span><strong>默认账户</strong><small>用于首页和账户页优先展示</small></span>
            <select value={settings.defaultAccountId} onChange={(event) => updateSetting("defaultAccountId", event.target.value)}>
              <option value="">余额最高账户</option>
              {summary.positive.map((asset) => <option key={asset.id} value={asset.id}>{asset.name}</option>)}
            </select>
          </label>
          <label className="account-setting-row">
            <span><strong>账户排序</strong><small>调整钱包卡片排列方式</small></span>
            <select value={settings.sort} onChange={(event) => updateSetting("sort", event.target.value as AccountSort)}>
              <option value="BALANCE">余额从高到低</option>
              <option value="UPDATED">最近更新优先</option>
              <option value="NAME">按名称排序</option>
            </select>
          </label>
          <div className="account-setting-row">
            <span><strong>显示账户余额</strong><small>关闭后金额以圆点隐藏</small></span>
            <button type="button" role="switch" aria-checked={settings.showBalance} className={`account-setting-switch ${settings.showBalance ? "active" : ""}`} onClick={() => updateSetting("showBalance", !settings.showBalance)}><i /></button>
          </div>
          <div className="account-setting-row">
            <span><strong>自动匹配流水</strong><small>按账户类型和名称关联记录</small></span>
            <button type="button" role="switch" aria-checked={settings.autoMatch} className={`account-setting-switch ${settings.autoMatch ? "active" : ""}`} onClick={() => updateSetting("autoMatch", !settings.autoMatch)}><i /></button>
          </div>
        </div>
      </section>

      <section className="home-card finance-section finance-create-section account-create-section">
        <div className="finance-section-head"><h2>添加账户</h2><span>建立新的资金容器</span></div>
        <div className="account-type-picker" role="radiogroup" aria-label="账户类型">
          {assetTypes.map((item) => <button type="button" key={item} className={type === item ? "active" : ""} onClick={() => setType(item)}><i className={typeMeta[item].className}>{typeMeta[item].short}</i><span>{typeMeta[item].label}</span></button>)}
        </div>
        <div className="finance-form-grid account-form-grid">
          <label><span>账户名称</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="如日常消费卡" /></label>
          <label><span>当前余额</span><input inputMode="decimal" value={balance} onChange={(event) => setBalance(event.target.value.replace(/[^\d.]/g, ""))} placeholder="0.00" /></label>
        </div>
        <button type="button" className="finance-primary-action" onClick={() => void saveAsset()}>添加账户</button>
      </section>
    </div>
  );
}
