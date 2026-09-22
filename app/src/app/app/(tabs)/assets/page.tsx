"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { PageTopBar } from "@/components/stark/PageTopBar";
import { PageDataError, PageSkeleton } from "@/components/stark/Skeleton";
import { EChartView } from "@/components/stark/EChartView";
import { LazyJournalPanel as JournalPanel } from "@/components/stark/LazyJournalPanel";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { clampPercent, formatMoney } from "@/lib/stark/utils/format";
import { getCurrentAccountId } from "@/lib/stark/storage/local-config";
import type { Asset, AssetType, Loan, SavingsGoal } from "@/lib/stark/models";
import type { EChartsCoreOption } from "echarts/core";
import { translateValue, useAppLocale } from "@/lib/stark/i18n";

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

function buildAssetDonutOption(groups: Array<{ label: string; amount: number; color: string }>, locale: "zh-CN" | "en-US"): EChartsCoreOption {
  const data = groups.map((g) => ({
    name: translateValue(g.label, locale),
    value: g.amount,
    itemStyle: { color: g.color },
  }));

  return {
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(255, 255, 255, 0.96)",
      borderColor: "rgba(13, 138, 95, 0.2)",
      textStyle: { color: "#142036", fontSize: 12 },
      formatter: (params: any) => {
        return `<div style="font-size:11px;color:#64748b;">${params.name}</div><strong style="color:#142036;">¥ ${formatMoney(params.value)}</strong> <span style="color:#0d8a5f;">(${params.percent}%)</span>`;
      },
    },
    series: [
      {
        type: "pie",
        radius: ["55%", "78%"],
        center: ["50%", "50%"],
        avoidLabelOverlap: false,
        label: { show: false },
        data: data.length ? data : [{ value: 1, name: translateValue("暂无配置", locale), itemStyle: { color: "#e2ecf2" } }],
      },
    ],
  };
}

