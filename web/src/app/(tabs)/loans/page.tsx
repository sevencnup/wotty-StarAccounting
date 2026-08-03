"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { PageTopBar } from "@/components/stark/PageTopBar";
import { PageSkeleton } from "@/components/stark/Skeleton";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { REPORTING_MONTH_KEY, clampPercent, formatMoney, monthKey, nowText } from "@/lib/stark/utils/format";
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
  const [platform, setPlatform] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [remainingAmount, setRemainingAmount] = useState("");
  const [monthlyPayment, setMonthlyPayment] = useState("");
  const [periods, setPeriods] = useState("12");
  const [dueDay, setDueDay] = useState("20");

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

  async function saveLoan() {
    const now = nowText();
    const total = Number(totalAmount) || 0;
    await repo.saveLoan({
      id: crypto.randomUUID(),
      userId: "local-user",
      accountId: "default",
      platform: platform.trim() || "新贷款",
      totalAmount: total,
      remainingAmount: remainingAmount === "" ? total : Number(remainingAmount) || 0,
      periods: Math.max(1, Number(periods) || 12),
      paidPeriods: 0,
      monthlyPayment: Number(monthlyPayment) || 0,
      dueDate: Math.min(31, Math.max(1, Number(dueDay) || 20)),
      status: "ACTIVE",
      matchKeywords: null,
      createdAt: now,
      updatedAt: now,
    });
    setPlatform("");
    setTotalAmount("");
    setRemainingAmount("");
    setMonthlyPayment("");
    setPeriods("12");
    setDueDay("20");
    reload();
  }

  if (loading) return <PageSkeleton title="贷款" cards={4} />;

  const nearest = schedule[0] ?? null;
  const pressureLevel = summary.pressure === null ? "暂无收入数据" : summary.pressure <= 25 ? "压力可控" : summary.pressure <= 40 ? "需要关注" : "压力偏高";

  return (
    <div className="page-stack finance-page loans-page">
      <PageTopBar title="贷款" />

      <section className="loan-command-card loan-identity-hero">
        <div className="finance-eyebrow-row">
          <span className="finance-eyebrow">还款指挥台</span>
          <span className="finance-state-chip">{summary.activeLoans.length} 笔进行中</span>
        </div>
        <div className="loan-identity-main">
          <div className="loan-identity-balance">
            <span>待还本金</span>
            <div className="loan-command-value">¥ {formatMoney(summary.remaining)}</div>
            <div className="loan-command-caption">已偿还 ¥ {formatMoney(summary.repaid)}</div>
          </div>
          <div
            className="loan-identity-progress"
            style={{ "--loan-progress": `${summary.progress}%` } as CSSProperties}
            aria-label={`整体已还 ${Math.round(summary.progress)}%`}
          >
            <strong>{Math.round(summary.progress)}%</strong>
            <span>已还</span>
          </div>
        </div>
        <div className="loan-progress-track" aria-label={`整体已还 ${Math.round(summary.progress)}%`}>
          <span style={{ width: `${summary.progress}%` }} />
        </div>
        <div className="loan-command-progress">
          <span>偿还进度</span>
          <strong>剩余 {summary.remainingPeriods} 期</strong>
        </div>
        <div className="loan-command-metrics">
          <div><span>本月月供</span><strong>¥ {formatMoney(summary.monthly)}</strong></div>
          <div><span>还款压力</span><strong>{summary.pressure === null ? "--" : `${summary.pressure.toFixed(1)}%`}</strong></div>
          <div><span>贷款总额</span><strong>¥ {formatMoney(summary.total)}</strong></div>
        </div>
      </section>

      <section className="loan-next-grid">
        <div className="home-card loan-next-card">
          <div className="finance-section-head"><h2>最近还款</h2><span>下一节点</span></div>
          {nearest ? (
            <div className="loan-next-body">
              <div className="loan-date-tile"><strong>{dueMeta(nearest).days}</strong><span>天后</span></div>
              <div className="loan-next-copy">
                <strong>{nearest.platform}</strong>
                <span>{dueMeta(nearest).date} · 应还 ¥ {formatMoney(nearest.monthlyPayment)}</span>
              </div>
            </div>
          ) : <div className="finance-empty">暂无待还贷款</div>}
        </div>
        <div className="home-card loan-pressure-card">
          <div className="finance-section-head"><h2>还款压力</h2><span>{pressureLevel}</span></div>
          <div className="loan-pressure-value">{summary.pressure === null ? "--" : `${summary.pressure.toFixed(1)}%`}</div>
          <div className="loan-pressure-scale"><span style={{ width: `${clampPercent(summary.pressure ?? 0)}%` }} /></div>
          <p>{summary.income > 0 ? `月供占本月收入 ¥ ${formatMoney(summary.income)}` : "录入本月收入后可计算月供收入比"}</p>
        </div>
      </section>

      <section className="home-card finance-section loan-schedule-section">
        <div className="finance-section-head"><h2>还款日程</h2><span>按到期时间</span></div>
        <div className="loan-schedule-list">
          {schedule.length ? schedule.map((loan, index) => {
            const meta = dueMeta(loan);
            return (
              <div className="loan-schedule-row" key={loan.id}>
                <div className="loan-timeline-marker"><i /><span>{index + 1}</span></div>
                <div className="loan-schedule-main"><strong>{loan.platform}</strong><span>{meta.date} · 剩余 {Math.max(0, loan.periods - loan.paidPeriods)} 期</span></div>
                <div className="loan-schedule-amount"><strong>¥ {formatMoney(loan.monthlyPayment)}</strong><span className={meta.days <= 3 ? "urgent" : ""}>{meta.days === 0 ? "今天" : `${meta.days} 天`}</span></div>
              </div>
            );
          }) : <div className="finance-empty">还款日程为空</div>}
        </div>
      </section>

      <section className="finance-section loan-portfolio-section">
        <div className="finance-section-head"><h2>贷款组合</h2><span>{list.length} 笔</span></div>
        <div className="loan-portfolio-list">
          {list.length ? list.map((loan) => {
            const progress = loanProgress(loan);
            return (
              <article className="loan-portfolio-card" key={loan.id}>
                <div className="loan-portfolio-top">
                  <div className="loan-brand-mark">{loan.platform.slice(0, 1)}</div>
                  <div className="loan-portfolio-title"><strong>{loan.platform}</strong><span className={`loan-status ${loan.status.toLowerCase()}`}>{statusLabel(loan)}</span></div>
                  <strong className="loan-balance">¥ {formatMoney(loan.remainingAmount)}</strong>
                </div>
                <div className="loan-portfolio-meta"><span>已还 {loan.paidPeriods}/{loan.periods} 期</span><span>下期 {dueMeta(loan).date}</span></div>
                <div className="loan-portfolio-progress"><span style={{ width: `${progress}%` }} /></div>
                <div className="loan-portfolio-foot"><span>完成 {Math.round(progress)}%</span><strong>月供 ¥ {formatMoney(loan.monthlyPayment)}</strong></div>
              </article>
            );
          }) : <div className="finance-empty bordered">暂无贷款，新增后会显示还款节奏</div>}
        </div>
      </section>

      <section className="home-card finance-section finance-create-section">
        <div className="finance-section-head"><h2>新增贷款</h2><span>建立还款计划</span></div>
        <div className="finance-form-grid loan-form-grid">
          <label><span>贷款名称</span><input value={platform} onChange={(event) => setPlatform(event.target.value)} placeholder="如住房贷款" /></label>
          <label><span>贷款总额</span><input inputMode="decimal" value={totalAmount} onChange={(event) => setTotalAmount(event.target.value.replace(/[^\d.]/g, ""))} placeholder="0.00" /></label>
          <label><span>剩余本金</span><input inputMode="decimal" value={remainingAmount} onChange={(event) => setRemainingAmount(event.target.value.replace(/[^\d.]/g, ""))} placeholder="默认等于总额" /></label>
          <label><span>每月月供</span><input inputMode="decimal" value={monthlyPayment} onChange={(event) => setMonthlyPayment(event.target.value.replace(/[^\d.]/g, ""))} placeholder="0.00" /></label>
          <label><span>总期数</span><input inputMode="numeric" value={periods} onChange={(event) => setPeriods(event.target.value.replace(/\D/g, ""))} /></label>
          <label><span>每月还款日</span><input inputMode="numeric" value={dueDay} onChange={(event) => setDueDay(event.target.value.replace(/\D/g, ""))} /></label>
        </div>
        <button type="button" className="finance-primary-action" onClick={() => void saveLoan()}>保存贷款计划</button>
      </section>
    </div>
  );
}
