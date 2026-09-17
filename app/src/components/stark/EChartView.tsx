"use client";

import { useEffect, useRef } from "react";
import type { EChartsCoreOption, EChartsType } from "echarts/core";

export function EChartView({ option, className }: { option: EChartsCoreOption; className?: string }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<EChartsType | null>(null);
  const optionRef = useRef(option);

  useEffect(() => {
    optionRef.current = option;
    instanceRef.current?.setOption(option, true);
  }, [option]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let disposed = false;
    let resizeObserver: ResizeObserver | null = null;

    async function initializeChart() {
      // ECharts is intentionally loaded after the page has painted. Keeping this
      // heavyweight library out of the navigation-critical bundle prevents a tab
      // change from blocking on chart parsing and initialization.
      const [echarts, components, charts, renderers] = await Promise.all([
        import("echarts/core"),
        import("echarts/components"),
        import("echarts/charts"),
        import("echarts/renderers"),
      ]);

      if (disposed) return;

      echarts.use([
        components.GridComponent,
        components.TooltipComponent,
        components.CalendarComponent,
        components.VisualMapComponent,
        charts.LineChart,
        charts.PieChart,
        charts.BarChart,
        charts.SankeyChart,
        charts.HeatmapChart,
        renderers.CanvasRenderer,
      ]);

      const chart = echarts.init(root!, undefined, { renderer: "canvas" });
      instanceRef.current = chart;
      chart.setOption(optionRef.current, true);

      resizeObserver = new ResizeObserver(() => chart.resize());
      resizeObserver.observe(root!);
    }

    void initializeChart();

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      instanceRef.current?.dispose();
      instanceRef.current = null;
    };
  }, []);

  return <div ref={rootRef} className={className} />;
}
