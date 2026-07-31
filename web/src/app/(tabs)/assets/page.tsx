"use client";

import { useEffect, useMemo, useState } from "react";
import { PageTopBar } from "@/components/stark/PageTopBar";
import { PageSkeleton } from "@/components/stark/Skeleton";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { clampPercent, formatMoney, nowText } from "@/lib/stark/utils/format";
import type { Asset, AssetType, Loan, SavingsGoal } from "@/lib/stark/models";

const repo = new DataModeManager().getRepository();
const assetTypes: AssetType[] = ["CASH", "BANK_CARD", "ALIPAY", "WECHAT", "INVESTMENT", "OTHER"];
const typeMeta: Record<AssetType, { label: string; short: string; color: string }> = {
  CASH: { label: "现金", short: "现", color: "#e9a23b" },
  BANK_CARD: { label: "银行卡", short: "卡", color: "#397fe8" },
  ALIPAY: { label: "支付宝", short: "支", color: "#2e91ee" },
  WECHAT: { label: "微信", short: "微", color: "#25a96f" },
  INVESTMENT: { label: "投资", short: "投", color: "#e27662" },
  OTHER: { label: "其他", short: "其", color: "#8996aa" },
};

export default function AssetsPage() {
  const [list, setList] = useState<Asset[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [type, setType] = useState<AssetType>("ALIPAY");

  const reload = () => {
    void Promise.all([repo.getAssets("default"), repo.getSavingsGoals("default"), repo.getLoans("default")])
      .then(([assets, savings, loanList]) => {
        setList(assets);
        setSavingsGoals(savings);
        setLoans(loanList);
      });
  };

  useEffect(() => {
    let active = true;
    void Promise.all([repo.getAssets("default"), repo.getSavingsGoals("default"), repo.getLoans("default")])
      .then(([assets, savings, loanList]) => {
        if (!active) return;
        setList(assets);
        setSavingsGoals(savings);
        setLoans(loanList);
      }).finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const summary = useMemo(() => {
    const positive = list.filter((item) => item.balance >= 0);
    const negative = list.filter((item) => item.balance < 0);
    const savingsTotal = savingsGoals.reduce((sum, item) => sum + item.currentAmount, 0);
    const loanTotal = loans.filter((item) => item.status !== "PAID_OFF").reduce((sum, item) => sum + item.remainingAmount, 0);
    const accountAssets = positive.reduce((sum, item) => sum + item.balance, 0);
    const accountLiabilities = negative.reduce((sum, item) => sum + Math.abs(item.balance), 0);
    const assetTotal = accountAssets + savingsTotal;
    const liabilityTotal = accountLiabilities + loanTotal;
    const netWorth = assetTotal - liabilityTotal;
    const liquid = positive
      .filter((item) => ["CASH", "BANK_CARD", "ALIPAY", "WECHAT"].includes(item.type))
      .reduce((sum, item) => sum + item.balance, 0);
    const maxHolding = Math.max(savingsTotal, ...positive.map((item) => item.balance), 0);
    const liquidity = assetTotal > 0 ? (liquid / assetTotal) * 100 : 0;
    const debtRatio = assetTotal > 0 ? (liabilityTotal / assetTotal) * 100 : liabilityTotal > 0 ? 100 : 0;
    const concentration = assetTotal > 0 ? (maxHolding / assetTotal) * 100 : 0;

    const groups = assetTypes.map((assetType) => ({
      type: assetType,
      label: typeMeta[assetType].label,
      color: typeMeta[assetType].color,
      amount: positive.filter((item) => item.type === assetType).reduce((sum, item) => sum + item.balance, 0),
    }));
    if (savingsTotal > 0) groups.push({ type: "OTHER", label: "储蓄计划", color: "#55b892", amount: savingsTotal });

    return { positive, negative, savingsTotal, loanTotal, assetTotal, liabilityTotal, netWorth, liquidity, debtRatio, concentration, groups: groups.filter((item) => item.amount > 0) };
  }, [list, savingsGoals, loans]);

  async function saveAsset() {
    const now = nowText();
    await repo.saveAsset({
      id: crypto.randomUUID(), userId: "local-user", accountId: "default",
      name: name.trim() || "新资产", type, balance: Number(balance) || 0, currency: "CNY",
      createdAt: now, updatedAt: now,
    });
    setName("");
    setBalance("");
    setType("ALIPAY");
    reload();
  }

  if (loading) return <PageSkeleton title="资产" cards={4} />;

  return (
    <div className="page-stack finance-page assets-page">
      <PageTopBar title="资产" />

      <section className="asset-balance-sheet">
        <div className="asset-net-block">
          <div className="finance-eyebrow">净资产</div>
          <strong>¥ {formatMoney(summary.netWorth)}</strong>
          <span>{summary.netWorth >= 0 ? "资产覆盖负债，净值为正" : "负债高于资产，需要优先降债"}</span>
        </div>
        <div className="asset-sheet-side">
          <div><span>总资产</span><strong>¥ {formatMoney(summary.assetTotal)}</strong><i className="positive" /></div>
          <div><span>总负债</span><strong>¥ {formatMoney(summary.liabilityTotal)}</strong><i className="negative" /></div>
        </div>
        <div className="asset-balance-track" aria-label="资产负债比例">
          <span style={{ width: `${summary.assetTotal + summary.liabilityTotal > 0 ? (summary.assetTotal / (summary.assetTotal + summary.liabilityTotal)) * 100 : 100}%` }} />
        </div>
      </section>

      <section className="home-card finance-section asset-allocation-section">
        <div className="finance-section-head"><h2>资产构成</h2><span>{summary.groups.length} 类配置</span></div>
        {summary.groups.length ? (
          <>
            <div className="asset-allocation-bar">
              {summary.groups.map((group) => <span key={`${group.label}-${group.amount}`} style={{ width: `${(group.amount / summary.assetTotal) * 100}%`, background: group.color }} />)}
            </div>
            <div className="asset-allocation-list">
              {summary.groups.map((group) => (
                <div key={`${group.label}-${group.amount}`} className="asset-allocation-row">
                  <i style={{ background: group.color }} />
                  <span>{group.label}</span>
                  <em>{summary.assetTotal > 0 ? `${((group.amount / summary.assetTotal) * 100).toFixed(1)}%` : "0%"}</em>
                  <strong>¥ {formatMoney(group.amount)}</strong>
                </div>
              ))}
            </div>
          </>
        ) : <div className="finance-empty">暂无资产配置数据</div>}
      </section>

      <section className="asset-health-section">
        <div className="finance-section-head"><h2>财务体检</h2><span>基于当前资产</span></div>
        <div className="asset-health-grid">
          <article>
            <div className="asset-health-ring" style={{ "--metric": `${clampPercent(summary.liquidity)}%` } as React.CSSProperties}><strong>{Math.round(summary.liquidity)}%</strong></div>
            <span>流动资产率</span><p>现金与支付账户占比</p>
          </article>
          <article>
            <div className="asset-health-ring debt" style={{ "--metric": `${clampPercent(summary.debtRatio)}%` } as React.CSSProperties}><strong>{Math.round(summary.debtRatio)}%</strong></div>
            <span>负债率</span><p>{summary.debtRatio <= 40 ? "结构稳健" : "建议降低负债"}</p>
          </article>
          <article>
            <div className="asset-health-ring focus" style={{ "--metric": `${clampPercent(summary.concentration)}%` } as React.CSSProperties}><strong>{Math.round(summary.concentration)}%</strong></div>
            <span>集中度</span><p>{summary.concentration <= 50 ? "配置较分散" : "单项占比较高"}</p>
          </article>
        </div>
      </section>

      <section className="asset-ledger-section">
        <div className="finance-section-head"><h2>资产负债清单</h2><span>完整口径</span></div>
        <div className="asset-ledger-grid">
          <div className="home-card asset-ledger-card positive-ledger">
            <div className="asset-ledger-title"><span>资产</span><strong>¥ {formatMoney(summary.assetTotal)}</strong></div>
            <div className="asset-ledger-list">
              {summary.positive.map((item) => (
                <div key={item.id}><i style={{ background: typeMeta[item.type].color }}>{typeMeta[item.type].short}</i><span><strong>{item.name}</strong><small>{typeMeta[item.type].label}</small></span><em>¥ {formatMoney(item.balance)}</em></div>
              ))}
              {summary.savingsTotal > 0 ? <div><i className="savings-mark">储</i><span><strong>储蓄计划</strong><small>{savingsGoals.length} 个目标</small></span><em>¥ {formatMoney(summary.savingsTotal)}</em></div> : null}
              {!summary.positive.length && summary.savingsTotal === 0 ? <div className="finance-empty">暂无资产</div> : null}
            </div>
          </div>
          <div className="home-card asset-ledger-card negative-ledger">
            <div className="asset-ledger-title"><span>负债</span><strong>¥ {formatMoney(summary.liabilityTotal)}</strong></div>
            <div className="asset-ledger-list">
              {summary.negative.map((item) => (
                <div key={item.id}><i>{typeMeta[item.type].short}</i><span><strong>{item.name}</strong><small>{typeMeta[item.type].label}</small></span><em>¥ {formatMoney(Math.abs(item.balance))}</em></div>
              ))}
              {summary.loanTotal > 0 ? <div><i>贷</i><span><strong>贷款剩余</strong><small>{loans.filter((item) => item.status !== "PAID_OFF").length} 笔贷款</small></span><em>¥ {formatMoney(summary.loanTotal)}</em></div> : null}
              {!summary.negative.length && summary.loanTotal === 0 ? <div className="finance-empty">暂无负债</div> : null}
            </div>
          </div>
        </div>
      </section>

      <section className="home-card finance-section finance-create-section">
        <div className="finance-section-head"><h2>新增资产</h2><span>负债余额可填负数</span></div>
        <div className="finance-form-grid asset-form-grid">
          <label><span>资产名称</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="如工资卡" /></label>
          <label><span>资产类型</span><select value={type} onChange={(event) => setType(event.target.value as AssetType)}>{assetTypes.map((item) => <option key={item} value={item}>{typeMeta[item].label}</option>)}</select></label>
          <label className="wide"><span>当前余额</span><input inputMode="decimal" value={balance} onChange={(event) => setBalance(event.target.value.replace(/[^\d.-]/g, ""))} placeholder="0.00" /></label>
        </div>
        <button type="button" className="finance-primary-action" onClick={() => void saveAsset()}>保存资产</button>
      </section>
    </div>
  );
}
