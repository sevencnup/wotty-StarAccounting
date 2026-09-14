"use client";

import { useMemo } from "react";
import type { EChartsCoreOption } from "echarts/core";
import { EChartView } from "@/components/stark/EChartView";
import { formatMoney, isReportingYearKey, reportingMonthDate } from "@/lib/stark/utils/format";
import type { HomeRatio, HomeTrend } from "@/lib/stark/dashboard/summary";
import { buildDailyPlatformData, buildMonthlyPlatformData, buildPlatformCategoryFlow } from "@/lib/stark/dashboard/consumption-platforms";
import { buildMerchantRanking } from "@/lib/stark/dashboard/merchant-ranking";
import { sankeyLayoutOptions } from "@/lib/stark/dashboard/sankey-layout";
import type { Transaction } from "@/lib/stark/models";
import { translateValue, useAppLocale, type AppLocale } from "@/lib/stark/i18n";

const INCOME_BLUE = "#2a78d6";
const EXPENSE_ORANGE = "#eb6834";
const PLATFORM_COLORS: Record<string, string> = {
  "微信": "#1baf7a",
  "支付宝": "#2a78d6",
  "银行卡": "#008300",
  "现金": "#eda100",
  "其他": "#4a3aa7",
};

function TrendLegend({ locale }: { locale: AppLocale }) {
  return (
    <div className="trend-legend">
      <span><i style={{ background: INCOME_BLUE }} />{translateValue("收入", locale)}</span>
      <span><i style={{ background: EXPENSE_ORANGE }} />{translateValue("支出", locale)}</span>
    </div>
  );
}

function PlatformLegend({ platforms, locale }: { platforms: string[]; locale: AppLocale }) {
  return (
    <div className="trend-legend platform-legend">
      {platforms.map((platform) => (
        <span key={platform}><i style={{ background: PLATFORM_COLORS[platform] || PLATFORM_COLORS["其他"] }} />{translateValue(platform, locale)}</span>
      ))}
    </div>
  );
}

/* ────────── 折线图 ────────── */

function buildTrendOption(trend: HomeTrend, locale: AppLocale): EChartsCoreOption {
  const maxRaw = Math.max(...trend.expense, ...trend.income, 8000);
  const maxValue = Math.ceil(maxRaw / 2000) * 2000;
  type TooltipSize = { contentSize: number[]; viewSize: number[] };

  return {
    animationDuration: 450,
    animationEasing: "cubicOut",
    grid: { left: 18, right: 8, top: 12, bottom: 20 },
    tooltip: {
      trigger: "axis",
      confine: true,
      backgroundColor: "rgba(19, 27, 48, 0.92)",
      borderWidth: 0,
      padding: [8, 10],
      textStyle: { color: "#ffffff", fontSize: 12 },
      axisPointer: { type: "line", lineStyle: { color: "rgba(0,96,192,0.28)" } },
      position: (point: number[], _params: unknown, _dom: unknown, _rect: unknown, size: TooltipSize) => {
        const [x, y] = point as [number, number];
        const viewWidth = size.viewSize[0];
        const viewHeight = size.viewSize[1];
        const boxWidth = size.contentSize[0];
        const boxHeight = size.contentSize[1];
        const nextX = Math.min(Math.max(8, x - boxWidth / 2), viewWidth - boxWidth - 8);
        const nextY = y < viewHeight / 2
          ? Math.min(viewHeight - boxHeight - 8, y + 12)
          : Math.max(8, y - boxHeight - 12);
        return [nextX, nextY];
      },
      valueFormatter: (value: number | string) => `¥ ${formatMoney(Number(value ?? 0))}`,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: trend.labels,
      axisLine: { lineStyle: { color: "#e1e8f2" } },
      axisTick: { show: false },
      axisLabel: { color: "#74819a", fontSize: 10, margin: 8 },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: maxValue,
      splitNumber: 4,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: "#74819a",
        fontSize: 10,
        formatter: (value: number) => (value === 0 ? "0" : `${Math.round(value / 1000)}K`),
      },
      splitLine: { lineStyle: { color: "#eef2f7", type: "dashed" } },
    },
    series: [
      {
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        data: trend.income,
        lineStyle: { width: 2, color: INCOME_BLUE },
        itemStyle: { color: INCOME_BLUE, borderColor: "#ffffff", borderWidth: 1.2 },
        name: translateValue("收入", locale),
      },
      {
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        data: trend.expense,
        lineStyle: { width: 2, color: EXPENSE_ORANGE },
        itemStyle: { color: EXPENSE_ORANGE, borderColor: "#ffffff", borderWidth: 1.2 },
        name: translateValue("支出", locale),
      },
    ],
  };
}

