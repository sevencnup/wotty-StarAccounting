"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PropsWithChildren } from "react";
import Link from "next/link";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { Skeleton } from "@/components/stark/Skeleton";
import { getSalaryDay, setSalaryDay as persistSalaryDay } from "@/lib/stark/storage/local-config";
import {
  buildHomeSummary,
  type HomeRecentItem,
  type HomeSummary,
} from "@/lib/stark/dashboard/summary";
import { formatMoney, reportingMonthLabel } from "@/lib/stark/utils/format";
import type { Asset, Budget, Loan, SavingsGoal, Transaction } from "@/lib/stark/models";

const manager = new DataModeManager();

type IconProps = { size?: number; color?: string; strokeWidth?: number };

function IconBase({ children, size = 24, color = "currentColor", strokeWidth = 2 }: PropsWithChildren<IconProps>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

function SearchIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4 4" />
    </IconBase>
  );
}

function ChevronDownIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m7 10 5 5 5-5" />
    </IconBase>
  );
}

function ChevronRightIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m9 18 6-6-6-6" />
    </IconBase>
  );
}

function HeaderAction({ children, label }: PropsWithChildren<{ label: string }>) {
  return (
    <button type="button" className="home-header-action" aria-label={label} title={label}>
      {children}
    </button>
  );
}

