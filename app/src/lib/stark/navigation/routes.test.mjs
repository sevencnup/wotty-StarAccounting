import assert from "node:assert/strict";
import test from "node:test";
import { appRoute } from "./routes.ts";

test("normalizes static app routes with a trailing slash", () => {
  assert.equal(appRoute("/budgets"), "/budgets/");
  assert.equal(appRoute("budgets"), "/budgets/");
  assert.equal(appRoute("/budgets/"), "/budgets/");
});
