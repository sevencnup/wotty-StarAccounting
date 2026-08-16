"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PropsWithChildren } from "react";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { Skeleton } from "@/components/stark/Skeleton";
import { getSalaryDay, setSalaryDay as persistSalaryDay } from "@/lib/stark/storage/local-config";
import {
  buildHomeSummary,
  type HomeBudgetAlert,
  type HomeProgress,
  type HomeRecentItem,
  type HomeSummary,
} from "@/lib/stark/dashboard/summary";
import { formatMoney, reportingMonthLabel } from "@/lib/stark/utils/format";
import type { Asset, Budget, Loan, SavingsGoal, Transaction } from "@/lib/stark/models";

const manager = new DataModeManager();

function formatPercent(value: number) {
  return Number.isInteger(value) ? String(value) : `${Math.round(value * 10) / 10}`;
}

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

function EyeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.7" />
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

function FinanceOverviewCard({ summary }: { summary: HomeSummary }) {
  const healthy = summary.netWorth >= 0;
  return (
    <SurfaceCard className="finance-overview-card">
      <div className="fo-net-row">
        <span className="fo-net-label">净资产</span>
        <strong className={healthy ? "positive" : "negative"}>¥ {formatMoney(summary.netWorth)}</strong>
        <span className={healthy ? "fo-tag" : "fo-tag negative"}>{healthy ? "资产结构健康" : "负债需关注"}</span>
      </div>
      <div className="fo-mini-stats">
        <div><span>总资产</span><strong>¥ {formatMoney(summary.assetTotal)}</strong></div>
        <div><span>总负债</span><strong>¥ {formatMoney(summary.liabilityTotal)}</strong></div>
        <div><span>储蓄</span><strong>¥ {formatMoney(summary.totalSavings)}</strong></div>
      </div>
    </SurfaceCard>
  );
}

