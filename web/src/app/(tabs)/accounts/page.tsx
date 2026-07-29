"use client";

import { useEffect, useMemo, useState } from "react";
import { PageTopBar } from "@/components/stark/PageTopBar";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { formatMoney, nowText } from "@/lib/stark/utils/format";
import type { Asset, AssetType } from "@/lib/stark/models";

const repo = new DataModeManager().getRepository();
const assetTypes: AssetType[] = ["CASH", "BANK_CARD", "ALIPAY", "WECHAT", "INVESTMENT", "OTHER"];

export default function AccountsPage() {
  const [list, setList] = useState<Asset[]>([]);
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [type, setType] = useState<AssetType>("ALIPAY");

  const total = useMemo(() => list.reduce((sum, item) => sum + item.balance, 0), [list]);

  const reload = () => void repo.getAssets("default").then(setList);

  useEffect(() => {
    reload();
  }, []);

  async function saveAsset() {
    const now = nowText();
    await repo.saveAsset({
      id: crypto.randomUUID(),
      userId: "local-user",
      accountId: "default",
      name: name || "新账户",
      type,
      balance: Number(balance) || 0,
      currency: "CNY",
      createdAt: now,
      updatedAt: now,
    });
    setName("");
    setBalance("");
    setType("ALIPAY");
    reload();
  }

  return (
    <div className="page-stack">
      <PageTopBar title="账户" />

      <section className="home-card page-hero">
        <div className="page-hero-label">账户总资产</div>
        <div className="page-hero-value">¥ {formatMoney(total)}</div>
        <div className="page-hero-sub">共 {list.length} 个账户 · 资金已同步到首页汇总</div>
      </section>

      <section className="home-card page-card">
        <h2 className="page-card-title">新增账户</h2>
        <div className="app-field-grid">
          <input className="app-input" value={name} onChange={(event) => setName(event.target.value)} placeholder="账户名称" />
          <select className="app-select" value={type} onChange={(event) => setType(event.target.value as AssetType)}>
            {assetTypes.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <input className="app-input" value={balance} onChange={(event) => setBalance(event.target.value.replace(/[^\d.]/g, ""))} placeholder="余额" />
          <button type="button" className="primary-button" onClick={() => void saveAsset()}>保存账户</button>
        </div>
      </section>

      <section className="home-card page-card">
        <h2 className="page-card-title">资产账户</h2>
        <div className="app-list">
          {list.map((item) => (
            <div key={item.id} className="app-list-row">
              <div className="app-list-main">
                <div className="app-list-title">{item.name}</div>
                <div className="app-list-subtitle">{item.type}</div>
              </div>
              <div className="app-list-value">¥ {formatMoney(item.balance)}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