/* ────────── 占比图 ────────── */

function buildRatioOption(ratios: HomeRatio[], locale: AppLocale): EChartsCoreOption {
  type TooltipSize = { contentSize: number[]; viewSize: number[] };

  return {
    animationDuration: 450,
    tooltip: {
      trigger: "item",
      confine: true,
      backgroundColor: "rgba(19, 27, 48, 0.92)",
      borderWidth: 0,
      padding: [8, 10],
      textStyle: { color: "#ffffff", fontSize: 12 },
      position: (point: number[], _params: unknown, _dom: unknown, _rect: unknown, size: TooltipSize) => {
        const [x, y] = point as [number, number];
        const viewWidth = size.viewSize[0];
        const viewHeight = size.viewSize[1];
        const boxWidth = size.contentSize[0];
        const boxHeight = size.contentSize[1];
        const nextX = Math.min(Math.max(8, x - boxWidth / 2), viewWidth - boxWidth - 8);
        const nextY = y < viewHeight / 2
          ? Math.min(viewHeight - boxHeight - 8, y + 12)
          : Math.max(8, y - boxHeight - 12);
        return [nextX, nextY];
      },
      formatter: (params: { name?: string; value?: number; percent?: number }) => `${params.name ?? ""}<br/>¥ ${formatMoney(Number(params.value ?? 0))} (${params.percent ?? 0}%)`,
    },
    series: [
      {
        type: "pie",
        radius: ["56%", "78%"],
        center: ["50%", "52%"],
        avoidLabelOverlap: true,
        label: { show: false },
        labelLine: { show: false },
        emphasis: { scale: false },
        itemStyle: { borderColor: "#ffffff", borderWidth: 2 },
        data: ratios.map((item) => ({ name: translateValue(item.name, locale), value: item.amount, itemStyle: { color: item.color } })),
      },
    ],
  };
}

/* ────────── 日历热力图（周历布局）────────── */

function shortAmount(amount: number) {
  if (amount >= 10000) return `${(amount / 10000).toFixed(1)}w`;
  if (amount >= 1000) return `${Math.round(amount / 100) / 10}k`;
  return String(Math.round(amount));
}

