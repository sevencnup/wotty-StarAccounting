"use client";

import { useEffect, useMemo, useState } from "react";
import { PageTopBar } from "@/components/stark/PageTopBar";
import { PageSkeleton } from "@/components/stark/Skeleton";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { REPORTING_MONTH_KEY, clampPercent, formatMoney, monthKey } from "@/lib/stark/utils/format";
import type { Loan, Transaction } from "@/lib/stark/models";

const repo = new DataModeManager().getRepository();

function nextDueDate(dueDay: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function dateFor(year: number, month: number) {
    const lastDay = new Date(year, month + 1, 0).getDate();
    return new Date(year, month, Math.min(Math.max(dueDay, 1), lastDay));
  }

  let target = dateFor(today.getFullYear(), today.getMonth());
  if (target < today) target = dateFor(today.getFullYear(), today.getMonth() + 1);
  return target;
}

function dueMeta(loan: Loan) {
  const target = nextDueDate(loan.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.max(0, Math.ceil((target.getTime() - today.getTime()) / 86_400_000));
  const date = `${String(target.getMonth() + 1).padStart(2, "0")}-${String(target.getDate()).padStart(2, "0")}`;
  return { target, days, date };
}

function loanProgress(loan: Loan) {
  return loan.totalAmount > 0
    ? clampPercent(((loan.totalAmount - loan.remainingAmount) / loan.totalAmount) * 100)
    : 0;
}

function statusLabel(loan: Loan) {
  if (loan.status === "PAID_OFF") return "已结清";
  if (loan.status === "OVERDUE") return "已逾期";
  const days = dueMeta(loan).days;
  if (days <= 3) return "临近还款";
  return "还款中";
}

export default function LoansPage() {
  const [list, setList] = useState<Loan[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = () => void repo.getLoans("default").then(setList);

  useEffect(() => {
    let active = true;
    void Promise.all([
      repo.getLoans("default"),
      repo.getTransactions("default", 1, 200),
    ]).then(([loans, records]) => {
      if (!active) return;
      setList(loans);
      setTransactions(records);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const handleLoanSaved = () => reload();
    window.addEventListener("stark:loan-saved", handleLoanSaved);
    return () => window.removeEventListener("stark:loan-saved", handleLoanSaved);
  }, []);

  const summary = useMemo(() => {
    const activeLoans = list.filter((item) => item.status !== "PAID_OFF");
    const total = list.reduce((sum, item) => sum + item.totalAmount, 0);
    const remaining = activeLoans.reduce((sum, item) => sum + item.remainingAmount, 0);
    const repaid = Math.max(0, total - list.reduce((sum, item) => sum + item.remainingAmount, 0));
    const monthly = activeLoans.reduce((sum, item) => sum + item.monthlyPayment, 0);
    const remainingPeriods = activeLoans.reduce((sum, item) => sum + Math.max(0, item.periods - item.paidPeriods), 0);
    const progress = total > 0 ? clampPercent((repaid / total) * 100) : 0;
    const income = transactions
      .filter((item) => item.type === "INCOME" && monthKey(item.date) === REPORTING_MONTH_KEY)
      .reduce((sum, item) => sum + item.amount, 0);
    const pressure = income > 0 ? (monthly / income) * 100 : null;
    return { activeLoans, total, remaining, repaid, monthly, remainingPeriods, progress, income, pressure };
  }, [list, transactions]);

  const schedule = useMemo(() => (
    [...summary.activeLoans].sort((a, b) => dueMeta(a).target.getTime() - dueMeta(b).target.getTime())
  ), [summary.activeLoans]);

  if (loading) return <PageSkeleton title="贷款" cards={4} />;

  const nearest = schedule[0] ?? null;
  const pressureClass = summary.pressure === null ? "neutral" : summary.pressure <= 25 ? "positive" : summary.pressure <= 40 ? "warning" : "danger";
  const pressureLevel = summary.pressure === null ? "暂无收入数据" : summary.pressure <= 25 ? "压力可控" : summary.pressure <= 40 ? "需要关注" : "压力偏高";

  return (
    <div className="page-stack finance-page loans-page">
      <PageTopBar title="贷款" />

      <section className="loan-operations-hero">
        <div className="finance-eyebrow-row">
          <span className="finance-eyebrow">还款指挥台</span>
          <span className="finance-state-chip">{summary.activeLoans.length} 笔进行中</span>
        </div>
        <div className="loan-operations-main">
          <div className="loan-operations-balance">
            <span>待还本金</span>
            <strong>¥ {formatMoney(summary.remaining)}</strong>
            <small>已偿还 ¥ {formatMoney(summary.repaid)} · 总额 ¥ {formatMoney(summary.total)}</small>
          </div>
          <div className="loan-next-node">
            {nearest ? (
              <>
                <span>下一节点</span>
                <strong>{dueMeta(nearest).days}</strong>
                <em>{dueMeta(nearest).days === 0 ? "今天还款" : "天后还款"}</em>
                <small>{nearest.platform} · ¥ {formatMoney(nearest.monthlyPayment)}</small>
              </>
            ) : (
              <><span>下一节点</span><strong>--</strong><em>暂无还款</em></>
            )}
          </div>
        </div>
        <div className="loan-milestone-head">
          <span>整体已还进度</span>
          <strong>{Math.round(summary.progress)}%</strong>
        </div>
        <div className="loan-milestone-rail" aria-label={`整体已还 ${Math.round(summary.progress)}%`}>
          <div className="loan-milestone-bar" style={{ width: `${summary.progress}%` }} />
          <div className="loan-milestone-segments">
            {Array.from({ length: 10 }, (_, index) => (
              <i key={index} className={index < Math.round(summary.progress / 10) ? "complete" : ""} />
            ))}
          </div>
        </div>
        <div className="loan-operations-metrics">
          <div className="loan-metric-tile">
            <span>本月月供</span>
            <strong>¥ {formatMoney(summary.monthly)}</strong>
          </div>
          <div className={`loan-metric-tile ${pressureClass}`}>
            <span>还款压力</span>
            <strong>{pressureLevel}</strong>
          </div>
          <div className="loan-metric-tile">
            <span>剩余期数</span>
            <strong>{summary.remainingPeriods} 期</strong>
          </div>
        </div>
      </section>

      <section className="home-card finance-section loan-schedule-section">
        <div className="finance-section-head">
          <div>
            <h2>还款日程</h2>
            <span>按到期时间排序</span>
          </div>
          <span className="mini-section-note">{schedule.length} 笔待还</span>
        </div>
        <div className="loan-schedule-list">
          {schedule.length ? schedule.map((loan, index) => {
            const meta = dueMeta(loan);
            const isToday = meta.days === 0;
            const isUrgent = meta.days <= 3;
            return (
              <div className={`loan-schedule-row ${isToday ? "today" : isUrgent ? "urgent" : ""}`} key={loan.id}>
                <div className="loan-timeline-marker">
                  <i />
                  <span>{index + 1}</span>
                </div>
                <div className="loan-schedule-main">
                  <strong>{loan.platform}</strong>
                  <span>{meta.date} · 剩余 {Math.max(0, loan.periods - loan.paidPeriods)} 期</span>
                </div>
                <div className="loan-schedule-amount">
                  <strong>¥ {formatMoney(loan.monthlyPayment)}</strong>
                  <span className={`loan-due-tag ${isToday ? "today" : isUrgent ? "urgent" : ""}`}>
                    {isToday ? "今天到期" : `${meta.days} 天后`}
                  </span>
                </div>
              </div>
            );
          }) : <div className="finance-empty">还款日程为空</div>}
        </div>
      </section>

      <section className="finance-section loan-portfolio-section">
        <div className="finance-section-head">
          <div>
            <h2>贷款组合</h2>
            <span>全部贷款明细与还款进度</span>
          </div>
          <span className="mini-section-note">{list.length} 笔记录</span>
        </div>
        <div className="loan-portfolio-list">
          {list.length ? list.map((loan) => {
            const progress = loanProgress(loan);
            const status = statusLabel(loan);
            const statusKey = loan.status === "PAID_OFF" ? "paid" : loan.status === "OVERDUE" ? "overdue" : dueMeta(loan).days <= 3 ? "urgent" : "active";
            const repaidAmount = Math.max(0, loan.totalAmount - loan.remainingAmount);
            return (
              <article className="loan-portfolio-card" key={loan.id}>
                <div className="loan-portfolio-top">
                  <div className="loan-brand-mark">{loan.platform.slice(0, 1)}</div>
                  <div className="loan-portfolio-title">
                    <strong>{loan.platform}</strong>
                    <span className={`loan-status-chip ${statusKey}`}>{status}</span>
                  </div>
                  <div className="loan-balance-group">
                    <span className="loan-balance-label">待还本金</span>
                    <strong className="loan-balance">¥ {formatMoney(loan.remainingAmount)}</strong>
                  </div>
                </div>
                <div className="loan-portfolio-meta">
                  <span>已还 {loan.paidPeriods} / {loan.periods} 期</span>
                  <span>下期还款 {dueMeta(loan).date}</span>
                </div>
                <div className="loan-portfolio-progress" aria-label={`还款进度 ${Math.round(progress)}%`}>
                  <span style={{ width: `${progress}%` }} />
                </div>
                <div className="loan-portfolio-foot">
                  <span>已还 ¥ {formatMoney(repaidAmount)} ({Math.round(progress)}%)</span>
                  <strong>月供 ¥ {formatMoney(loan.monthlyPayment)}</strong>
                </div>
              </article>
            );
          }) : <div className="finance-empty bordered">暂无贷款，新增后会显示还款节奏</div>}
        </div>
      </section>
    </div>
  );
}
