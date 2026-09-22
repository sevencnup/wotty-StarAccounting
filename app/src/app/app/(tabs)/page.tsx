"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PropsWithChildren, ReactNode } from "react";
import Link from "next/link";
import type { EChartsCoreOption } from "echarts/core";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { REMOTE_CACHE_UPDATED_EVENT, type RemoteCacheUpdate } from "@/lib/stark/repository/RemoteRepository";
import { EChartView } from "@/components/stark/EChartView";
import { loadAvailableTransactionMonths, resolveAvailableReportingMonth } from "@/lib/stark/repository/transaction-months";
import { Skeleton } from "@/components/stark/Skeleton";
import { MonthPicker } from "@/components/stark/MonthPicker";
import { BottomSheet } from "@/components/stark/BottomSheet";
import { BudgetManagementSheet } from "@/components/stark/BudgetManagementSheet";
import { getCloudApiUrl, getCurrentAccountId, getSalaryDay, getSelectedReportMonth, setSalaryDay as persistSalaryDay, setSelectedReportMonth } from "@/lib/stark/storage/local-config";
import {
  buildHomeSummary,
  type HomeSummary,
} from "@/lib/stark/dashboard/summary";
import { homeCoreTransactionMonths, homeSupplementalTransactionMonths } from "@/lib/stark/dashboard/home-load-stages";
import { toAnalysisTransactions } from "@/lib/stark/dashboard/remark";
import { formatMoney, isReportingYearKey, monthKey, reportingMonthDate, reportingMonthEndDate, reportingMonthLabel, reportingMonthSequence, reportingPeriodMonths } from "@/lib/stark/utils/format";
import type { Asset, Budget, Loan, SavingsGoal, SavingsPlan, Transaction } from "@/lib/stark/models";
import { translateText, translateValue, useAppLocale, type AppLocale } from "@/lib/stark/i18n";

const manager = new DataModeManager();

type IconProps = { size?: number; color?: string; strokeWidth?: number };

function IconBase({ children, size = 24, color = "currentColor", strokeWidth = 2 }: PropsWithChildren<IconProps>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

function SearchIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4 4" />
    </IconBase>
  );
}

function ChevronDownIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m7 10 5 5 5-5" />
    </IconBase>
  );
}

function ChevronRightIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m9 18 6-6-6-6" />
    </IconBase>
  );
}

// 现代精细化矢量线性图标
function SparklesIcon(props: IconProps) {
  return (
    <IconBase {...props} size={15}>
      <path d="m12 3-1.9 4.3a2 2 0 0 1-1.1 1.1L4.7 10.3a.6.6 0 0 0 0 1.1l4.3 1.9a2 2 0 0 1 1.1 1.1l1.9 4.3a.6.6 0 0 0 1.1 0l1.9-4.3a2 2 0 0 1 1.1-1.1l4.3-1.9a.6.6 0 0 0 0-1.1l-4.3-1.9a2 2 0 0 1-1.1-1.1L13.1 3a.6.6 0 0 0-1.1 0Z" />
      <path d="M19 16v3M20.5 17.5h-3M5 4v2M6 5H4" />
    </IconBase>
  );
}

function ShieldCheckIcon(props: IconProps) {
  return (
    <IconBase {...props} size={14}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </IconBase>
  );
}

function TargetIcon(props: IconProps) {
  return (
    <IconBase {...props} size={14}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" />
    </IconBase>
  );
}

function CreditCardIcon(props: IconProps) {
  return (
    <IconBase {...props} size={14}>
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </IconBase>
  );
}

function PiggyBankIcon(props: IconProps) {
  return (
    <IconBase {...props} size={14}>
      <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8.7 3.3 2 4.3V19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-1h3v1a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-2.2c1.7-1.2 2.5-3 2.5-4.8 0-1.7-.5-3.5-1.5-4.5V5Z" />
      <path d="M16 11h.01" />
      <path d="M2 9v1a2 2 0 0 0 2 2h1" />
    </IconBase>
  );
}

function CompassIcon(props: IconProps) {
  return (
    <IconBase {...props} size={15}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </IconBase>
  );
}

function HeaderAction({ children, label }: PropsWithChildren<{ label: string }>) {
  return (
    <button type="button" className="home-header-action" aria-label={label} title={label}>
      {children}
    </button>
  );
}

function SurfaceCard({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  return <section className={`home-card ${className}`}>{children}</section>;
}

type HomeModuleStatus = "loading" | "ready" | "error";

function combinedHomeModuleStatus(...statuses: HomeModuleStatus[]) {
  if (statuses.includes("error")) return "error";
  return statuses.every((status) => status === "ready") ? "ready" : "loading";
}

function HomeModulePlaceholder({ status, onRetry, height = 124 }: { status: HomeModuleStatus; onRetry: () => void; height?: number }) {
  if (status === "loading") return <Skeleton className="skeleton-card" style={{ height }} />;
  if (status === "error") {
    return (
      <section className="home-module-load-error" role="alert">
        <span>该模块暂时未能加载</span>
        <button type="button" onClick={onRetry}>重试</button>
      </section>
    );
  }
  return null;
}

function DeferredHomeSection({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      setVisible(true);
      observer.disconnect();
    }, { rootMargin: "240px 0px" });
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  return <div ref={hostRef}>{visible ? children : fallback}</div>;
}

// 发薪日快速配置浮层
function SalaryDayModal({
  salaryDay,
  onClose,
  onSave,
}: {
  salaryDay: number;
  onClose: () => void;
  onSave: (day: number) => void;
}) {
  const [val, setVal] = useState(String(salaryDay));

  function handleConfirm() {
    const num = Math.max(1, Math.min(28, Math.round(Number(val) || 15)));
    onSave(num);
    onClose();
  }

  return (
    <div className="home-modal-mask" onClick={onClose}>
      <div className="home-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="home-modal-head">
          <h3>薪资周期设置</h3>
          <button type="button" className="home-modal-close" onClick={onClose}>×</button>
        </div>
        <p className="home-modal-desc">
          配置每月固定发薪日（1 ~ 28 日），自动同步薪资周期结余与流水统计。
        </p>
        <div className="home-modal-input-row">
          <input
            type="number"
            min={1}
            max={28}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="home-modal-input"
            autoFocus
          />
          <span>日</span>
        </div>
        <div className="home-modal-actions">
          <button type="button" className="home-modal-btn cancel" onClick={onClose}>取消</button>
          <button type="button" className="home-modal-btn confirm" onClick={handleConfirm}>保存</button>
        </div>
      </div>
    </div>
  );
}

