"use client";

import { useEffect, useRef } from "react";
import type { EChartsCoreOption, EChartsType } from "echarts/core";

let chartRuntimePromise: Promise<typeof import("echarts/core")> | null = null;

export type EChartDataClick = {
  componentType?: string;
  dataIndex?: number;
  name?: string;
  seriesName?: string;
};

function loadChartRuntime() {
  if (!chartRuntimePromise) {
    chartRuntimePromise = Promise.all([
      import("echarts/core"),
      import("echarts/components"),
      import("echarts/charts"),
      import("echarts/renderers"),
    ]).then(([echarts, components, charts, renderers]) => {
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
      return echarts;
    });
  }
  return chartRuntimePromise;
}

export function EChartView({
  option,
  className,
  ariaLabel,
  onDataClick,
}: {
  option: EChartsCoreOption;
  className?: string;
  ariaLabel?: string;
  onDataClick?: (event: EChartDataClick) => void;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<EChartsType | null>(null);
  const optionRef = useRef(option);
  const onDataClickRef = useRef(onDataClick);
  const shouldInitializeRef = useRef(false);

  useEffect(() => {
    optionRef.current = option;
    instanceRef.current?.setOption(option, true);
  }, [option]);

  useEffect(() => {
    onDataClickRef.current = onDataClick;
  }, [onDataClick]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let observer: IntersectionObserver | null = null;
    let disposed = false;
    let resizeObserver: ResizeObserver | null = null;

    async function initializeChart() {
      const echarts = await loadChartRuntime();
      if (disposed) return;

      const chart = echarts.init(root!, undefined, { renderer: "canvas" });
      instanceRef.current = chart;
      chart.setOption(optionRef.current, true);
      chart.on("click", (event) => {
        onDataClickRef.current?.({
          componentType: event.componentType,
          dataIndex: event.dataIndex,
          name: event.name,
          seriesName: event.seriesName,
        });
      });

      resizeObserver = new ResizeObserver(() => chart.resize());
      resizeObserver.observe(root!);
    }

    function requestInitialization() {
      if (shouldInitializeRef.current || disposed) return;
      shouldInitializeRef.current = true;
      void initializeChart();
    }

    // The analytics page can render several charts. Defer charts outside the
    // viewport so the tab becomes interactive before ECharts parses and paints.
    if (typeof IntersectionObserver === "undefined") {
      requestInitialization();
    } else {
      observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer?.disconnect();
        requestInitialization();
      }, { rootMargin: "280px 0px" });
      observer.observe(root);
    }

    return () => {
      disposed = true;
      observer?.disconnect();
      resizeObserver?.disconnect();
      instanceRef.current?.dispose();
      instanceRef.current = null;
    };
  }, []);

  return <div ref={rootRef} className={className} role={ariaLabel ? "img" : undefined} aria-label={ariaLabel} />;
}
