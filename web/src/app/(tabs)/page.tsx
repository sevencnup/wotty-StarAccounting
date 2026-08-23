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
          <h3>设置发薪日</h3>
          <button type="button" className="home-modal-close" onClick={onClose}>×</button>
        </div>
        <p className="home-modal-desc">
          发薪日用于自动统计薪资周期的实际支出与结余（可选 1 ~ 28 日）。
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

// 支付宝风格浅光 Hero
function AlipayLightHero({
  summary,
  salaryDay,
  onSalaryDayChange,
  activeTab,
  onTabChange,
  transactionCount,
}: {
  summary: HomeSummary;
  salaryDay: number;
  onSalaryDayChange: (day: number) => void;
  activeTab: "balance" | "expense" | "income";
  onTabChange: (tab: "balance" | "expense" | "income") => void;
  transactionCount: number;
}) {
  const monthLabel = reportingMonthLabel();
  const [balanceMode, setBalanceMode] = useState<"month" | "salary">("month");
  const [showSalaryModal, setShowSalaryModal] = useState(false);

  const displayAmount =
    activeTab === "balance"
      ? (balanceMode === "month" ? summary.forecast.monthBalance : summary.forecast.salaryCycleBalance)
      : activeTab === "expense"
        ? summary.expense
        : summary.income;

  const displayTitle =
    activeTab === "balance"
      ? (balanceMode === "month" ? "本月结余" : "薪资周期结余")
      : activeTab === "expense"
        ? "本月支出"
        : "本月收入";

  const isNegative = activeTab === "balance" && displayAmount < 0;

  return (
    <div className="alipay-hero-wrapper">
      {/* 顶部轻量控制栏 */}
      <div className="alipay-top-controls">
        <button type="button" className="alipay-month-selector">
          <span>{monthLabel}</span>
          <ChevronDownIcon size={16} />
        </button>

        <div className="alipay-tab-pill">
          <button
            type="button"
            className={activeTab === "balance" ? "active" : ""}
            onClick={() => onTabChange("balance")}
          >
            结余
          </button>
          <button
            type="button"
            className={activeTab === "expense" ? "active" : ""}
            onClick={() => onTabChange("expense")}
          >
            支出
          </button>
          <button
            type="button"
            className={activeTab === "income" ? "active" : ""}
            onClick={() => onTabChange("income")}
          >
            收入
          </button>
        </div>
      </div>

      {/* 浅光通透主卡片 */}
      <div className="alipay-light-card">
        <div className="alipay-card-watermark">Jan</div>

        <div className="alipay-card-main">
          <div className="alipay-card-label-row">
            <span className="alipay-card-label">{displayTitle}</span>
            {activeTab === "balance" ? (
              <div className="alipay-mode-toggle">
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
                  薪资周期
                </button>
              </div>
            ) : null}
          </div>

          <div className="alipay-amount-row">
            <strong className={`alipay-amount ${isNegative ? "negative" : ""}`}>
              {isNegative ? "-¥ " : "¥ "}{formatMoney(Math.abs(displayAmount))}
            </strong>
          </div>

          <div className="alipay-card-footer">
            <span className="alipay-count-tag">共 {transactionCount} 笔记账</span>
            {activeTab === "balance" && balanceMode === "salary" ? (
              <button
                type="button"
                className="alipay-salary-link"
                onClick={() => setShowSalaryModal(true)}
              >
                发薪日 {salaryDay} 号 ⚙️
              </button>
            ) : (
              <Link href="/consumption" className="alipay-detail-link">
                查看明细分析 <ChevronRightIcon size={12} />
              </Link>
            )}
          </div>
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

// 智能月度小结
function MonthInsightSummary({ summary }: { summary: HomeSummary }) {
  const topInsight = summary.insights[0];
  const budget = summary.budgetAlerts[0];
  const isDanger = budget && budget.tone === "danger";

  return (
    <SurfaceCard className="alipay-insight-card">
      <div className="alipay-insight-head">
        <div className="alipay-insight-title">
          <span className="alipay-insight-icon">📅</span>
          <strong>月度小结</strong>
        </div>
        <Link href="/consumption" className="alipay-sub-btn">
          收支分析 ›
        </Link>
      </div>

      <div className="alipay-insight-body">
        <p className="alipay-insight-text">
          ● 本月支出 ¥{formatMoney(summary.expense)}
          {summary.expenseChange !== 0 ? (
            <>，较上月同期{summary.expenseChange > 0 ? "增加 " : "减少 "}
              <b className={summary.expenseChange > 0 ? "text-warn" : "text-safe"}>
                {Math.abs(summary.expenseChange)}%
              </b>
            </>
          ) : "，整体消费节奏平稳"}。
          {topInsight ? topInsight.detail : (budget ? ` ${budget.title}目前已使用 ${Math.round(budget.percent)}%` : "")}
        </p>
      </div>
    </SurfaceCard>
  );
}

// 4格微型指标卡 (Metrics Grid)
function MetricsGrid4({ summary }: { summary: HomeSummary }) {
  const budget = summary.budgetAlerts[0];
  const task = summary.tasks[0];
  const budgetPercent = budget ? Math.round(budget.percent) : 0;
  const budgetRemaining = budget ? Math.max(0, 100 - budgetPercent) : 100;

  return (
    <div className="alipay-metrics-grid">
      <Link href="/assets" className="alipay-metric-tile">
        <span className="metric-name">净资产</span>
        <strong className="metric-val">¥ {Math.abs(summary.netWorth) >= 10000 ? `${(summary.netWorth / 10000).toFixed(1)}w` : formatMoney(summary.netWorth)}</strong>
        <span className={`metric-sub ${summary.netWorth >= 0 ? "safe" : "danger"}`}>
          {summary.netWorth >= 0 ? "结构健康" : "负债关注"} ›
        </span>
      </Link>

      <Link href="/consumption" className="alipay-metric-tile">
        <span className="metric-name">预算可用</span>
        <strong className="metric-val">{budget ? `${budgetRemaining}%` : "100%"}</strong>
        <span className={`metric-sub ${budget?.tone === "danger" ? "danger" : budget?.tone === "warn" ? "warn" : "normal"}`}>
          {budget?.tone === "danger" ? "已超支" : `已用 ${budgetPercent}%`} ›
        </span>
      </Link>

      <Link href="/loans" className="alipay-metric-tile">
        <span className="metric-name">贷款待还</span>
        <strong className="metric-val">{task?.badge || "无待办"}</strong>
        <span className={`metric-sub ${task?.tone === "danger" ? "danger" : "normal"}`}>
          {task ? "近期还款" : "暂无待还"} ›
        </span>
      </Link>

      <Link href="/savings" className="alipay-metric-tile">
        <span className="metric-name">储蓄达成</span>
        <strong className="metric-val">{Math.round(summary.savingProgress.percent)}%</strong>
        <span className="metric-sub safe">
          目标计划 ›
        </span>
      </Link>
    </div>
  );
}

// 简易近5个月月度对比柱状图 (参考支付宝)
function MonthlyMiniBarChart({ summary }: { summary: HomeSummary }) {
  // 模拟近5个月消费走势（以当前月支出为基准形成对比）
  const currentExp = summary.expense || 558;
  const history = [
    { month: "9月", amount: 4579 },
    { month: "10月", amount: 4408 },
    { month: "11月", amount: 7259 },
    { month: "12月", amount: 3024 },
    { month: "1月", amount: currentExp, current: true },
  ];

  const maxVal = Math.max(...history.map((h) => h.amount), 8000);
  const avgVal = Math.round(history.reduce((s, h) => s + h.amount, 0) / history.length);

  return (
    <SurfaceCard className="alipay-barchart-card">
      <div className="alipay-barchart-head">
        <strong>月度消费趋势</strong>
        <span className="barchart-avg-tag">月均 ¥ {formatMoney(avgVal)}</span>
      </div>

      <div className="alipay-barchart-body">
        <div className="barchart-bars">
          {history.map((item) => {
            const heightPercent = Math.max(12, Math.min(100, Math.round((item.amount / maxVal) * 100)));
            return (
              <div key={item.month} className={`barchart-col ${item.current ? "is-current" : ""}`}>
                <span className="bar-val">¥{Math.round(item.amount)}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ height: `${heightPercent}%` }} />
                </div>
                <span className="bar-label">{item.month}</span>
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
    <SurfaceCard className="recent-card alipay-recent-card">
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
  const [activeTab, setActiveTab] = useState<"balance" | "expense" | "income">("expense");

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
    <div className="home-screen home-liquid-screen alipay-home-container">
      <header className="home-topbar">
        <span />
        <h1>首页</h1>
        <div className="home-actions">
          <HeaderAction label="搜索">
            <SearchIcon size={24} strokeWidth={1.8} />
          </HeaderAction>
        </div>
      </header>

      {/* 支付宝风格浅光 Hero */}
      <AlipayLightHero
        summary={summary}
        salaryDay={salaryDay}
        onSalaryDayChange={handleSalaryDayChange}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        transactionCount={transactions.length}
      />

      {/* 4格核心指标快捷枢纽 */}
      <MetricsGrid4 summary={summary} />

      {/* 月度小结洞察 */}
      <MonthInsightSummary summary={summary} />

      {/* 月度消费趋势 */}
      <MonthlyMiniBarChart summary={summary} />

      {/* 最近记账 */}
      <RecentFeed items={summary.recent} />
    </div>
  );
}
