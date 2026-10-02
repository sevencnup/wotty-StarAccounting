import assert from "node:assert/strict";
import test from "node:test";
import {
  BACKGROUND_NAVIGATION_RECOVERY_MS,
  appRoute,
  planTabNavigation,
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

test("reloads the selected tab directly after a background recovery", () => {
  assert.deepEqual(planTabNavigation("/app/savings", true), {
    mode: "reload",
    target: "/app/savings/",
  });
});

test("keeps normal tab switches on the client router", () => {
  assert.deepEqual(planTabNavigation("/app/consumption", false), {
    mode: "client",
    target: "/app/consumption/",
  });
});
