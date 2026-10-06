import assert from "node:assert/strict";
import test from "node:test";
import {
  BACKGROUND_NAVIGATION_RECOVERY_MS,
  appRoute,
  isPrimaryTabPath,
  planBackgroundResume,
  planTabNavigation,
  shouldRestorePrimaryTabAfterHistoryBack,
  shouldRecoverNavigation,
} from "./routes.ts";

test("normalizes static app routes with a trailing slash", () => {
  assert.equal(appRoute("/budgets"), "/budgets/");
  assert.equal(appRoute("budgets"), "/budgets/");
  assert.equal(appRoute("/budgets/"), "/budgets/");
});

test("recovers navigation after a long background pause", () => {
  const backgroundedAt = 10_000;
  assert.equal(
    shouldRecoverNavigation(backgroundedAt, backgroundedAt + BACKGROUND_NAVIGATION_RECOVERY_MS),
    true,
  );
});

test("keeps client navigation after a short background pause", () => {
  const backgroundedAt = 10_000;
  assert.equal(
    shouldRecoverNavigation(backgroundedAt, backgroundedAt + BACKGROUND_NAVIGATION_RECOVERY_MS - 1),
    false,
  );
  assert.equal(shouldRecoverNavigation(null, 20_000), false);
});

test("recovers navigation when a page is restored from the back-forward cache", () => {
  assert.equal(shouldRecoverNavigation(null, 20_000, true), true);
});

test("refreshes the current route immediately after a long background resume", () => {
  const backgroundedAt = 10_000;
  assert.deepEqual(
    planBackgroundResume(backgroundedAt, backgroundedAt + BACKGROUND_NAVIGATION_RECOVERY_MS),
    { mode: "reload-current" },
  );
});

test("does not reload the current route after a short background pause", () => {
  assert.deepEqual(planBackgroundResume(10_000, 10_001), { mode: "none" });
});

test("reloads the selected tab directly after a background recovery", () => {
  assert.deepEqual(planTabNavigation("/app/savings", true), {
    mode: "reload",
    target: "/app/savings/",
  });
});

test("replaces the current history entry for normal tab switches", () => {
  assert.deepEqual(planTabNavigation("/app/consumption", false), {
    mode: "replace",
    target: "/app/consumption/",
  });
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
