"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { PageTopBar } from "@/components/stark/PageTopBar";
import { PageSkeleton } from "@/components/stark/Skeleton";
import { EChartView } from "@/components/stark/EChartView";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { REPORTING_MONTH_KEY, clampPercent, formatMoney, monthKey } from "@/lib/stark/utils/format";
import type { Loan, Transaction } from "@/lib/stark/models";
import type { EChartsCoreOption } from "echarts/core";

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

function buildForecastChartOption(activeLoans: Loan[]): EChartsCoreOption {
  const now = new Date();
  const months: string[] = [];
  const monthAmounts: number[] = [];

  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const mLabel = `${d.getMonth() + 1}月`;
    months.push(mLabel);

    // 计算当月需要还款的总额
    const totalDue = activeLoans.reduce((sum, loan) => {
      const remainingP = Math.max(0, loan.periods - loan.paidPeriods);
      return i < remainingP ? sum + loan.monthlyPayment : sum;
    }, 0);
    monthAmounts.push(totalDue);
  }

  return {
    grid: {
      left: 12,
      right: 16,
      top: 24,
      bottom: 24,
      containLabel: true,
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(255, 255, 255, 0.96)",
      borderColor: "rgba(13, 138, 95, 0.2)",
      textStyle: { color: "#142036", fontSize: 12 },
      formatter: (params: any) => {
        const item = Array.isArray(params) ? params[0] : params;
        return `<div style="font-size:11px;color:#64748b;">${item.name}应还</div><strong style="color:#0d8a5f;font-size:13px;">¥ ${formatMoney(Number(item.value))}</strong>`;
      },
    },
    xAxis: {
      type: "category",
      data: months,
      axisLine: { lineStyle: { color: "#e2ecf2" } },
      axisTick: { show: false },
      axisLabel: { color: "#64748b", fontSize: 11 },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: "rgba(226, 236, 242, 0.6)", type: "dashed" } },
      axisLabel: {
        color: "#94a3b8",
        fontSize: 10,
        formatter: (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`),
      },
    },
    series: [
      {
        data: monthAmounts,
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        itemStyle: { color: "#0d8a5f", borderWidth: 2, borderColor: "#ffffff" },
        lineStyle: { width: 3, color: "#0d8a5f" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(13, 138, 95, 0.28)" },
              { offset: 1, color: "rgba(13, 138, 95, 0.0)" },
            ],
          },
        },
      },
    ],
  };
}

function buildDonutChartOption(loans: Loan[]): EChartsCoreOption {
  const palette = ["#0d8a5f", "#2a78d6", "#df9d35", "#e87962", "#8b5cf6", "#06b6d4"];
  const activeLoans = loans.filter((l) => l.status !== "PAID_OFF" && l.remainingAmount > 0);
  const data = activeLoans.map((l, i) => ({
    name: l.platform,
    value: l.remainingAmount,
    itemStyle: { color: palette[i % palette.length] },
  }));

  return {
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(255, 255, 255, 0.96)",
      borderColor: "rgba(13, 138, 95, 0.2)",
      textStyle: { color: "#142036", fontSize: 12 },
      formatter: (params: any) => {
        return `<div style="font-size:11px;color:#64748b;">${params.name}</div><strong style="color:#142036;">¥ ${formatMoney(params.value)}</strong> <span style="color:#0d8a5f;">(${params.percent}%)</span>`;
      },
    },
    series: [
      {
        type: "pie",
        radius: ["55%", "78%"],
        center: ["50%", "50%"],
        avoidLabelOverlap: false,
        label: { show: false },
        data: data.length ? data : [{ value: 1, name: "无贷款", itemStyle: { color: "#e2ecf2" } }],
      },
    ],
  };
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
    const maxRemainingMonths = activeLoans.length
      ? Math.max(0, ...activeLoans.map((item) => item.periods - item.paidPeriods))
      : 0;
    const estimatedCompletionYear = maxRemainingMonths > 0
      ? new Date().getFullYear() + Math.ceil(maxRemainingMonths / 12)
      : null;
    return { activeLoans, total, remaining, repaid, monthly, remainingPeriods, progress, income, pressure, maxRemainingMonths, estimatedCompletionYear };
  }, [list, transactions]);

  const debtStructure = useMemo(() => {
    if (!summary.remaining) return [];
    const palette = ["#0d8a5f", "#2a78d6", "#df9d35", "#e87962", "#8b5cf6", "#06b6d4"];
    return summary.activeLoans.map((loan, idx) => ({
      id: loan.id,
      platform: loan.platform,
      remaining: loan.remainingAmount,
      monthlyPayment: loan.monthlyPayment,
      percent: summary.remaining > 0 ? (loan.remainingAmount / summary.remaining) * 100 : 0,
      color: palette[idx % palette.length],
    })).sort((a, b) => b.remaining - a.remaining);
  }, [summary.activeLoans, summary.remaining]);

  const schedule = useMemo(() => (
    [...summary.activeLoans].sort((a, b) => dueMeta(a).target.getTime() - dueMeta(b).target.getTime())
  ), [summary.activeLoans]);

  const forecastOption = useMemo(() => buildForecastChartOption(summary.activeLoans), [summary.activeLoans]);
  const donutOption = useMemo(() => buildDonutChartOption(list), [list]);

  if (loading) return <PageSkeleton title="贷款" cards={4} />;

  const nearest = schedule[0] ?? null;
  const pressureClass = summary.pressure === null ? "neutral" : summary.pressure <= 25 ? "positive" : summary.pressure <= 40 ? "warning" : "danger";
  const pressureLevel = summary.pressure === null ? "暂无收入数据" : summary.pressure <= 25 ? "压力可控" : summary.pressure <= 40 ? "需要关注" : "压力偏高";

  return (
    <div className="page-stack finance-page loans-page">
      <PageTopBar title="贷款" />

      {/* 核心驾驶舱：还款指挥台 */}
      <section className="loan-operations-hero loan-cockpit-hero">
        <div className="finance-eyebrow-row">
          <span className="finance-eyebrow">还款控制中心</span>
          <span className="finance-state-chip">{summary.activeLoans.length} 笔进行中</span>
        </div>

        <div className="loan-cockpit-main">
          <div className="loan-cockpit-balance">
            <span>待还本金总额</span>
            <strong>¥ {formatMoney(summary.remaining)}</strong>
            <p>已还清 ¥ {formatMoney(summary.repaid)} · 整体进度 {Math.round(summary.progress)}%</p>
          </div>

          <div className="loan-cockpit-ring-box">
            <div className="loan-cockpit-ring" style={{ "--progress": `${summary.progress}%` } as CSSProperties}>
              <strong>{Math.round(summary.progress)}%</strong>
              <span>已还</span>
            </div>
          </div>
        </div>

        <div className="loan-cockpit-metrics">
          <div className="loan-metric-card primary">
            <span>本月月供</span>
            <strong>¥ {formatMoney(summary.monthly)}</strong>
            <small>{summary.activeLoans.length} 笔待还款</small>
          </div>
          <div className={`loan-metric-card ${pressureClass}`}>
            <span>还款压力</span>
            <strong>{pressureLevel}</strong>
            <small>{summary.pressure ? `占收入 ${Math.round(summary.pressure)}%` : "暂无收入"}</small>
          </div>
          <div className="loan-metric-card node">
            <span>下期到期</span>
            <strong>{nearest ? `${dueMeta(nearest).days} 天后` : "--"}</strong>
            <small>{nearest ? `${nearest.platform} · ${dueMeta(nearest).date}` : "已全部结清"}</small>
          </div>
        </div>
      </section>

      {/* 数据驾驶舱：偿还趋势预测与构成 */}
      <section className="home-card finance-section loan-charts-card">
        <div className="finance-section-head">
          <div>
            <h2>未来6个月月供趋势</h2>
            <span>按现有贷款期数推演</span>
          </div>
          {summary.estimatedCompletionYear ? (
            <span className="mini-section-note">预计 {summary.estimatedCompletionYear} 年结清</span>
          ) : null}
        </div>
        <div className="loan-trend-chart-box">
          <EChartView option={forecastOption} className="loan-trend-chart" />
        </div>
      </section>

      {/* 负债构成可视化 */}
      {debtStructure.length > 0 ? (
        <section className="home-card finance-section loan-structure-card">
          <div className="finance-section-head">
            <div>
              <h2>负债构成分析</h2>
              <span>各平台贷款占比</span>
            </div>
            <span className="mini-section-note">共 {debtStructure.length} 个账户</span>
          </div>
          <div className="loan-structure-flex">
            <div className="loan-donut-wrap">
              <EChartView option={donutOption} className="loan-donut-chart" />
            </div>
            <div className="loan-structure-list">
              {debtStructure.map((item) => (
                <div className="loan-structure-item-row" key={item.id}>
                  <div className="loan-structure-lead">
                    <i style={{ background: item.color }} />
                    <strong>{item.platform}</strong>
                  </div>
                  <span className="loan-structure-pct">{item.percent.toFixed(1)}%</span>
                  <strong className="loan-structure-val">¥ {formatMoney(item.remaining)}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* 还款日程时间轴 */}
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

      {/* 贷款组合卡片 */}
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
