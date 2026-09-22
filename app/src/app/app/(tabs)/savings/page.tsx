"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { PageTopBar } from "@/components/stark/PageTopBar";
import { PageDataError, PageSkeleton } from "@/components/stark/Skeleton";
import { LazyJournalPanel as JournalPanel } from "@/components/stark/LazyJournalPanel";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { REMOTE_CACHE_UPDATED_EVENT, type RemoteCacheUpdate } from "@/lib/stark/repository/RemoteRepository";
import { savingsDepositTypeLabel } from "@/lib/stark/savings/deposit-type";
import { formatMoney } from "@/lib/stark/utils/format";
import type { SavingsGoal, SavingsPlan } from "@/lib/stark/models";
import { savingsPlanRecordedAmount } from "@/lib/stark/savings/planner";
import { translateValue, useAppLocale } from "@/lib/stark/i18n";
import { getCurrentAccountId } from "@/lib/stark/storage/local-config";
import styles from "./savings-record.module.css";

const repo = new DataModeManager().getRepository();

function dayLabel(value: string, locale: "zh-CN" | "en-US") {
  const day = Number(value.slice(8, 10));
  return Number.isFinite(day) ? locale === "en-US" ? String(day) : `${day}日` : value;
}

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function currentMonthKey() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function deadlineLabel(value: string | null | undefined, locale: "zh-CN" | "en-US") {
  if (!value) return locale === "en-US" ? "No deadline" : "未设置期限";
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const formatted = match ? `${match[1]}-${match[2]}-${match[3]}` : value;
  return locale === "en-US" ? `Deadline ${formatted}` : `截止 ${formatted}`;
}

function planStatusLabel(status: SavingsPlan["status"]) {
  if (status === "COMPLETED") return "已完成";
  if (status === "SKIPPED") return "已跳过";
  return "待存入";
}

function goalPercent(goal: SavingsGoal) {
  return goal.targetAmount > 0 ? clampPercent((goal.currentAmount / goal.targetAmount) * 100) : 0;
}

