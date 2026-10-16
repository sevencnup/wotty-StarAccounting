import assert from "node:assert/strict";
import test from "node:test";
import {
  BACKGROUND_NAVIGATION_RECOVERY_MS,
  appRoute,
  isPrimaryTabPath,
  navigationRecoveryUrl,
  planBackgroundResume,
  shouldRecoverNavigation,
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
  assert.equal(shouldRecoverNavigation(null, 20_000), false);
});

test("recovers navigation when a page is restored from the back-forward cache", () => {
  assert.equal(shouldRecoverNavigation(null, 20_000, true), true);
});

test("returns through the root entry when recovering from a long background pause", () => {
  assert.deepEqual(planBackgroundResume(10_000, 10_000 + BACKGROUND_NAVIGATION_RECOVERY_MS, "/app/savings"), {
    mode: "restart",
    target: "/?next=%2Fapp%2Fsavings%2F&resume-navigation=1",
  });
});

test("keeps the active page search and hash while restarting navigation", () => {
  assert.equal(
    navigationRecoveryUrl("/app/loans", "?month=2026-10", "#records"),
    "/?next=%2Fapp%2Floans%2F%3Fmonth%3D2026-10%23records&resume-navigation=1",
  );
});

test("does not restart after a short background pause", () => {
  assert.deepEqual(planBackgroundResume(10_000, 10_001, "/app"), { mode: "none" });
});
