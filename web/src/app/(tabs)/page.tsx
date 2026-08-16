"use client";

import { useEffect, useMemo, useState } from "react";
import type { PropsWithChildren, ReactNode } from "react";
import type { EChartsCoreOption } from "echarts/core";
import { EChartView } from "@/components/stark/EChartView";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { Skeleton } from "@/components/stark/Skeleton";
import { getSalaryDay, setSalaryDay as persistSalaryDay } from "@/lib/stark/storage/local-config";
import {
  buildHomeSummary,
  type HomeBudgetAlert,
  type HomeInsight,
  type HomeRatio,
  type HomeSummary,
  type HomeTaskItem,
  type HomeTrend,
} from "@/lib/stark/dashboard/summary";
import { formatMoney, reportingMonthLabel } from "@/lib/stark/utils/format";
import type { Asset, Budget, Loan, SavingsGoal, Transaction } from "@/lib/stark/models";

const manager = new DataModeManager();

const INCOME_BLUE = "#0060c0";
const EXPENSE_ORANGE = "#ff7a32";
const POSITIVE = "#ff6848";
const NEGATIVE = "#0d8a5f";
const GREEN = "#0d8a5f";

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
      <path d="m9 6 6 6-6 6" />
    </IconBase>
  );
}

function PiggyIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M7 11.5c0-3 2.8-5 6.2-5 2 0 3.7.7 4.7 1.9H20v3.7l-1.8 1.1a5.8 5.8 0 0 1-2.2 2.5V19h-3v-2H9.5v2h-3v-3.2A5.2 5.2 0 0 1 7 11.5Z" />
      <path d="M10 6.8 9 4.5h4" />
      <path d="M16.8 10.3h.2" />
    </IconBase>
  );
}

function BankIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 10h18" />
      <path d="M5 10v8" />
      <path d="M10 10v8" />
      <path d="M14 10v8" />
      <path d="M19 10v8" />
      <path d="M4 18h16" />
      <path d="M12 4 4 8h16l-8-4Z" />
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

