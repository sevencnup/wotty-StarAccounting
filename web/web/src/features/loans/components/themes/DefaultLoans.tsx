"use client";

import { type ReactNode, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Banknote,
  Building,
  Calendar,
  Check,
  CreditCard,
  HandCoins,
  Home,
  Landmark,
  MoreHorizontal,
  MoreVertical,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DelayedRender } from "@/components/shared/DelayedRender";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/shared/Skeletons";
import { getThemeModuleStyle } from "@/components/shared/theme-primitives";
import { cn, formatCurrency } from "@/lib/utils";
import type { Loan } from "@/types";

export type { Loan };

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface LoansViewProps {
  items: Loan[];
  platformData: Array<{ name: string; value: number; fill: string }>;
  paidVsRemainingData: Array<{ platform: string; paid: number; remaining: number }>;
  loading?: boolean;
  reconcileLoadingId?: string | null;
  onOpenCreate: () => void;
  onOpenEdit: (item: Loan) => void;
  onOpenSchedule: (item: Loan) => void;
  onRepay: (item: Loan) => void;
  onReconcile: (item: Loan) => void;
}

function LoansPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[20px] bg-white p-3 shadow-[0_8px_30px_rgb(0,0,0,0.03)] sm:rounded-[24px] sm:p-5 sm:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

function LoansPanelHeader({
  title,
  eyebrow,
  action,
}: {
  title: string;
  eyebrow?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2 sm:mb-6">
      <div>
        {eyebrow ? (
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#64748b] sm:text-xs">
            {eyebrow}
          </p>
        ) : null}
        <h3 className="text-[13px] font-bold text-[#1e293b] sm:text-[15px]">{title}</h3>
      </div>
      {action}
    </div>
  );
}

function LoansActionDots() {
  return (
    <button className="flex h-6 w-6 items-center justify-center rounded-full text-[#94a3b8] transition hover:bg-slate-100">
      <MoreVertical className="h-4 w-4" />
    </button>
  );
}

function LoansLoadingState() {
  return (
    <div
      className="mx-auto max-w-[1680px] space-y-4 px-0.5 pb-2 sm:space-y-5 sm:px-4"
      style={getThemeModuleStyle("loans")}
    >
      <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-[1fr_1fr_1fr_1fr]">
        {Array.from({ length: 4 }).map((_, index) => (
          <LoansPanel key={index} className={index === 0 ? "bg-[#eff6ff]" : undefined}>
            <div className="space-y-3">
              <Skeleton className="h-4 w-20 rounded-full opacity-60" />
              <Skeleton className="h-8 w-32 rounded-[14px]" />
              <Skeleton className="h-3 w-24 rounded-full opacity-60" />
            </div>
          </LoansPanel>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <LoansPanel key={index}>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28 rounded-full" />
                  <Skeleton className="h-3 w-20 rounded-full opacity-60" />
                </div>
              </div>
              <Skeleton className="h-20 rounded-[18px]" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          </LoansPanel>
        ))}
      </div>
    </div>
  );
}

function getIcon(platform: string) {
  if (platform.includes("")) return <Home className="h-4 w-4" style={{ color: "#2B6AF2" }} />;
  if (platform.includes("")) return <CreditCard className="h-4 w-4" style={{ color: "#4CC98F" }} />;
  if (platform.includes("银行")) return <Landmark className="h-4 w-4" style={{ color: "#2B6AF2" }} />;
  return <Building className="h-4 w-4" style={{ color: "var(--theme-muted-text)" }} />;
}

