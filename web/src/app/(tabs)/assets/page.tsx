"use client";

import { useEffect, useMemo, useState } from "react";
import { PageTopBar } from "@/components/stark/PageTopBar";
import { PageSkeleton } from "@/components/stark/Skeleton";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { formatMoney, nowText } from "@/lib/stark/utils/format";
import type { Asset, AssetType, Loan, SavingsGoal } from "@/lib/stark/models";

const repo = new DataModeManager().getRepository();
const assetTypes: AssetType[] = ["CASH", "BANK_CARD", "ALIPAY", "WECHAT", "INVESTMENT", "OTHER"];

export default function AssetsPage() {
  const [list, setList] = useState<Asset[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [type, setType] = useState<AssetType>("ALIPAY");

  const positive = useMemo(() => list.filter((item) => item.balance >= 0), [list]);
  const negative = useMemo(() => list.filter((item) => item.balance < 0), [list]);

  const savingsTotal = useMemo(() => savingsGoals.reduce((sum, item) => sum + item.currentAmount, 0), [savingsGoals]);
  const loanTotal = useMemo(() => loans.reduce((sum, item) => sum + item.remainingAmount, 0), [loans]);

  const assetTotal = useMemo(() => positive.reduce((sum, item) => sum + item.balance, 0) + savingsTotal, [positive, savingsTotal]);
  const liabilityTotal = useMemo(() => negative.reduce((sum, item) => sum + -item.balance, 0) + loanTotal, [negative, loanTotal]);
  const netWorth = assetTotal - liabilityTotal;

  const reload = () => {
    void Promise.all([
      repo.getAssets("default"),
      repo.getSavingsGoals("default"),
      repo.getLoans("default"),
    ]).then(([a, s, l]) => {
      setList(a);
      setSavingsGoals(s);
      setLoans(l);
    });
  };

  useEffect(() => {
    void Promise.all([
      repo.getAssets("default"),
      repo.getSavingsGoals("default"),
      repo.getLoans("default"),
    ]).then(([a, s, l]) => {
      setList(a);
      setSavingsGoals(s);
      setLoans(l);
      setLoading(false);
    });
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

  if (loading) {
    return <PageSkeleton title="资产" cards={4} />;
  }

  return (
    <div className="page-stack">
      <PageTopBar title="资产" />

      <section className="home-card page-hero">
        <div className="page-hero-label">净资产</div>
        <div className="page-hero-value">¥ {formatMoney(netWorth)}</div>
        <div className="page-hero-sub">
          资产 ¥ {formatMoney(assetTotal)} · 负债 ¥ {formatMoney(liabilityTotal)}
        </div>
      </section>

      <section className="home-card page-card">
        <h2 className="page-card-title">资产账户</h2>
        <div className="app-list">
          {positive.length === 0 ? (
            <div className="app-list-subtitle">暂无资产账户</div>
          ) : (
            positive.map((item) => (
              <div key={item.id} className="app-list-row">
                <div className="app-list-main">
                  <div className="app-list-title">{item.name}</div>
                  <div className="app-list-subtitle">{item.type}</div>
                </div>
                <div className="app-list-value">¥ {formatMoney(item.balance)}</div>
              </div>
            ))
          )}
          {savingsTotal > 0 && (
            <div className="app-list-row">
              <div className="app-list-main">
                <div className="app-list-title">储蓄总额</div>
                <div className="app-list-subtitle">来自储蓄计划</div>
              </div>
              <div className="app-list-value">¥ {formatMoney(savingsTotal)}</div>
            </div>
          )}
        </div>
      </section>

      <section className="home-card page-card">
        <h2 className="page-card-title">负债账户</h2>
        <div className="app-list">
          {negative.length === 0 && loanTotal === 0 ? (
            <div className="app-list-subtitle">暂无负债</div>
          ) : (
            <>
              {negative.map((item) => (
                <div key={item.id} className="app-list-row">
                  <div className="app-list-main">
                    <div className="app-list-title">{item.name}</div>
                    <div className="app-list-subtitle">{item.type}</div>
                  </div>
                  <div className="app-list-value" style={{ color: "#ff6848" }}>
                    -¥ {formatMoney(-item.balance)}
                  </div>
                </div>
              ))}
              {loanTotal > 0 && (
                <div className="app-list-row">
                  <div className="app-list-main">
                    <div className="app-list-title">贷款剩余</div>
                    <div className="app-list-subtitle">来自贷款</div>
                  </div>
                  <div className="app-list-value" style={{ color: "#ff6848" }}>
                    -¥ {formatMoney(loanTotal)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="home-card page-card">
        <h2 className="page-card-title">新增账户</h2>
        <div className="app-field-grid">
          <input className="app-input" value={name} onChange={(event) => setName(event.target.value)} placeholder="账户名称" />
          <select className="app-select" value={type} onChange={(event) => setType(event.target.value as AssetType)}>
            {assetTypes.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <input className="app-input" value={balance} onChange={(event) => setBalance(event.target.value.replace(/[^\d.-]/g, ""))} placeholder="余额（负债用负数）" />
          <button type="button" className="primary-button" onClick={() => void saveAsset()}>保存账户</button>
        </div>
      </section>
    </div>
  );
}