"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { PageTopBar } from "@/components/stark/PageTopBar";
import { PageDataError, PageSkeleton } from "@/components/stark/Skeleton";
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

function deadlineLabel(value?: string | null) {
  if (!value) return "未设置期限";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function planStatusLabel(status: SavingsPlan["status"]) {
  if (status === "COMPLETED") return "已完成";
  if (status === "SKIPPED") return "已跳过";
  return "待存入";
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
  const [loadError, setLoadError] = useState(false);
  const [loadVersion, setLoadVersion] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(false);
    async function loadSavingsDashboard() {
      try {
        const data = await repo.getSavingsGoals("default");
        const planGroups = await Promise.all(data.map((goal) => repo.getSavingsPlans(goal.id)));
        if (!active) return;
        setGoals(data);
        setPlans(planGroups.flat());
      } catch {
        if (active) setLoadError(true);
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadSavingsDashboard();
    return () => {
      active = false;
    };
  }, [loadVersion]);

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
    const activeCount = goals.filter((goal) => goal.status === "ACTIVE").length;
    return { activeCount, completed, completionRate, monthPlanned, pending, pendingAmount, plannedTotal, progress, remainingTarget, savedAmount, target };
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
  const heroProgress = `${summary.progress}%`;
  const focusPercent = focusGoal ? goalPercent(focusGoal) : 0;

  if (loading) return <PageSkeleton title="储蓄" cards={3} />;
  if (loadError) return <PageDataError title="储蓄" onRetry={() => setLoadVersion((version) => version + 1)} />;

  return (
    <div className="page-stack savings-dashboard-page">
      <PageTopBar title="储蓄" />

      <section className="home-card savings-vault-hero">
        <div className="savings-vault-copy">
          <span className="savings-eyebrow">储蓄总览</span>
          <strong>¥ {formatMoney(summary.savedAmount)}</strong>
          <p>{focusGoal ? `${focusGoal.name} · 还差 ¥ ${formatMoney(Math.max(focusGoal.targetAmount - focusGoal.currentAmount, 0))}` : "还没有储蓄目标"}</p>
          <div className="savings-hero-track" aria-label={`总进度 ${summary.progress}%`}>
            <i style={{ width: heroProgress }} />
          </div>
          <div className="savings-hero-meta">
            <span>目标 ¥ {formatMoney(summary.target)}</span>
            <span>剩余 ¥ {formatMoney(summary.remainingTarget)}</span>
          </div>
        </div>
        <div className="savings-vault-ring" style={{ "--progress": heroProgress } as CSSProperties}>
          <strong>{summary.progress}%</strong>
          <span>总进度</span>
        </div>
      </section>

      <section className="savings-metric-grid" aria-label="储蓄关键指标">
        <div className="savings-metric-card primary">
          <span>本月计划</span>
          <strong>¥ {formatMoney(summary.monthPlanned)}</strong>
          <small>{REPORTING_MONTH_KEY} 待执行额度</small>
        </div>
        <div className="savings-metric-card gap">
          <span>目标缺口</span>
          <strong>¥ {formatMoney(summary.remainingTarget)}</strong>
          <small>离总目标还需补齐</small>
        </div>
        <div className="savings-metric-card done">
          <span>完成率</span>
          <strong>{summary.completionRate}%</strong>
          <small>{summary.completed} 已完成 · {summary.pending} 待处理</small>
        </div>
      </section>

      {focusGoal ? (
        <section className="home-card savings-focus-card">
          <div className="savings-focus-head">
            <div>
              <span>当前冲刺目标</span>
              <strong>{focusGoal.name}</strong>
            </div>
            <em>{focusPercent}%</em>
          </div>
          <div className="savings-focus-bar" aria-label={`${focusGoal.name} 进度 ${focusPercent}%`}>
            <i style={{ width: `${focusPercent}%` }} />
          </div>
          <div className="savings-focus-meta">
            <span>已存 ¥ {formatMoney(focusGoal.currentAmount)}</span>
            <span>目标 ¥ {formatMoney(focusGoal.targetAmount)}</span>
            <span>{deadlineLabel(focusGoal.deadline)}</span>
          </div>
        </section>
      ) : null}

      <section className="home-card savings-goal-section">
        <div className="section-head savings-section-head">
          <div>
            <h2>目标组</h2>
            <span>活跃目标与存入进度</span>
          </div>
          <span className="mini-section-note">{summary.activeCount || goals.length} 个目标</span>
        </div>
        <div className="savings-goal-grid">
          {goalCards.length ? goalCards.map((goal) => {
            const percent = goalPercent(goal);
            const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
            return (
              <article key={goal.id} className="savings-goal-card">
                <div className="savings-goal-copy">
                  <span>{depositTypeLabel(goal.depositType)}</span>
                  <strong>{goal.name}</strong>
                </div>
                <em>{percent}%</em>
                <div className="savings-goal-track" aria-label={`${goal.name} 进度 ${percent}%`}><i style={{ width: `${percent}%` }} /></div>
                <p><span>已存 ¥ {formatMoney(goal.currentAmount)}</span><span>还差 ¥ {formatMoney(remaining)}</span></p>
              </article>
            );
          }) : (
            <div className="loan-empty">暂无储蓄目标</div>
          )}
        </div>
      </section>

      <section className="home-card savings-rhythm-card">
        <div className="section-head savings-section-head">
          <div>
            <h2>月度节奏</h2>
            <span>计划强度与完成比例</span>
          </div>
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
        <div className="recent-head savings-section-head">
          <div>
            <h2>最近计划</h2>
            <span>最近更新的存入安排</span>
          </div>
          <span className="mini-section-note">按更新时间</span>
        </div>
        <div className="recent-list">
          {recentPlans.length ? recentPlans.map((plan) => {
            const goal = goals.find((item) => item.id === plan.goalId);
            return (
              <div key={plan.id} className={`savings-recent-row ${plan.status.toLowerCase()}`}>
                <div className="savings-recent-icon">存</div>
                <strong>{goal?.name || "储蓄计划"}</strong>
                <span>{plan.month} · {planStatusLabel(plan.status)}</span>
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