function LoanCard({
  item,
  onOpenEdit,
  onOpenSchedule,
  onRepay,
  onReconcile,
  isReconciling,
}: {
  item: Loan;
  onOpenEdit: (item: Loan) => void;
  onOpenSchedule: (item: Loan) => void;
  onRepay: (item: Loan) => void;
  onReconcile: (item: Loan) => void;
  isReconciling: boolean;
}) {
  const progress = item.totalAmount > 0 ? Math.min(100, ((item.totalAmount - item.remainingAmount) / item.totalAmount) * 100) : 0;

  return (
    <div className="relative overflow-hidden rounded-[20px] sm:rounded-[24px] bg-white p-3 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div
            className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl border border-transparent"
            style={{ background: "var(--theme-dialog-section-bg)" }}
          >
            {getIcon(item.platform)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] sm:text-[15px] font-semibold" style={{ color: "var(--theme-body-text)" }}>{item.platform}</p>
            <p className="mt-0.5 sm:mt-1 flex items-center gap-1.5 text-[10px] sm:text-xs" style={{ color: "var(--theme-muted-text)" }}>
              <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              每月 {item.dueDate} 日还款
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenEdit(item)}
          className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-transparent"
          style={{ background: "var(--theme-empty-icon-bg)" }}
        >
          <MoreHorizontal className="h-4 w-4" style={{ color: "var(--theme-label-text)" }} />
        </button>
      </div>

      <div className="mt-3 sm:mt-4 space-y-2.5 sm:space-y-3.5">
        <div
          className="grid grid-cols-2 gap-3 rounded-xl px-3 py-2.5 sm:px-0 sm:py-0"
          style={{ background: "var(--theme-dialog-section-bg)" }}
        >
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs" style={{ color: "var(--theme-muted-text)" }}>
              <Banknote className="h-3 w-3 sm:h-4 sm:w-4" />
              月供
            </div>
            <p className="mt-0.5 sm:mt-1 text-[13px] sm:text-sm font-semibold" style={{ color: "var(--theme-body-text)" }}>{formatCurrency(item.monthlyPayment)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] sm:text-xs" style={{ color: "var(--theme-muted-text)" }}>剩余本金</p>
            <p className="mt-0.5 sm:mt-1 text-[13px] sm:text-sm font-semibold" style={{ color: "var(--theme-body-text)" }}>{formatCurrency(item.remainingAmount)}</p>
          </div>
        </div>

        <div>
          <div className="mb-1.5 sm:mb-2 flex items-center justify-between text-[10px] sm:text-xs" style={{ color: "var(--theme-muted-text)" }}>
            <span>进度 {progress.toFixed(1)}%</span>
            <span>
              {item.paidPeriods} / {item.periods} 期
            </span>
          </div>
          <Progress value={progress} className="h-1.5 sm:h-2" indicatorClassName="[background:var(--module-progress-gradient)]" />
          <div className="mt-1.5 sm:mt-2 flex items-center justify-between gap-3 text-[10px] sm:text-xs">
            <span style={{ color: "var(--theme-muted-text)" }}>已还 {formatCurrency(item.totalAmount - item.remainingAmount)}</span>
            <span className="font-medium" style={{ color: "var(--theme-body-text)" }}>总额 {formatCurrency(item.totalAmount)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 sm:pt-2">
          <Button
            type="button"
            variant="outline"
            className="h-8 sm:h-9 justify-center rounded-xl border-transparent px-2 sm:px-3 text-[10px] sm:text-xs font-medium"
            style={{ background: "var(--theme-empty-icon-bg)", color: "var(--theme-label-text)" }}
            onClick={() => onOpenSchedule(item)}
          >
            <Calendar className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            还款计划
          </Button>
          <Button
            type="button"
            className="h-8 sm:h-9 justify-center rounded-xl px-2 sm:px-3 text-[10px] sm:text-xs font-medium text-white hover:brightness-105"
            style={{ background: "var(--module-accent-strong)" }}
            onClick={() => onRepay(item)}
          >
            <HandCoins className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            登记还款
          </Button>
        </div>

        <Button
          type="button"
          variant="ghost"
          className="h-8 sm:h-9 w-full justify-center rounded-xl text-[10px] sm:text-xs font-medium"
          onClick={() => onReconcile(item)}
          disabled={isReconciling}
          style={{ color: "var(--theme-label-text)" }}
        >
          {isReconciling ? "扫描中.." : "扫描历史还款"}
        </Button>
      </div>
    </div>
  );
}

