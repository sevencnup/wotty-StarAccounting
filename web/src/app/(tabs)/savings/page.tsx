"use client";

import { useEffect, useMemo, useState } from "react";
import type { EChartsCoreOption } from "echarts/core";
import { EChartView } from "@/components/stark/EChartView";
import { PageTopBar } from "@/components/stark/PageTopBar";
import { PageSkeleton } from "@/components/stark/Skeleton";
import { depositTypeLabel } from "@/components/stark/SavingsPlanner";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { formatMoney } from "@/lib/stark/utils/format";
import type { SavingsGoal, SavingsPlan } from "@/lib/stark/models";

const repo = new DataModeManager().getRepository();
const PLAN_BLUE = "#3d86ff";
const DONE_GREEN = "#18b66f";

function monthKey(value: string) {
  return value.slice(0, 7);
}

function dayLabel(value: string) {
  const day = Number(value.slice(8, 10));
  return Number.isFinite(day) ? `${day}日` : value;
}

function shortAmount(amount: number) {
  if (amount >= 10000) return `${(amount / 10000).toFixed(1)}w`;
  if (amount >= 1000) return `${Math.round(amount / 100) / 10}k`;
  return String(Math.round(amount));
}

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function monthLabel(month: string) {
  const value = Number(month.slice(5, 7));
  return Number.isFinite(value) ? `${value}月` : month;
}

function deadlineLabel(value?: string | null) {
  if (!value) return "未设截止";
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));
  return month && day ? `${month}/${day}` : value;
}

function buildCalendar(plans: SavingsPlan[]) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthStr = String(month + 1).padStart(2, "0");
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const leading = firstDay === 0 ? 6 : firstDay - 1;
  const daily: Record<string, number> = {};

  for (let day = 1; day <= daysInMonth; day++) {
    daily[`${year}-${monthStr}-${String(day).padStart(2, "0")}`] = 0;
  }

  plans
    .filter((plan) => plan.month === `${year}-${monthStr}`)
    .forEach((plan) => {
      const day = plan.updatedAt?.slice(0, 10) || `${year}-${monthStr}-01`;
      if (daily[day] !== undefined) daily[day] += plan.amount;
    });

  const days = Object.entries(daily).map(([date, amount]) => ({
    date,
    day: Number(date.slice(8, 10)),
    amount,
  }));
  const maxAmount = Math.max(...days.map((item) => item.amount), 1);
  return { leading, days, maxAmount };
}

function buildMonthRhythm(plans: SavingsPlan[]) {
  const year = new Date().getFullYear();
  const currentMonth = monthKey(new Date().toISOString().slice(0, 10));
  const months = Array.from({ length: 12 }, (_, index) => {
    const month = `${year}-${String(index + 1).padStart(2, "0")}`;
    return {
      month,
      planned: 0,
      completed: 0,
      pending: 0,
      isCurrent: month === currentMonth,
    };
  });

  plans.forEach((plan) => {
    const index = Number(plan.month.slice(5, 7)) - 1;
    if (index < 0 || index > 11) return;
    months[index].planned += plan.amount;
    if (plan.status === "COMPLETED") months[index].completed += plan.amount;
    if (plan.status === "PENDING") months[index].pending += plan.amount;
  });

  const maxPlanned = Math.max(...months.map((item) => item.planned), 1);
  return months.map((item) => ({
    ...item,
    planPercent: clampPercent((item.planned / maxPlanned) * 100),
    donePercent: item.planned > 0 ? clampPercent((item.completed / item.planned) * 100) : 0,
  }));
}

function buildSavingsTrendOption(plans: SavingsPlan[]): EChartsCoreOption {
  const labels = Array.from({ length: 12 }, (_, index) => `${index + 1}`);
  const planned = Array.from({ length: 12 }, () => 0);
  const completed = Array.from({ length: 12 }, () => 0);

  plans.forEach((plan) => {
    const month = Number(plan.month.slice(5, 7));
    if (!month || month < 1 || month > 12) return;
    planned[month - 1] += plan.amount;
    if (plan.status === "COMPLETED") completed[month - 1] += plan.amount;
  });

  const maxRaw = Math.max(...planned, ...completed, 8000);
  const maxValue = Math.ceil(maxRaw / 2000) * 2000;
  type TooltipSize = { contentSize: number[]; viewSize: number[] };

  return {
    animationDuration: 450,
    animationEasing: "cubicOut",
    grid: { left: 18, right: 8, top: 12, bottom: 20 },
    tooltip: {
      trigger: "axis",
      confine: true,
      backgroundColor: "rgba(19, 27, 48, 0.92)",
      borderWidth: 0,
      padding: [8, 10],
      textStyle: { color: "#ffffff", fontSize: 12 },
      axisPointer: { type: "line", lineStyle: { color: "rgba(61,134,255,0.28)" } },
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
      data: labels,
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
        data: planned,
        lineStyle: { width: 2, color: PLAN_BLUE },
        itemStyle: { color: PLAN_BLUE, borderColor: "#ffffff", borderWidth: 1.2 },
        name: "计划",
      },
      {
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        data: completed,
        lineStyle: { width: 2, color: DONE_GREEN },
        itemStyle: { color: DONE_GREEN, borderColor: "#ffffff", borderWidth: 1.2 },
        name: "已存",
      },
    ],
  };
}

