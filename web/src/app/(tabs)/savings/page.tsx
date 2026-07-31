"use client";

import { useEffect, useMemo, useState } from "react";
import { PageTopBar } from "@/components/stark/PageTopBar";
import { PageSkeleton } from "@/components/stark/Skeleton";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { formatMoney } from "@/lib/stark/utils/format";
import type { SavingsGoal, SavingsPlan } from "@/lib/stark/models";

const repo = new DataModeManager().getRepository();

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

  const featuredGoals = useMemo(() => (
    [...goals]
      .sort((a, b) => (b.currentAmount / Math.max(b.targetAmount, 1)) - (a.currentAmount / Math.max(a.targetAmount, 1)))
      .slice(0, 4)
  ), [goals]);

  const recentPlans = useMemo(() => (
    [...plans].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 8)
  ), [plans]);

  const calendar = useMemo(() => buildCalendar(plans), [plans]);
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

      <section className="home-card page-card">
        <div className="section-head">
          <h2>储蓄计划进度</h2>
          <span className="mini-section-note">共 {goals.length} 个计划</span>
        </div>
        <div className="savings-goal-list">
          {featuredGoals.length ? featuredGoals.map((goal) => {
            const percent = goal.targetAmount > 0 ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100) : 0;
            return (
              <div key={goal.id} className="savings-goal-row">
                <div className="savings-goal-copy">
                  <strong>{goal.name}</strong>
                  <span>已存 ¥ {formatMoney(goal.currentAmount)} / 目标 ¥ {formatMoney(goal.targetAmount)}</span>
                </div>
                <em>{Math.round(percent)}%</em>
                <div className="mini-progress">
                  <span style={{ width: `${Math.max(4, percent)}%`, background: "linear-gradient(90deg,#2f7cff,#6da2ff)" }} />
                </div>
              </div>
            );
          }) : (
            <div className="loan-empty">暂无储蓄计划，点击底部“添加储蓄”创建</div>
          )}
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
