"use client";

import { useMemo } from "react";
import type { EChartsCoreOption } from "echarts/core";
import { EChartView } from "@/components/stark/EChartView";
import { formatMoney } from "@/lib/stark/utils/format";
import type { HomeRatio, HomeTrend } from "@/lib/stark/dashboard/summary";
import type { Transaction } from "@/lib/stark/models";

const INCOME_BLUE = "#3d86ff";
const EXPENSE_ORANGE = "#ff7a32";
const PLATFORM_COLORS: Record<string, string> = {
  "微信": "#07c160",
  "支付宝": "#1677ff",
  "银行卡": "#45b787",
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
    grid: { left: 26, right: 10, top: 16, bottom: 24 },
    tooltip: {
      trigger: "axis",
      confine: true,
      backgroundColor: "rgba(19, 27, 48, 0.92)",
      borderWidth: 0,
      padding: [8, 10],
      textStyle: { color: "#ffffff", fontSize: 12 },
      axisPointer: { type: "line", lineStyle: { color: "rgba(61,134,255,0.28)" } },
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
      splitLine: { show: false },
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

function buildCalendarOption(transactions: Transaction[]): EChartsCoreOption {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthStr = String(month + 1).padStart(2, "0");
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const start = `${year}-${monthStr}-01`;
  const end = `${year}-${monthStr}-${String(daysInMonth).padStart(2, "0")}`;

  // daily expense total
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

  const data = Object.entries(dailyMap).map(([k, v]) => [k, Math.round(v)]);

  const maxVal = Math.max(...data.map(([, v]) => v as number), 1);
  const threshold = maxVal * 0.45;

  return {
    tooltip: {
      show: false,
    },
    visualMap: {
      min: 0,
      max: Math.max(maxVal, 1),
      calculable: false,
      show: false,
      inRange: { color: ["#f0f5ff", "#b3d0ff", "#4d8cf7", "#1a5dc9"] },
    },
    calendar: {
      range: [start, end],
      orient: "vertical",
      left: 8,
      right: 8,
      top: 8,
      bottom: 8,
      cellSize: [30, 30],
      dayLabel: {
        color: "#65718a",
        fontSize: 10,
        firstDay: 1,
        nameMap: "ZH",
      },
      monthLabel: { show: false },
      splitLine: { lineStyle: { color: "#ffffff", width: 2 } },
      itemStyle: {
        borderColor: "#ffffff",
        borderWidth: 3,
      },
    },
    series: [
      {
        type: "heatmap",
        coordinateSystem: "calendar",
        data,
        itemStyle: {
          borderRadius: 5,
        },
        label: {
          show: true,
          fontSize: 10,
          fontWeight: 500,
          position: "inside",
          lineHeight: 14,
          formatter: (params: { value: [string, number] }) => {
            const day = parseInt(params.value[0].slice(8, 10), 10);
            const amount = params.value[1];
            const dark = amount > threshold;
            const ds = dark ? "dw" : "d";
            if (amount <= 0) return `{${ds}|${day}}`;
            const slot = dark ? "w" : "a";
            const short = amount >= 10000
              ? `${(amount / 10000).toFixed(1)}w`
              : amount >= 1000
                ? `${Math.round(amount / 100) / 10}k`
                : String(amount);
            return `{${ds}|${day}}\n{${slot}|¥${short}}`;
          },
          rich: {
            d: {
              color: "#11182d",
              fontSize: 10,
              fontWeight: 500,
              lineHeight: 14,
            },
            dw: {
              color: "#ffffff",
              fontSize: 10,
              fontWeight: 500,
              lineHeight: 14,
            },
            a: {
              color: "#11182d",
              fontSize: 9,
              fontWeight: 400,
              lineHeight: 12,
            },
            w: {
              color: "#ffffff",
              fontSize: 9,
              fontWeight: 400,
              lineHeight: 12,
            },
          },
        },
        emphasis: { itemStyle: { borderColor: "#11182d", borderWidth: 1.5 } },
      },
    ],
  };
}

/* ────────── 日柱状图 ────────── */

function buildBarOption(transactions: Transaction[]): EChartsCoreOption {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const prefix = `${now.getFullYear()}-${month}`;
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  const days = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));
  const preferredPlatforms = ["微信", "支付宝", "银行卡", "现金", "其他"];
  const platformSet = new Set(
    transactions
      .filter((t) => t.date.startsWith(prefix) && t.type === "EXPENSE")
      .map((t) => t.platform || "其他"),
  );
  const platforms = preferredPlatforms.filter((platform) => platformSet.has(platform));
  const activePlatforms = platforms.length ? platforms : ["其他"];
  const platformDaily: Record<string, number[]> = Object.fromEntries(
    activePlatforms.map((platform) => [platform, new Array(daysInMonth).fill(0)]),
  );

  transactions
    .filter((t) => t.date.startsWith(prefix) && t.type === "EXPENSE")
    .forEach((t) => {
      const day = parseInt(t.date.slice(8, 10), 10) - 1;
      if (day < 0 || day >= daysInMonth) return;
      const platform = activePlatforms.includes(t.platform || "其他") ? t.platform || "其他" : "其他";
      platformDaily[platform][day] += t.amount;
    });

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
    grid: { left: 34, right: 8, top: 12, bottom: 20 },
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
    "娱乐": "#ff9f43", "医疗": "#ff5c8a", "日用": "#45b787", "服装": "#b37feb",
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
        right: 28,
        top: 8,
        bottom: 8,
        nodeWidth: 14,
        nodeGap: 10,
        lineStyle: { color: "gradient", opacity: 0.35 },
        label: { color: "#11182d", fontSize: 10 },
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
  const calendarOption = useMemo(() => buildCalendarOption(transactions), [transactions]);
  const barOption = useMemo(() => buildBarOption(transactions), [transactions]);
  const barPlatforms = useMemo(() => {
    const now = new Date();
    const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const platforms = new Set(
      transactions
        .filter((t) => t.date.startsWith(prefix) && t.type === "EXPENSE")
        .map((t) => t.platform || "其他"),
    );
    const ordered = ["微信", "支付宝", "银行卡", "现金", "其他"].filter((platform) => platforms.has(platform));
    return ordered.length ? ordered : ["其他"];
  }, [transactions]);
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
          <EChartView option={calendarOption} className="calendar-chart" />
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
