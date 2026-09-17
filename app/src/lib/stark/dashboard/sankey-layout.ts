// The chart has roughly 244px of usable height and can display up to 15
// categories. Keep (categoryCount - 1) * gap below that height so ECharts
// never calculates negative node heights.
export const SANKEY_NODE_GAP = 10;
export const SANKEY_LAYOUT_ITERATIONS = 32;
export const SANKEY_LABEL_DISTANCE = 8;

/**
 * Shared layout values for the account-to-category Sankey diagram.
 * Account labels live in the card header. ECharts keeps nodes and flow lines
 * in one automatic layout pass; colliding category labels are hidden rather
 * than moved outside the chart bounds.
 */
export function sankeyLayoutOptions() {
  return {
    nodeGap: SANKEY_NODE_GAP,
    layoutIterations: SANKEY_LAYOUT_ITERATIONS,
    labelDistance: SANKEY_LABEL_DISTANCE,
    labelLayout: { hideOverlap: true },
  };
}