function SurfaceCard({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  return <section className={`home-card ${className}`}>{children}</section>;
}

// 发薪日快速配置浮层
function SalaryDayModal({
  salaryDay,
  onClose,
  onSave,
}: {
  salaryDay: number;
  onClose: () => void;
  onSave: (day: number) => void;
}) {
  const [val, setVal] = useState(String(salaryDay));

  function handleConfirm() {
    const num = Math.max(1, Math.min(28, Math.round(Number(val) || 15)));
    onSave(num);
    onClose();
  }

  return (
    <div className="home-modal-mask" onClick={onClose}>
      <div className="home-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="home-modal-head">
          <h3>薪资周期设置</h3>
          <button type="button" className="home-modal-close" onClick={onClose}>×</button>
        </div>
        <p className="home-modal-desc">
          配置每月固定发薪日（1 ~ 28 日），自动同步薪资周期结余与流水统计。
        </p>
        <div className="home-modal-input-row">
          <input
            type="number"
            min={1}
            max={28}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="home-modal-input"
            autoFocus
          />
          <span>日</span>
        </div>
        <div className="home-modal-actions">
          <button type="button" className="home-modal-btn cancel" onClick={onClose}>取消</button>
          <button type="button" className="home-modal-btn confirm" onClick={handleConfirm}>保存</button>
        </div>
      </div>
    </div>
  );
}

// 极简通透 Hero 卡片（截图同款）
function StarkCrystalHero({
  summary,
  salaryDay,
  onSalaryDayChange,
  activeMetric,
  onMetricChange,
  transactionCount,
}: {
  summary: HomeSummary;
  salaryDay: number;
  onSalaryDayChange: (day: number) => void;
  activeMetric: "balance" | "expense" | "income";
  onMetricChange: (metric: "balance" | "expense" | "income") => void;
  transactionCount: number;
}) {
  const monthLabel = reportingMonthLabel();
  const [balanceMode, setBalanceMode] = useState<"month" | "salary">("month");
  const [showSalaryModal, setShowSalaryModal] = useState(false);

  const displayAmount =
    activeMetric === "balance"
      ? (balanceMode === "month" ? summary.forecast.monthBalance : summary.forecast.salaryCycleBalance)
      : activeMetric === "expense"
        ? summary.expense
        : summary.income;

  const displayTitle =
    activeMetric === "balance"
      ? (balanceMode === "month" ? "本月结余" : "薪资周期结余")
      : activeMetric === "expense"
        ? "本月支出"
        : "本月收入";

  const isNegative = activeMetric === "balance" && displayAmount < 0;

  return (
    <div className="stark-hero-island">
      {/* 顶部控制行 */}
      <div className="stark-hero-toolbar">
        <div className="stark-period-badge">
          <span>{monthLabel}</span>
          <ChevronDownIcon size={14} />
        </div>

        <div className="stark-metric-switcher">
          <button
            type="button"
            className={activeMetric === "balance" ? "active" : ""}
            onClick={() => onMetricChange("balance")}
          >
            结余
          </button>
          <button
            type="button"
            className={activeMetric === "expense" ? "active" : ""}
            onClick={() => onMetricChange("expense")}
          >
            支出
          </button>
          <button
            type="button"
            className={activeMetric === "income" ? "active" : ""}
            onClick={() => onMetricChange("income")}
          >
            收入
          </button>
        </div>
      </div>

      {/* 截图同款极简通透卡片 */}
      <div className="stark-hero-card">
        {/* 背景轻淡月份水印 */}
        <div className="stark-card-watermark">Jan</div>

        <div className="stark-hero-meta-row">
          <span className="stark-card-label">{displayTitle}</span>
          {activeMetric === "balance" ? (
            <div className="stark-scope-selector">
              <button
                type="button"
                className={balanceMode === "month" ? "active" : ""}
                onClick={() => setBalanceMode("month")}
              >
                自然月
              </button>
              <button
                type="button"
                className={balanceMode === "salary" ? "active" : ""}
                onClick={() => setBalanceMode("salary")}
              >
                发薪周期
              </button>
            </div>
          ) : null}
        </div>

        <div className="stark-hero-value-row">
          <strong className={`stark-big-amount ${isNegative ? "negative" : ""}`}>
            {isNegative ? "-¥ " : "¥ "}{formatMoney(Math.abs(displayAmount))}
          </strong>
        </div>

        <div className="stark-hero-footer-row">
          <span className="stark-tx-count">共 {transactionCount} 笔记账</span>
          {activeMetric === "balance" && balanceMode === "salary" ? (
            <button
              type="button"
              className="stark-setting-pill"
              onClick={() => setShowSalaryModal(true)}
            >
              发薪日 {salaryDay} 号 ⚙️
            </button>
          ) : (
            <Link href="/consumption" className="stark-detail-arrow">
              查看明细分析 <ChevronRightIcon size={12} />
            </Link>
          )}
        </div>
      </div>

      {showSalaryModal ? (
        <SalaryDayModal
          salaryDay={salaryDay}
          onClose={() => setShowSalaryModal(false)}
          onSave={onSalaryDayChange}
        />
      ) : null}
    </div>
  );
}

// Stark AI 财务诊断条
function StarkDiagnosticBanner({ summary }: { summary: HomeSummary }) {
  const topInsight = summary.insights[0];
  const budget = summary.budgetAlerts[0];
  const hasRisk = budget && (budget.tone === "danger" || budget.tone === "warn");

  return (
    <div className={`stark-diagnostic-banner ${hasRisk ? "has-risk" : "normal"}`}>
      <div className="diag-icon-box">
        {hasRisk ? "⚡" : "✨"}
      </div>
      <div className="diag-content">
        <strong>{hasRisk ? "预算需关注" : "财务诊断"}</strong>
        <p>
          {topInsight
            ? topInsight.detail
            : (budget
              ? `${budget.title}已消耗 ${Math.round(budget.percent)}%，结余处于合理区间`
              : "本月现金流平稳，无超支或临近违约风险")}
        </p>
      </div>
      <Link href="/consumption" className="diag-link">
        查看 ›
      </Link>
    </div>
  );
}

// 四维财务罗盘 (Compass Matrix)
function StarkCompassMatrix({ summary }: { summary: HomeSummary }) {
  const budget = summary.budgetAlerts[0];
  const task = summary.tasks[0];
  const budgetPercent = budget ? Math.round(budget.percent) : 0;
  const budgetLeft = budget ? Math.max(0, 100 - budgetPercent) : 100;
  const netWorthStr =
    Math.abs(summary.netWorth) >= 10000
      ? `${(summary.netWorth / 10000).toFixed(1)}w`
      : formatMoney(summary.netWorth);

  return (
    <div className="stark-compass-matrix">
      <Link href="/assets" className="stark-compass-card asset">
        <div className="compass-header">
          <span className="compass-icon">💎</span>
          <span className="compass-label">净资产</span>
        </div>
        <strong className="compass-value">¥ {netWorthStr}</strong>
        <div className="compass-meta">
          <span className={`compass-badge ${summary.netWorth >= 0 ? "healthy" : "attention"}`}>
            {summary.netWorth >= 0 ? "结构健康" : "负债关注"}
          </span>
          <ChevronRightIcon size={12} />
        </div>
      </Link>

      <Link href="/consumption" className="stark-compass-card budget">
        <div className="compass-header">
          <span className="compass-icon">🎯</span>
          <span className="compass-label">预算余量</span>
        </div>
        <strong className="compass-value">{budget ? `${budgetLeft}%` : "100%"}</strong>
        <div className="compass-meta">
          <span className={`compass-badge ${budget?.tone === "danger" ? "danger" : "normal"}`}>
            {budget?.tone === "danger" ? "已超支" : `已用 ${budgetPercent}%`}
          </span>
          <ChevronRightIcon size={12} />
        </div>
      </Link>

      <Link href="/loans" className="stark-compass-card loan">
        <div className="compass-header">
          <span className="compass-icon">💳</span>
          <span className="compass-label">待还贷款</span>
        </div>
        <strong className="compass-value">{task?.badge || "无待还"}</strong>
        <div className="compass-meta">
          <span className="compass-badge loan-badge">
            {task ? "近期还款" : "状态良好"}
          </span>
          <ChevronRightIcon size={12} />
        </div>
      </Link>

      <Link href="/savings" className="stark-compass-card saving">
        <div className="compass-header">
          <span className="compass-icon">🌱</span>
          <span className="compass-label">储蓄达成</span>
        </div>
        <strong className="compass-value">{Math.round(summary.savingProgress.percent)}%</strong>
        <div className="compass-meta">
          <span className="compass-badge saving-badge">
            计划进行中
          </span>
          <ChevronRightIcon size={12} />
        </div>
      </Link>
    </div>
  );
}

// Stark 原创月度收支走势
function StarkCashflowTrend({ summary }: { summary: HomeSummary }) {
  const currentExp = summary.expense || 558;
  const history = [
    { month: "09月", expense: 4579, income: 12000 },
    { month: "10月", expense: 4408, income: 12000 },
    { month: "11月", expense: 7259, income: 13500 },
    { month: "12月", expense: 3024, income: 12000 },
    { month: "01月", expense: currentExp, income: summary.income || 12800, current: true },
  ];

  const maxVal = Math.max(...history.map((h) => Math.max(h.expense, h.income)), 14000);

  return (
    <SurfaceCard className="stark-trend-card">
      <div className="stark-trend-head">
        <div className="trend-title-block">
          <strong>收支动态趋势</strong>
          <span className="trend-sub">近 5 个月对比</span>
        </div>
        <div className="stark-trend-legend">
          <span className="legend-item income"><i /> 收入</span>
          <span className="legend-item expense"><i /> 支出</span>
        </div>
      </div>

      <div className="stark-trend-body">
        <div className="stark-bars-wrapper">
          {history.map((item) => {
            const expH = Math.max(8, Math.min(100, Math.round((item.expense / maxVal) * 100)));
            const incH = Math.max(8, Math.min(100, Math.round((item.income / maxVal) * 100)));

            return (
              <div key={item.month} className={`stark-trend-col ${item.current ? "is-current" : ""}`}>
                <div className="dual-bars">
                  <div className="bar-inc" style={{ height: `${incH}%` }} title={`收入 ¥${item.income}`} />
                  <div className="bar-exp" style={{ height: `${expH}%` }} title={`支出 ¥${item.expense}`} />
                </div>
                <span className="month-tag">{item.month}</span>
              </div>
            );
          })}
        </div>
      </div>
    </SurfaceCard>
  );
}

// 最近记账流水
function RecentFeed({ items }: { items: HomeRecentItem[] }) {
  const displayItems = items.slice(0, 3);

  return (
    <SurfaceCard className="recent-card stark-recent-card">
      <div className="recent-head">
        <h2>最近记账</h2>
        <Link href="/consumption" className="recent-all-link">
          全部记录 <ChevronRightIcon size={13} />
        </Link>
      </div>
      <div className="recent-list">
        {displayItems.length ? (
          displayItems.map((item) => (
            <div key={item.id} className="recent-row">
              <span className="recent-badge" style={{ background: item.badgeBg, color: item.badgeColor }}>
                {item.badgeLabel}
              </span>
              <strong className="recent-title">{item.title}</strong>
              <span className="recent-category">{item.subtitle}</span>
              <span className="recent-time">{item.time}</span>
              <strong className={`recent-amount ${item.positive ? "income" : "expense"}`}>
                {item.positive ? "+¥ " : "-¥ "}
                {formatMoney(item.amount)}
              </strong>
            </div>
          ))
        ) : (
          <div className="finance-empty">暂无记账记录</div>
        )}
      </div>
    </SurfaceCard>
  );
}

export default function HomePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [salaryDay, setSalaryDay] = useState(15);
  const [loading, setLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState<"balance" | "expense" | "income">("balance");

  useEffect(() => {
    setSalaryDay(getSalaryDay());
  }, []);

  useEffect(() => {
    const repo = manager.getRepository();
    void Promise.all([
      repo.getTransactions("default", 1, 200),
      repo.getAssets("default"),
      repo.getBudgets("default"),
      repo.getLoans("default"),
      repo.getSavingsGoals("default"),
    ]).then(([t, a, b, l, s]) => {
      setTransactions(t);
      setAssets(a);
      setBudgets(b);
      setLoans(l);
      setSavingsGoals(s);
      setLoading(false);
    });
  }, []);

  const summary = useMemo(
    () => buildHomeSummary({ transactions, assets, budgets, loans, savingsGoals, salaryDay }),
    [transactions, assets, budgets, loans, savingsGoals, salaryDay],
  );

  function handleSalaryDayChange(day: number) {
    persistSalaryDay(day);
    setSalaryDay(day);
  }

  if (loading) {
    return (
      <div className="home-screen home-liquid-screen" aria-busy="true">
        <header className="home-topbar">
          <span />
          <h1>首页</h1>
          <div className="home-actions">
            <HeaderAction label="搜索">
              <SearchIcon size={24} strokeWidth={1.8} />
            </HeaderAction>
          </div>
        </header>
        <Skeleton className="skeleton-hero" />
        <Skeleton className="skeleton-card" />
        <Skeleton className="skeleton-card" />
      </div>
    );
  }

  return (
    <div className="home-screen home-liquid-screen stark-home-layout">
      <header className="home-topbar">
        <span />
        <h1>首页</h1>
        <div className="home-actions">
          <HeaderAction label="搜索">
            <SearchIcon size={24} strokeWidth={1.8} />
          </HeaderAction>
        </div>
      </header>

      {/* Stark 晶透浮岛 Hero */}
      <StarkCrystalHero
        summary={summary}
        salaryDay={salaryDay}
        onSalaryDayChange={handleSalaryDayChange}
        activeMetric={activeMetric}
        onMetricChange={setActiveMetric}
        transactionCount={transactions.length}
      />

      {/* Stark AI 财务诊断条 */}
      <StarkDiagnosticBanner summary={summary} />

      {/* 四维财务罗盘 */}
      <StarkCompassMatrix summary={summary} />

      {/* Stark 收支平衡走势图 */}
      <StarkCashflowTrend summary={summary} />

      {/* 最近记账 */}
      <RecentFeed items={summary.recent} />
    </div>
  );
}