function buildCalendarDays(transactions: Transaction[], monthKey: string) {
  const now = reportingMonthDate(monthKey);
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthStr = String(month + 1).padStart(2, "0");
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const leading = firstDay === 0 ? 6 : firstDay - 1;

  const dailyMap: Record<string, number> = {};
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${monthStr}-${String(d).padStart(2, "0")}`;
    dailyMap[key] = 0;
  }
  transactions
    .filter((t) => t.date.startsWith(`${year}-${monthStr}`) && t.type === "EXPENSE")
    .forEach((t) => {
      const day = t.date.slice(0, 10);
      if (dailyMap[day] !== undefined) dailyMap[day] += t.amount;
    });

  const days = Object.entries(dailyMap).map(([date, amount]) => ({
    date,
    day: parseInt(date.slice(8, 10), 10),
    amount: Math.round(amount),
  }));
  const maxAmount = Math.max(...days.map((day) => day.amount), 1);
  return { leading, days, maxAmount };
}

function CalendarHeatmap({ transactions, monthKey, locale }: { transactions: Transaction[]; monthKey: string; locale: AppLocale }) {
  const calendarData = useMemo(() => buildCalendarDays(transactions, isReportingYearKey(monthKey) ? `${monthKey}-01` : monthKey), [monthKey, transactions]);

  if (isReportingYearKey(monthKey)) {
    const monthlyTotals = Array.from({ length: 12 }, (_, index) => {
      const prefix = `${monthKey}-${String(index + 1).padStart(2, "0")}`;
      return {
        label: `${index + 1}${locale === "en-US" ? "" : "月"}`,
        amount: transactions
          .filter((transaction) => transaction.type === "EXPENSE" && transaction.date.startsWith(prefix))
          .reduce((sum, transaction) => sum + transaction.amount, 0),
      };
    });
    const maxAmount = Math.max(...monthlyTotals.map((item) => item.amount), 1);
    return (
      <div className="calendar-grid-card calendar-year-grid-card">
        <div className="calendar-year-grid">
          {monthlyTotals.map((item, index) => {
            const level = item.amount <= 0 ? 0 : Math.max(1, Math.ceil((item.amount / maxAmount) * 4));
            return (
              <span key={item.label} className={`calendar-month-total level-${level}`} title={`${monthKey}-${String(index + 1).padStart(2, "0")} ¥ ${formatMoney(item.amount)}`}>
                <em>{item.label}</em>
                <strong>¥{shortAmount(item.amount)}</strong>
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  const { leading, days, maxAmount } = calendarData;
  const weekDays = locale === "zh-CN" ? ["一", "二", "三", "四", "五", "六", "日"] : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="calendar-grid-card">
      <div className="calendar-week-row">
        {weekDays.map((day) => <span key={day}>{day}</span>)}
      </div>
      <div className="calendar-grid">
        {Array.from({ length: leading }, (_, index) => (
          <span key={`empty-${index}`} className="calendar-day empty" />
        ))}
        {days.map((item) => {
          const level = item.amount <= 0 ? 0 : Math.max(1, Math.ceil((item.amount / maxAmount) * 4));
          return (
            <span key={item.date} className={`calendar-day level-${level}`} title={`${item.date} ¥ ${formatMoney(item.amount)}`}>
              <em>{item.day}</em>
              {item.amount > 0 && <strong>¥{shortAmount(item.amount)}</strong>}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ────────── 日柱状图 ────────── */

function buildBarOption(transactions: Transaction[], monthKey: string, locale: AppLocale): EChartsCoreOption {
  if (isReportingYearKey(monthKey)) {
    const { activePlatforms, months, platformMonthly } = buildMonthlyPlatformData(transactions, Number(monthKey));
    return {
      tooltip: {
        trigger: "axis",
        confine: true,
        backgroundColor: "rgba(19, 27, 48, 0.92)",
        borderWidth: 0,
        padding: [8, 10],
        textStyle: { color: "#ffffff", fontSize: 12 },
        axisPointer: { type: "shadow" },
        valueFormatter: (value: number | string) => `¥ ${formatMoney(Number(value ?? 0))}`,
      },
      grid: { left: 26, right: 8, top: 12, bottom: 20 },
      xAxis: {
        type: "category",
        data: months.map((month) => `${month}${locale === "en-US" ? "" : "月"}`),
        axisLine: { lineStyle: { color: "#e1e8f2" } },
        axisTick: { show: false },
        axisLabel: { color: "#74819a", fontSize: 9 },
      },
      yAxis: {
        type: "value",
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "#74819a", fontSize: 9, formatter: (v: number) => v === 0 ? "0" : `${Math.round(v / 1000)}K` },
        splitLine: { lineStyle: { color: "#eef2f7", type: "dashed" } },
      },
      series: activePlatforms.map((platform) => ({
        name: translateValue(platform, locale),
        type: "bar",
        stack: "total",
        barWidth: 14,
        itemStyle: { color: PLATFORM_COLORS[platform] || PLATFORM_COLORS["其他"], borderRadius: [3, 3, 0, 0] },
        data: platformMonthly[platform],
      })),
    };
  }

  const { activePlatforms, days, platformDaily } = buildDailyPlatformData(transactions, reportingMonthDate(monthKey));

  type TooltipSize = { contentSize: number[]; viewSize: number[] };

  return {
    tooltip: {
      trigger: "axis",
      confine: true,
      backgroundColor: "rgba(19, 27, 48, 0.92)",
      borderWidth: 0,
      padding: [8, 10],
      textStyle: { color: "#ffffff", fontSize: 12 },
      axisPointer: { type: "shadow" },
      position: (point: number[], _params: unknown, _dom: unknown, _rect: unknown, size: TooltipSize) => {
        const [x, y] = point as [number, number];
        const viewWidth = size.viewSize[0];
        const viewHeight = size.viewSize[1];
        const boxWidth = size.contentSize[0];
        const boxHeight = size.contentSize[1];
        const nextX = Math.min(Math.max(4, x - boxWidth / 2), viewWidth - boxWidth - 4);
        const nextY = y < viewHeight / 2
          ? Math.min(viewHeight - boxHeight - 4, y + 12)
          : Math.max(4, y - boxHeight - 12);
        return [nextX, nextY];
      },
      valueFormatter: (value: number | string) => `¥ ${formatMoney(Number(value ?? 0))}`,
    },
    grid: { left: 26, right: 8, top: 12, bottom: 20 },
    xAxis: {
      type: "category",
      data: days,
      axisLine: { lineStyle: { color: "#e1e8f2" } },
      axisTick: { show: false },
      axisLabel: { color: "#74819a", fontSize: 9 },
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: "#74819a", fontSize: 9, formatter: (v: number) => v === 0 ? "0" : `${Math.round(v / 1000)}K` },
      splitLine: { lineStyle: { color: "#eef2f7", type: "dashed" } },
    },
    series: activePlatforms.map((platform) => ({
        name: translateValue(platform, locale),
        type: "bar",
        stack: "total",
        barWidth: 6,
        itemStyle: { color: PLATFORM_COLORS[platform] || PLATFORM_COLORS["其他"], borderRadius: [3, 3, 0, 0] },
        data: platformDaily[platform],
      })),
  };
}

function SankeyAccountLegend({ platforms, locale }: { platforms: string[]; locale: AppLocale }) {
  return (
    <div className="sankey-account-legend" aria-label={locale === "en-US" ? "Accounts in the Sankey diagram" : "流向图账户"}>
      {platforms.map((platform) => (
        <span key={platform}>
          <i style={{ background: PLATFORM_COLORS[platform] || PLATFORM_COLORS["其他"] }} />
          {translateValue(platform, locale)}
        </span>
      ))}
    </div>
  );
}

/* ────────── 商家排行横向条形图 ────────── */

function buildMerchantRankingOption(transactions: Transaction[], locale: AppLocale): EChartsCoreOption {
  const ranking = buildMerchantRanking(transactions);
  const displayRows = [...ranking].reverse();
  const maxAmount = Math.max(...ranking.map((item) => item.amount), 0);
  const truncateLabel = (value: string) => value.length > 8 ? `${value.slice(0, 8)}…` : value;

  return {
    animationDuration: 450,
    grid: { left: 78, right: 16, top: 8, bottom: 8 },
    tooltip: {
      trigger: "axis",
      confine: true,
      backgroundColor: "rgba(19, 27, 48, 0.92)",
      borderWidth: 0,
      padding: [8, 10],
      textStyle: { color: "#ffffff", fontSize: 12 },
      axisPointer: { type: "shadow" },
      valueFormatter: (value: number | string) => `¥ ${formatMoney(Number(value ?? 0))}`,
    },
    xAxis: {
      type: "value",
      min: 0,
      max: maxAmount > 0 ? undefined : 1,
      splitNumber: 4,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: "#74819a", fontSize: 9, formatter: (value: number) => value === 0 ? "0" : `${Math.round(value / 1000)}K` },
      splitLine: { lineStyle: { color: "#eef2f7", type: "dashed" } },
    },
    yAxis: {
      type: "category",
      data: displayRows.map((item) => item.merchant),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: "#405268", fontSize: 10, formatter: truncateLabel },
    },
    series: [
      {
        name: locale === "en-US" ? "Merchant spending" : "商家消费",
        type: "bar",
        barWidth: 14,
        itemStyle: { color: "#2a78d6", borderRadius: [0, 7, 7, 0] },
        data: displayRows.map((item) => item.amount),
      },
    ],
  };
}

/* ────────── 桑基图 ────────── */

export function buildSankeyOption(transactions: Transaction[], locale: AppLocale): EChartsCoreOption {
  const layout = sankeyLayoutOptions();
  const expenseFiltered = transactions.filter((t) => t.type === "EXPENSE");
  const { activePlatforms: allPlatforms, flow } = buildPlatformCategoryFlow(expenseFiltered);
  const allCategories = [...new Set(Object.values(flow).flatMap((categories) => Object.keys(categories)))];

  const nodes: { name: string; label?: { show: boolean }; itemStyle?: { color: string } }[] = [];
  const links: { source: string; target: string; value: number }[] = [];

  const catColors: Record<string, string> = {
    "餐饮": "#ff7a32", "购物": "#ff4d6a", "交通": "#57b3ff", "住房": "#7c5cfc",
    "娱乐": "#ff9f43", "医疗": "#ff5c8a", "日用": "#0d8a5f", "服装": "#b37feb",
    "美容": "#f759ab", "宠物": "#ff7a45", "通讯": "#597ef7", "运动": "#36cfc9",
    "旅行": "#9254de", "教育": "#40a9ff", "其他": "#bfbfbf",
  };

  const displayPlatform = (value: string) => translateValue(value, locale);
  const displayCategory = (value: string) => translateValue(value, locale);

  allPlatforms.forEach((plat) => {
    nodes.push({
      name: displayPlatform(plat),
      label: { show: false },
      itemStyle: { color: PLATFORM_COLORS[plat] || PLATFORM_COLORS["其他"] },
    });
  });
  allCategories.forEach((cat) => {
    nodes.push({ name: displayCategory(cat), itemStyle: { color: catColors[cat] || "#bfbfbf" } });
  });

  allPlatforms.forEach((plat) => {
    Object.entries(flow[plat] || {}).forEach(([cat, value]) => {
       links.push({ source: displayPlatform(plat), target: displayCategory(cat), value: Math.round(value) });
    });
  });

  return {
    tooltip: {
      confine: true,
      backgroundColor: "rgba(19, 27, 48, 0.92)",
      borderWidth: 0,
      padding: [8, 10],
      textStyle: { color: "#ffffff", fontSize: 12 },
      formatter: (params: { name?: string; value?: number; dataType?: string; data?: { source?: string; target?: string } }) => {
        if (params.dataType === "edge") {
          return `${params.data?.source ?? ""} → ${params.data?.target ?? ""}<br/>¥ ${formatMoney(params.value ?? 0)}`;
        }
        return `${params.name ?? ""}`;
      },
    },
    series: [
      {
        type: "sankey",
        layout: "none",
        layoutIterations: layout.layoutIterations,
        left: 22,
        right: 112,
        top: 8,
        bottom: 8,
        nodeWidth: 14,
        nodeGap: layout.nodeGap,
        lineStyle: { color: "gradient", opacity: 0.35 },
        label: { color: "#11182d", fontSize: 10, distance: layout.labelDistance, lineHeight: 14, overflow: "truncate", width: 58 },
        labelLayout: layout.labelLayout,
        data: nodes,
        links,
      },
    ],
  };
}

/* ────────── 主组件 ────────── */

export function ConsumptionCharts({
  trend,
  ratios,
  transactions,
  monthKey,
  showDeepAnalysis = true,
}: {
  trend: HomeTrend;
  ratios: HomeRatio[];
  transactions: Transaction[];
  monthKey: string;
  showDeepAnalysis?: boolean;
}) {
  const locale = useAppLocale();
  const reportingDate = useMemo(() => reportingMonthDate(monthKey), [monthKey]);
  const trendOption = useMemo(() => buildTrendOption(trend, locale), [locale, trend]);
  const ratioOption = useMemo(() => buildRatioOption(ratios, locale), [locale, ratios]);
  const displayRatios = ratios.length ? ratios : [];
  const barOption = useMemo(() => buildBarOption(transactions, monthKey, locale), [locale, monthKey, transactions]);
  const barPlatforms = useMemo(
    () => isReportingYearKey(monthKey)
      ? buildMonthlyPlatformData(transactions, Number(monthKey)).activePlatforms
      : buildDailyPlatformData(transactions, reportingDate).activePlatforms,
    [monthKey, reportingDate, transactions],
  );
  const merchantRanking = useMemo(() => buildMerchantRanking(transactions), [transactions]);
  const merchantRankingOption = useMemo(() => buildMerchantRankingOption(transactions, locale), [locale, transactions]);
  const sankeyOption = useMemo(() => buildSankeyOption(transactions, locale), [locale, transactions]);

  return (
    <div className="consumption-chart-stack">
      {/* 核心分析：趋势 */}
      <section className="home-card trend-card consumption-chart-card">
        <div className="trend-panel">
          <div className="section-head">
            <div className="consumption-chart-title">
              <h2>收支趋势</h2>
              <span>按当前筛选范围</span>
            </div>
              <TrendLegend locale={locale} />
          </div>
          <EChartView option={trendOption} className="trend-chart consumption-trend-chart" />
        </div>
      </section>

      {/* 核心分析：分类结构 */}
      <section className="home-card ratio-card consumption-chart-card">
        <div className="section-head">
          <div className="consumption-chart-title">
            <h2>支出分类构成</h2>
            <span>金额占比</span>
          </div>
        </div>
        <div className="ratio-content">
          <EChartView option={ratioOption} className="ratio-donut" />
          <div className="ratio-list">
            {displayRatios.map((item) => (
              <div key={item.name} className="ratio-row">
                <span className="ratio-dot" style={{ background: item.color }} />
                <span>{item.name}</span>
                <strong>{item.percent}%</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 消费节律 */}
      <section className="home-card consumption-chart-card">
        <div className="trend-panel">
          <div className="section-head">
            <div className="consumption-chart-title">
                <h2>消费节律</h2>
                <span>{isReportingYearKey(monthKey) ? "每月的支出热度" : "每天的支出热度"}</span>
            </div>
          </div>
          <CalendarHeatmap transactions={transactions} monthKey={monthKey} locale={locale} />
        </div>
      </section>

      {showDeepAnalysis ? (
        <>
          <section className="home-card consumption-chart-card merchant-ranking-card">
            <div className="trend-panel">
              <div className="section-head">
                <div className="consumption-chart-title">
                  <h2>{locale === "en-US" ? "Top merchant spending" : "商家消费排行"}</h2>
                  <span>{locale === "en-US" ? "Top 10 by expense amount" : "消费金额前 10 名"}</span>
                </div>
              </div>
              {merchantRanking.length ? (
                <EChartView option={merchantRankingOption} className="merchant-ranking-chart" />
              ) : (
                <div className="merchant-ranking-empty">{locale === "en-US" ? "No merchant spending in the current filters" : "当前筛选下暂无商家支出"}</div>
              )}
            </div>
          </section>

          <section className="home-card consumption-chart-card">
            <div className="trend-panel">
              <div className="section-head">
                <div className="consumption-chart-title">
                  <h2>{isReportingYearKey(monthKey) ? "每月平台支出" : "每日平台支出"}</h2>
                  <span>按账户拆分</span>
                </div>
                <PlatformLegend platforms={barPlatforms} locale={locale} />
              </div>
              <EChartView option={barOption} className="bar-chart" />
            </div>
          </section>

          <section className="home-card consumption-chart-card">
            <div className="trend-panel">
              <div className="section-head">
                <div className="consumption-chart-title">
                  <h2>消费流向图</h2>
                  <span>账户到分类</span>
                </div>
                <SankeyAccountLegend platforms={buildPlatformCategoryFlow(transactions.filter((transaction) => transaction.type === "EXPENSE")).activePlatforms} locale={locale} />
              </div>
              <div className="sankey-scroll">
                <EChartView option={sankeyOption} className="sankey-chart" />
              </div>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
