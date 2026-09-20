"use client";

import Image from "next/image";
import { type ReactNode, useMemo, useState } from "react";
import {
  Archive,
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  CheckSquare,
  ChevronDown,
  Image as ImageIcon,
  MoreVertical,
  PiggyBank,
  Plus,
  Search,
  Square,
  Target,
  Trash2,
} from "lucide-react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  BottomSheet,
  BottomSheetContent,
} from "@/components/ui/bottomsheet";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { CompactTransactionRow, formatCompactTransactionDateTime } from "@/components/shared/compact-transaction-row";
import { DelayedRender } from "@/components/shared/DelayedRender";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/shared/Skeletons";
import { getThemeModuleStyle } from "@/components/shared/theme-primitives";
import { cn } from "@/lib/utils";
import type { SavingsGoal } from "@/types";

export type { SavingsGoal };

export type TransactionItem = {
  id: string;
  date: string;
  type: string;
  amount: string;
  category: string;
  description: string | null;
};

type SortOption = "progress" | "deadline" | "name" | "createdAt";
type FilterOption = "all" | "active" | "completed" | "archived";

interface SavingsViewProps {
  items: SavingsGoal[];
  transactions: TransactionItem[];
  totalSaved: number;
  totalTarget: number;
  overallProgress: number;
  loading?: boolean;
  onOpenCreate: () => void;
  onOpenEdit: (item: SavingsGoal) => void;
  onOpenPunch: (item: SavingsGoal) => void;
  onOpenWithdrawal: (item: SavingsGoal) => void;
  onDelete: (item: SavingsGoal) => void;
  onArchive?: (item: SavingsGoal) => Promise<void>;
  onBatchDelete?: (ids: string[]) => Promise<void>;
  onBatchArchive?: (ids: string[]) => Promise<void>;
  onCopy?: (item: SavingsGoal) => void;
  onImageChange?: (item: SavingsGoal, image: string | null) => Promise<void>;
}

function SavingsPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[20px] bg-white p-3 shadow-[0_8px_30px_rgb(0,0,0,0.03)] sm:rounded-[24px] sm:p-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

function SavingsPanelHeader({
  title,
  eyebrow,
  action,
}: {
  title: string;
  eyebrow?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2 sm:mb-4">
      <div>
        {eyebrow ? (
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#64748b] sm:text-xs">
            {eyebrow}
          </p>
        ) : null}
        <h3 className="text-[13px] font-bold text-[#1e293b] sm:text-[13px]">{title}</h3>
      </div>
      {action}
    </div>
  );
}

