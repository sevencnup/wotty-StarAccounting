"use client";

import { useEffect, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import type { EChartsCoreOption } from "echarts/core";
import { EChartView } from "@/components/stark/EChartView";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { Skeleton } from "@/components/stark/Skeleton";
import { getSalaryDay, setSalaryDay as persistSalaryDay } from "@/lib/stark/storage/local-config";
import {
  buildHomeSummary,
  type HomeRecentItem,
  type HomeSummary,
  type HomeTrend,
} from "@/lib/stark/dashboard/summary";
import { formatMoney, reportingMonthLabel } from "@/lib/stark/utils/format";
import type { Asset, Budget, Loan, SavingsGoal, Transaction } from "@/lib/stark/models";

const manager = new DataModeManager();

const INCOME_BLUE = "#0060c0";
const EXPENSE_ORANGE = "#ff7a32";

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
            <strong className={positive ? "positive" : "negative"}>{positive ? "" : "-"}¥ {formatMoney(Math.abs(balance))}</strong>
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

function TrendLegend() {
  return (
    <div className="trend-legend">
      <span><i style={{ background: INCOME_BLUE }} />收入</span>
      <span><i style={{ background: EXPENSE_ORANGE }} />支出</span>
    </div>
  );
}

function buildTrendOption(trend: HomeTrend): EChartsCoreOption {
  const maxRaw = Math.max(...trend.expense, ...trend.income, 8000);
  const maxValue = Math.ceil(maxRaw / 2000) * 2000;
  type TooltipSize = { contentSize: number[]; viewSize: number[] };

  return {
    animationDuration: 450,
    animationEasing: "cubicOut",
    grid: { left: 26, right: 10, top: 16, bottom: 24 },
    tooltip: {
      trigger: "axis",
      confine: true,
      backgroundColor: "rgba(19, 27, 48, 0.92)",
      borderWidth: 0,
      padding: [8, 10],
      textStyle: { color: "#ffffff", fontSize: 12 },
      axisPointer: { type: "line", lineStyle: { color: "rgba(0,96,192,0.28)" } },
      position: (point: number[], _params: unknown, _dom: unknown, _rect: unknown, size: TooltipSize) => {
        const [x, y] = point as [number, number];
        const viewWidth = size.viewSize[0];
        const viewHeight = size.viewSize[1];
        const boxWidth = size.contentSize[0];
        const boxHeight = size.contentSize[1];
        const nextX = Math.min(Math.max(8, x - boxWidth / 2), viewWidth - boxWidth - 8);
        const nextY = y < viewHeight / 2
          ? Math.min(viewHeight - boxHeight - 8, y + 12)
          : Math.max(8, y - boxHeight - 12);
        return [nextX, nextY];
      },
      valueFormatter: (value: number | string) => `¥ ${formatMoney(Number(value ?? 0))}`,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: trend.labels,
      axisLine: { lineStyle: { color: "#e1e8f2" } },
      axisTick: { show: false },
      axisLabel: { color: "#74819a", fontSize: 10, margin: 8 },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: maxValue,
      splitNumber: 4,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: "#74819a",
        fontSize: 10,
        formatter: (value: number) => (value === 0 ? "0" : `${Math.round(value / 1000)}K`),
      },
      splitLine: { show: false },
    },
    series: [
      {
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        data: trend.income,
        lineStyle: { width: 2, color: INCOME_BLUE },
        itemStyle: { color: INCOME_BLUE, borderColor: "#ffffff", borderWidth: 1.2 },
      },
      {
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        data: trend.expense,
        lineStyle: { width: 2, color: EXPENSE_ORANGE },
        itemStyle: { color: EXPENSE_ORANGE, borderColor: "#ffffff", borderWidth: 1.2 },
      },
    ],
  };
}

function TrendChart({ trend }: { trend: HomeTrend }) {
  const option = useMemo(() => buildTrendOption(trend), [trend]);
  return <EChartView option={option} className="trend-chart" />;
}

function TrendCard({ trend }: { trend: HomeTrend }) {
  return (
    <SurfaceCard className="trend-card">
      <div className="trend-panel">
        <div className="section-head">
          <h2>本月收支趋势</h2>
          <TrendLegend />
        </div>
        <TrendChart trend={trend} />
      </div>
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
      <TrendCard trend={summary.trend} />
      <RecentFeed items={summary.recent} />
    </div>
  );
}
