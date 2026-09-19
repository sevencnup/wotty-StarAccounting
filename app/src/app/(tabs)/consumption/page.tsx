"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { PageTopBar } from "@/components/stark/PageTopBar";
import { PageDataError, PageSkeleton } from "@/components/stark/Skeleton";
import { MonthPicker } from "@/components/stark/MonthPicker";
import { RemarkedExpenseCard } from "@/components/stark/RemarkedExpenseCard";
import { JournalPanel } from "@/components/stark/JournalPanel";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { buildHomeSummary } from "@/lib/stark/dashboard/summary";
import { effectiveCategory, effectiveType, hasRemark, toAnalysisTransaction, toAnalysisTransactions } from "@/lib/stark/dashboard/remark";
import { normalizeConsumptionPlatform } from "@/lib/stark/dashboard/consumption-platforms";
import { categoryIconSrc, categoryIconSrcForCategory } from "@/lib/stark/utils/category-icon";
import { getCurrentAccountId, getSelectedReportMonth, setSelectedReportMonth } from "@/lib/stark/storage/local-config";
import { formatMoney, isReportingYearKey, reportingMonthDate, reportingMonthEndDate, reportingPeriodDate, reportingPeriodMonths } from "@/lib/stark/utils/format";
import type { Transaction } from "@/lib/stark/models";
import { formatCount, translateValue, useAppLocale } from "@/lib/stark/i18n";

const ConsumptionCharts = dynamic(
  () => import("@/components/stark/ConsumptionCharts").then((module) => module.ConsumptionCharts),
  {
    ssr: false,
    loading: () => <div className="home-card consumption-chart-loading">正在加载消费图表…</div>,
  },
);

const repo = new DataModeManager().getRepository();

async function getTransactionsForReportingPeriod(accountId: string, period: string) {
  const months = reportingPeriodMonths(period);
  return repo.getTransactionsByMonths(accountId, months);
}

type ViewMode = "expense" | "income" | "all";

type FilterOption = {
  label: string;
  count: number;
};

function categoryIconForFilter(category: string) {
  return categoryIconSrcForCategory(category);
}

function accountIconForFilter(account: string) {
  if (account === "银行卡") return "卡";
  if (account === "支付宝") return "支";
  if (account === "微信") return "微";
  if (account === "其他") return "其";
  return "全";
}

