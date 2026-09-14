export const SANKEY_NODE_GAP = 18;
export const SANKEY_LAYOUT_ITERATIONS = 32;
export const SANKEY_LABEL_DISTANCE = 8;
export const SANKEY_LAYOUT_HEIGHT = 244;

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

/**
 * Keep source/account nodes together while leaving enough room for their
 * labels. ECharts' relaxation pass can otherwise move low-volume sources to
 * opposite ends of the chart to follow the category nodes.
 *
 * Values are normalized to the Sankey layout height because ECharts uses
 * localY * height when rendering manually positioned nodes.
 */
export function sankeySourceNodeLocalY(
  sourceValues: number[],
  categoryCount: number,
  availableHeight = SANKEY_LAYOUT_HEIGHT,
) {
  if (!sourceValues.length || availableHeight <= 0) return [];

  const total = sourceValues.reduce((sum, value) => sum + Math.max(0, value), 0);
  if (total <= 0) {
    const groupGap = Math.min(SANKEY_NODE_GAP, availableHeight / Math.max(1, sourceValues.length));
    const groupHeight = groupGap * sourceValues.length;
    const start = Math.max(0, (availableHeight - groupHeight) / 2);
    return sourceValues.map((_, index) => (start + index * groupGap) / availableHeight);
  }

  const categoryGapSpace = Math.max(0, categoryCount - 1) * SANKEY_NODE_GAP;
  const scale = Math.max(0, availableHeight - categoryGapSpace) / total;
  const sourceHeights = sourceValues.map((value) => Math.max(0, value) * scale);
  const sourceGapSpace = Math.max(0, sourceValues.length - 1) * SANKEY_NODE_GAP;
  const sourceGroupHeight = sourceHeights.reduce((sum, height) => sum + height, 0) + sourceGapSpace;
  const start = Math.max(0, (availableHeight - sourceGroupHeight) / 2);

  let cursor = start;
  return sourceHeights.map((height) => {
    const position = Math.min(1, Math.max(0, cursor / availableHeight));
    cursor += height + SANKEY_NODE_GAP;
    return position;
  });
}
