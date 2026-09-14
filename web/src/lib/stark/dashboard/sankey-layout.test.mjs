import assert from "node:assert/strict";
import test from "node:test";
import { sankeyLayoutOptions } from "./sankey-layout.ts";

test("uses a real Sankey layout pass and enough source-node gap for account labels", () => {
  const options = sankeyLayoutOptions();
  assert.equal(options.layoutIterations, 0);
  assert.ok(options.nodeGap >= 8);
  assert.ok((15 - 1) * options.nodeGap < 244);
  assert.ok(options.labelDistance >= 6);
  assert.equal(options.labelLayout.moveOverlap, "shiftY");
});
