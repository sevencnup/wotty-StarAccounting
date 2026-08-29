"use client";

import { useEffect, useMemo, useState } from "react";
import { PageTopBar } from "@/components/stark/PageTopBar";
import { ConsumptionCharts } from "@/components/stark/ConsumptionCharts";
import { PageSkeleton } from "@/components/stark/Skeleton";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { buildHomeSummary } from "@/lib/stark/dashboard/summary";
import { REPORTING_MONTH_KEY, formatMoney, monthKey, reportingMonthLabel } from "@/lib/stark/utils/format";
import type { Transaction } from "@/lib/stark/models";

const repo = new DataModeManager().getRepository();

type ViewMode = "expense" | "income" | "all";

function categoryIconSrc(item: Transaction) {
  const text = `${item.merchant || ""}${item.description || ""}${item.category}`;
  if (item.type === "INCOME") return "/category-icons/jiaoyi.png";
  if (text.includes("餐") || text.includes("咖啡")) return "/category-icons/canyin.png";
  if (text.includes("交") || text.includes("地铁")) return "/category-icons/jiaotong.png";
  if (text.includes("购") || text.includes("超市")) return "/category-icons/gouwu.png";
  if (text.includes("娱") || text.includes("电影")) return "/category-icons/yule.png";
  if (text.includes("生活") || text.includes("日用")) return "/category-icons/riyong.png";
  if (text.includes("医")) return "/category-icons/yiliao.png";
  if (text.includes("住")) return "/category-icons/zhufang.png";
  if (text.includes("旅")) return "/category-icons/lvxing.png";
  if (text.includes("美")) return "/category-icons/meirong.png";
  if (text.includes("宠")) return "/category-icons/chongwu.png";
  if (text.includes("服")) return "/category-icons/fuzhuang.png";
  if (text.includes("通")) return "/category-icons/tongxun.png";
  if (text.includes("运")) return "/category-icons/yundong.png";
  if (text.includes("教")) return "/category-icons/jiaoyu.png";
  return "/category-icons/qita.png";
}