export default function SavingsPage() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [plans, setPlans] = useState<SavingsPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadSavingsDashboard() {
      try {
        const data = await repo.getSavingsGoals("default");
        const planGroups = await Promise.all(data.map((goal) => repo.getSavingsPlans(goal.id)));
        if (!active) return;
        setGoals(data);
        setPlans(planGroups.flat());
      } catch {
        if (!active) return;
        setGoals([]);
        setPlans([]);
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadSavingsDashboard();
    return () => {
      active = false;
    };
  }, []);

  const summary = useMemo(() => {
    const currentMonth = monthKey(new Date().toISOString().slice(0, 10));
    const monthPlans = plans.filter((plan) => plan.month === currentMonth);
    const monthPlanned = monthPlans.reduce((sum, plan) => sum + plan.amount, 0);
    const monthCompleted = monthPlans.filter((plan) => plan.status === "COMPLETED").reduce((sum, plan) => sum + plan.amount, 0);
    const plannedTotal = plans.reduce((sum, plan) => sum + plan.amount, 0);
    const completedAmount = plans.filter((plan) => plan.status === "COMPLETED").reduce((sum, plan) => sum + plan.amount, 0);
    const recordedSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const savedAmount = Math.max(recordedSaved, completedAmount);
    const target = goals.reduce((sum, goal) => sum + goal.targetAmount, 0) || plannedTotal;
    const completed = plans.filter((plan) => plan.status === "COMPLETED").length;
    const pending = plans.filter((plan) => plan.status !== "COMPLETED").length;
    const progress = target > 0 ? clampPercent((savedAmount / target) * 100) : 0;
    const pendingAmount = Math.max(plannedTotal - savedAmount, 0);
    const averageMonthly = plannedTotal > 0 ? plannedTotal / 12 : 0;
    return {
      averageMonthly,
      completed,
      monthCompleted,
      monthPlanned,
      pending,
      pendingAmount,
      plannedTotal,
      progress,
      savedAmount,
      target,
      count: monthPlans.length,
    };
  }, [goals, plans]);

  const recentPlans = useMemo(() => (
    [...plans].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 8)
  ), [plans]);
  const primaryGoal = goals[0] ?? null;
  const activeGoals = useMemo(() => goals.filter((goal) => goal.status === "ACTIVE"), [goals]);
  const goalCards = useMemo(() => goals.slice(0, 4).map((goal) => {
    const goalPlans = plans.filter((plan) => plan.goalId === goal.id);
    const planned = goalPlans.reduce((sum, plan) => sum + plan.amount, 0);
    const completed = goalPlans.filter((plan) => plan.status === "COMPLETED").reduce((sum, plan) => sum + plan.amount, 0);
    const saved = Math.max(goal.currentAmount, completed);
    const target = goal.targetAmount || planned;
    const progress = target > 0 ? clampPercent((saved / target) * 100) : 0;
    return { goal, planned, saved, target, progress };
  }), [goals, plans]);

  const calendar = useMemo(() => buildCalendar(plans), [plans]);
  const rhythm = useMemo(() => buildMonthRhythm(plans), [plans]);
  const trendOption = useMemo(() => buildSavingsTrendOption(plans), [plans]);
  const weekDays = ["一", "二", "三", "四", "五", "六", "日"];

  if (loading) return <PageSkeleton title="储蓄" cards={3} />;

  return (
    <div className="page-stack savings-dashboard-page">
      <PageTopBar title="储蓄" />

      <section className="savings-command-card">
        <div className="savings-command-head">
          <div className="savings-command-copy">
            <span>储蓄目标管理</span>
            <strong>{primaryGoal?.name || "还没有储蓄目标"}</strong>
            <p>{activeGoals.length ? `${activeGoals.length} 个目标执行中 · ${depositTypeLabel(primaryGoal?.depositType)}` : "添加储蓄后，这里会生成目标驾驶舱"}</p>
          </div>
          <div
            className="savings-progress-ring"
            style={{ background: `conic-gradient(${DONE_GREEN} ${summary.progress * 3.6}deg, rgba(255,255,255,0.24) 0deg)` }}
          >
            <div>
              <strong>{summary.progress}%</strong>
              <span>目标进度</span>
            </div>
          </div>
        </div>

        <div className="savings-command-amount">
          <span>已落袋</span>
          <strong>¥ {formatMoney(summary.savedAmount)}</strong>
          <em>计划总额 ¥ {formatMoney(summary.plannedTotal)}</em>
        </div>

        <div className="savings-metric-grid">
          <div>
            <span>本月计划</span>
            <strong>¥ {formatMoney(summary.monthPlanned)}</strong>
            <small>已完成 ¥ {formatMoney(summary.monthCompleted)}</small>
          </div>
          <div>
            <span>待执行</span>
            <strong>¥ {formatMoney(summary.pendingAmount)}</strong>
            <small>{summary.pending} 笔计划</small>
          </div>
          <div>
            <span>目标池</span>
            <strong>{activeGoals.length} 个</strong>
            <small>总目标 ¥ {formatMoney(summary.target)}</small>
          </div>
          <div>
            <span>月均计划</span>
            <strong>¥ {formatMoney(summary.averageMonthly)}</strong>
            <small>按全年摊平</small>
          </div>
        </div>
      </section>

      <section className="home-card trend-card savings-module-card">
        <div className="trend-panel">
          <div className="section-head">
            <h2>年度储蓄曲线</h2>
            <div className="trend-legend">
              <span><i style={{ background: PLAN_BLUE }} />计划</span>
              <span><i style={{ background: DONE_GREEN }} />已存</span>
            </div>
          </div>
          <EChartView option={trendOption} className="trend-chart consumption-trend-chart" />
        </div>
      </section>

      <section className="home-card page-card savings-module-card">
        <div className="section-head">
          <h2>月度执行节奏</h2>
          <span className="mini-section-note">{summary.completed} 笔完成</span>
        </div>
        <div className="savings-rhythm-grid">
          {rhythm.map((item) => (
            <div key={item.month} className={`savings-rhythm-cell ${item.isCurrent ? "current" : ""}`}>
              <div className="savings-rhythm-top">
                <span>{monthLabel(item.month)}</span>
                <strong>¥{shortAmount(item.planned)}</strong>
              </div>
              <div className="savings-rhythm-track">
                <i style={{ width: `${item.planPercent}%` }} />
                <b style={{ width: `${item.donePercent}%` }} />
              </div>
              <small>{item.pending > 0 ? `待 ¥${shortAmount(item.pending)}` : "清"}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="home-card page-card savings-module-card">
        <div className="section-head">
          <h2>目标分层</h2>
          <span className="mini-section-note">{goals.length} 个目标</span>
        </div>
        <div className="savings-goal-board">
          {goalCards.length ? goalCards.map(({ goal, planned, saved, target, progress }) => (
            <div key={goal.id} className="savings-goal-board-row">
              <div>
                <strong>{goal.name}</strong>
                <span>{depositTypeLabel(goal.depositType)} · 截止 {deadlineLabel(goal.deadline)}</span>
              </div>
              <em>{progress}%</em>
              <div className="savings-goal-track">
                <span style={{ width: `${progress}%` }} />
              </div>
              <small>已存 ¥ {formatMoney(saved)} / {target > 0 ? `目标 ¥ ${formatMoney(target)}` : `计划 ¥ ${formatMoney(planned)}`}</small>
            </div>
          )) : (
            <div className="finance-empty bordered">暂无储蓄目标</div>
          )}
        </div>
      </section>

      <section className="home-card page-card savings-module-card savings-heat-card">
        <div className="section-head">
          <h2>本月计划热力</h2>
          <span className="mini-section-note">{summary.count} 笔计划</span>
        </div>
        <div className="calendar-grid-card savings-calendar-card">
          <div className="calendar-week-row">
            {weekDays.map((day) => <span key={day}>{day}</span>)}
          </div>
          <div className="calendar-grid">
            {Array.from({ length: calendar.leading }, (_, index) => (
              <span key={`empty-${index}`} className="calendar-day empty" />
            ))}
            {calendar.days.map((item) => {
              const level = item.amount <= 0 ? 0 : Math.max(1, Math.ceil((item.amount / calendar.maxAmount) * 4));
              return (
                <span key={item.date} className={`calendar-day level-${level}`} title={`${item.date} ¥ ${formatMoney(item.amount)}`}>
                  <em>{item.day}</em>
                  {item.amount > 0 && <strong>¥{shortAmount(item.amount)}</strong>}
                </span>
              );
            })}
          </div>
        </div>
      </section>

      <section className="recent-card savings-recent-card">
        <div className="recent-head">
          <h2>最近储蓄计划</h2>
          <span className="mini-section-note">按更新时间</span>
        </div>
        <div className="recent-list">
          {recentPlans.length ? recentPlans.map((plan) => {
            const goal = goals.find((item) => item.id === plan.goalId);
            return (
              <div key={plan.id} className="savings-recent-row">
                <div className="savings-recent-icon">存</div>
                <strong>{goal?.name || "储蓄计划"}</strong>
                <span>{plan.month} · {plan.status === "COMPLETED" ? "已完成" : "待存"}</span>
                <time>{dayLabel(plan.updatedAt.slice(0, 10))}</time>
                <em>+¥ {formatMoney(plan.amount)}</em>
              </div>
            );
          }) : (
            <div className="loan-empty">暂无储蓄记录</div>
          )}
        </div>
      </section>
    </div>
  );
}