export default function SavingsPage() {
  const locale = useAppLocale();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [plans, setPlans] = useState<SavingsPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [loadVersion, setLoadVersion] = useState(0);
  const [recordingPlan, setRecordingPlan] = useState<SavingsPlan | null>(null);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(false);
    async function loadSavingsDashboard() {
      try {
        const data = await repo.getSavingsGoals(getCurrentAccountId());
        const planGroups = await repo.getSavingsPlansByGoals(data.map((goal) => goal.id));
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
    const handleSavingsSaved = () => { void loadSavingsDashboard(); };
    const handleCacheUpdate = (event: Event) => {
      const update = (event as CustomEvent<RemoteCacheUpdate>).detail;
      if (!update || !["savingsGoals", "savingsPlans"].includes(update.resource)) return;
      if (update.accountId && update.accountId !== getCurrentAccountId()) return;
      void loadSavingsDashboard();
    };
    window.addEventListener("stark:savings-saved", handleSavingsSaved);
    window.addEventListener(REMOTE_CACHE_UPDATED_EVENT, handleCacheUpdate);
    return () => {
      active = false;
      window.removeEventListener("stark:savings-saved", handleSavingsSaved);
      window.removeEventListener(REMOTE_CACHE_UPDATED_EVENT, handleCacheUpdate);
    };
  }, [loadVersion]);

  const currentMonth = currentMonthKey();
  const summary = useMemo(() => {
    const monthPlans = plans.filter((plan) => plan.month === currentMonth);
    const monthPlanned = monthPlans.reduce((sum, plan) => sum + plan.amount, 0);
    const plannedTotal = plans.reduce((sum, plan) => sum + plan.amount, 0);
    const completedAmount = plans.reduce((sum, plan) => sum + savingsPlanRecordedAmount(plan), 0);
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
  }, [currentMonth, goals, plans]);

  const recentPlans = useMemo(() => (
    [...plans].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 8)
  ), [plans]);
  const activeGoals = useMemo(() => goals.filter((goal) => goal.status === "ACTIVE"), [goals]);
  const goalCards = useMemo(() => (
    activeGoals.length ? activeGoals : goals
  ).slice(0, 4), [activeGoals, goals]);
  const recordingGoal = recordingPlan ? goals.find((goal) => goal.id === recordingPlan.goalId) ?? null : null;
  const heroProgress = `${summary.progress}%`;

  if (loading) return <PageSkeleton title="储蓄" cards={3} />;
  if (loadError) return <PageDataError title="储蓄" onRetry={() => setLoadVersion((version) => version + 1)} />;

  return (
    <div className="page-stack savings-dashboard-page">
      <PageTopBar title="储蓄" />

      <aside className="financial-planning-notice" role="note">
        <strong>规划提醒</strong>
        <p>本项目只用于规划，不能实际存入资金，请合理规划资金存放。</p>
      </aside>

      <section className="home-card savings-vault-hero">
        <div className="savings-vault-copy">
          <span className="savings-eyebrow">{translateValue("储蓄总览", locale)}</span>
          <strong>¥ {formatMoney(summary.savedAmount)}</strong>
          <p>{goals.length ? `${goals.length} ${locale === "en-US" ? "savings goals" : "个储蓄目标"}` : translateValue("还没有储蓄目标", locale)}</p>
          <div className="savings-hero-track" aria-label={`总进度 ${summary.progress}%`}>
            <i style={{ width: heroProgress }} />
          </div>
          <div className="savings-hero-meta">
            <span>{translateValue("目标", locale)} ¥ {formatMoney(summary.target)}</span>
            <span>{translateValue("剩余", locale)} ¥ {formatMoney(summary.remainingTarget)}</span>
          </div>
        </div>
        <div className="savings-vault-ring" style={{ "--progress": heroProgress } as CSSProperties}>
          <strong>{summary.progress}%</strong>
          <span>{translateValue("总进度", locale)}</span>
        </div>
      </section>

      <section className="savings-metric-grid" aria-label={locale === "en-US" ? "Key savings metrics" : "储蓄关键指标"}>
        <div className="savings-metric-card primary">
          <span>{translateValue("本月计划", locale)}</span>
          <strong>¥ {formatMoney(summary.monthPlanned)}</strong>
          <small>{locale === "en-US" ? `${currentMonth} planned amount` : `${currentMonth} 待执行额度`}</small>
        </div>
        <div className="savings-metric-card gap">
          <span>{translateValue("目标缺口", locale)}</span>
          <strong>¥ {formatMoney(summary.remainingTarget)}</strong>
          <small>{translateValue("离总目标还需补齐", locale)}</small>
        </div>
        <div className="savings-metric-card done">
          <span>{translateValue("完成率", locale)}</span>
          <strong>{summary.completionRate}%</strong>
          <small>{locale === "en-US" ? `${summary.completed} completed · ${summary.pending} pending` : `${summary.completed} 已完成 · ${summary.pending} 待处理`}</small>
        </div>
      </section>

      <section className="home-card savings-goal-section">
        <div className="section-head savings-section-head">
          <div>
            <h2>{translateValue("目标组", locale)}</h2>
            <span>{translateValue("活跃目标与存入进度", locale)}</span>
          </div>
          <span className="mini-section-note">{locale === "en-US" ? `${summary.activeCount || goals.length} goals` : `${summary.activeCount || goals.length} 个目标`}</span>
        </div>
        <div className="savings-goal-grid">
          {goalCards.length ? goalCards.map((goal) => {
            const percent = goalPercent(goal);
            const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
            return (
              <article key={goal.id} className="savings-goal-card">
                <div className="savings-goal-copy">
                  <span>{savingsDepositTypeLabel(goal.depositType)}</span>
                  <strong>{goal.name}</strong>
                  <small>{deadlineLabel(goal.deadline, locale)}</small>
                </div>
                <div className="savings-goal-card-actions">
                  <em>{percent}%</em>
                  <button
                    type="button"
                    className="savings-goal-edit-button"
                    aria-label={`${translateValue("编辑目标", locale)} ${goal.name}`}
                    onClick={() => setEditingGoalId(goal.id)}
                  >
                    {translateValue("编辑目标", locale)}
                  </button>
                </div>
                <div className="savings-goal-track" aria-label={`${goal.name} 进度 ${percent}%`}><i style={{ width: `${percent}%` }} /></div>
                <p><span>{translateValue("已存", locale)} ¥ {formatMoney(goal.currentAmount)}</span><span>{locale === "en-US" ? "Remaining" : "还差"} ¥ {formatMoney(remaining)}</span></p>
              </article>
            );
          }) : (
            <div className="loan-empty">{translateValue("暂无储蓄目标", locale)}</div>
          )}
        </div>
      </section>

      <section className="recent-card savings-recent-card">
        <div className="recent-head savings-section-head">
          <div>
            <h2>{translateValue("最近计划", locale)}</h2>
            <span>{translateValue("最近更新的存入安排", locale)}</span>
          </div>
          <span className="mini-section-note">{translateValue("按更新时间", locale)}</span>
        </div>
        <div className="recent-list">
          {recentPlans.length ? recentPlans.map((plan) => {
            const goal = goals.find((item) => item.id === plan.goalId);
            const recorded = plan.status === "COMPLETED";
            const amount = recorded && plan.actualAmount !== null && plan.actualAmount !== undefined ? plan.actualAmount : plan.amount;
            const recordedAmount = savingsPlanRecordedAmount(plan);
            const progress = plan.amount > 0 ? clampPercent((recordedAmount / plan.amount) * 100) : 0;
            return (
              <div key={plan.id} className={`savings-recent-row ${plan.status.toLowerCase()}`}>
                <div className="savings-recent-icon">存</div>
                <strong>{goal?.name || "储蓄计划"}</strong>
                <div className="savings-recent-meta">
                  <span>{plan.month} · {translateValue(planStatusLabel(plan.status), locale)}</span>
                  <time>{dayLabel(plan.updatedAt.slice(0, 10), locale)}</time>
                </div>
                <div className={styles.recentActions}>
                  <div className={styles.progressSummary}>
                    <div className={styles.progressTrack} aria-label={`${goal?.name || "储蓄计划"} 完成 ${progress}%`}>
                      <i style={{ width: `${progress}%` }} />
                    </div>
                    <small>已存 ¥ {formatMoney(recordedAmount)} / 计划 ¥ {formatMoney(plan.amount)}</small>
                  </div>
                  <em>+¥ {formatMoney(amount)}</em>
                  <button
                    type="button"
                    className={`${styles.recordButton} ${recorded ? styles.recorded : ""}`}
                    onClick={() => setRecordingPlan(plan)}
                    aria-label={`${goal?.name || "储蓄计划"} · ${recorded ? "修改实际存入记录" : "记录实际存入"}`}
                  >
                    {recorded ? "修改记录" : "实际存入"}
                  </button>
                </div>
              </div>
            );
          }) : (
            <div className="loan-empty">{translateValue("暂无储蓄记录", locale)}</div>
          )}
        </div>
      </section>

      {recordingPlan && recordingGoal ? (
        <JournalPanel
          mode="sheet"
          variant="savings-record"
          savingsPlan={recordingPlan}
          savingsGoal={recordingGoal}
          onClose={() => setRecordingPlan(null)}
          onSaved={() => {
            setRecordingPlan(null);
            setLoadVersion((version) => version + 1);
          }}
        />
      ) : null}

      {editingGoalId ? (
        <JournalPanel
          mode="page"
          variant="savings"
          savingsGoalId={editingGoalId}
          onClose={() => setEditingGoalId(null)}
          onSaved={() => {
            setEditingGoalId(null);
            setLoadVersion((version) => version + 1);
          }}
        />
      ) : null}
    </div>
  );
}
