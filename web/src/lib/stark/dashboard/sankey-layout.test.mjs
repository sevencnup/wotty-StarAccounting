import assert from "node:assert/strict";
import test from "node:test";
import { sankeyLayoutOptions, sankeySourceNodeLocalY } from "./sankey-layout.ts";

test("uses a real Sankey layout pass and enough source-node gap for account labels", () => {
  const options = sankeyLayoutOptions();
  assert.equal(options.layoutIterations, 32);
  assert.ok(options.nodeGap >= 14);
  assert.ok(options.labelDistance >= 6);
});

test("keeps source account nodes grouped in the middle of the chart", () => {
  const positions = sankeySourceNodeLocalY([100, 300], 6);
  assert.equal(positions.length, 2);
  assert.ok(positions[0] > 0);
  assert.ok(positions[1] > positions[0]);
  assert.ok(positions[1] < 0.8);
});
