"use client";

import { useMemo } from "react";
import type { EChartsCoreOption } from "echarts/core";
import { EChartView } from "@/components/stark/EChartView";
import { formatMoney, reportingMonthDate } from "@/lib/stark/utils/format";
import type { HomeRatio, HomeTrend } from "@/lib/stark/dashboard/summary";
import { buildDailyPlatformData } from "@/lib/stark/dashboard/consumption-platforms";
import type { Transaction } from "@/lib/stark/models";

const INCOME_BLUE = "#0060c0";
const EXPENSE_ORANGE = "#ff7a32";
const PLATFORM_COLORS: Record<string, string> = {
  "微信": "#07c160",
  "支付宝": "#1677ff",
  "银行卡": "#0d8a5f",
  "现金": "#ff9f43",
  "其他": "#9aa7bd",
};

function TrendLegend() {
  return (
    <div className="trend-legend">
      <span><i style={{ background: INCOME_BLUE }} />收入</span>
      <span><i style={{ background: EXPENSE_ORANGE }} />支出</span>
    </div>
  );
}

function PlatformLegend({ platforms }: { platforms: string[] }) {
  return (
    <div className="trend-legend platform-legend">
      {platforms.map((platform) => (
        <span key={platform}><i style={{ background: PLATFORM_COLORS[platform] || PLATFORM_COLORS["其他"] }} />{platform}</span>
      ))}
    </div>
  );
}

/* ────────── 折线图 ────────── */

function buildTrendOption(trend: HomeTrend): EChartsCoreOption {
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
        name: "收入",
      },
      {
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        data: trend.expense,
        lineStyle: { width: 2, color: EXPENSE_ORANGE },
        itemStyle: { color: EXPENSE_ORANGE, borderColor: "#ffffff", borderWidth: 1.2 },
        name: "支出",
      },
    ],
  };
}

/* ────────── 占比图 ────────── */

function buildRatioOption(ratios: HomeRatio[]): EChartsCoreOption {
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
        data: ratios.map((item) => ({ name: item.name, value: item.amount, itemStyle: { color: item.color } })),
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

function buildCalendarDays(transactions: Transaction[]) {
  const now = reportingMonthDate();
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

function CalendarHeatmap({ transactions }: { transactions: Transaction[] }) {
  const { leading, days, maxAmount } = useMemo(() => buildCalendarDays(transactions), [transactions]);
  const weekDays = ["一", "二", "三", "四", "五", "六", "日"];

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

function buildBarOption(transactions: Transaction[]): EChartsCoreOption {
  const { activePlatforms, days, platformDaily } = buildDailyPlatformData(transactions);

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
        name: platform,
        type: "bar",
        stack: "total",
        barWidth: 6,
        itemStyle: { color: PLATFORM_COLORS[platform] || PLATFORM_COLORS["其他"], borderRadius: [3, 3, 0, 0] },
        data: platformDaily[platform],
      })),
  };
}

/* ────────── 桑基图 ────────── */

function buildSankeyOption(transactions: Transaction[]): EChartsCoreOption {
  const expenseFiltered = transactions.filter((t) => t.type === "EXPENSE");

  // platform → category flow
  const flow: Record<string, Record<string, number>> = {};
  expenseFiltered.forEach((t) => {
    const plat = t.platform || "其他";
    const cat = t.category || "其他";
    if (!flow[plat]) flow[plat] = {};
    flow[plat][cat] = (flow[plat][cat] || 0) + t.amount;
  });

  const allPlatforms = ["微信", "支付宝", "银行卡", "现金", "其他"].filter((p) => flow[p] && Object.keys(flow[p]).length > 0);
  const allCategories = [...new Set(expenseFiltered.map((t) => t.category || "其他"))];

  const nodes: { name: string; itemStyle?: { color: string } }[] = [];
  const links: { source: string; target: string; value: number }[] = [];

  const catColors: Record<string, string> = {
    "餐饮": "#ff7a32", "购物": "#ff4d6a", "交通": "#57b3ff", "住房": "#7c5cfc",
    "娱乐": "#ff9f43", "医疗": "#ff5c8a", "日用": "#0d8a5f", "服装": "#b37feb",
    "美容": "#f759ab", "宠物": "#ff7a45", "通讯": "#597ef7", "运动": "#36cfc9",
    "旅行": "#9254de", "教育": "#40a9ff", "其他": "#bfbfbf",
  };

  allPlatforms.forEach((plat) => {
    nodes.push({ name: plat, itemStyle: { color: PLATFORM_COLORS[plat] || PLATFORM_COLORS["其他"] } });
  });
  allCategories.forEach((cat) => {
    nodes.push({ name: cat, itemStyle: { color: catColors[cat] || "#bfbfbf" } });
  });

  allPlatforms.forEach((plat) => {
    Object.entries(flow[plat] || {}).forEach(([cat, value]) => {
      links.push({ source: plat, target: cat, value: Math.round(value) });
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
        layoutIterations: 0,
        left: 8,
        right: 112,
        top: 8,
        bottom: 8,
        nodeWidth: 14,
        nodeGap: 10,
        lineStyle: { color: "gradient", opacity: 0.35 },
        label: { color: "#11182d", fontSize: 10, distance: 7 },
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
}: {
  trend: HomeTrend;
  ratios: HomeRatio[];
  transactions: Transaction[];
}) {
  const trendOption = useMemo(() => buildTrendOption(trend), [trend]);
  const ratioOption = useMemo(() => buildRatioOption(ratios), [ratios]);
  const displayRatios = ratios.length ? ratios : [];
  const barOption = useMemo(() => buildBarOption(transactions), [transactions]);
  const barPlatforms = useMemo(() => buildDailyPlatformData(transactions).activePlatforms, [transactions]);
  const sankeyOption = useMemo(() => buildSankeyOption(transactions), [transactions]);

  return (
    <>
      {/* 折线图 */}
      <section className="home-card trend-card">
        <div className="trend-panel">
          <div className="section-head">
            <h2>本月收支趋势</h2>
            <TrendLegend />
          </div>
          <EChartView option={trendOption} className="trend-chart consumption-trend-chart" />
        </div>
      </section>

      {/* 日历图 */}
      <section className="home-card">
        <div className="trend-panel">
          <div className="section-head">
            <h2>每日支出日历</h2>
          </div>
          <CalendarHeatmap transactions={transactions} />
        </div>
      </section>

      {/* 日柱状图 */}
      <section className="home-card">
        <div className="trend-panel">
          <div className="section-head">
            <h2>每日平台支出</h2>
            <PlatformLegend platforms={barPlatforms} />
          </div>
          <EChartView option={barOption} className="bar-chart" />
        </div>
      </section>

      {/* 占比图 */}
      <section className="home-card ratio-card">
        <h2>收支类型占比</h2>
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

      {/* 桑基图 */}
      <section className="home-card">
        <div className="trend-panel">
          <div className="section-head">
            <h2>消费流向图</h2>
            <span style={{ fontSize: 11, color: "#65718a" }}>消费平台 → 消费类型</span>
          </div>
          <div className="sankey-scroll">
            <EChartView option={sankeyOption} className="sankey-chart" />
          </div>
        </div>
      </section>
    </>
  );
}
