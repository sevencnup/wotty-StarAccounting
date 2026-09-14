// The chart has roughly 244px of usable height and can display up to 15
// categories. Keep (categoryCount - 1) * gap below that height so ECharts
// never calculates negative node heights.
export const SANKEY_NODE_GAP = 10;
export const SANKEY_LAYOUT_ITERATIONS = 0;
export const SANKEY_LABEL_DISTANCE = 8;

/**
 * Shared layout values for the account-to-category Sankey diagram.
 * A real layout pass plus a larger gap prevents tiny source nodes (for example
 * a low-volume WeChat or Alipay node) from placing their labels on top of one
 * another.
 */
export function sankeyLayoutOptions() {
  return {
    nodeGap: SANKEY_NODE_GAP,
    layoutIterations: SANKEY_LAYOUT_ITERATIONS,
    labelDistance: SANKEY_LABEL_DISTANCE,
    labelLayout: { moveOverlap: "shiftY" as const },
  };
}
