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
          发薪日用于自动计算薪资周期的现金结余与预算消耗（可选 1 ~ 28 日）。
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

function UnifiedHeroCard({
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
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const balance = balanceMode === "month" ? summary.forecast.monthBalance : summary.forecast.salaryCycleBalance;
  const positive = balance >= 0;
  const balanceLabel = balanceMode === "month" ? "本月结余" : "薪资周期结余";

  const balanceRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = balanceRef.current;
    if (!el) return;
    const base = 28;
    let size = base;
    el.style.fontSize = `${base}px`;
    while (el.scrollWidth > el.clientWidth && size > 16) {
      size -= 1;
      el.style.fontSize = `${size}px`;
    }
  }, [balance, balanceMode]);

  const healthy = summary.netWorth >= 0;

  return (
    <SurfaceCard className="unified-hero-card">
      <div className="overview-hero">
        <div className="overview-title-row">
          <div className="overview-title">
            <span>财务总览</span>
            <EyeIcon size={18} strokeWidth={2} />
          </div>
          <button type="button" className="month-picker">
            {monthLabel}
            <ChevronDownIcon size={14} />
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
            <i className={summary.incomeChange >= 0 ? "up" : "down"}>
              {summary.incomeChange >= 0 ? "↑" : "↓"} {Math.abs(summary.incomeChange).toFixed(1)}%
            </i>
          </div>
          <div>
            <span>支出</span>
            <strong>¥ {formatMoney(summary.expense)}</strong>
            <i className={summary.expenseChange >= 0 ? "down" : "up"}>
              {summary.expenseChange >= 0 ? "↓" : "↑"} {Math.abs(summary.expenseChange).toFixed(1)}%
            </i>
          </div>
        </div>

        <div className="hero-bottom-bar">
          <Link href="/assets" className="hero-networth-pill" title="查看资产分布">
            <span className="pill-title">净资产</span>
            <strong className="pill-amount">¥ {formatMoney(summary.netWorth)}</strong>
            <span className={`pill-badge ${healthy ? "healthy" : "attention"}`}>
              {healthy ? "结构健康" : "负债关注"}
            </span>
            <ChevronRightIcon size={14} />
          </Link>

          {balanceMode === "salary" ? (
            <button
              type="button"
              className="hero-salary-trigger"
              onClick={() => setShowSalaryModal(true)}
            >
              发薪日 {salaryDay}日
            </button>
          ) : null}
        </div>
      </div>

      {showSalaryModal ? (
        <SalaryDayModal
          salaryDay={salaryDay}
          onClose={() => setShowSalaryModal(false)}
          onSave={onSalaryDayChange}
        />
      ) : null}
    </SurfaceCard>
  );
}

function SmartAlertCard({ summary }: { summary: HomeSummary }) {
  const budget = summary.budgetAlerts[0];
  const task = summary.tasks[0];

  const hasUrgentBudget = budget && (budget.tone === "danger" || budget.tone === "warn");
  const hasUrgentTask = task && (task.tone === "danger" || task.tone === "warn");
  const hasAlerts = hasUrgentBudget || hasUrgentTask || budget || task;

  return (
    <SurfaceCard className="smart-alert-card">
      <div className="section-head">
        <h2>关注与提醒</h2>
        <span className="mini-section-note">
          {hasUrgentBudget ? "预算预警" : hasUrgentTask ? "临近待办" : "运行正常"}
        </span>
      </div>

      {hasAlerts ? (
        <div className="smart-alert-list">
          {budget ? (
            <div className={`smart-alert-item budget-alert-item ${budget.tone}`}>
              <div className="smart-alert-header">
                <span className="smart-alert-tag">{budget.title}</span>
                <span className="smart-alert-percent">{Math.round(budget.percent)}%</span>
              </div>
              <div className="focus-track">
                <span className={budget.tone} style={{ width: `${Math.min(budget.percent, 100)}%` }} />
              </div>
              <div className="smart-alert-meta">
                <span>已用 ¥ {formatMoney(budget.spent)}</span>
                <span>预算 ¥ {formatMoney(budget.budget)}</span>
              </div>
            </div>
          ) : null}

          {task ? (
            <div className={`smart-alert-item task-alert-item ${task.tone}`}>
              <div className="task-alert-main">
                <span className="task-dot" />
                <div className="task-info">
                  <strong>{task.title}</strong>
                  <span>{task.subtitle}</span>
                </div>
              </div>
              <span className="task-badge">{task.badge}</span>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="smart-alert-empty">
          <span className="empty-dot" />
          <span>财务运行平稳，暂无超支或临近待办</span>
        </div>
      )}
    </SurfaceCard>
  );
}

function RecentFeed({ items }: { items: HomeRecentItem[] }) {
  const displayItems = items.slice(0, 3);

  return (
    <SurfaceCard className="recent-card">
      <div className="recent-head">
        <h2>最近记账</h2>
        <Link href="/consumption" className="recent-all-link">
          全部明细 <ChevronRightIcon size={13} />
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
    <div className="home-screen home-liquid-screen">
      <header className="home-topbar">
        <span />
        <h1>首页</h1>
        <div className="home-actions">
          <HeaderAction label="搜索">
            <SearchIcon size={24} strokeWidth={1.8} />
          </HeaderAction>
        </div>
      </header>

      <div className="hero-stack">
        <div className="hero-stack-bg" />
        <div className="hero-stack-content">
          <UnifiedHeroCard
            summary={summary}
            salaryDay={salaryDay}
            onSalaryDayChange={handleSalaryDayChange}
          />
        </div>
      </div>

      <SmartAlertCard summary={summary} />
      <RecentFeed items={summary.recent} />
    </div>
  );
}