function MonthlySummaryCard({
  summary,
  salaryDay,
  onSalaryDayChange,
}: {
  summary: HomeSummary;
  salaryDay: number;
  onSalaryDayChange: (day: number) => void;
}) {
  const monthLabel = reportingMonthLabel();
  const [balanceMode, setBalanceMode] = useState<"month" | "salary">("month");
  const [editingSalaryDay, setEditingSalaryDay] = useState(false);
  const [salaryDayInput, setSalaryDayInput] = useState(String(salaryDay));
  const balance = balanceMode === "month" ? summary.forecast.monthBalance : summary.forecast.salaryCycleBalance;
  const positive = balance >= 0;
  const balanceLabel = balanceMode === "month" ? "本月结余" : "薪资周期结余";
  const balanceNote = balanceMode === "month"
    ? "按自然月统计"
    : `自 ${summary.forecast.salaryCycleStartLabel} 起统计`;

  useEffect(() => {
    setSalaryDayInput(String(salaryDay));
  }, [salaryDay]);

  const balanceRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = balanceRef.current;
    if (!el) return;
    const base = 26;
    let size = base;
    el.style.fontSize = `${base}px`;
    while (el.scrollWidth > el.clientWidth && size > 14) {
      size -= 1;
      el.style.fontSize = `${size}px`;
    }
  }, [balance, balanceMode]);

  function saveSalaryDay() {
    const parsed = Number(salaryDayInput);
    if (!Number.isFinite(parsed)) return;
    onSalaryDayChange(Math.max(1, Math.min(28, Math.round(parsed))));
    setEditingSalaryDay(false);
  }

  return (
    <SurfaceCard className="overview-card">
      <div className="overview-hero">
        <div className="overview-title-row">
          <div className="overview-title">
            本月收支汇总
            <EyeIcon size={20} strokeWidth={2} />
          </div>
          <button type="button" className="month-picker">
            {monthLabel}
            <ChevronDownIcon size={15} />
          </button>
        </div>
        <div className="overview-hero-balance">
          <div>
            <span className="balance-label">{balanceLabel}</span>
            <strong
              ref={balanceRef}
              className={positive ? "positive" : "negative"}
              title={`${positive ? "" : "-"}¥ ${formatMoney(Math.abs(balance))}`}
            >
              {positive ? "" : "-"}¥ {formatMoney(Math.abs(balance))}
            </strong>
          </div>
          <div className="balance-toggle" role="tablist" aria-label="结余口径切换">
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
        </div>
        <div className="overview-hero-flow">
          <div>
            <span>收入</span>
            <strong>¥ {formatMoney(summary.income)}</strong>
            <i className={summary.incomeChange >= 0 ? "up" : "down"}>{summary.incomeChange >= 0 ? "↑" : "↓"} {Math.abs(summary.incomeChange).toFixed(1)}%</i>
          </div>
          <div>
            <span>支出</span>
            <strong>¥ {formatMoney(summary.expense)}</strong>
            <i className={summary.expenseChange >= 0 ? "down" : "up"}>{summary.expenseChange >= 0 ? "↓" : "↑"} {Math.abs(summary.expenseChange).toFixed(1)}%</i>
          </div>
        </div>
        {balanceMode === "salary" ? (
          <div className="salary-setting-row">
            <button type="button" className="salary-setting-button" onClick={() => setEditingSalaryDay((value) => !value)}>
              发薪日 {salaryDay} 号
            </button>
            {editingSalaryDay ? (
              <div className="salary-setting-panel">
                <input
                  type="number"
                  min={1}
                  max={28}
                  value={salaryDayInput}
                  onChange={(event) => setSalaryDayInput(event.target.value)}
                />
                <button type="button" onClick={saveSalaryDay}>保存</button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </SurfaceCard>
  );
}

function ProgressCard({ saving, loan }: { saving: HomeProgress; loan: HomeProgress }) {
  return (
    <SurfaceCard className="progress-card">
      <div className="section-head">
        <h2>储蓄与贷款</h2>
      </div>
      <div className="progress-items">
        <div className="progress-item">
          <div className="progress-item-head">
            <span>{saving.title}</span>
            <strong>{formatPercent(saving.percent)}%</strong>
          </div>
          <div className="progress-track">
            <span style={{ width: `${Math.min(saving.percent, 100)}%`, background: "#0060c0" }} />
          </div>
          <div className="progress-item-meta">
            <span>已存 ¥ {formatMoney(saving.current)}</span>
            <span>目标 ¥ {formatMoney(saving.total)}</span>
          </div>
        </div>
        <div className="progress-item">
          <div className="progress-item-head">
            <span>{loan.title}</span>
            <strong>{formatPercent(loan.percent)}%</strong>
          </div>
          <div className="progress-track">
            <span style={{ width: `${Math.min(loan.percent, 100)}%`, background: "#0d8a5f" }} />
          </div>
          <div className="progress-item-meta">
            <span>已还 ¥ {formatMoney(loan.current)}</span>
            <span>总额 ¥ {formatMoney(loan.total)}</span>
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}

function ReminderCard({ alerts }: { alerts: HomeBudgetAlert[] }) {
  return (
    <SurfaceCard className="reminder-card">
      <div className="section-head">
        <h2>预算预警</h2>
      </div>
      {alerts.length ? (
        <div className="budget-alert-list">
          {alerts.map((item) => (
            <div key={item.id} className="budget-alert-row">
              <div className="budget-alert-top">
                <strong>{item.title}</strong>
                <span>已用 ¥ {formatMoney(item.spent)} / ¥ {formatMoney(item.budget)} · {formatPercent(item.percent)}%</span>
                <i className={`budget-alert-badge ${item.tone}`}>{item.percent >= 100 ? "超支" : item.percent >= 60 ? "预警" : "正常"}</i>
              </div>
              <div className="budget-alert-track">
                <span className={item.tone} style={{ width: `${Math.min(item.percent, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="finance-empty">暂无预算预警</div>
      )}
    </SurfaceCard>
  );
}

function RecentFeed({ items }: { items: HomeRecentItem[] }) {
  return (
    <SurfaceCard className="recent-card">
      <div className="recent-head">
        <h2>最近记账</h2>
      </div>
      <div className="recent-list">
        {items.length ? items.map((item) => (
          <div key={item.id} className="recent-row">
            <span className="recent-badge" style={{ background: item.badgeBg, color: item.badgeColor }}>{item.badgeLabel}</span>
            <strong className="recent-title">{item.title}</strong>
            <span className="recent-category">{item.subtitle}</span>
            <span className="recent-time">{item.time}</span>
            <strong className={`recent-amount ${item.positive ? "income" : "expense"}`}>
              {item.positive ? "+¥ " : "-¥ "}{formatMoney(item.amount)}
            </strong>
          </div>
        )) : <div className="finance-empty">暂无记账记录</div>}
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
            <HeaderAction label="搜索"><SearchIcon size={24} strokeWidth={1.8} /></HeaderAction>
          </div>
        </header>
        <Skeleton className="skeleton-hero" />
        <Skeleton className="skeleton-card" />
        <Skeleton className="skeleton-card" />
        <Skeleton className="skeleton-card" />
        <Skeleton className="skeleton-card" />
      </div>
    );
  }

  return (
    <div className="home-screen home-liquid-screen">
      <header className="home-topbar">
        <span />
        <h1>首页</h1>
        <div className="home-actions">
          <HeaderAction label="搜索"><SearchIcon size={24} strokeWidth={1.8} /></HeaderAction>
        </div>
      </header>

      <div className="hero-stack">
        <div className="hero-stack-bg" />
        <div className="hero-stack-content">
          <MonthlySummaryCard summary={summary} salaryDay={salaryDay} onSalaryDayChange={handleSalaryDayChange} />
        </div>
      </div>

      <FinanceOverviewCard summary={summary} />
      <ProgressCard saving={summary.savingProgress} loan={summary.loanProgress} />
      <ReminderCard alerts={summary.budgetAlerts} />
      <RecentFeed items={summary.recent} />
    </div>
  );
}