export function LoansDefaultTheme({
  items,
  platformData,
  paidVsRemainingData,
  loading = false,
  reconcileLoadingId = null,
  onOpenCreate,
  onOpenEdit,
  onOpenSchedule,
  onRepay,
  onReconcile,
}: LoansViewProps) {
  const totalRemaining = useMemo(() => items.reduce((sum, item) => sum + item.remainingAmount, 0), [items]);
  const totalPaid = useMemo(() => items.reduce((sum, item) => sum + (item.totalAmount - item.remainingAmount), 0), [items]);
  const totalMonthlyPayment = useMemo(() => items.reduce((sum, item) => sum + item.monthlyPayment, 0), [items]);

  if (loading && items.length === 0) {
    return <LoansLoadingState />;
  }

  const platformOption = {
    tooltip: { trigger: "item" },
    series: [
      {
        type: "pie",
        radius: ["42%", "72%"],
        label: { show: true, formatter: "{b}" },
        data: platformData.map((item) => ({
          value: item.value,
          name: item.name,
          itemStyle: { color: item.fill },
        })),
      },
    ],
  };

  const progressOption = {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    legend: {
      data: ["已还", "剩余"],
      top: 0,
      left: "center",
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: "#64748b", fontSize: 11 },
    },
    grid: { left: 44, right: 16, top: 52, bottom: 50 },
    xAxis: {
      type: "category",
      data: paidVsRemainingData.map((item) => item.platform),
      axisLabel: { rotate: -18, color: "#64748b", fontSize: 11, margin: 12 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: "rgba(148,163,184,0.14)" } },
      axisLabel: { color: "#94a3b8", fontSize: 11 },
    },
    series: [
      {
        name: "已还",
        type: "bar",
        stack: "total",
        data: paidVsRemainingData.map((item) => item.paid),
        itemStyle: { color: "#4CC98F" },
      },
      {
        name: "剩余",
        type: "bar",
        stack: "total",
        data: paidVsRemainingData.map((item) => item.remaining),
        itemStyle: { color: "#2B6AF2" },
      },
    ],
  };

  return (
    <div
      className="mx-auto max-w-[1680px] space-y-4 pb-2 sm:space-y-5 px-0.5 sm:px-4"
      style={{
        ...getThemeModuleStyle("loans"),
      }}
    >
      {/* ═══════ ROW 1: Hero + 4 Metric Cards ═══════ */}
      <DelayedRender delay={0}>
        <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-[1fr_1fr_1fr_1fr]">
          {/* Hero Card: Create Button */}
          <LoansPanel className="bg-[#2B6AF2] p-3 pb-4 text-white sm:p-3 sm:pb-4">
            <div className="flex items-start justify-between">
              <p className="text-[13px] sm:text-[13px] font-semibold text-white/90">贷款管理</p>
              <div className="flex h-6 w-6 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-white/20">
                <Plus className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
              </div>
            </div>
            <Button
              onClick={onOpenCreate}
              className="mt-2 sm:mt-2 h-9 sm:h-10 rounded-xl px-4 text-[13px] sm:text-[14px] font-medium text-white hover:brightness-105 w-full"
              style={{ background: "rgba(255,255,255,0.2)" }}
            >
              新增贷款
            </Button>
          </LoansPanel>

          {/* Red Card: Total Remaining */}
          <LoansPanel className="p-3 sm:p-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] sm:text-[13px] font-bold text-[#1e293b]">待还总额</h3>
              <LoansActionDots />
            </div>
            <div className="mt-2 sm:mt-2 space-y-1 sm:space-y-2">
              <p className="text-[18px] sm:text-[20px] font-bold tracking-tight font-numbers text-red-600">
                {formatCurrency(totalRemaining)}
              </p>
              <p className="text-[10px] sm:text-xs font-medium text-[#64748b]">当前负债</p>
            </div>
          </LoansPanel>

          {/* Green Card: Total Paid */}
          <LoansPanel className="bg-[#4CC98F] p-3 pb-4 text-white sm:p-3 sm:pb-4">
            <div className="flex items-start justify-between">
              <p className="text-[13px] sm:text-[13px] font-semibold text-white/90">已还金额</p>
              <div className="flex h-6 w-6 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-white/20">
                <Check className="h-3.5 w-3.5 sm:h-3 sm:w-3 stroke-[3]" />
              </div>
            </div>
            <p className="mt-2 sm:mt-2 text-[20px] sm:text-[24px] font-bold tracking-tight font-numbers leading-none">
              {formatCurrency(totalPaid)}
            </p>
          </LoansPanel>

          {/* Light Blue Card: Monthly Payment */}
          <LoansPanel className="bg-[#D8E6FC] p-3 sm:p-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] sm:text-[13px] font-bold text-[#1e293b]">月供合计</h3>
              <LoansActionDots />
            </div>
            <div className="mt-2 sm:mt-2 space-y-1 sm:space-y-2">
              <p className="text-[18px] sm:text-[20px] font-bold tracking-tight font-numbers text-[#1e293b]">
                {formatCurrency(totalMonthlyPayment)}
              </p>
              <p className="text-[10px] sm:text-xs font-medium text-[#64748b]">每月固定支出 · {items.length} 笔贷款</p>
            </div>
          </LoansPanel>
        </div>
      </DelayedRender>

      {/* ═══════ ROW 2: Loan Cards Grid ═══════ */}
      <DelayedRender delay={60}>
        {items.length === 0 ? (
          <LoansPanel className="p-8">
            <EmptyState icon={Landmark} title="暂无贷款记录" description="开始添加你的第一笔贷款吧" />
          </LoansPanel>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <LoanCard
                key={item.id}
                item={item}
                onOpenEdit={onOpenEdit}
                onOpenSchedule={onOpenSchedule}
                onRepay={onRepay}
                onReconcile={onReconcile}
                isReconciling={reconcileLoadingId === item.id}
              />
            ))}
          </div>
        )}
      </DelayedRender>

      {/* ═══════ ROW 3: Charts ═══════ */}
      {items.length > 0 ? (
        <DelayedRender delay={120}>
          <div className="grid grid-cols-1 gap-2 sm:gap-4 lg:grid-cols-12">
            {/* Platform Distribution Card */}
            <LoansPanel className="lg:col-span-5">
              <LoansPanelHeader title="剩余本金结构" eyebrow="贷款分布" action={<LoansActionDots />} />
              <div className="h-[200px] sm:h-[250px]">
                <ReactECharts option={platformOption} style={{ height: "100%", width: "100%" }} />
              </div>
            </LoansPanel>

            {/* Progress Chart Card */}
            <LoansPanel className="lg:col-span-7">
              <LoansPanelHeader title="已还 vs 剩余" eyebrow="还款进度" action={<LoansActionDots />} />
              <div className="h-[200px] sm:h-[250px]">
                <ReactECharts option={progressOption} style={{ height: "100%", width: "100%" }} />
              </div>
            </LoansPanel>
          </div>
        </DelayedRender>
      ) : null}
    </div>
  );
}