// 极简通透 Hero 卡片
function StarkCrystalHero({
  summary,
  salaryDay,
  onSalaryDayChange,
  activeMetric,
  onMetricChange,
  transactionCount,
  reportingMonth,
  onReportingMonthChange,
  availableMonths,
}: {
  summary: HomeSummary;
  salaryDay: number;
  onSalaryDayChange: (day: number) => void;
  activeMetric: "balance" | "expense" | "income";
  onMetricChange: (metric: "balance" | "expense" | "income") => void;
  transactionCount: number;
  reportingMonth: string;
  onReportingMonthChange: (month: string) => void;
  availableMonths: ReadonlySet<string>;
}) {
  const locale = useAppLocale();
  const monthLabel = isReportingYearKey(reportingMonth)
    ? locale === "en-US" ? `${reportingMonth} full year` : reportingMonthLabel(reportingMonth)
    : locale === "en-US"
      ? new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(reportingMonthDate(reportingMonth))
      : reportingMonthLabel(reportingMonth);
  const [balanceMode, setBalanceMode] = useState<"month" | "salary">("month");
  const [showSalaryModal, setShowSalaryModal] = useState(false);

  const displayAmount =
    activeMetric === "balance"
      ? (balanceMode === "month" ? summary.forecast.monthBalance : summary.forecast.salaryCycleBalance)
      : activeMetric === "expense"
        ? summary.expense
        : summary.income;

  const displayTitle =
    activeMetric === "balance"
        ? (balanceMode === "month" ? (isReportingYearKey(reportingMonth) ? "全年结余" : "本月结余") : "薪资周期结余")
      : activeMetric === "expense"
        ? (isReportingYearKey(reportingMonth) ? "全年支出" : "本月支出")
        : (isReportingYearKey(reportingMonth) ? "全年收入" : "本月收入");

  const isNegative = activeMetric === "balance" && displayAmount < 0;

  return (
    <div className="stark-hero-island">
      {/* 顶部控制行 */}
      <div className="stark-hero-toolbar">
        <MonthPicker
          value={reportingMonth}
          onChange={onReportingMonthChange}
          ariaLabel={locale === "en-US" ? "Select home reporting month" : "选择首页统计月份"}
          triggerClassName="stark-period-badge"
          availableMonths={availableMonths}
        >
          <span>{monthLabel}</span>
          <ChevronDownIcon size={14} />
        </MonthPicker>

        <div className="stark-metric-switcher">
          <button
            type="button"
            className={activeMetric === "balance" ? "active" : ""}
            onClick={() => onMetricChange("balance")}
          >
            {translateValue("结余", locale)}
          </button>
          <button
            type="button"
            className={activeMetric === "expense" ? "active" : ""}
            onClick={() => onMetricChange("expense")}
          >
            {translateValue("支出", locale)}
          </button>
          <button
            type="button"
            className={activeMetric === "income" ? "active" : ""}
            onClick={() => onMetricChange("income")}
          >
            {translateValue("收入", locale)}
          </button>
        </div>
      </div>

      {/* 极简通透卡片 */}
      <div className="stark-hero-card">
        {/* 背景轻淡月份水印 */}
        <div className="stark-card-watermark">
          {isReportingYearKey(reportingMonth)
            ? locale === "en-US" ? reportingMonth : `${reportingMonth}年`
            : new Intl.DateTimeFormat(locale, { month: "short" }).format(reportingMonthDate(reportingMonth))}
        </div>

        <div className="stark-hero-meta-row">
          <span className="stark-card-label">{translateValue(displayTitle, locale)}</span>
          {activeMetric === "balance" ? (
            <div className="stark-scope-selector">
              <button
                type="button"
                className={balanceMode === "month" ? "active" : ""}
                onClick={() => setBalanceMode("month")}
              >
                {translateValue("自然月", locale)}
              </button>
              <button
                type="button"
                className={balanceMode === "salary" ? "active" : ""}
                onClick={() => setBalanceMode("salary")}
              >
                {translateValue("发薪周期", locale)}
              </button>
            </div>
          ) : null}
        </div>

        <div className="stark-hero-value-row">
          <strong className={`stark-big-amount ${isNegative ? "negative" : ""}`}>
            {isNegative ? "-¥ " : "¥ "}{formatMoney(Math.abs(displayAmount))}
          </strong>
        </div>
        {activeMetric === "balance" ? (
          <div className="stark-cycle-breakdown" aria-label={translateValue("发薪周期资金明细", locale)}>
            <span>{translateValue(balanceMode === "salary" ? "收入" : "月收入", locale)} ¥{formatMoney(balanceMode === "salary" ? summary.forecast.cycleIncome : summary.income)}</span>
            <span>{translateValue(balanceMode === "salary" ? "消费" : "月消费", locale)} ¥{formatMoney(balanceMode === "salary" ? summary.forecast.cycleExpense : summary.expense)}</span>
            <span>{translateValue("储蓄", locale)} ¥{formatMoney(balanceMode === "salary" ? summary.forecast.cycleSavings : summary.forecast.monthSavings)}</span>
            <span>{translateValue("还款", locale)} ¥{formatMoney(balanceMode === "salary" ? summary.forecast.cycleRepayment : summary.forecast.monthRepayment)}</span>
          </div>
        ) : null}

        <div className="stark-hero-footer-row">
          <div className="stark-hero-footer-left">
            <span className="stark-tx-count">{locale === "en-US" ? `${transactionCount} entries` : `共 ${transactionCount} 笔记账`}</span>
            {activeMetric === "balance" && balanceMode === "salary" ? (
              <button
                type="button"
                className="stark-setting-pill"
                onClick={() => setShowSalaryModal(true)}
              >
                {translateValue("发薪日", locale)} {salaryDay}{locale === "en-US" ? "" : "号"} ›
              </button>
            ) : (
              <Link href="/app/consumption" className="stark-detail-arrow">
                {translateValue("查看明细分析", locale)} <ChevronRightIcon size={12} />
              </Link>
            )}
          </div>

        </div>

      </div>

      {showSalaryModal ? (
        <SalaryDayModal
          salaryDay={salaryDay}
          onClose={() => setShowSalaryModal(false)}
          onSave={onSalaryDayChange}
        />
      ) : null}
    </div>
  );
}