export default function AssetsPage() {
  const locale = useAppLocale();
  const [list, setList] = useState<Asset[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [loadVersion, setLoadVersion] = useState(0);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const reload = () => {
    const accountId = getCurrentAccountId();
    void Promise.all([repo.getAssets(accountId), repo.getSavingsGoals(accountId), repo.getLoans(accountId)])
      .then(([assets, savings, loanList]) => {
        setList(assets);
        setSavingsGoals(savings);
        setLoans(loanList);
        setLoadError(false);
      })
      .catch(() => setLoadError(true));
  };

  async function deleteAsset(item: Asset) {
    if (!window.confirm(`确定删除资产“${item.name}”吗？`)) return;
    await repo.deleteAsset(item.id);
    setEditingAsset(null);
    reload();
  }

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(false);
    const accountId = getCurrentAccountId();
    void Promise.all([repo.getAssets(accountId), repo.getSavingsGoals(accountId), repo.getLoans(accountId)])
      .then(([assets, savings, loanList]) => {
        if (!active) return;
        setList(assets);
        setSavingsGoals(savings);
        setLoans(loanList);
      })
      .catch(() => {
        if (active) setLoadError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [loadVersion]);

  useEffect(() => {
    const handleAssetSaved = () => reload();
    window.addEventListener("stark:asset-saved", handleAssetSaved);
    return () => window.removeEventListener("stark:asset-saved", handleAssetSaved);
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
    if (savingsTotal > 0) groups.push({ type: "OTHER", label: "储蓄计划", color: "#0d8a5f", amount: savingsTotal });

    return {
      positive,
      negative,
      savingsTotal,
      loanTotal,
      assetTotal,
      liabilityTotal,
      netWorth,
      liquid,
      liquidity,
      debtRatio,
      concentration,
      groups: groups.filter((item) => item.amount > 0),
    };
  }, [list, savingsGoals, loans]);

  const assetDonutOption = useMemo(() => buildAssetDonutOption(summary.groups, locale), [locale, summary.groups]);

  if (loading) return <PageSkeleton title="资产" cards={4} />;
  if (loadError) return <PageDataError title="资产" onRetry={() => setLoadVersion((version) => version + 1)} />;

  const assetRatioPct = summary.assetTotal + summary.liabilityTotal > 0
    ? (summary.assetTotal / (summary.assetTotal + summary.liabilityTotal)) * 100
    : 100;

  return (
    <div className="page-stack finance-page assets-page">
      <PageTopBar title="资产" />

      <aside className="financial-planning-notice" role="note">
        <strong>规划提醒</strong>
        <p>本项目只用于规划，不能实际存入资金，请合理规划资金存放。</p>
      </aside>

      {/* 净资产驾驶舱：核心总览 */}
      <section className="asset-cockpit-hero">
        <div className="finance-eyebrow-row">
          <span className="finance-eyebrow">资产负债全景</span>
          <span className={`finance-state-chip ${summary.netWorth >= 0 ? "healthy" : "attention"}`}>
            {summary.netWorth >= 0 ? "结构稳健" : "负债关注"}
          </span>
        </div>

        <div className="asset-cockpit-main">
          <div className="asset-cockpit-net">
            <span>净资产估值</span>
            <strong className={summary.netWorth >= 0 ? "positive" : "negative"}>
              ¥ {formatMoney(summary.netWorth)}
            </strong>
            <p>{summary.netWorth >= 0 ? "资产能够充足覆盖当前全部负债" : "负债高于资产，建议优先降低高息债务"}</p>
          </div>

          <div className="asset-cockpit-sub-side">
            <div className="asset-sub-val asset">
              <span>资产总额</span>
              <strong>¥ {formatMoney(summary.assetTotal)}</strong>
            </div>
            <div className="asset-sub-val liability">
              <span>负债总额</span>
              <strong>¥ {formatMoney(summary.liabilityTotal)}</strong>
            </div>
          </div>
        </div>

        {/* 资产负债对比轨 */}
        <div className="asset-balance-bar-box">
          <div className="asset-balance-bar" aria-label="资产负债对比">
            <span className="bar-asset" style={{ width: `${assetRatioPct}%` }} />
            <span className="bar-liability" style={{ width: `${100 - assetRatioPct}%` }} />
          </div>
          <div className="asset-balance-bar-labels">
            <span>资产占比 {assetRatioPct.toFixed(0)}%</span>
            <span>负债占比 {(100 - assetRatioPct).toFixed(0)}%</span>
          </div>
        </div>

        <div className="asset-cockpit-metrics">
          <div className="asset-metric-tile">
            <span>流动资产</span>
            <strong>¥ {formatMoney(summary.liquid)}</strong>
            <small>占比 {summary.liquidity.toFixed(0)}%</small>
          </div>
          <div className={`asset-metric-tile ${summary.debtRatio <= 40 ? "positive" : summary.debtRatio <= 60 ? "warning" : "danger"}`}>
            <span>负债率</span>
            <strong>{summary.debtRatio.toFixed(1)}%</strong>
            <small>{summary.debtRatio <= 40 ? "安全区间" : "负债偏高"}</small>
          </div>
          <div className="asset-metric-tile">
            <span>最大单项</span>
            <strong>{summary.concentration.toFixed(1)}%</strong>
            <small>{summary.concentration <= 50 ? "分散适中" : "高度集中"}</small>
          </div>
        </div>
      </section>

      {/* 资产配置结构分析（环形图 + 矩阵） */}
      <section className="home-card finance-section asset-donut-card">
        <div className="finance-section-head">
          <div>
            <h2>资产配置构成</h2>
            <span>资金分布与占比分析</span>
          </div>
          <span className="mini-section-note">{summary.groups.length} 类配置</span>
        </div>

        {summary.groups.length ? (
          <div className="asset-donut-content">
            <div className="asset-donut-view">
              <EChartView option={assetDonutOption} className="asset-donut-chart" />
            </div>
            <div className="asset-donut-list">
              {summary.groups.map((group) => {
                const pct = summary.assetTotal > 0 ? (group.amount / summary.assetTotal) * 100 : 0;
                return (
                  <div key={group.label} className="asset-donut-row">
                    <div className="asset-donut-lead">
                      <i style={{ background: group.color }} />
                      <strong>{translateValue(group.label, locale)}</strong>
                    </div>
                    <span className="asset-donut-pct">{pct.toFixed(1)}%</span>
                    <strong className="asset-donut-amount">¥ {formatMoney(group.amount)}</strong>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="finance-empty">暂无资产配置数据</div>
        )}
      </section>

      {/* 资产明细账本（资产账户 + 负债账户） */}
      <section className="home-card finance-section asset-ledger-section">
        <div className="finance-section-head">
          <div>
            <h2>资产与负债明细</h2>
            <span>各资金账户与借贷清单</span>
          </div>
          <span className="mini-section-note">{list.length + (savingsGoals.length ? 1 : 0) + (loans.length ? 1 : 0)} 项关联</span>
        </div>

        <div className="asset-ledger-modern-grid">
          {/* 资产组 */}
          <div className="asset-ledger-pane asset-pane">
            <div className="asset-pane-title">
              <span className="pane-tag asset">正向资产</span>
              <strong>¥ {formatMoney(summary.assetTotal)}</strong>
            </div>
            <div className="asset-item-list">
              {summary.positive.map((item) => (
                <div key={item.id} className="asset-item-row">
                  <i style={{ background: typeMeta[item.type].color }}>{typeMeta[item.type].short}</i>
                  <div className="asset-item-name">
                    <strong>{item.name}</strong>
                    <small>{translateValue(typeMeta[item.type].label, locale)}</small>
                  </div>
                  <strong className="asset-item-val">¥ {formatMoney(item.balance)}</strong>
                  <div className="finance-item-actions"><button type="button" onClick={() => setEditingAsset(item)}>编辑</button><button type="button" onClick={() => void deleteAsset(item)}>删除</button></div>
                </div>
              ))}
              {summary.savingsTotal > 0 ? (
                <div className="asset-item-row">
                  <i className="savings-mark">储</i>
                  <div className="asset-item-name">
                    <strong>储蓄计划</strong>
                    <small>{savingsGoals.length} 个目标计划</small>
                  </div>
                  <strong className="asset-item-val">¥ {formatMoney(summary.savingsTotal)}</strong>
                </div>
              ) : null}
              {!summary.positive.length && summary.savingsTotal === 0 ? (
                <div className="finance-empty">暂无资产账户</div>
              ) : null}
            </div>
          </div>

          {/* 负债组 */}
          <div className="asset-ledger-pane liability-pane">
            <div className="asset-pane-title">
              <span className="pane-tag liability">应还负债</span>
              <strong>¥ {formatMoney(summary.liabilityTotal)}</strong>
            </div>
            <div className="asset-item-list">
              {summary.negative.map((item) => (
                <div key={item.id} className="asset-item-row liability">
                  <i>{typeMeta[item.type].short}</i>
                  <div className="asset-item-name">
                    <strong>{item.name}</strong>
                    <small>{translateValue(typeMeta[item.type].label, locale)}</small>
                  </div>
                  <strong className="asset-item-val liability">¥ {formatMoney(Math.abs(item.balance))}</strong>
                  <div className="finance-item-actions"><button type="button" onClick={() => setEditingAsset(item)}>编辑</button><button type="button" onClick={() => void deleteAsset(item)}>删除</button></div>
                </div>
              ))}
              {summary.loanTotal > 0 ? (
                <div className="asset-item-row liability">
                  <i className="loan-mark">贷</i>
                  <div className="asset-item-name">
                    <strong>贷款待还</strong>
                    <small>{loans.filter((item) => item.status !== "PAID_OFF").length} 笔进行中</small>
                  </div>
                  <strong className="asset-item-val liability">¥ {formatMoney(summary.loanTotal)}</strong>
                </div>
              ) : null}
              {!summary.negative.length && summary.loanTotal === 0 ? (
                <div className="finance-empty">暂无负债，表现优秀</div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
      {editingAsset ? <JournalPanel mode="sheet" variant="asset" asset={editingAsset} onClose={() => setEditingAsset(null)} onSaved={() => { setEditingAsset(null); reload(); }} /> : null}
    </div>
  );
}
