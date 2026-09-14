import assert from "node:assert/strict";
import test from "node:test";
import { sankeyLayoutOptions } from "./sankey-layout.ts";

test("uses automatic Sankey layout with a safe gap and hidden colliding labels", () => {
  const options = sankeyLayoutOptions();
  assert.equal(options.layoutIterations, 32);
  assert.ok(options.nodeGap >= 8);
  assert.ok((15 - 1) * options.nodeGap < 244);
  assert.ok(options.labelDistance >= 6);
  assert.equal(options.labelLayout.hideOverlap, true);
});