function DeltaLine({ value, muted = false }: { value: number; muted?: boolean }) {
  const positive = value >= 0;
  return (
    <div className={muted ? "home-delta muted" : "home-delta"}>
      <span>较上月</span>
      <span className={positive ? "up" : "down"}>{positive ? "+" : ""}{Math.abs(value).toFixed(1)}%</span>
      <span className={positive ? "up arrow" : "down arrow"}>{positive ? "↗" : "↓"}</span>
    </div>
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

function buildRatioOption(ratios: HomeRatio[]): EChartsCoreOption {
  type TooltipSize = { contentSize: number[]; viewSize: number[] };

  return {
    animationDuration: 450,
    tooltip: {
      trigger: "item",
      confine: true,
      backgroundColor: "rgba(19, 27, 48, 0.92)",
      borderWidth: 0,
      padding: [8, 10],
      textStyle: { color: "#ffffff", fontSize: 12 },
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
      formatter: (params: { name?: string; value?: number; percent?: number }) => `${params.name ?? ""}<br/>¥ ${formatMoney(Number(params.value ?? 0))} (${params.percent ?? 0}%)`,
    },
    series: [
      {
        type: "pie",
        radius: ["56%", "78%"],
        center: ["50%", "52%"],
        avoidLabelOverlap: true,
        label: { show: false },
        labelLine: { show: false },
        emphasis: { scale: false },
        itemStyle: { borderColor: "#ffffff", borderWidth: 2 },
        data: ratios.map((item) => ({ name: item.name, value: item.amount, itemStyle: { color: item.color } })),
      },
    ],
  };
}

function TrendChart({ trend }: { trend: HomeTrend }) {
  const option = useMemo(() => buildTrendOption(trend), [trend]);
  return <EChartView option={option} className="trend-chart" />;
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
        <div className="overview-stats">
          <div className="overview-stat">
            <span>总收入</span>
            <strong>¥ {formatMoney(summary.income)}</strong>
            <DeltaLine value={summary.incomeChange} />
          </div>
          <div className="overview-divider" />
          <div className="overview-stat">
            <span>总支出</span>
            <strong>¥ {formatMoney(summary.expense)}</strong>
            <DeltaLine value={summary.expenseChange * -1} />
          </div>
        </div>
        <div className="overview-forecast">
          <div className="overview-forecast-top">
            <span>{balanceLabel}</span>
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
          <strong className={positive ? "positive" : "negative"}>
            {positive ? "" : "-"}¥ {formatMoney(Math.abs(balance))}
          </strong>
          <em>{balanceNote}</em>
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
      </div>
    </SurfaceCard>
  );
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

function RatioCard({ ratios }: { ratios: HomeRatio[] }) {
  const displayRatios = ratios.length ? ratios : [];
  const option = useMemo(() => buildRatioOption(displayRatios), [displayRatios]);

  return (
    <SurfaceCard className="ratio-card">
      <h2>收支类型占比</h2>
      <div className="ratio-content">
        <EChartView option={option} className="ratio-donut" />
        <div className="ratio-list">
          {displayRatios.map((item) => (
            <div key={item.name} className="ratio-row">
              <span className="ratio-dot" style={{ background: item.color }} />
              <span>{item.name}</span>
              <strong>{item.percent}%</strong>
            </div>
          ))}
        </div>
      </div>
    </SurfaceCard>
  );
}

function ProgressRow({ title, current, total, percent, color, icon }: { title: string; current: number; total: number; percent: number; color: string; icon: ReactNode }) {
  return (
    <SurfaceCard className="progress-row">
      <div className="progress-top">
        <h3>{title}</h3>
        <span className="progress-icon" style={{ color, background: `${color}20` }}>{icon}</span>
      </div>
      <div className="progress-money">
        <span className="progress-money-current">¥ {formatMoney(current)}</span>
        <span className="progress-money-total">目标 ¥ {formatMoney(total)}</span>
      </div>
      <div className="progress-track-row">
        <div className="progress-track">
          <span style={{ width: `${Math.max(4, Math.min(percent, 100))}%`, background: color }} />
        </div>
        <strong style={{ color }}>{Math.round(percent)}%</strong>
      </div>
    </SurfaceCard>
  );
}

function ProgressCard({ summary }: { summary: HomeSummary }) {
  return (
    <div className="progress-grid">
      <ProgressRow title="储蓄计划进度" current={summary.savingProgress.current} total={summary.savingProgress.total} percent={summary.savingProgress.percent} color={INCOME_BLUE} icon={<PiggyIcon size={18} strokeWidth={2.1} />} />
      <ProgressRow title="贷款还款进度" current={summary.loanProgress.current} total={summary.loanProgress.total} percent={summary.loanProgress.percent} color={GREEN} icon={<BankIcon size={18} strokeWidth={2} />} />
    </div>
  );
}

function SummaryCard({ title, value, delta }: { title: string; value: number; delta: number }) {
  return (
    <SurfaceCard className="summary-card">
      <div>
        <h2>{title}</h2>
        <strong>¥ {formatMoney(value)}</strong>
        <DeltaLine value={delta} muted />
      </div>
    </SurfaceCard>
  );
}

function BudgetAndInsightsCard({ items, insights }: { items: HomeBudgetAlert[]; insights: HomeInsight[] }) {
  return (
    <SurfaceCard className="budget-alert-card">
      <div className="section-head">
        <h2>预算与支出</h2>
      </div>
      <div className="budget-alert-list">
        {items.map((item) => (
          <div key={item.id} className={`budget-alert-row ${item.tone}`}>
            <div className="budget-alert-copy">
              <strong>{item.title}</strong>
              <span>¥ {formatMoney(item.spent)} / ¥ {formatMoney(item.budget)}</span>
            </div>
            <div className="budget-alert-side">
              <em className={`budget-alert-badge ${item.tone}`}>{Math.round(item.percent)}%</em>
              <div className="budget-alert-track">
                <span className={item.tone} style={{ width: `${Math.max(8, Math.min(item.percent, 100))}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="budget-insights-head">
        <h3>大额支出</h3>
      </div>
      <div className="insight-list budget-insight-list">
        {insights.map((item) => (
          <div key={item.id} className={`insight-row ${item.tone}`}>
            <strong>{item.title}</strong>
            <span>{item.detail}</span>
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
}

function splitTaskSubtitle(subtitle: string) {
  const amountMatch = subtitle.match(/¥\s*[\d,]+(?:\.\d+)?/);
  const amount = amountMatch?.[0] ?? "";
  const detail = amount ? subtitle.replace(amount, "").replace(/\s{2,}/g, " ").trim() : subtitle;
  return { detail, amount };
}

function TasksCard({ items }: { items: HomeTaskItem[] }) {
  return (
    <SurfaceCard className="tasks-card">
      <div className="section-head">
        <h2>本周待处理</h2>
      </div>
      <div className="tasks-list">
        {items.map((item) => {
          const { detail, amount } = splitTaskSubtitle(item.subtitle);
          return (
            <div key={item.id} className={`task-row ${item.tone}`}>
              <span className={`task-dot ${item.tone}`} />
              <div className="task-copy">
                <strong>{item.title}</strong>
                <span>{detail}</span>
              </div>
              <div className="task-side">
                {amount ? <span className={`task-amount ${item.tone}`}>{amount}</span> : null}
                <em className={`task-badge ${item.tone}`}>{item.badge}</em>
              </div>
            </div>
          );
        })}
      </div>
    </SurfaceCard>
  );
}

function nextDueDateLabel(dueDay: number) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const targetMonth = dueDay >= today ? month : month + 1;
  const targetDate = new Date(year, targetMonth, dueDay);
  const mm = String(targetDate.getMonth() + 1).padStart(2, "0");
  const dd = String(targetDate.getDate()).padStart(2, "0");
  return `${mm}-${dd}`;
}

function LoanMiniRow({ loan }: { loan: Loan }) {
  const repaid = Math.max(loan.totalAmount - loan.remainingAmount, 0);
  const percent = loan.totalAmount > 0 ? Math.min(100, (repaid / loan.totalAmount) * 100) : 0;

  return (
    <div className="loan-mini-row">
      <div className="loan-mini-head">
        <strong>{loan.platform || "贷款"}</strong>
        <span>{Math.round(percent)}%</span>
      </div>
      <div className="loan-mini-money">
        剩余 ¥ {formatMoney(loan.remainingAmount)} / 总额 ¥ {formatMoney(loan.totalAmount)}
      </div>
      <div className="loan-mini-track">
        <span style={{ width: `${Math.max(4, Math.min(percent, 100))}%` }} />
      </div>
      <div className="loan-mini-meta">
        <span>已还 {loan.paidPeriods}/{loan.periods} 期</span>
        <span>下期 {nextDueDateLabel(loan.dueDate)} 还 ¥ {formatMoney(loan.monthlyPayment)}</span>
      </div>
    </div>
  );
}

function LoanSummaryCard({ value, delta, loans }: { value: number; delta: number; loans: Loan[] }) {
  return (
    <SurfaceCard className="loan-summary-card">
      <div className="loan-summary-head">
        <h2>贷款已还款汇总</h2>
        <button type="button" className="detail-button">
          查看详情
          <ChevronRightIcon size={14} />
        </button>
      </div>
      <div className="loan-summary-copy">
        <strong>¥ {formatMoney(value)}</strong>
        <DeltaLine value={delta} muted />
      </div>
      <div className="loan-mini-list">
        {loans.length ? loans.map((loan) => <LoanMiniRow key={loan.id} loan={loan} />) : <div className="loan-empty">暂无贷款数据</div>}
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
        <div className="summary-grid">
          <Skeleton className="skeleton-card" />
          <Skeleton className="skeleton-card" />
        </div>
        <Skeleton className="skeleton-card" />
        <div className="home-main-grid">
          <Skeleton className="skeleton-card" />
          <Skeleton className="skeleton-card" />
        </div>
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

      <ProgressCard summary={summary} />

      <div className="summary-grid">
        <SummaryCard title="资产汇总" value={summary.assetTotal} delta={8.6} />
        <SummaryCard title="储蓄汇总" value={summary.totalSavings} delta={5.4} />
      </div>

      <LoanSummaryCard value={summary.loanProgress.current} delta={10.2} loans={loans} />

      <div className="home-main-grid">
        <BudgetAndInsightsCard items={summary.budgetAlerts} insights={summary.insights} />
        <TasksCard items={summary.tasks} />
      </div>
    </div>
  );
}
