export const SANKEY_NODE_GAP = 18;
export const SANKEY_LAYOUT_ITERATIONS = 32;
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
  };
}