// Stark AI 财务诊断条
function StarkDiagnosticSheet({ summary, onClose }: { summary: HomeSummary; onClose: () => void }) {
  const locale = useAppLocale();
  const topInsight = summary.insights[0];
  const budget = summary.budgetAlerts[0];
  const hasRisk = budget && (budget.tone === "danger" || budget.tone === "warn");
  const title = translateValue(hasRisk ? "预算需关注" : "财务诊断", locale);
  const headline = topInsight
    ? translateText(topInsight.detail, locale)
    : (budget
      ? `${translateValue(budget.title, locale)}${locale === "en-US" ? ` used ${Math.round(budget.percent)}%; the remaining budget is in a healthy range` : `已消耗 ${Math.round(budget.percent)}%，结余处于合理区间`}`
      : translateValue("本月现金流平稳，无超支或临近违约风险", locale));

  return (
    <BottomSheet title={title} onClose={onClose} className="diagnostic-sheet" bodyClassName="diagnostic-sheet-body">
      <section className={`diagnostic-sheet-hero ${hasRisk ? "has-risk" : ""}`}>
        <div className="diagnostic-sheet-icon"><SparklesIcon size={20} strokeWidth={2.1} color={hasRisk ? "#e11d48" : "#0060c0"} /></div>
        <div>
          <strong>{title}</strong>
          <p>{headline}</p>
        </div>
      </section>

      <section className="diagnostic-sheet-section">
        <h3>{translateValue("现金流概览", locale)}</h3>
        <div className="diagnostic-sheet-metrics">
          <div><span>{translateValue("本月收入", locale)}</span><strong>¥ {formatMoney(summary.income)}</strong></div>
          <div><span>{translateValue("本月支出", locale)}</span><strong>¥ {formatMoney(summary.expense)}</strong></div>
          <div><span>{translateValue("本月结余", locale)}</span><strong className={summary.forecast.monthBalance >= 0 ? "positive" : "negative"}>{summary.forecast.monthBalance < 0 ? "-¥ " : "¥ "}{formatMoney(Math.abs(summary.forecast.monthBalance))}</strong></div>
        </div>
      </section>

      <section className="diagnostic-sheet-section">
        <h3>{translateValue("诊断明细", locale)}</h3>
        {summary.insights.length ? (
          <div className="diagnostic-sheet-insights">
            {summary.insights.map((insight) => (
              <article className={`diagnostic-sheet-insight ${insight.tone}`} key={insight.id}>
                <span className="diagnostic-sheet-insight-dot" aria-hidden="true" />
                <div><strong>{translateText(insight.title, locale)}</strong><p>{translateText(insight.detail, locale)}</p></div>
              </article>
            ))}
          </div>
        ) : (
          <p className="diagnostic-sheet-empty">{translateValue("本月现金流平稳，无超支或临近违约风险", locale)}</p>
        )}
      </section>

      {summary.budgetAlerts.length ? (
        <section className="diagnostic-sheet-section">
          <h3>{translateValue("预算管理", locale)}</h3>
          <div className="diagnostic-sheet-budgets">
            {summary.budgetAlerts.map((item) => (
              <div className="diagnostic-sheet-budget" key={item.id}>
                <div className="diagnostic-sheet-budget-head">
                  <span>{translateText(item.title, locale)}</span>
                  <strong>¥ {formatMoney(item.spent)} / ¥ {formatMoney(item.budget)}</strong>
                </div>
                <div className="diagnostic-sheet-budget-track"><i className={item.tone} style={{ width: `${Math.min(item.percent, 100)}%` }} /></div>
                <small>{locale === "en-US" ? `${Math.round(item.percent)}% used` : `已使用 ${Math.round(item.percent)}%`}</small>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </BottomSheet>
  );
}

// Stark AI 财务诊断条
function StarkDiagnosticBanner({ summary, onOpen }: { summary: HomeSummary; onOpen: () => void }) {
  const locale = useAppLocale();
  const topInsight = summary.insights[0];
  const budget = summary.budgetAlerts[0];
  const hasRisk = budget && (budget.tone === "danger" || budget.tone === "warn");

  return (
    <div className={`stark-diagnostic-banner ${hasRisk ? "has-risk" : "normal"}`}>
      <div className="diag-icon-box">
        <SparklesIcon size={16} strokeWidth={2.2} color={hasRisk ? "#e11d48" : "#0060c0"} />
      </div>
      <div className="diag-content">
        <strong>{translateValue(hasRisk ? "预算需关注" : "财务诊断", locale)}</strong>
        <p>
          {topInsight
            ? translateText(topInsight.detail, locale)
            : (budget
              ? `${translateValue(budget.title, locale)}${locale === "en-US" ? ` used ${Math.round(budget.percent)}%; the remaining budget is in a healthy range` : `已消耗 ${Math.round(budget.percent)}%，结余处于合理区间`}`
              : translateValue("本月现金流平稳，无超支或临近违约风险", locale))}
        </p>
      </div>
      <button type="button" className="diag-link" onClick={onOpen}>
        {translateText("查看 ›", locale)}
      </button>
    </div>
  );
}

function StarkBudgetAllocationCard({ summary, reportingMonth, onManageBudget }: { summary: HomeSummary; reportingMonth: string; onManageBudget: () => void }) {
  const locale = useAppLocale();
  const allocation = summary.budgetAllocation;
  const allocated = allocation.expense + allocation.repayment + allocation.savings;
  const allocationBase = Math.max(allocation.income, allocated, 1);
  const segments = [
    { key: "expense", label: "消费", amount: allocation.expense, color: "#0ea5e9" },
    { key: "repayment", label: "还款", amount: allocation.repayment, color: "#f59e0b" },
    { key: "savings", label: "储蓄", amount: allocation.savings, color: "#10b981" },
  ];
  const periodLabel = isReportingYearKey(reportingMonth) ? "全年资金分配" : "本月资金分配";
  const availableLabel = allocation.available >= 0 ? "可继续安排" : "已超出收入";
  const translatedAvailableLabel = translateValue(availableLabel, locale);
  const cardClassName = "stark-budget-allocation-card" + (allocation.available < 0 ? " has-overrun" : "");

  return (
    <section className={cardClassName}>
      <button type="button" className="stark-budget-allocation-link" onClick={onManageBudget}>
        <div className="stark-budget-allocation-head">
          <div className="stark-budget-allocation-title">
            <span className="stark-budget-allocation-icon"><TargetIcon size={15} strokeWidth={2.2} color="#0060c0" /></span>
            <span>
              <strong>{translateValue(periodLabel, locale)}</strong>
              <small>{translateValue("收入扣除实际消费、还款和储蓄后的安排金额", locale)}</small>
            </span>
          </div>
          <span className="stark-budget-allocation-entry">{translateValue("预算管理", locale)} <ChevronRightIcon size={12} /></span>
        </div>

        <div className="stark-budget-allocation-main">
          <div>
            <span>{translateValue("可支配预算", locale)}</span>
            <strong className={allocation.available < 0 ? "negative" : ""}>
              {allocation.available < 0 ? "-¥ " : "¥ "}{formatMoney(Math.abs(allocation.available))}
            </strong>
            <small>{locale === "en-US" ? translatedAvailableLabel + ": ¥" + formatMoney(Math.abs(allocation.available)) : translatedAvailableLabel + " ¥ " + formatMoney(Math.abs(allocation.available))}</small>
          </div>
          <div className="stark-budget-allocation-income">
            <span>{translateValue("收入", locale)}</span>
            <strong>¥ {formatMoney(allocation.income)}</strong>
            <small>{locale === "en-US" ? "Allocated ¥" + formatMoney(allocated) : "已分配 ¥ " + formatMoney(allocated)}</small>
          </div>
        </div>

        <div className="stark-budget-allocation-track" aria-label={locale === "en-US" ? "Budget allocation breakdown" : "预算分配构成"}>
          {segments.map((segment) => (
            <i key={segment.key} style={{ width: String(Math.min(100, Math.max(0, (segment.amount / allocationBase) * 100))) + "%", background: segment.color }} />
          ))}
        </div>

        <div className="stark-budget-allocation-grid">
          {segments.map((segment) => (
            <div key={segment.key}>
              <span><i style={{ background: segment.color }} />{translateValue(segment.label, locale)}</span>
              <strong>¥ {formatMoney(segment.amount)}</strong>
            </div>
          ))}
          <div>
            <span><i className="available" />{translateValue("剩余", locale)}</span>
            <strong className={allocation.available < 0 ? "negative" : "available"}>¥ {formatMoney(Math.abs(allocation.available))}</strong>
          </div>
        </div>
      </button>
      <div className="stark-budget-allocation-assets">
        <span>{translateValue("资产存量", locale)}</span>
        <strong>¥ {formatMoney(allocation.assetTotal)}</strong>
        <small>{translateValue("余额单独展示，不重复计入本月扣减", locale)}</small>
      </div>
    </section>
  );
}

// 四维财务罗盘 (Compass Matrix)
function StarkCompassMatrix({ summary, onManageBudget }: { summary: HomeSummary; onManageBudget: () => void }) {
  const locale = useAppLocale();
  const budget = summary.budgetAlerts[0];
  const loanTask = summary.tasks.find((task) => task.source === "loan");
  const budgetPercent = budget ? Math.round(budget.percent) : 0;
  const budgetLeft = budget ? Math.max(0, 100 - budgetPercent) : 100;
  const netWorthStr =
    Math.abs(summary.netWorth) >= 10000
      ? `${(summary.netWorth / 10000).toFixed(1)}w`
      : formatMoney(summary.netWorth);

  return (
    <div className="stark-compass-matrix">
      <Link href="/app/assets" className="stark-compass-card asset">
        <div className="compass-header">
          <span className="compass-icon-wrapper asset">
            <ShieldCheckIcon size={14} strokeWidth={2.2} color="#059669" />
          </span>
          <span className="compass-label">{translateValue("净资产", locale)}</span>
        </div>
        <strong className="compass-value">¥ {netWorthStr}</strong>
        <div className="compass-meta">
          <span className={`compass-badge ${summary.netWorth >= 0 ? "healthy" : "attention"}`}>
            {translateValue(summary.netWorth >= 0 ? "结构健康" : "负债关注", locale)}
          </span>
          <ChevronRightIcon size={12} />
        </div>
      </Link>

      <button type="button" className="stark-compass-card budget" onClick={onManageBudget}>
        <div className="compass-header">
          <span className="compass-icon-wrapper budget">
            <TargetIcon size={14} strokeWidth={2.2} color="#0060c0" />
          </span>
          <span className="compass-label">{translateValue("预算余量", locale)}</span>
        </div>
        <strong className="compass-value">{budget ? `${budgetLeft}%` : "100%"}</strong>
        <div className="compass-meta">
          <span className={`compass-badge ${budget?.tone === "danger" ? "danger" : "normal"}`}>
            {budget?.tone === "danger" ? translateValue("已超支", locale) : locale === "en-US" ? `${budgetPercent}% used` : `已用 ${budgetPercent}%`}
          </span>
          <ChevronRightIcon size={12} />
        </div>
      </button>

      <Link href="/app/loans" className="stark-compass-card loan">
        <div className="compass-header">
          <span className="compass-icon-wrapper loan">
            <CreditCardIcon size={14} strokeWidth={2.2} color="#e11d48" />
          </span>
          <span className="compass-label">{translateValue("待还贷款", locale)}</span>
        </div>
        <strong className="compass-value">{loanTask ? translateText(loanTask.badge, locale) : translateValue("无待还", locale)}</strong>
        <div className="compass-meta">
          <span className="compass-badge loan-badge">
            {translateValue(loanTask ? "近期还款" : "状态良好", locale)}
          </span>
          <ChevronRightIcon size={12} />
        </div>
      </Link>

      <Link href="/app/savings" className="stark-compass-card saving">
        <div className="compass-header">
          <span className="compass-icon-wrapper saving">
            <PiggyBankIcon size={14} strokeWidth={2.2} color="#d97706" />
          </span>
          <span className="compass-label">{translateValue("储蓄达成", locale)}</span>
        </div>
        <strong className="compass-value">{Math.round(summary.savingProgress.percent)}%</strong>
        <div className="compass-meta">
          <span className="compass-badge saving-badge">
            {translateValue("计划进行中", locale)}
          </span>
          <ChevronRightIcon size={12} />
        </div>
      </Link>
    </div>
  );
}

// 本月支出构成
type HomeExpenseSegment = {
  name: string;
  amount: number;
  color: string;
};

function buildHomeExpenseRoseOption(
  segments: HomeExpenseSegment[],
  locale: AppLocale,
): EChartsCoreOption {
  return {
    animationDuration: 420,
    animationEasing: "cubicOut",
    tooltip: {
      trigger: "item",
      confine: true,
      backgroundColor: "rgba(19, 27, 48, 0.92)",
      borderWidth: 0,
      padding: [8, 10],
      textStyle: { color: "#ffffff", fontSize: 12 },
      formatter: (item: { name?: string; value?: number; percent?: number }) => (
        `${item.name ?? ""}<br/>¥ ${formatMoney(Number(item.value ?? 0))} (${item.percent ?? 0}%)`
      ),
    },
    series: [{
      type: "pie",
      roseType: "radius",
      radius: ["16%", "58%"],
      center: ["50%", "51%"],
      startAngle: 90,
      minAngle: 12,
      avoidLabelOverlap: true,
      labelLayout: { moveOverlap: "shiftY", hideOverlap: false },
      label: {
        show: true,
        position: "outside",
        alignTo: "edge",
        edgeDistance: 4,
        bleedMargin: 0,
        overflow: "none",
        formatter: "{b}",
        fontSize: 11,
        fontWeight: 500,
      },
      labelLine: {
        show: true,
        length: 8,
        length2: 8,
        lineStyle: { width: 1 },
      },
      emphasis: { scale: false, focus: "self" },
      itemStyle: { borderColor: "#ffffff", borderWidth: 3, borderRadius: 5 },
      data: segments.map((segment) => ({
        name: translateValue(segment.name, locale),
        value: segment.amount,
        itemStyle: { color: segment.color },
        label: { color: segment.color },
        labelLine: { lineStyle: { color: segment.color } },
      })),
    }],
  };
}

function ExpenseCategoryDetailSheet({ summary, reportingMonth, onClose }: { summary: HomeSummary; reportingMonth: string; onClose: () => void }) {
  const locale = useAppLocale();
  const isAnnual = isReportingYearKey(reportingMonth);
  const periodLabel = isAnnual ? "全年支出" : "本月支出";

  return (
    <BottomSheet title={translateValue("分类明细", locale)} onClose={onClose} className="expense-category-sheet" bodyClassName="expense-category-sheet-body">
      <section className="expense-category-total">
        <span>{translateValue(periodLabel, locale)}</span>
        <strong>¥ {formatMoney(summary.expense)}</strong>
        <small>{locale === "en-US" ? `${summary.ratios.length} categories` : `共 ${summary.ratios.length} 个分类`}</small>
      </section>

      <section className="expense-category-detail-list" aria-label={translateValue("分类明细", locale)}>
        {summary.ratios.length ? summary.ratios.map((item) => {
          const itemName = translateValue(item.name, locale);
          return (
            <article className="expense-category-detail-row" key={item.name}>
              <div className="expense-category-detail-head">
                <span className="expense-category-detail-name"><i style={{ background: item.color }} />{itemName}</span>
                <strong>¥ {formatMoney(item.amount)}</strong>
              </div>
              <div className="expense-category-detail-progress" aria-label={`${itemName} ${item.percent}%`}>
                <i style={{ width: `${Math.min(Math.max(item.percent, 0), 100)}%`, background: item.color }} />
              </div>
              <small>{locale === "en-US" ? `${item.percent}% of total` : `占本期支出 ${item.percent}%`}</small>
            </article>
          );
        }) : <p className="category-empty">{translateValue("本月暂无支出记录", locale)}</p>}
      </section>
    </BottomSheet>
  );
}

function TopExpenseStructure({ summary, reportingMonth }: { summary: HomeSummary; reportingMonth: string }) {
  const locale = useAppLocale();
  const isAnnual = isReportingYearKey(reportingMonth);
  const periodLabel = isAnnual ? "全年支出" : "本月支出";
  const structureLabel = isAnnual ? "全年支出结构" : "本月支出结构";
  const ratios = summary.ratios.slice(0, 4);
  const otherAmount = summary.ratios.slice(4).reduce((sum, item) => sum + item.amount, 0);
  const roseSegments = [
    ...ratios.map((item) => ({ name: item.name, amount: item.amount, color: item.color })),
    ...(otherAmount > 0 ? [{ name: "其他", amount: otherAmount, color: "#94a3b8" }] : []),
  ];
  const roseOption = useMemo(
    () => buildHomeExpenseRoseOption(roseSegments, locale),
    [locale, roseSegments],
  );
  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <>
      <SurfaceCard className="stark-category-card">
        <div className="category-card-head">
          <div className="category-title-block">
            <strong>{translateValue(structureLabel, locale)}</strong>
            <span className="category-sub">{locale === "en-US" ? `${summary.ratios.length} categories` : `共 ${summary.ratios.length} 个分类`}</span>
          </div>
          <button type="button" className="category-all-link category-all-button" onClick={() => setDetailOpen(true)}>
            {translateValue("分类明细", locale)} <ChevronRightIcon size={12} />
          </button>
        </div>

        {ratios.length ? (
          <div className="category-card-body">
            <EChartView
              option={roseOption}
              className="category-rose-chart"
              ariaLabel={`${translateValue(periodLabel, locale)} ¥ ${formatMoney(summary.expense)}`}
            />
          </div>
        ) : (
          <div className="category-empty">{translateValue("本月暂无支出记录", locale)}</div>
        )}
      </SurfaceCard>

      {detailOpen ? <ExpenseCategoryDetailSheet summary={summary} reportingMonth={reportingMonth} onClose={() => setDetailOpen(false)} /> : null}
    </>
  );
}

// 智能理财与省钱行动建议
function SmartAdvisoryCard({ summary, reportingMonth, locale }: { summary: HomeSummary; reportingMonth: string; locale: AppLocale }) {
  const periodDays = Math.max(
    Math.round((reportingMonthEndDate(reportingMonth).getTime() - reportingMonthDate(reportingMonth).getTime()) / 86400000) + 1,
    1,
  );
  const dailyAvg = (summary.expense / periodDays).toFixed(1);
  const remainingBudget = summary.budgetAlerts[0]
    ? Math.max(0, summary.budgetAlerts[0].budget - summary.budgetAlerts[0].spent)
    : 0;
  const isHealthy = summary.forecast.monthBalance >= 0;

  return (
    <SurfaceCard className="stark-advisory-card">
      <div className="advisory-card-head">
        <div className="advisory-title-block">
          <CompassIcon size={16} strokeWidth={2.2} color="#0060c0" />
          <strong>{translateValue("财务行动建议", locale)}</strong>
        </div>
        <span className="advisory-status-tag">{translateValue(isHealthy ? "节律健康" : "需控制支出", locale)}</span>
      </div>

      <div className="advisory-card-body">
        <div className="advisory-tip-row">
          <span className="tip-bullet">1</span>
          <p>
            {locale === "en-US" ? <>Daily spending is currently <b>¥{dailyAvg}</b>. At this pace, the projected month-end balance is <b>¥{formatMoney(Math.max(0, summary.forecast.monthBalance))}</b>.</> : <>当前日均支出 <b>¥{dailyAvg}</b>，若保持当前速率，预计月底可结余 <b>¥{formatMoney(Math.max(0, summary.forecast.monthBalance))}</b>。</>}
          </p>
        </div>
        <div className="advisory-tip-row">
          <span className="tip-bullet">2</span>
          <p>
            {locale === "en-US" ? <>Remaining total budget <b>¥{formatMoney(remainingBudget)}</b>. Consider directing the surplus to </> : <>剩余总预算 <b>¥{formatMoney(remainingBudget)}</b>，建议将富余资金分配至</>}
            <Link href="/app/savings" className="advisory-inline-link">{translateText("储蓄计划 ›", locale)}</Link>
          </p>
        </div>
      </div>
    </SurfaceCard>
  );
}

// Stark 原创月度收支走势
type HomeCashflowPoint = {
  key: string;
  month: string;
  expense: number;
  income: number;
  current: boolean;
};

function buildHomeCashflowTrendOption(history: HomeCashflowPoint[], locale: AppLocale): EChartsCoreOption {
  return {
    animationDuration: 420,
    animationEasing: "cubicOut",
    grid: { left: 4, right: 4, top: 8, bottom: 22, containLabel: false },
    tooltip: {
      trigger: "axis",
      confine: true,
      backgroundColor: "rgba(19, 27, 48, 0.92)",
      borderWidth: 0,
      padding: [8, 10],
      textStyle: { color: "#ffffff", fontSize: 12 },
      valueFormatter: (value: number | string) => `¥ ${formatMoney(Number(value ?? 0))}`,
    },
    xAxis: {
      type: "category",
      data: history.map((item) => item.month),
      axisLine: { lineStyle: { color: "#e8eef5" } },
      axisTick: { show: false },
      axisLabel: { color: "#94a3b8", fontSize: 10, margin: 8 },
    },
    yAxis: {
      type: "value",
      show: false,
      min: 0,
    },
    series: [
      {
        name: translateValue("收入", locale),
        type: "bar",
        barWidth: "24%",
        barGap: "28%",
        itemStyle: { borderRadius: [4, 4, 0, 0] },
        data: history.map((item) => ({
          value: item.income,
          itemStyle: { color: item.current ? "#0060c0" : "#bae6fd" },
        })),
      },
      {
        name: translateValue("支出", locale),
        type: "bar",
        barWidth: "24%",
        itemStyle: { borderRadius: [4, 4, 0, 0] },
        data: history.map((item) => ({
          value: item.expense,
          itemStyle: { color: item.current ? "#f43f5e" : "#fecdd3" },
        })),
      },
    ],
  };
}

function StarkCashflowTrend({ transactions, reportingMonth, locale }: { transactions: Transaction[]; reportingMonth: string; locale: AppLocale }) {
  const history = useMemo(() => {
    const monthKeys = isReportingYearKey(reportingMonth)
      ? reportingPeriodMonths(reportingMonth)
      : reportingMonthSequence(reportingMonth, 5);
    return monthKeys.map((key) => {
      const monthTransactions = transactions.filter((item) => monthKey(item.date) === key);
      return {
        key,
        month: locale === "en-US"
          ? new Intl.DateTimeFormat("en-US", { month: "short" }).format(reportingMonthDate(key))
          : `${Number(key.slice(5))}月`,
        expense: monthTransactions.filter((item) => item.type === "EXPENSE").reduce((sum, item) => sum + item.amount, 0),
        income: monthTransactions.filter((item) => item.type === "INCOME").reduce((sum, item) => sum + item.amount, 0),
        current: isReportingYearKey(reportingMonth) ? key.startsWith(`${reportingMonth}-`) : key === reportingMonth,
      } satisfies HomeCashflowPoint;
    });
  }, [locale, reportingMonth, transactions]);
  const chartOption = useMemo(() => buildHomeCashflowTrendOption(history, locale), [history, locale]);
  const [selectedMonthKey, setSelectedMonthKey] = useState<string | null>(null);
  const selectedMonth = history.find((item) => item.key === selectedMonthKey);

  useEffect(() => {
    setSelectedMonthKey(null);
  }, [reportingMonth]);

  return (
    <SurfaceCard className="stark-trend-card">
      <div className="stark-trend-head">
        <div className="trend-title-block">
          <strong>{translateValue("收支动态走势", locale)}</strong>
          <span className="trend-sub">{translateValue(isReportingYearKey(reportingMonth) ? "全年按月对比" : "近 5 个月对比", locale)}</span>
        </div>
        <div className="stark-trend-legend">
          <span className="legend-item income"><i /> {translateValue("收入", locale)}</span>
          <span className="legend-item expense"><i /> {translateValue("支出", locale)}</span>
        </div>
      </div>

      <div className="stark-trend-body">
        {selectedMonth ? (
          <div id="stark-trend-detail" className="stark-trend-detail" role="status" aria-live="polite">
            <span className="stark-trend-detail-month">{selectedMonth.month}{locale === "en-US" ? " cash flow" : "收支"}</span>
            <div className="stark-trend-detail-values">
              <span className="stark-trend-detail-value">
                <i className="income" aria-hidden="true" />
                <span>{translateValue("收入", locale)}</span>
                <strong>¥{formatMoney(selectedMonth.income)}</strong>
              </span>
              <span className="stark-trend-detail-value">
                <i className="expense" aria-hidden="true" />
                <span>{translateValue("支出", locale)}</span>
                <strong>¥{formatMoney(selectedMonth.expense)}</strong>
              </span>
            </div>
          </div>
        ) : null}

        <EChartView
          option={chartOption}
          className="home-cashflow-chart"
          ariaLabel={translateValue("收支动态走势", locale)}
          onDataClick={({ dataIndex }) => {
            const item = dataIndex === undefined ? null : history[dataIndex];
            if (item) setSelectedMonthKey((current) => current === item.key ? null : item.key);
          }}
        />
      </div>
    </SurfaceCard>
  );
}

export function HomeDashboard() {
  const locale = useAppLocale();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [savingsPlans, setSavingsPlans] = useState<SavingsPlan[]>([]);
  const [salaryDay, setSalaryDay] = useState(15);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [assetStatus, setAssetStatus] = useState<HomeModuleStatus>("loading");
  const [budgetStatus, setBudgetStatus] = useState<HomeModuleStatus>("loading");
  const [loanStatus, setLoanStatus] = useState<HomeModuleStatus>("loading");
  const [savingsStatus, setSavingsStatus] = useState<HomeModuleStatus>("loading");
  const [historyStatus, setHistoryStatus] = useState<HomeModuleStatus>("loading");
  const [loadVersion, setLoadVersion] = useState(0);
  const [reportingMonth, setReportingMonth] = useState("2026-01");
  const [availableMonths, setAvailableMonths] = useState<ReadonlySet<string>>(new Set());
  const [monthReady, setMonthReady] = useState(false);
  const [activeMetric, setActiveMetric] = useState<"balance" | "expense" | "income">("expense");
  const [diagnosticOpen, setDiagnosticOpen] = useState(false);
  const [budgetManagementOpen, setBudgetManagementOpen] = useState(false);

  useEffect(() => {
    setSalaryDay(getSalaryDay());
    setReportingMonth(getSelectedReportMonth());
    setMonthReady(true);
  }, []);

  useEffect(() => {
    if (!monthReady) return;
    const repo = manager.getRepository();
    let active = true;
    let requestSequence = 0;
    const load = async () => {
      const requestId = ++requestSequence;
      const canUpdate = () => active && requestId === requestSequence;
      setLoading(true);
      setLoadError("");
      setAssetStatus("loading");
      setBudgetStatus("loading");
      setLoanStatus("loading");
      setSavingsStatus("loading");
      setHistoryStatus("loading");
      try {
        const accountId = getCurrentAccountId();
        const [coreTransactions, loadedAvailableMonths] = await Promise.all([
          repo.getTransactionsByMonths(accountId, homeCoreTransactionMonths(reportingMonth)),
          loadAvailableTransactionMonths(repo, accountId),
        ]);
        if (!canUpdate()) return;
        const resolvedReportingMonth = resolveAvailableReportingMonth(reportingMonth, loadedAvailableMonths);
        if (resolvedReportingMonth !== reportingMonth) {
          setSelectedReportMonth(resolvedReportingMonth);
          setReportingMonth(resolvedReportingMonth);
          setAvailableMonths(loadedAvailableMonths);
          return;
        }
        setTransactions(coreTransactions);
        setAvailableMonths(loadedAvailableMonths);
        setLoading(false);

        const assetsRequest = repo.getAssets(accountId);
        const budgetsRequest = repo.getBudgets(accountId);
        const loansRequest = repo.getLoans(accountId);
        const savingsRequest = repo.getSavingsGoals(accountId)
          .then(async (goals) => [goals, await repo.getSavingsPlansByGoals(goals.map((goal) => goal.id))] as const);
        const historyRequest = budgetsRequest
          .then((loadedBudgets) => repo.getTransactionsByMonths(
            accountId,
            homeSupplementalTransactionMonths(reportingMonth, loadedBudgets.some((budget) => budget.period === "YEARLY")),
          ));

        void assetsRequest.then(
          (items) => {
            if (!canUpdate()) return;
            setAssets(items);
            setAssetStatus("ready");
          },
          () => {
            if (canUpdate()) setAssetStatus("error");
          },
        );
        void budgetsRequest.then(
          (items) => {
            if (!canUpdate()) return;
            setBudgets(items);
            setBudgetStatus("ready");
          },
          () => {
            if (canUpdate()) setBudgetStatus("error");
          },
        );
        void loansRequest.then(
          (items) => {
            if (!canUpdate()) return;
            setLoans(items);
            setLoanStatus("ready");
          },
          () => {
            if (canUpdate()) setLoanStatus("error");
          },
        );
        void savingsRequest.then(
          ([goals, plans]) => {
            if (!canUpdate()) return;
            setSavingsGoals(goals);
            setSavingsPlans(plans);
            setSavingsStatus("ready");
          },
          () => {
            if (canUpdate()) setSavingsStatus("error");
          },
        );
        void historyRequest.then(
          (items) => {
            if (!canUpdate()) return;
            setTransactions(items);
            setHistoryStatus("ready");
          },
          () => {
            if (canUpdate()) setHistoryStatus("error");
          },
        );
      } catch {
        if (!canUpdate()) return;
        setLoadError("云端数据加载失败，请检查后端服务和数据库连接后重试。");
        setLoading(false);
      }
    };
    void load();
    const handleCacheUpdate = (event: Event) => {
      const update = (event as CustomEvent<RemoteCacheUpdate>).detail;
      const accountId = getCurrentAccountId();
      if (!update || (update.accountId && update.accountId !== accountId)) return;

      if (update.resource === "assets") {
        void repo.getAssets(accountId).then(
          (items) => {
            if (!active) return;
            setAssets(items);
            setAssetStatus("ready");
          },
          () => { if (active) setAssetStatus("error"); },
        );
      }
      if (update.resource === "budgets") {
        void repo.getBudgets(accountId).then(
          (items) => {
            if (!active) return;
            setBudgets(items);
            setBudgetStatus("ready");
          },
          () => { if (active) setBudgetStatus("error"); },
        );
      }
      if (update.resource === "loans") {
        void repo.getLoans(accountId).then(
          (items) => {
            if (!active) return;
            setLoans(items);
            setLoanStatus("ready");
          },
          () => { if (active) setLoanStatus("error"); },
        );
      }
      if (update.resource === "savingsGoals" || update.resource === "savingsPlans") {
        void repo.getSavingsGoals(accountId)
          .then(async (goals) => [goals, await repo.getSavingsPlansByGoals(goals.map((goal) => goal.id))] as const)
          .then(
            ([goals, plans]) => {
              if (!active) return;
              setSavingsGoals(goals);
              setSavingsPlans(plans);
              setSavingsStatus("ready");
            },
            () => { if (active) setSavingsStatus("error"); },
          );
      }
    };
    window.addEventListener("stark:transaction-saved", load);
    window.addEventListener("stark:savings-saved", load);
    window.addEventListener(REMOTE_CACHE_UPDATED_EVENT, handleCacheUpdate);
    return () => {
      active = false;
      window.removeEventListener("stark:transaction-saved", load);
      window.removeEventListener("stark:savings-saved", load);
      window.removeEventListener(REMOTE_CACHE_UPDATED_EVENT, handleCacheUpdate);
    };
  }, [loadVersion, monthReady, reportingMonth]);

  const analysisTransactions = useMemo(() => toAnalysisTransactions(transactions), [transactions]);
  const currentTransactions = useMemo(
    () => transactions.filter((item) => isReportingYearKey(reportingMonth)
      ? item.date.slice(0, 4) === reportingMonth
      : monthKey(item.date) === reportingMonth),
    [reportingMonth, transactions],
  );
  const summary = useMemo(
    () => buildHomeSummary({ transactions: analysisTransactions, assets, budgets, loans, savingsGoals, savingsPlans, salaryDay, reportingMonth }),
    [analysisTransactions, assets, budgets, loans, reportingMonth, savingsGoals, savingsPlans, salaryDay],
  );
  const budgetAllocationStatus = combinedHomeModuleStatus(assetStatus, budgetStatus, savingsStatus);
  const diagnosticStatus = budgetStatus;
  const compassStatus = combinedHomeModuleStatus(assetStatus, loanStatus, savingsStatus);
  const showDiagnosticStage = budgetAllocationStatus !== "loading";
  const showCompassStage = showDiagnosticStage && diagnosticStatus !== "loading";
  const showDetailStages = showCompassStage && compassStatus !== "loading";

  function handleSalaryDayChange(day: number) {
    persistSalaryDay(day);
    setSalaryDay(day);
  }

  function handleReportingMonthChange(month: string) {
    setSelectedReportMonth(month);
    setReportingMonth(month);
  }

  function reloadDashboard() {
    setLoadVersion((version) => version + 1);
  }

  if (loading) {
    return (
      <div className="home-screen home-liquid-screen" aria-busy="true">
        <header className="home-topbar">
          <span />
          <h1>首页</h1>
          <div className="home-actions">
            <HeaderAction label="搜索">
              <SearchIcon size={24} strokeWidth={1.8} />
            </HeaderAction>
          </div>
        </header>
        <Skeleton className="skeleton-hero" />
        <Skeleton className="skeleton-card" />
        <Skeleton className="skeleton-card" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="home-screen home-liquid-screen stark-home-layout">
        <header className="home-topbar">
          <span />
          <h1>首页</h1>
          <div className="home-actions">
            <HeaderAction label="搜索">
              <SearchIcon size={24} strokeWidth={1.8} />
            </HeaderAction>
          </div>
        </header>
        <section className="home-data-error" role="alert">
          <strong>未能读取数据库数据</strong>
          <p>{loadError}</p>
          <code>{getCloudApiUrl()}</code>
          <div className="home-data-error-actions">
            <button type="button" onClick={reloadDashboard}>重新加载</button>
            <Link href="/app/accounts">检查数据源设置</Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="home-screen home-liquid-screen stark-home-layout">
      <header className="home-topbar">
        <span />
        <h1>首页</h1>
        <div className="home-actions">
          <HeaderAction label="搜索">
            <SearchIcon size={24} strokeWidth={1.8} />
          </HeaderAction>
        </div>
      </header>

      {/* 极简通透 Hero */}
      <StarkCrystalHero
        summary={summary}
        salaryDay={salaryDay}
        onSalaryDayChange={handleSalaryDayChange}
        activeMetric={activeMetric}
        onMetricChange={setActiveMetric}
        transactionCount={currentTransactions.length}
        reportingMonth={reportingMonth}
        onReportingMonthChange={handleReportingMonthChange}
        availableMonths={availableMonths}
      />

      {/* 本月资金分配 */}
      {budgetAllocationStatus === "ready" ? (
        <StarkBudgetAllocationCard summary={summary} reportingMonth={reportingMonth} onManageBudget={() => setBudgetManagementOpen(true)} />
      ) : (
        <HomeModulePlaceholder status={budgetAllocationStatus} onRetry={reloadDashboard} height={178} />
      )}

      {/* AI 财务诊断条 */}
      {showDiagnosticStage ? (
        diagnosticStatus === "ready" ? (
          <StarkDiagnosticBanner summary={summary} onOpen={() => setDiagnosticOpen(true)} />
        ) : (
          <HomeModulePlaceholder status={diagnosticStatus} onRetry={reloadDashboard} height={86} />
        )
      ) : null}

      {/* 四维财务罗盘 */}
      {showCompassStage ? (
        compassStatus === "ready" ? (
          <StarkCompassMatrix summary={summary} onManageBudget={() => setBudgetManagementOpen(true)} />
        ) : (
          <HomeModulePlaceholder status={compassStatus} onRetry={reloadDashboard} height={172} />
        )
      ) : null}

      {showDetailStages ? (
        <>
          {/* 本月支出构成 (替代老旧流水) */}
          <TopExpenseStructure summary={summary} reportingMonth={reportingMonth} />

          {/* 财务行动建议 */}
          <DeferredHomeSection fallback={<Skeleton className="skeleton-card" style={{ height: 128 }} />}>
            {diagnosticStatus === "ready" ? (
              <SmartAdvisoryCard summary={summary} reportingMonth={reportingMonth} locale={locale} />
            ) : (
              <HomeModulePlaceholder status={diagnosticStatus} onRetry={reloadDashboard} height={128} />
            )}
          </DeferredHomeSection>

          {/* 收支动态走势 */}
          <DeferredHomeSection fallback={<Skeleton className="skeleton-card" style={{ height: 228 }} />}>
            {historyStatus === "ready" ? (
              <StarkCashflowTrend transactions={analysisTransactions} reportingMonth={reportingMonth} locale={locale} />
            ) : (
              <HomeModulePlaceholder status={historyStatus} onRetry={reloadDashboard} height={228} />
            )}
          </DeferredHomeSection>
        </>
      ) : null}

      {diagnosticOpen ? <StarkDiagnosticSheet summary={summary} onClose={() => setDiagnosticOpen(false)} /> : null}
      {budgetManagementOpen ? (
        <BudgetManagementSheet
          budgets={budgets}
          onBudgetsChange={setBudgets}
          onClose={() => setBudgetManagementOpen(false)}
        />
      ) : null}

    </div>
  );
}

export default HomeDashboard;
