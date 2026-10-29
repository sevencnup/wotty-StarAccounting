import assert from "node:assert/strict";
import test from "node:test";

import { createId } from "./id.ts";

test("creates an id with the requested prefix", () => {
  const id = createId("savings-goal");
  assert.match(id, /^savings-goal-/);
});

test("creates distinct ids for consecutive records", () => {
  const ids = new Set(Array.from({ length: 20 }, () => createId("record")));
  assert.equal(ids.size, 20);
});
