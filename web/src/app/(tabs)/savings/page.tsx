"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { PageTopBar } from "@/components/stark/PageTopBar";
import { PageSkeleton } from "@/components/stark/Skeleton";
import { depositTypeLabel } from "@/components/stark/SavingsPlanner";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { REPORTING_MONTH_KEY, formatMoney, reportingMonthDate } from "@/lib/stark/utils/format";
import type { SavingsGoal, SavingsPlan } from "@/lib/stark/models";

const repo = new DataModeManager().getRepository();

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

function buildMonthRhythm(plans: SavingsPlan[]) {
  const year = reportingMonthDate().getFullYear();
  const currentMonth = REPORTING_MONTH_KEY;
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

function goalPercent(goal: SavingsGoal) {
  return goal.targetAmount > 0 ? clampPercent((goal.currentAmount / goal.targetAmount) * 100) : 0;
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
    const monthPlans = plans.filter((plan) => plan.month === REPORTING_MONTH_KEY);
    const monthPlanned = monthPlans.reduce((sum, plan) => sum + plan.amount, 0);
    const plannedTotal = plans.reduce((sum, plan) => sum + plan.amount, 0);
    const completedAmount = plans.filter((plan) => plan.status === "COMPLETED").reduce((sum, plan) => sum + plan.amount, 0);
    const recordedSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const savedAmount = Math.max(recordedSaved, completedAmount);
    const target = goals.reduce((sum, goal) => sum + goal.targetAmount, 0) || plannedTotal;
    const completed = plans.filter((plan) => plan.status === "COMPLETED").length;
    const pending = plans.filter((plan) => plan.status !== "COMPLETED").length;
    const progress = target > 0 ? clampPercent((savedAmount / target) * 100) : 0;
    const pendingAmount = Math.max(plannedTotal - savedAmount, 0);
    const remainingTarget = Math.max(target - savedAmount, 0);
    const completionRate = plans.length ? clampPercent((completed / plans.length) * 100) : 0;
    return { completed, completionRate, monthPlanned, pending, pendingAmount, plannedTotal, progress, remainingTarget, savedAmount, target };
  }, [goals, plans]);

  const recentPlans = useMemo(() => (
    [...plans].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 8)
  ), [plans]);
  const activeGoals = useMemo(() => goals.filter((goal) => goal.status === "ACTIVE"), [goals]);
  const focusGoal = activeGoals[0] ?? goals[0] ?? null;
  const goalCards = useMemo(() => (
    activeGoals.length ? activeGoals : goals
  ).slice(0, 4), [activeGoals, goals]);
  const rhythm = useMemo(() => buildMonthRhythm(plans), [plans]);
  const visibleRhythm = useMemo(() => {
    const active = rhythm.filter((item) => item.planned > 0 || item.isCurrent);
    return active.length ? active : rhythm.slice(0, 6);
  }, [rhythm]);

  if (loading) return <PageSkeleton title="储蓄" cards={3} />;

  return (
    <div className="page-stack savings-dashboard-page">
      <PageTopBar title="储蓄" />

      <section className="home-card savings-vault-hero">
        <div className="savings-vault-copy">
          <span>储蓄总览</span>
          <strong>¥ {formatMoney(summary.savedAmount)}</strong>
          <p>{focusGoal ? `${focusGoal.name} · 还差 ¥ ${formatMoney(Math.max(focusGoal.targetAmount - focusGoal.currentAmount, 0))}` : "还没有储蓄目标"}</p>
        </div>
        <div className="savings-vault-ring" style={{ "--progress": `${summary.progress}%` } as CSSProperties}>
          <strong>{summary.progress}%</strong>
          <span>总进度</span>
        </div>
      </section>

      <section className="savings-metric-grid" aria-label="储蓄关键指标">
        <div>
          <span>本月计划</span>
          <strong>¥ {formatMoney(summary.monthPlanned)}</strong>
        </div>
        <div>
          <span>目标缺口</span>
          <strong>¥ {formatMoney(summary.remainingTarget)}</strong>
        </div>
        <div>
          <span>完成率</span>
          <strong>{summary.completionRate}%</strong>
        </div>
      </section>

      <section className="home-card savings-goal-section">
        <div className="section-head">
          <h2>目标组</h2>
          <span className="mini-section-note">{activeGoals.length || goals.length} 个目标</span>
        </div>
        <div className="savings-goal-grid">
          {goalCards.length ? goalCards.map((goal) => {
            const percent = goalPercent(goal);
            const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
            return (
              <article key={goal.id} className="savings-goal-card">
                <div>
                  <span>{depositTypeLabel(goal.depositType)}</span>
                  <strong>{goal.name}</strong>
                </div>
                <em>{percent}%</em>
                <div className="savings-goal-track"><i style={{ width: `${percent}%` }} /></div>
                <p>已存 ¥ {formatMoney(goal.currentAmount)} / 还差 ¥ {formatMoney(remaining)}</p>
              </article>
            );
          }) : (
            <div className="loan-empty">暂无储蓄目标</div>
          )}
        </div>
      </section>

      <section className="home-card savings-rhythm-card">
        <div className="section-head">
          <h2>月度节奏</h2>
          <span className="mini-section-note">{REPORTING_MONTH_KEY}</span>
        </div>
        <div className="savings-rhythm-board">
          {visibleRhythm.map((item) => (
            <div key={item.month} className={`savings-rhythm-tile ${item.isCurrent ? "current" : ""}`}>
              <span>{monthLabel(item.month)}</span>
              <strong>¥ {formatMoney(item.planned)}</strong>
              <small>{item.pending > 0 ? `待 ${shortAmount(item.pending)}` : "已清"}</small>
              <div><i style={{ width: `${item.planPercent}%` }} /><b style={{ width: `${item.donePercent}%` }} /></div>
            </div>
          ))}
        </div>
      </section>

      <section className="recent-card savings-recent-card">
        <div className="recent-head">
          <h2>最近计划</h2>
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
