"use client";

import { useEffect, useMemo, useState } from "react";
import type { EChartsCoreOption } from "echarts/core";
import { EChartView } from "@/components/stark/EChartView";
import { PageTopBar } from "@/components/stark/PageTopBar";
import { PageSkeleton } from "@/components/stark/Skeleton";
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
    void repo.getSavingsGoals("default").then(async (data) => {
      const planGroups = await Promise.all(data.map((goal) => repo.getSavingsPlans(goal.id)));
      setGoals(data);
      setPlans(planGroups.flat());
      setLoading(false);
    });
  }, []);

  const summary = useMemo(() => {
    const currentMonth = monthKey(new Date().toISOString().slice(0, 10));
    const monthPlans = plans.filter((plan) => plan.month === currentMonth);
    const monthSaved = monthPlans.reduce((sum, plan) => sum + plan.amount, 0);
    const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0) + plans.reduce((sum, plan) => sum + plan.amount, 0);
    const target = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    const completed = plans.filter((plan) => plan.status === "COMPLETED").length;
    const pending = plans.filter((plan) => plan.status !== "COMPLETED").length;
    return { monthSaved, totalSaved, target, completed, pending, count: monthPlans.length };
  }, [goals, plans]);

  const recentPlans = useMemo(() => (
    [...plans].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 8)
  ), [plans]);

  const calendar = useMemo(() => buildCalendar(plans), [plans]);
  const trendOption = useMemo(() => buildSavingsTrendOption(plans), [plans]);
  const weekDays = ["一", "二", "三", "四", "五", "六", "日"];

  if (loading) return <PageSkeleton title="储蓄" cards={3} />;

  return (
    <div className="page-stack savings-dashboard-page">
      <PageTopBar title="储蓄" />

      <section className="home-card savings-summary-card">
        <div className="savings-summary-body">
          <div className="savings-summary-main">
            <div className="page-hero-label">本月已存</div>
            <div className="page-hero-value">¥ {formatMoney(summary.monthSaved)}</div>
            <div className="page-hero-sub">目标 ¥ {formatMoney(summary.target)} · 共 {summary.count} 笔</div>
          </div>
          <div className="savings-summary-side">
            <div className="savings-summary-row">
              <div className="savings-row-label">累计储蓄</div>
              <div className="savings-row-value">¥ {formatMoney(summary.totalSaved)}</div>
              <div className="savings-row-sub">已完成 {summary.completed} 笔</div>
            </div>
            <div className="savings-summary-row">
              <div className="savings-row-label">待存计划</div>
              <div className="savings-row-value">{summary.pending} 笔</div>
              <div className="savings-row-sub">继续按计划执行</div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-card trend-card">
        <div className="trend-panel">
          <div className="section-head">
            <h2>本年储蓄趋势</h2>
            <div className="trend-legend">
              <span><i style={{ background: PLAN_BLUE }} />计划</span>
              <span><i style={{ background: DONE_GREEN }} />已存</span>
            </div>
          </div>
          <EChartView option={trendOption} className="trend-chart consumption-trend-chart" />
        </div>
      </section>

      <section className="home-card page-card">
        <div className="section-head">
          <h2>每日存入日历</h2>
          <span className="mini-section-note">本月</span>
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

      <section className="recent-card">
        <div className="recent-head">
          <h2>最近储蓄</h2>
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
