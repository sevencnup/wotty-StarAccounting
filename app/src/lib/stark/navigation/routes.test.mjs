import assert from "node:assert/strict";
import test from "node:test";
import {
  appRoute,
  isPrimaryTabPath,
  shouldRestorePrimaryTabAfterHistoryBack,
} from "./routes.ts";

test("normalizes static app routes with a trailing slash", () => {
  assert.equal(appRoute("/budgets"), "/budgets/");
  assert.equal(appRoute("budgets"), "/budgets/");
  assert.equal(appRoute("/budgets/"), "/budgets/");
});

test("recognizes only bottom-navigation routes as primary tabs", () => {
  assert.equal(isPrimaryTabPath("/app/savings/"), true);
  assert.equal(isPrimaryTabPath("/app/accounts"), true);
  assert.equal(isPrimaryTabPath("/app/journal"), false);
  assert.equal(isPrimaryTabPath("/app/budgets"), false);
});

test("restores the current primary tab when stale history lands on another tab", () => {
  assert.equal(
    shouldRestorePrimaryTabAfterHistoryBack("/app/savings/", "/app/consumption/", false),
    true,
  );
});

test("does not intercept a layer close, same tab entry, or independent route", () => {
  assert.equal(
    shouldRestorePrimaryTabAfterHistoryBack("/app/savings", "/app/consumption", true),
    false,
  );
  assert.equal(
    shouldRestorePrimaryTabAfterHistoryBack("/app/savings", "/app/savings/", false),
    false,
  );
  assert.equal(
    shouldRestorePrimaryTabAfterHistoryBack("/app/journal", "/app/savings", false),
    false,
  );
});