function recentTimeLabel(dateStr: string) {
  const d = new Date(dateStr);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${mm}-${dd} ${hh}:${mi}`;
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

function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export default function ConsumptionPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("expense");
  const [categoryFilter, setCategoryFilter] = useState("全部分类");
  const [platformFilter, setPlatformFilter] = useState("全部账户");
  const [query, setQuery] = useState("");
  const [detailQuery, setDetailQuery] = useState("");
  const [showDeepAnalysis, setShowDeepAnalysis] = useState(true);

  useEffect(() => {
    void repo.getTransactions("default", 1, 200).then((data) => {
      setTransactions(data);
      setLoading(false);
    });
  }, []);

  const monthTransactions = useMemo(
    () => transactions.filter((item) => monthKey(item.date) === REPORTING_MONTH_KEY),
    [transactions],
  );

  const categories = useMemo(
    () => ["全部分类", ...new Set(monthTransactions.map((item) => item.category).filter(Boolean))],
    [monthTransactions],
  );

  const platforms = useMemo(
    () => ["全部账户", ...new Set(monthTransactions.map((item) => item.platform).filter(Boolean))],
    [monthTransactions],
  );

  const filteredTransactions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return monthTransactions.filter((item) => {
      const matchesMode = viewMode === "all"
        || (viewMode === "expense" && item.type === "EXPENSE")
        || (viewMode === "income" && item.type === "INCOME");
      const matchesCategory = categoryFilter === "全部分类" || item.category === categoryFilter;
      const matchesPlatform = platformFilter === "全部账户" || item.platform === platformFilter;
      const text = `${item.category} ${item.merchant || ""} ${item.description || ""} ${item.platform}`.toLowerCase();
      return matchesMode && matchesCategory && matchesPlatform && (!normalizedQuery || text.includes(normalizedQuery));
    });
  }, [categoryFilter, monthTransactions, platformFilter, query, viewMode]);

  const chartTransactions = filteredTransactions;

  const monthSummary = useMemo(() => {
    const expenses = monthTransactions.filter((item) => item.type === "EXPENSE");
    const income = monthTransactions.filter((item) => item.type === "INCOME");
    const categoryTotals = expenses.reduce<Record<string, number>>((totals, item) => {
      totals[item.category] = (totals[item.category] ?? 0) + item.amount;
      return totals;
    }, {});
    const [topCategory = "暂无支出", topCategoryAmount = 0] = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])[0] ?? [];
    const expense = expenses.reduce((sum, item) => sum + item.amount, 0);
    const incomeTotal = income.reduce((sum, item) => sum + item.amount, 0);
    return {
      expense,
      income: incomeTotal,
      balance: incomeTotal - expense,
      count: monthTransactions.length,
      expenseCount: expenses.length,
      topCategory,
      topCategoryAmount,
      dailyAverage: expense / Math.max(new Date().getDate(), 1),
    };
  }, [monthTransactions]);

  const platformSummary = useMemo(() => {
    const calc = (items: Transaction[]) => ({
      expense: items.filter((i) => i.type === "EXPENSE").reduce((s, i) => s + i.amount, 0),
      count: items.filter((i) => i.type === "EXPENSE").length,
    });
    return {
      wechat: calc(monthTransactions.filter((item) => item.platform === "微信")),
      alipay: calc(monthTransactions.filter((item) => item.platform === "支付宝")),
    };
  }, [monthTransactions]);

  const charts = useMemo(
    () => buildHomeSummary({ transactions: chartTransactions, assets: [], budgets: [], loans: [], savingsGoals: [] }),
    [chartTransactions],
  );

  const detailTransactions = useMemo(() => {
    const normalizedQuery = detailQuery.trim().toLowerCase();
    return filteredTransactions.filter((item) => {
      if (!normalizedQuery) return true;
      return `${item.category} ${item.merchant || ""} ${item.description || ""} ${item.platform}`.toLowerCase().includes(normalizedQuery);
    });
  }, [detailQuery, filteredTransactions]);

  if (loading) {
    return <PageSkeleton title="消费" cards={3} />;
  }

  return (
    <div className="page-stack consumption-page consumption-analysis-page">
      <PageTopBar title="消费分析" />

      <section className="consumption-overview-card">
        <div className="consumption-overview-head">
          <div>
            <span>{reportingMonthLabel()} · 现金流概览</span>
            <h2>本月支出</h2>
          </div>
          <button type="button" className="consumption-period-button">
            本月 <ChevronDownIcon />
          </button>
        </div>
        <strong className="consumption-overview-total">¥ {formatMoney(monthSummary.expense)}</strong>
        <div className="consumption-overview-stats">
          <div><span>日均支出</span><strong>¥ {formatMoney(monthSummary.dailyAverage)}</strong></div>
          <div><span>本月收入</span><strong>¥ {formatMoney(monthSummary.income)}</strong></div>
          <div><span>当前结余</span><strong className={monthSummary.balance >= 0 ? "positive" : "negative"}>¥ {formatMoney(Math.abs(monthSummary.balance))}</strong></div>
        </div>
      </section>

      <section className="consumption-deep-summary">
        <div><span>微信支出</span><strong>¥ {formatMoney(platformSummary.wechat.expense)}</strong><small>{platformSummary.wechat.count} 笔</small></div>
        <div><span>支付宝支出</span><strong>¥ {formatMoney(platformSummary.alipay.expense)}</strong><small>{platformSummary.alipay.count} 笔</small></div>
      </section>

      <section className="consumption-filter-card">
        <div className="consumption-mode-tabs" role="tablist" aria-label="收支类型">
          {([["expense", "支出"], ["income", "收入"], ["all", "全部"]] as const).map(([value, label]) => (
            <button key={value} type="button" className={viewMode === value ? "active" : ""} onClick={() => setViewMode(value)}>
              {label}
            </button>
          ))}
        </div>
        <div className="consumption-filter-row">
          <label className="consumption-select-wrap">
            <span>分类</span>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              {categories.map((item) => <option key={item}>{item}</option>)}
            </select>
            <ChevronDownIcon />
          </label>
          <label className="consumption-select-wrap">
            <span>账户</span>
            <select value={platformFilter} onChange={(event) => setPlatformFilter(event.target.value)}>
              {platforms.map((item) => <option key={item}>{item}</option>)}
            </select>
            <ChevronDownIcon />
          </label>
          <label className="consumption-search-wrap">
            <SearchIcon />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索商户或备注" />
          </label>
        </div>
      </section>

      <ConsumptionCharts trend={charts.trend} ratios={charts.ratios} transactions={chartTransactions} showDeepAnalysis={showDeepAnalysis} />

      <section className="consumption-detail-card">
        <div className="consumption-detail-head">
          <div>
            <h2>流水明细</h2>
            <span>{filteredTransactions.length} 笔筛选结果 · 共 {monthSummary.count} 笔本月记录</span>
          </div>
          <span className="consumption-top-category">最高分类 {monthSummary.topCategory} · ¥{formatMoney(monthSummary.topCategoryAmount)}</span>
        </div>
        <label className="detail-search-wrap">
          <SearchIcon />
          <input value={detailQuery} onChange={(event) => setDetailQuery(event.target.value)} placeholder="在当前筛选结果中搜索" />
        </label>
        <div className="recent-list consumption-detail-list">
          {detailTransactions.length ? detailTransactions.map((item) => (
            <div key={item.id} className="recent-row">
              <span className="recent-icon"><img src={categoryIconSrc(item)} alt="" /></span>
              <strong className="recent-title">{item.category}</strong>
              <span className="recent-category">{item.merchant || item.description || item.platform}</span>
              <span className="recent-time">{recentTimeLabel(item.date)}</span>
              <strong className={`recent-amount ${item.type === "INCOME" ? "income" : item.type === "EXPENSE" ? "expense" : "transfer"}`}>
                {item.type === "INCOME" ? "+¥ " : item.type === "EXPENSE" ? "-¥ " : "±¥ "}{formatMoney(item.amount)}
              </strong>
            </div>
          )) : <div className="consumption-empty-state">当前筛选下暂无流水</div>}
        </div>
      </section>

      <button type="button" className="consumption-deep-toggle" onClick={() => setShowDeepAnalysis((value) => !value)}>
        {showDeepAnalysis ? "收起深入分析" : "展开深入分析"}
        <ChevronDownIcon />
      </button>
    </div>
  );
}
