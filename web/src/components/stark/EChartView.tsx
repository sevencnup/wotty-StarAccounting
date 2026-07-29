"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import { GridComponent, TooltipComponent } from "echarts/components";
import { LineChart, PieChart } from "echarts/charts";
import { CanvasRenderer } from "echarts/renderers";
import type { EChartsCoreOption, EChartsType } from "echarts/core";

echarts.use([GridComponent, TooltipComponent, LineChart, PieChart, CanvasRenderer]);

export function EChartView({ option, className }: { option: EChartsCoreOption; className?: string }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<EChartsType | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const chart = echarts.init(root, undefined, { renderer: "canvas" });
    instanceRef.current = chart;
    chart.setOption(option, true);

    const resizeObserver = new ResizeObserver(() => {
      chart.resize();
    });
    resizeObserver.observe(root);

    return () => {
      resizeObserver.disconnect();
      chart.dispose();
      instanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    instanceRef.current?.setOption(option, true);
  }, [option]);

  return <div ref={rootRef} className={className} />;
}