function SavingsFilterBadge() {
  return (
    <span className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[#F1F5F9] px-3 py-1.5 text-xs font-semibold text-[#64748b] transition hover:bg-[#e2e8f0]">
      <ChevronDown className="h-3.5 w-3.5" />
      筛选
    </span>
  );
}

function SavingsActionDots() {
  return (
    <button className="flex h-6 w-6 items-center justify-center rounded-full text-[#94a3b8] transition hover:bg-slate-100">
      <MoreVertical className="h-4 w-4" />
    </button>
  );
}

function SavingsLoadingState() {
  return (
    <div
      className="mx-auto max-w-[1680px] space-y-4 px-0.5 pb-2 sm:space-y-5 sm:px-4"
      style={getThemeModuleStyle("savings")}
    >
      <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-[1fr_1fr_1.3fr_1.3fr]">
        {Array.from({ length: 4 }).map((_, index) => (
          <SavingsPanel key={index} className={index === 0 ? "bg-[#eff6ff]" : undefined}>
            <div className="space-y-3">
              <Skeleton className="h-4 w-20 rounded-full opacity-60" />
              <Skeleton className="h-8 w-32 rounded-[14px]" />
              <Skeleton className="h-3 w-24 rounded-full opacity-60" />
            </div>
          </SavingsPanel>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <SavingsPanel key={index}>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28 rounded-full" />
                  <Skeleton className="h-3 w-24 rounded-full opacity-60" />
                </div>
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
              <Skeleton className="h-24 rounded-[18px]" />
            </div>
          </SavingsPanel>
        ))}
      </div>
    </div>
  );
}

const TYPE_COLORS: Record<string, string> = {
  MONTHLY: "#6ee7b7",
  YEARLY: "#34d399",
  LONG_TERM: "#10b981",
  BI_MONTHLY_ODD: "#059669",
  BI_MONTHLY_EVEN: "#047857",
};

function getGoalModeLabel(type: SavingsGoal["type"]) {
  switch (type) {
    case "MONTHLY":
      return "月度";
    case "YEARLY":
      return "年度";
    case "LONG_TERM":
      return "长期";
    case "BI_MONTHLY_ODD":
      return "隔月(奇)";
    case "BI_MONTHLY_EVEN":
      return "隔月(偶)";
    default:
      return type;
  }
}

function getDepositTypeLabel(type: SavingsGoal["depositType"]) {
  switch (type) {
    case "CASH":
      return "现金";
    case "FIXED_TERM":
      return "定期";
    case "HELP_DEPOSIT":
      return "他人帮存";
    default:
      return type;
  }
}

function getDaysUntilDeadline(deadline: string | null): number | null {
  if (!deadline) return null;
  const diff = new Date(deadline).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function isBehindSchedule(item: SavingsGoal): boolean {
  if (!item.deadline || item.currentAmount >= item.targetAmount) return false;
  const totalDays = new Date(item.deadline).getTime() - new Date(item.createdAt).getTime();
  const elapsedDays = new Date().getTime() - new Date(item.createdAt).getTime();
  const expectedProgress = elapsedDays / totalDays;
  const actualProgress = item.currentAmount / item.targetAmount;
  return expectedProgress - actualProgress > 0.2;
}

function SavingsGoalCard({
  item,
  selected,
  onToggleSelect,
  onOpenEdit,
  onOpenPunch,
  onOpenWithdrawal,
  onDelete,
  onArchive,
  onCopy,
  onOpenImage,
}: {
  item: SavingsGoal;
  selected: boolean;
  onToggleSelect: () => void;
  onOpenEdit: () => void;
  onOpenPunch: () => void;
  onOpenWithdrawal: () => void;
  onDelete: () => void;
  onArchive?: () => void;
  onCopy?: () => void;
  onOpenImage?: () => void;
}) {
  const progress = item.targetAmount > 0 ? Math.min(100, (item.currentAmount / item.targetAmount) * 100) : 0;
  const daysLeft = getDaysUntilDeadline(item.deadline);
  const behind = isBehindSchedule(item);

  return (
    <div className="relative overflow-hidden rounded-[20px] sm:rounded-[24px] bg-white p-3 sm:p-4 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onToggleSelect}
            className="-m-1 rounded-lg p-1"
            style={{ color: "var(--theme-muted-text)" }}
          >
            {selected ? <CheckSquare className="h-4.5 w-4.5" style={{ color: "var(--module-accent-strong)" }} /> : <Square className="h-4.5 w-4.5" />}
          </button>
          <div
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-2xl border border-transparent"
            style={{ background: "var(--module-soft-panel)", color: "var(--module-accent-strong)" }}
          >
            <Target className="h-4 w-4 sm:h-4 sm:w-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] sm:text-[13px] font-semibold" style={{ color: "var(--theme-body-text)" }}>{item.name}</p>
            <div className="mt-0.5 sm:mt-1 flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs" style={{ color: "var(--theme-muted-text)" }}>
              <span className="rounded-full px-2 py-0.5 font-medium" style={{ background: "var(--theme-empty-icon-bg)", color: "var(--theme-label-text)" }}>{getGoalModeLabel(item.type)}</span>
              <span>{getDepositTypeLabel(item.depositType)}</span>
              {behind && item.status === "ACTIVE" ? <span className="text-amber-600">进度偏慢</span> : null}
            </div>
          </div>
        </div>

        {item.image ? (
          <button type="button" onClick={onOpenImage} className="overflow-hidden rounded-xl border border-transparent">
            <Image src={item.image} alt={item.name} width={48} height={48} className="h-9 w-9 sm:h-10 sm:w-10 object-cover" unoptimized />
          </button>
        ) : (
          <button type="button" onClick={onOpenImage} className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-transparent" style={{ background: "var(--theme-empty-icon-bg)" }}>
            <ImageIcon className="h-4 w-4" style={{ color: "var(--theme-label-text)" }} />
          </button>
        )}
      </div>

      <div className="mt-3 sm:mt-3 space-y-2.5 sm:space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] sm:text-xs font-medium" style={{ color: "var(--theme-muted-text)" }}>当前 / 目标</p>
            <p className="mt-0.5 sm:mt-1 text-[16px] sm:text-lg font-semibold tracking-tight font-numbers" style={{ color: "var(--theme-body-text)" }}>
              ¥{item.currentAmount.toLocaleString()} / ¥{item.targetAmount.toLocaleString()}
            </p>
          </div>
          <span
            className="rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-medium"
            style={{ background: "var(--module-accent-soft)", color: "var(--module-accent-text)" }}
          >
            {progress.toFixed(0)}%
          </span>
        </div>

        <div>
          <Progress value={progress} className="h-1.5 sm:h-2" indicatorClassName="[background:var(--module-progress-gradient)]" />
          <div className="mt-1.5 sm:mt-2 flex items-center justify-between gap-3 text-[10px] sm:text-xs" style={{ color: "var(--theme-muted-text)" }}>
            <span>{item.status === "COMPLETED" ? "已完成" : item.status === "ARCHIVED" ? "已归档" : "进行中"}</span>
            <span>{item.deadline ? `${daysLeft} 天到期` : "无截止日期"}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 sm:pt-2">
          <Button
            type="button"
            variant="outline"
            className="h-9 sm:h-10 justify-center rounded-xl border-transparent px-3 sm:px-4 text-[11px] sm:text-xs font-medium"
            style={{ background: "var(--theme-empty-icon-bg)", color: "var(--theme-label-text)" }}
            onClick={onOpenPunch}
          >
            打卡
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-9 sm:h-10 justify-center rounded-xl border-transparent px-3 sm:px-4 text-[11px] sm:text-xs font-medium"
            style={{ background: "var(--theme-empty-icon-bg)", color: "var(--theme-label-text)" }}
            onClick={onOpenWithdrawal}
          >
            取款
          </Button>
        </div>

        <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1 sm:pt-1">
          <button
            type="button"
            onClick={onOpenEdit}
            className="inline-flex min-h-8 sm:min-h-9 items-center gap-1 rounded-lg px-2 py-1 text-[10px] sm:text-xs font-medium"
            style={{ color: "var(--theme-label-text)" }}
          >
            编辑
          </button>
          {onCopy ? (
            <button
              type="button"
              onClick={onCopy}
              className="inline-flex min-h-8 sm:min-h-9 items-center gap-1 rounded-lg px-2 py-1 text-[10px] sm:text-xs font-medium"
              style={{ color: "var(--theme-label-text)" }}
            >
              复制
            </button>
          ) : null}
          {onArchive ? (
            <button
              type="button"
              onClick={onArchive}
              className="inline-flex min-h-8 sm:min-h-9 items-center gap-1 rounded-lg px-2 py-1 text-[10px] sm:text-xs font-medium"
              style={{ color: "var(--theme-muted-text)" }}
            >
              <Archive className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              归档
            </button>
          ) : null}
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex min-h-8 sm:min-h-9 items-center gap-1 rounded-lg px-2 py-1 text-[10px] sm:text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            删除
          </button>
        </div>
      </div>
    </div>
  );
}

export function SavingsDefaultTheme({
  items,
  transactions,
  totalSaved,
  totalTarget,
  overallProgress,
  loading = false,
  onOpenCreate,
  onOpenEdit,
  onOpenPunch,
  onOpenWithdrawal,
  onDelete,
  onArchive,
  onBatchDelete,
  onBatchArchive,
  onCopy,
  onImageChange,
}: SavingsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("progress");
  const [filterBy, setFilterBy] = useState<FilterOption>("active");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [imageDialogGoal, setImageDialogGoal] = useState<SavingsGoal | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const filteredGoals = useMemo(() => {
    let result = [...items];

    if (filterBy === "active") result = result.filter((item) => item.status === "ACTIVE");
    if (filterBy === "completed") result = result.filter((item) => item.status === "COMPLETED");
    if (filterBy === "archived") result = result.filter((item) => item.status === "ARCHIVED");

    if (searchTerm.trim()) {
      result = result.filter((item) => item.name.toLowerCase().includes(searchTerm.trim().toLowerCase()));
    }

    result.sort((a, b) => {
      if (sortBy === "progress") {
        return b.currentAmount / Math.max(b.targetAmount, 1) - a.currentAmount / Math.max(a.targetAmount, 1);
      }
      if (sortBy === "deadline") {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [items, filterBy, searchTerm, sortBy]);

  const distributionData = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((item) => {
      const key = getGoalModeLabel(item.type);
      map.set(key, (map.get(key) ?? 0) + item.currentAmount);
    });

    return Array.from(map.entries()).map(([name, value], index) => ({
      name,
      value,
      fill: Object.values(TYPE_COLORS)[index % Object.values(TYPE_COLORS).length],
    }));
  }, [items]);

  if (loading && items.length === 0 && transactions.length === 0) {
    return <SavingsLoadingState />;
  }

  return (
    <div
      className="mx-auto max-w-[1680px] space-y-4 pb-2 sm:space-y-5 px-0.5 sm:px-4"
      style={{
        ...getThemeModuleStyle("savings"),
      }}
    >
      {/* ═══════ ROW 1: Hero + 3 Metric Cards ═══════ */}
      <DelayedRender delay={0}>
        <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-[1fr_1fr_1.3fr_1.3fr]">
          {/* Hero Card: Create Button */}
          <SavingsPanel className="bg-[#2B6AF2] p-3 pb-4 text-white sm:p-3 sm:pb-4">
            <div className="flex items-start justify-between">
              <p className="text-[13px] sm:text-[13px] font-semibold text-white/90">储蓄目标</p>
              <div className="flex h-6 w-6 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-white/20">
                <Plus className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
              </div>
            </div>
            <Button
              onClick={onOpenCreate}
              className="mt-2 sm:mt-2 h-9 sm:h-10 rounded-xl px-4 text-[13px] sm:text-[14px] font-medium text-white hover:brightness-105 w-full"
              style={{ background: "rgba(255,255,255,0.2)" }}
            >
              新建目标
            </Button>
          </SavingsPanel>

          {/* Green Card: Total Saved */}
          <SavingsPanel className="bg-[#4CC98F] p-3 pb-4 text-white sm:p-3 sm:pb-4">
            <div className="flex items-start justify-between">
              <p className="text-[13px] sm:text-[13px] font-semibold text-white/90">总存款</p>
              <div className="flex h-6 w-6 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-white/20">
                <Check className="h-3.5 w-3.5 sm:h-3 sm:w-3 stroke-[3]" />
              </div>
            </div>
            <p className="mt-2 sm:mt-4 text-[28px] sm:text-[64px] font-bold tracking-tight font-numbers leading-none">
              ¥{totalSaved.toLocaleString()}
            </p>
          </SavingsPanel>

          {/* Blue Card: Target Amount */}
          <SavingsPanel className="p-3 sm:p-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] sm:text-[13px] font-bold text-[#1e293b]">目标总额</h3>
              <SavingsActionDots />
            </div>
            <div className="mt-2 sm:mt-4 space-y-2">
              <p className="text-[18px] sm:text-[28px] font-bold tracking-tight font-numbers text-[#1e293b]">
                ¥{totalTarget.toLocaleString()}
              </p>
              <p className="text-[10px] sm:text-xs font-medium text-[#64748b]">全部计划目标</p>
            </div>
          </SavingsPanel>

          {/* Light Blue Card: Overall Progress */}
          <SavingsPanel className="bg-[#D8E6FC] p-3 sm:p-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] sm:text-[13px] font-bold text-[#1e293b]">总体进度</h3>
              <SavingsActionDots />
            </div>
            <div className="mt-2 sm:mt-4 space-y-2">
              <p className="text-[18px] sm:text-[28px] font-bold tracking-tight font-numbers text-[#1e293b]">
                {overallProgress.toFixed(0)}%
              </p>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/50">
                <div
                  className="h-full rounded-full bg-[#4CC98F]"
                  style={{ width: `${Math.min(100, Math.max(5, overallProgress))}%` }}
                />
              </div>
              <p className="text-[10px] sm:text-xs font-medium text-[#64748b]">储蓄完成率</p>
            </div>
          </SavingsPanel>
        </div>
      </DelayedRender>

      {/* ═══════ ROW 2: Savings Goals Grid ═══════ */}
      <DelayedRender delay={60}>
        {filteredGoals.length === 0 ? (
          <SavingsPanel className="p-8">
            <EmptyState icon={Target} title="暂无储蓄目标" description="开始创建你的第一个储蓄目标吧。" />
          </SavingsPanel>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredGoals.map((item) => (
              <SavingsGoalCard
                key={item.id}
                item={item}
                selected={selectedIds.has(item.id)}
                onToggleSelect={() => {
                  const next = new Set(selectedIds);
                  if (next.has(item.id)) next.delete(item.id);
                  else next.add(item.id);
                  setSelectedIds(next);
                }}
                onOpenEdit={() => onOpenEdit(item)}
                onOpenPunch={() => onOpenPunch(item)}
                onOpenWithdrawal={() => onOpenWithdrawal(item)}
                onDelete={() => onDelete(item)}
                onArchive={onArchive ? () => onArchive(item) : undefined}
                onCopy={onCopy ? () => onCopy(item) : undefined}
                onOpenImage={() => {
                  setImageDialogGoal(item);
                  setPreviewImage(item.image || null);
                  setIsImageDialogOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </DelayedRender>

      {/* ═══════ ROW 3: Filter + Distribution Chart ═══════ */}
      <DelayedRender delay={120}>
        <div className="grid grid-cols-1 gap-2 sm:gap-4 lg:grid-cols-12">
          {/* Filter Card */}
          <SavingsPanel className="lg:col-span-5">
            <SavingsPanelHeader title="查找与批量操作" eyebrow="筛选工具" action={<SavingsFilterBadge />} />
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <div className="relative min-w-[180px] flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--theme-muted-text)" }} />
                  <Input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="搜索目标"
                    className="rounded-xl pl-10 h-9 sm:h-10 text-[11px] sm:text-xs"
                  />
                </div>
                <select value={filterBy} onChange={(event) => setFilterBy(event.target.value as FilterOption)} className="h-9 sm:h-10 rounded-xl border border-input bg-background px-3 text-[11px] sm:text-xs text-foreground">
                  <option value="active">进行中</option>
                  <option value="completed">已完成</option>
                  <option value="archived">已归档</option>
                  <option value="all">全部</option>
                </select>
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortOption)} className="h-9 sm:h-10 rounded-xl border border-input bg-background px-3 text-[11px] sm:text-xs text-foreground">
                  <option value="progress">按进度</option>
                  <option value="deadline">按截止日</option>
                  <option value="name">按名称</option>
                  <option value="createdAt">按创建时间</option>
                </select>
              </div>

              {selectedIds.size > 0 ? (
                <div className="flex flex-wrap items-center gap-2 rounded-xl px-3 py-2.5 text-[11px] sm:text-xs" style={{ background: "var(--theme-dialog-section-bg)" }}>
                  <span className="font-medium" style={{ color: "var(--theme-label-text)" }}>已选择 {selectedIds.size} 项</span>
                  {onBatchArchive ? (
                    <Button variant="outline" className="h-8 sm:h-9 rounded-lg px-3 text-[10px] sm:text-xs font-medium" onClick={() => onBatchArchive(Array.from(selectedIds))}>
                      <Archive className="mr-1.5 h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      批量归档
                    </Button>
                  ) : null}
                  {onBatchDelete ? (
                    <Button variant="outline" className="h-8 sm:h-9 rounded-lg px-3 text-[10px] sm:text-xs font-medium text-red-600" onClick={() => onBatchDelete(Array.from(selectedIds))}>
                      <Trash2 className="mr-1.5 h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      批量删除
                    </Button>
                  ) : null}
                  <Button variant="ghost" className="h-8 sm:h-9 rounded-lg px-3 text-[10px] sm:text-xs font-medium" onClick={() => setSelectedIds(new Set())}>
                    取消
                  </Button>
                </div>
              ) : null}
            </div>
          </SavingsPanel>

          {/* Distribution Card */}
          <SavingsPanel className="lg:col-span-7">
            <SavingsPanelHeader title="储蓄模式占比" eyebrow="目标分布" action={<SavingsActionDots />} />
            <div className="flex h-[140px] sm:h-[180px] md:h-[220px]">
              <div className="relative w-1/2 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius="60%"
                      outerRadius="85%"
                      paddingAngle={4}
                    >
                      {distributionData.map((item) => (
                        <Cell key={item.name} fill={item.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 flex flex-col justify-center gap-2 sm:gap-2.5 pl-2 sm:pl-4">
                {distributionData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                    <span className="text-[11px] sm:text-xs font-medium text-[#475569] truncate flex-1">{item.name}</span>
                    <span className="text-[11px] sm:text-xs font-semibold text-[#0f172a] font-numbers shrink-0">
                      ¥{item.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </SavingsPanel>
        </div>
      </DelayedRender>

      {/* ═══════ ROW 4: Recent Transactions ═══════ */}
      <DelayedRender delay={180}>
        <SavingsPanel>
          <SavingsPanelHeader title="最近存取款记录" eyebrow="最近动态" action={<SavingsActionDots />} />
          <div className="space-y-0 [&>*:last-child]:border-b-0">
            {transactions.length === 0 ? (
              <EmptyState icon={PiggyBank} title="暂无储蓄交易" description="打卡或取款后，这里会显示最近记录。" />
            ) : (
              transactions.slice(0, 8).map((transaction) => {
                const isIncome = transaction.type === "INCOME";
                return (
                  <CompactTransactionRow
                    key={transaction.id}
                    icon={isIncome ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownLeft className="h-3.5 w-3.5" />}
                    iconClassName={isIncome ? "[background:var(--module-accent-soft)] [color:var(--module-accent-strong)]" : "bg-red-50 text-red-600"}
                    primary={transaction.category}
                    secondary={transaction.description || undefined}
                    meta={[formatCompactTransactionDateTime(transaction.date)]}
                    trailing={
                      <div
                        className={cn("text-[11px] sm:text-xs font-semibold", !isIncome && "text-red-600")}
                        style={isIncome ? { color: "var(--module-accent-strong)" } : undefined}
                      >
                        <span className="mr-1 text-[10px] font-medium" style={{ color: "var(--theme-muted-text)" }}>
                          {isIncome ? "收入" : "支出"}
                        </span>
                        {isIncome ? "+" : "-"}¥{Number(transaction.amount).toLocaleString()}
                      </div>
                    }
                  />
                );
              })
            )}
          </div>
        </SavingsPanel>
      </DelayedRender>

      {isImageDialogOpen && imageDialogGoal ? (
        <BottomSheet open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
          <BottomSheetContent className="max-w-md">
            <div className="mb-6">
              <p className="text-[10px] sm:text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-1">目标图片</p>
              <h3 className="text-[15px] sm:text-[15px] font-bold text-[#1e293b]">{imageDialogGoal.name}</h3>
            </div>
            <div className="mt-5 space-y-4">
              {previewImage ? (
                <>
                  <div className="overflow-hidden rounded-2xl border border-transparent sm:border-slate-200" style={{ background: "var(--theme-dialog-section-bg)" }}>
                    <Image src={previewImage} alt={imageDialogGoal.name} width={640} height={420} className="h-auto w-full object-contain" unoptimized />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl"
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/*";
                        input.onchange = (event) => {
                          const file = (event.target as HTMLInputElement).files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = async (loadEvent) => {
                            const base64 = loadEvent.target?.result as string;
                            setPreviewImage(base64);
                            await onImageChange?.(imageDialogGoal, base64);
                          };
                          reader.readAsDataURL(file);
                        };
                        input.click();
                      }}
                    >
                      更换图片
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-xl text-red-600"
                      onClick={async () => {
                        setPreviewImage(null);
                        await onImageChange?.(imageDialogGoal, null);
                        setIsImageDialogOpen(false);
                      }}
                    >
                      删除
                    </Button>
                  </div>
                </>
              ) : (
                <div
                  className="flex h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-100 text-center sm:border-slate-200"
                  style={{ background: "var(--theme-dialog-section-bg)" }}
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = (event) => {
                      const file = (event.target as HTMLInputElement).files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = async (loadEvent) => {
                        const base64 = loadEvent.target?.result as string;
                        setPreviewImage(base64);
                        await onImageChange?.(imageDialogGoal, base64);
                      };
                      reader.readAsDataURL(file);
                    };
                    input.click();
                  }}
                >
                  <ImageIcon className="h-10 w-10" style={{ color: "var(--theme-muted-text)" }} />
                  <p className="mt-3 text-base font-medium" style={{ color: "var(--theme-body-text)" }}>点击上传图片</p>
                  <p className="mt-1 text-sm leading-6" style={{ color: "var(--theme-muted-text)" }}>支持 JPG、PNG、GIF</p>
                </div>
              )}

              <div className="flex justify-end">
                <Button variant="outline" className="rounded-xl" onClick={() => setIsImageDialogOpen(false)}>
                  关闭
                </Button>
              </div>
            </div>
          </BottomSheetContent>
        </BottomSheet>
      ) : null}
    </div>
  );
}
