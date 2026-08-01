"use client";

import { useEffect, useMemo, useState } from "react";
import { PageTopBar } from "@/components/stark/PageTopBar";
import { PageSkeleton } from "@/components/stark/Skeleton";
import { depositTypeLabel } from "@/components/stark/SavingsPlanner";
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

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function monthLabel(month: string) {
  const value = Number(month.slice(5, 7));
  return Number.isFinite(value) ? `${value}月` : month;
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
    const plannedTotal = plans.reduce((sum, plan) => sum + plan.amount, 0);
    const completedAmount = plans.filter((plan) => plan.status === "COMPLETED").reduce((sum, plan) => sum + plan.amount, 0);
    const recordedSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const savedAmount = Math.max(recordedSaved, completedAmount);
    const target = goals.reduce((sum, goal) => sum + goal.targetAmount, 0) || plannedTotal;
    const completed = plans.filter((plan) => plan.status === "COMPLETED").length;
    const pending = plans.filter((plan) => plan.status !== "COMPLETED").length;
    const progress = target > 0 ? clampPercent((savedAmount / target) * 100) : 0;
    const pendingAmount = Math.max(plannedTotal - savedAmount, 0);
    return { completed, monthPlanned, pending, pendingAmount, plannedTotal, progress, savedAmount };
  }, [goals, plans]);

  const recentPlans = useMemo(() => (
    [...plans].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 8)
  ), [plans]);
  const primaryGoal = goals[0] ?? null;
  const activeGoals = useMemo(() => goals.filter((goal) => goal.status === "ACTIVE"), [goals]);
  const rhythm = useMemo(() => buildMonthRhythm(plans), [plans]);
  const visibleRhythm = useMemo(() => {
    const active = rhythm.filter((item) => item.planned > 0 || item.isCurrent);
    return active.length ? active : rhythm.slice(0, 6);
  }, [rhythm]);

  if (loading) return <PageSkeleton title="储蓄" cards={3} />;

  return (
    <div className="page-stack savings-dashboard-page">
      <PageTopBar title="储蓄" />

      <section className="home-card savings-lite-hero">
        <div className="savings-lite-head">
          <div>
            <span>储蓄计划</span>
            <strong>{primaryGoal?.name || "还没有储蓄目标"}</strong>
          </div>
          <em>{activeGoals.length ? `${activeGoals.length} 个目标` : depositTypeLabel(primaryGoal?.depositType)}</em>
        </div>

        <div className="savings-lite-total">
          <span>已存金额</span>
          <strong>¥ {formatMoney(summary.savedAmount)}</strong>
        </div>

        <div className="savings-lite-progress">
          <span style={{ width: `${summary.progress}%` }} />
        </div>

        <div className="savings-lite-meta">
          <span>进度 {summary.progress}%</span>
          <span>计划 ¥ {formatMoney(summary.plannedTotal)}</span>
        </div>

        <div className="savings-lite-grid">
          <div>
            <span>本月计划</span>
            <strong>¥ {formatMoney(summary.monthPlanned)}</strong>
          </div>
          <div>
            <span>待执行</span>
            <strong>¥ {formatMoney(summary.pendingAmount)}</strong>
          </div>
          <div>
            <span>已完成</span>
            <strong>{summary.completed} 笔</strong>
          </div>
        </div>
      </section>

      <section className="home-card page-card savings-lite-card">
        <div className="section-head">
          <h2>月度执行节奏</h2>
          <span className="mini-section-note">{summary.pending} 笔待存</span>
        </div>
        <div className="savings-rhythm-list">
          {visibleRhythm.map((item) => (
            <div key={item.month} className={`savings-rhythm-row ${item.isCurrent ? "current" : ""}`}>
              <span>{monthLabel(item.month)}</span>
              <div>
                <strong>¥ {formatMoney(item.planned)}</strong>
                <small>{item.pending > 0 ? `待 ¥${shortAmount(item.pending)}` : "已清"}</small>
                <div className="savings-rhythm-track">
                  <i style={{ width: `${item.planPercent}%` }} />
                  <b style={{ width: `${item.donePercent}%` }} />
                </div>
              </div>
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