function recentTimeLabel(dateStr: string) {
  const d = new Date(dateStr);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${mm}-${dd} ${hh}:${mi}`;
}

function reportingPeriodLabel(period: string, locale: "zh-CN" | "en-US") {
  if (locale === "zh-CN") {
    if (isReportingYearKey(period)) return `${period}年全年`;
    const [year, month] = period.split("-");
    return `${year}年${Number(month)}月`;
  }
  if (isReportingYearKey(period)) return `${period} full year`;
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(reportingMonthDate(period));
}

function transactionTimestamp(dateStr: string) {
  const timestamp = Date.parse(dateStr);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4 4" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m7 10 5 5 5-5" />
    </svg>
  );
}

export default function ConsumptionPage() {
  const locale = useAppLocale();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [loadVersion, setLoadVersion] = useState(0);
  const [reportingMonth, setReportingMonth] = useState("2026-01");
  const [accountId, setAccountId] = useState(() => getCurrentAccountId());
  const [monthReady, setMonthReady] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("expense");
  const [categoryFilter, setCategoryFilter] = useState("全部分类");
  const [platformFilter, setPlatformFilter] = useState("全部账户");
  const [query, setQuery] = useState("");
  const [detailQuery, setDetailQuery] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [filterMenuReady, setFilterMenuReady] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filterMenuPosition, setFilterMenuPosition] = useState({ top: 0, left: 0, width: 300 });
  const categoryFilterRef = useRef<HTMLDivElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const accountFilterRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReportingMonth(getSelectedReportMonth());
    setAccountId(getCurrentAccountId());
    setMonthReady(true);
  }, []);

  useEffect(() => {
    if (!monthReady) return;
    let active = true;
    setLoading(true);
    setLoadError(false);
    void getTransactionsForReportingPeriod(accountId, reportingMonth)
      .then((data) => {
        if (!active) return;
        setTransactions(data);
      })
      .catch(() => {
        if (active) setLoadError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [accountId, loadVersion, monthReady, reportingMonth]);

  useEffect(() => {
    if (!monthReady) return;
    let active = true;
    const reload = () => {
      void getTransactionsForReportingPeriod(accountId, reportingMonth)
        .then((data) => {
          if (active) setTransactions(data);
        })
        .catch(() => {
          if (active) setLoadError(true);
        });
    };
    window.addEventListener("stark:transaction-saved", reload);
    return () => {
      active = false;
      window.removeEventListener("stark:transaction-saved", reload);
    };
  }, [accountId, monthReady, reportingMonth]);

  useEffect(() => {
    if (!categoryOpen && !accountOpen) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target as Node;
      const insideCategory = categoryFilterRef.current?.contains(target) || categoryMenuRef.current?.contains(target);
      const insideAccount = accountFilterRef.current?.contains(target) || accountMenuRef.current?.contains(target);
      if (!insideCategory && !insideAccount) {
        setCategoryOpen(false);
        setAccountOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setCategoryOpen(false);
        setAccountOpen(false);
      }
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [accountOpen, categoryOpen]);

  const monthTransactions = transactions;

  const categoryOptions = useMemo<FilterOption[]>(() => {
    const counts = new Map<string, number>();
    for (const item of monthTransactions) {
      const category = effectiveCategory(item);
      counts.set(category, (counts.get(category) ?? 0) + 1);
    }
    return ["全部分类", ...new Set(monthTransactions.map((item) => effectiveCategory(item)).filter(Boolean))]
      .map((label) => ({ label, count: label === "全部分类" ? monthTransactions.length : counts.get(label) ?? 0 }));
  }, [monthTransactions]);

  const platforms = useMemo(
    () => ["全部账户", ...new Set(monthTransactions.map((item) => normalizeConsumptionPlatform(item.platform)))],
    [monthTransactions],
  );

  const accountOptions = useMemo<FilterOption[]>(() => {
    const counts = new Map<string, number>();
    for (const item of monthTransactions) {
      const account = normalizeConsumptionPlatform(item.platform);
      counts.set(account, (counts.get(account) ?? 0) + 1);
    }
    return platforms
      .map((label) => ({ label, count: label === "全部账户" ? monthTransactions.length : counts.get(label) ?? 0 }));
  }, [monthTransactions, platforms]);

  useEffect(() => {
    if (!categoryOpen && !accountOpen) {
      setFilterMenuReady(false);
      return;
    }
    setFilterMenuReady(false);
    const updateFilterMenuPosition = () => {
      const activeFilterRef = categoryOpen ? categoryFilterRef : accountFilterRef;
      const activeMenuRef = categoryOpen ? categoryMenuRef : accountMenuRef;
      const filter = activeFilterRef.current;
      if (!filter) return;
      const filterBox = filter.getBoundingClientRect();
      const menuBox = activeMenuRef.current?.getBoundingClientRect();
      const width = Math.min(filterBox.width, window.innerWidth - 28);
      const left = Math.min(Math.max(14, filterBox.left), Math.max(14, window.innerWidth - width - 14));
      const menuHeight = menuBox?.height ?? 320;
      const spaceBelow = window.innerHeight - filterBox.bottom - 12;
      const top = menuHeight > spaceBelow && filterBox.top > menuHeight + 12
        ? Math.max(12, filterBox.top - menuHeight - 8)
        : filterBox.bottom + 8;
      setFilterMenuPosition({ top, left, width });
      setFilterMenuReady(true);
    };
    const frame = window.requestAnimationFrame(updateFilterMenuPosition);
    window.addEventListener("resize", updateFilterMenuPosition, { passive: true });
    window.addEventListener("scroll", updateFilterMenuPosition, { capture: true, passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateFilterMenuPosition);
      window.removeEventListener("scroll", updateFilterMenuPosition, true);
    };
  }, [accountOpen, accountOptions.length, categoryOpen, categoryOptions.length]);

  const filteredTransactions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return monthTransactions.filter((item) => {
      const matchesMode = viewMode === "all"
        || (viewMode === "expense" && effectiveType(item) === "EXPENSE")
        || (viewMode === "income" && item.type === "INCOME");
      const matchesCategory = categoryFilter === "全部分类" || effectiveCategory(item) === categoryFilter;
      const matchesPlatform = platformFilter === "全部账户" || normalizeConsumptionPlatform(item.platform) === platformFilter;
      const text = `${effectiveCategory(item)} ${item.category} ${item.merchant || ""} ${item.description || ""} ${item.platform}`.toLowerCase();
      return matchesMode && matchesCategory && matchesPlatform && (!normalizedQuery || text.includes(normalizedQuery));
    });
  }, [categoryFilter, monthTransactions, platformFilter, query, viewMode]);

  const chartTransactions = useMemo(() => toAnalysisTransactions(filteredTransactions), [filteredTransactions]);
  // The shared chart helpers are expense-oriented. Project income entries as
  // expense entries for the income view so category, rhythm, merchant,
  // platform, and flow charts can reuse the same aggregation pipeline.
  const displayChartTransactions = useMemo(
    () => viewMode === "income"
      ? chartTransactions.map((item) => item.type === "INCOME" ? { ...item, type: "EXPENSE" as const } : item)
      : chartTransactions,
    [chartTransactions, viewMode],
  );

  const monthSummary = useMemo(() => {
    const expenses = monthTransactions.filter((item) => effectiveType(item) === "EXPENSE");
    const income = monthTransactions.filter((item) => item.type === "INCOME");
    const primaryTransactions = viewMode === "income" ? income : expenses;
    const categoryTotals = primaryTransactions.reduce<Record<string, number>>((totals, item) => {
      totals[effectiveCategory(item)] = (totals[effectiveCategory(item)] ?? 0) + item.amount;
      return totals;
    }, {});
    const [topCategory = "暂无支出", topCategoryAmount = 0] = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])[0] ?? [];
    const expense = expenses.reduce((sum, item) => sum + item.amount, 0);
    const incomeTotal = income.reduce((sum, item) => sum + item.amount, 0);
    const primaryAmount = primaryTransactions.reduce((sum, item) => sum + item.amount, 0);
    return {
      expense,
      income: incomeTotal,
      primaryAmount,
      balance: incomeTotal - expense,
      count: monthTransactions.length,
      expenseCount: expenses.length,
      topCategory,
      topCategoryAmount,
      dailyAverage: primaryAmount / Math.max(
        Math.round((reportingMonthEndDate(reportingMonth).getTime() - reportingPeriodDate(reportingMonth).getTime()) / 86400000) + 1,
        1,
      ),
    };
  }, [monthTransactions, reportingMonth, viewMode]);

  const platformSummary = useMemo(() => {
    const targetType = viewMode === "income" ? "INCOME" : "EXPENSE";
    const calc = (items: Transaction[]) => ({
      expense: items.filter((i) => effectiveType(i) === targetType).reduce((s, i) => s + i.amount, 0),
      count: items.filter((i) => effectiveType(i) === targetType).length,
    });
    return {
      wechat: calc(monthTransactions.filter((item) => normalizeConsumptionPlatform(item.platform) === "微信")),
      alipay: calc(monthTransactions.filter((item) => normalizeConsumptionPlatform(item.platform) === "支付宝")),
    };
  }, [monthTransactions, viewMode]);

  const charts = useMemo(
    () => buildHomeSummary({ transactions: chartTransactions, assets: [], budgets: [], loans: [], savingsGoals: [], reportingMonth }),
    [chartTransactions, reportingMonth],
  );
  const displayCharts = useMemo(
    () => buildHomeSummary({ transactions: displayChartTransactions, assets: [], budgets: [], loans: [], savingsGoals: [], reportingMonth }),
    [displayChartTransactions, reportingMonth],
  );

  const detailMatchedTransactions = useMemo(() => {
    const normalizedQuery = detailQuery.trim().toLowerCase();
    return filteredTransactions.filter((item) => {
      if (!normalizedQuery) return true;
      return `${effectiveCategory(item)} ${item.category} ${item.merchant || ""} ${item.description || ""} ${item.platform}`.toLowerCase().includes(normalizedQuery);
    });
  }, [detailQuery, filteredTransactions]);

  const detailTransactions = useMemo(
    () => [...detailMatchedTransactions]
      .sort((a, b) => transactionTimestamp(b.date) - transactionTimestamp(a.date))
      .slice(0, 5),
    [detailMatchedTransactions],
  );

  function handleReportingMonthChange(month: string) {
    setSelectedReportMonth(month);
    setReportingMonth(month);
    setCategoryFilter("全部分类");
    setCategoryOpen(false);
    setPlatformFilter("全部账户");
    setQuery("");
    setDetailQuery("");
  }

  async function deleteTransaction(item: Transaction) {
    if (!window.confirm("确定删除这笔流水吗？")) return;
    await repo.deleteTransaction(item.id);
    setEditingTransaction(null);
    window.dispatchEvent(new Event("stark:transaction-saved"));
  }

  if (loading) {
    return <PageSkeleton title="消费" cards={3} />;
  }

  if (loadError) {
    return <PageDataError title="消费" onRetry={() => setLoadVersion((version) => version + 1)} />;
  }

  return (
    <div className="page-stack consumption-page consumption-analysis-page">
      <PageTopBar title="消费分析" />

      <section className="consumption-overview-card">
        <div className="consumption-overview-head">
          <div>
            <span>{reportingPeriodLabel(reportingMonth, locale)} · {locale === "en-US" ? "Cash-flow overview" : "现金流概览"}</span>
            <h2>{locale === "en-US" ? (viewMode === "income" ? "Income in selected period" : "Spending in selected period") : (viewMode === "income" ? "当前筛选收入" : "当前筛选支出")}</h2>
          </div>
          <MonthPicker
            value={reportingMonth}
            onChange={handleReportingMonthChange}
            ariaLabel={locale === "en-US" ? "Select spending month" : "选择消费统计月份"}
            triggerClassName="consumption-period-button"
          >
            <span>{reportingPeriodLabel(reportingMonth, locale)}</span>
            <ChevronDownIcon />
          </MonthPicker>
        </div>
        <strong className="consumption-overview-total">¥ {formatMoney(monthSummary.primaryAmount)}</strong>
        <div className="consumption-overview-stats">
          <div><span>{locale === "en-US" ? (viewMode === "income" ? "Daily average income" : "Daily average spending") : (viewMode === "income" ? "日均收入" : "日均支出")}</span><strong>¥ {formatMoney(monthSummary.dailyAverage)}</strong></div>
          <div><span>{locale === "en-US" ? "Selected-period income" : "筛选期收入"}</span><strong>¥ {formatMoney(monthSummary.income)}</strong></div>
          <div><span>{locale === "en-US" ? "Current balance" : "当前结余"}</span><strong className={monthSummary.balance >= 0 ? "positive" : "negative"}>{monthSummary.balance < 0 ? "-¥ " : "¥ "}{formatMoney(Math.abs(monthSummary.balance))}</strong></div>
        </div>
      </section>

      <section className="consumption-deep-summary">
        <div><span>{translateValue("微信", locale)} {locale === "en-US" ? "spending" : "支出"}</span><strong>¥ {formatMoney(platformSummary.wechat.expense)}</strong><small>{formatCount(platformSummary.wechat.count, "transactions", locale)}</small></div>
        <div><span>{translateValue("支付宝", locale)} {locale === "en-US" ? "spending" : "支出"}</span><strong>¥ {formatMoney(platformSummary.alipay.expense)}</strong><small>{formatCount(platformSummary.alipay.count, "transactions", locale)}</small></div>
      </section>

      {viewMode !== "income" ? <RemarkedExpenseCard transactions={monthTransactions} locale={locale} /> : null}

      <section className={"consumption-filter-card" + (categoryOpen || accountOpen ? " is-category-open" : "")}>
        <div className="consumption-mode-tabs" role="tablist" aria-label={locale === "en-US" ? "Transaction type" : "收支类型"}>
          {([["expense", locale === "en-US" ? "Expense" : "支出"], ["income", locale === "en-US" ? "Income" : "收入"], ["all", locale === "en-US" ? "All" : "全部"]] as const).map(([value, label]) => (
            <button key={value} type="button" className={viewMode === value ? "active" : ""} onClick={() => setViewMode(value)}>
              {label}
            </button>
          ))}
        </div>
        <div className="consumption-filter-row">
          <div ref={categoryFilterRef} className={"consumption-select-wrap consumption-category-select" + (categoryOpen ? " is-open" : "")}>
            <span>{locale === "en-US" ? "Category" : "分类"}</span>
            <button
              type="button"
              className="consumption-category-trigger"
              aria-haspopup="listbox"
              aria-expanded={categoryOpen}
              onClick={() => {
                setAccountOpen(false);
                setFilterMenuReady(false);
                setCategoryOpen((open) => !open);
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setAccountOpen(false);
                  setFilterMenuReady(false);
                  setCategoryOpen(true);
                }
              }}
            >
              <span className="consumption-category-trigger-icon">
                <img src={categoryIconForFilter(categoryFilter)} alt="" />
              </span>
              <span className="consumption-category-trigger-value">{translateValue(categoryFilter, locale)}</span>
              <ChevronDownIcon />
            </button>
            {categoryOpen ? createPortal(
              <div
                ref={categoryMenuRef}
                className="consumption-category-menu"
                role="listbox"
                aria-label={locale === "en-US" ? "Select expense category" : "选择消费分类"}
                style={{ ...filterMenuPosition, visibility: filterMenuReady ? "visible" : "hidden" }}
              >
                <div className="consumption-category-menu-head">
                  <strong>{locale === "en-US" ? "Expense category" : "消费分类"}</strong>
                  <span>{formatCount(categoryOptions.length - 1, "categories", locale)}</span>
                </div>
                <div className="consumption-category-options">
                  {categoryOptions.map((option) => {
                    const selected = option.label === categoryFilter;
                    return (
                      <button
                        key={option.label}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        className={"consumption-category-option" + (selected ? " selected" : "")}
                        onClick={() => {
                          setCategoryFilter(option.label);
                          setCategoryOpen(false);
                        }}
                      >
                        <span className="consumption-category-option-icon">
                          <img src={categoryIconForFilter(option.label)} alt="" />
                        </span>
                        <span className="consumption-category-option-copy">
                          <strong>{translateValue(option.label, locale)}</strong>
                          <small>{formatCount(option.count, "transactions", locale)}</small>
                        </span>
                        <span className="consumption-category-check" aria-hidden="true">{selected ? "✓" : ""}</span>
                      </button>
                    );
                  })}
                </div>
              </div>,
              document.body,
            ) : null}
          </div>
          <div ref={accountFilterRef} className={"consumption-select-wrap consumption-account-select" + (accountOpen ? " is-open" : "")}>
            <span>{locale === "en-US" ? "Account" : "账户"}</span>
            <button
              type="button"
              className="consumption-category-trigger consumption-account-trigger"
              aria-haspopup="listbox"
              aria-expanded={accountOpen}
              onClick={() => {
                setCategoryOpen(false);
                setFilterMenuReady(false);
                setAccountOpen((open) => !open);
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setCategoryOpen(false);
                  setFilterMenuReady(false);
                  setAccountOpen(true);
                }
              }}
            >
              <span className="consumption-account-trigger-icon">{accountIconForFilter(platformFilter)}</span>
              <span className="consumption-category-trigger-value">{translateValue(platformFilter, locale)}</span>
              <ChevronDownIcon />
            </button>
            {accountOpen ? createPortal(
              <div
                ref={accountMenuRef}
                className="consumption-category-menu consumption-account-menu"
                role="listbox"
                aria-label={locale === "en-US" ? "Select spending account" : "选择消费账户"}
                style={{ ...filterMenuPosition, visibility: filterMenuReady ? "visible" : "hidden" }}
              >
                <div className="consumption-category-menu-head">
                  <strong>{locale === "en-US" ? "Spending account" : "消费账户"}</strong>
                  <span>{formatCount(accountOptions.length - 1, "accounts", locale)}</span>
                </div>
                <div className="consumption-category-options">
                  {accountOptions.map((option) => {
                    const selected = option.label === platformFilter;
                    return (
                      <button
                        key={option.label}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        className={"consumption-category-option" + (selected ? " selected" : "")}
                        onClick={() => {
                          setPlatformFilter(option.label);
                          setAccountOpen(false);
                        }}
                      >
                        <span className="consumption-account-option-icon">{accountIconForFilter(option.label)}</span>
                        <span className="consumption-category-option-copy">
                          <strong>{translateValue(option.label, locale)}</strong>
                          <small>{formatCount(option.count, "transactions", locale)}</small>
                        </span>
                        <span className="consumption-category-check" aria-hidden="true">{selected ? "✓" : ""}</span>
                      </button>
                    );
                  })}
                </div>
              </div>,
              document.body,
            ) : null}
          </div>
          <label className="consumption-search-wrap">
            <SearchIcon />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={locale === "en-US" ? "Search merchant or note" : "搜索商户或备注"} />
          </label>
        </div>
      </section>

      <ConsumptionCharts
        trend={charts.trend}
        ratios={displayCharts.ratios}
        transactions={displayChartTransactions}
        monthKey={reportingMonth}
        viewMode={viewMode}
      />

      <section className="consumption-detail-card">
        <div className="consumption-detail-head">
          <div>
            <h2>{locale === "en-US" ? "Transaction details" : "流水明细"}</h2>
            <span>{locale === "en-US" ? `${filteredTransactions.length} filtered results · showing the latest ${Math.min(detailMatchedTransactions.length, 5)}` : `${filteredTransactions.length} 笔筛选结果 · 显示最近 ${Math.min(detailMatchedTransactions.length, 5)} 笔`}</span>
          </div>
          <span className="consumption-top-category">{locale === "en-US" ? (viewMode === "income" ? "Top income category" : "Top category") : (viewMode === "income" ? "最高收入分类" : "最高分类")} {translateValue(monthSummary.topCategory, locale)} · ¥{formatMoney(monthSummary.topCategoryAmount)}</span>
        </div>
        <label className="detail-search-wrap">
          <SearchIcon />
          <input value={detailQuery} onChange={(event) => setDetailQuery(event.target.value)} placeholder={locale === "en-US" ? "Search within filtered results" : "在当前筛选结果中搜索"} />
        </label>
        <div className="recent-list consumption-detail-list">
          {detailTransactions.length ? detailTransactions.map((item) => {
            const display = toAnalysisTransaction(item);
            const transferred = hasRemark(item) && item.type !== "EXPENSE";
            return (
              <div key={item.id} className="recent-row">
                <span className="recent-icon"><img src={categoryIconSrc(display)} alt="" /></span>
                <strong className="recent-title">{translateValue(display.category, locale)}</strong>
                <span className="recent-category">{transferred ? `${locale === "en-US" ? "Transfer recategorized" : "转账归类"} · ${translateValue(item.remarkCategory || item.category, locale)} · ` : ""}{item.merchant || item.description || translateValue(item.platform, locale)}</span>
                <span className="recent-time">{recentTimeLabel(item.date)}</span>
                <strong className={`recent-amount ${display.type === "INCOME" ? "income" : display.type === "EXPENSE" ? "expense" : "transfer"}`}>
                  {display.type === "INCOME" ? "+¥ " : display.type === "EXPENSE" ? "-¥ " : "±¥ "}{formatMoney(item.amount)}
                </strong>
                <div className="finance-item-actions"><button type="button" onClick={() => setEditingTransaction(item)}>编辑</button><button type="button" onClick={() => void deleteTransaction(item)}>删除</button></div>
              </div>
            );
          }) : <div className="consumption-empty-state">{locale === "en-US" ? "No transactions match the current filters" : "当前筛选下暂无流水"}</div>}
        </div>
      </section>

      {editingTransaction ? <JournalPanel mode="sheet" variant="journal" transaction={editingTransaction} onClose={() => setEditingTransaction(null)} onSaved={() => { setEditingTransaction(null); }} /> : null}
    </div>
  );
}
