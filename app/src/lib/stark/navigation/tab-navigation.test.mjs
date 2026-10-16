import assert from "node:assert/strict";
import test from "node:test";
import { createTabNavigation, TAB_NAVIGATION_TIMEOUT_MS } from "./tab-navigation.ts";

function setup(t) {
  t.mock.timers.enable({ apis: ["Date", "setTimeout"], now: 1_000 });
  const clientNavigations = [];
  const documentNavigations = [];
  const pendingChanges = [];
  let recoverable = true;
  let routerThrows = false;
  const navigation = createTabNavigation({
    now: Date.now,
    schedule: setTimeout,
    cancel: clearTimeout,
    canRecover: () => recoverable,
    replace: (target) => {
      clientNavigations.push(target);
      if (routerThrows) throw new Error("Router is unavailable");
    },
    replaceDocument: (target) => documentNavigations.push(target),
    onPendingChange: (target) => pendingChanges.push(target),
  });
  return {
    navigation, clientNavigations, documentNavigations, pendingChanges,
    tick: (time) => t.mock.timers.tick(time),
    setRecoverable: (value) => { recoverable = value; },
    failRouter: () => { routerThrows = true; },
  };
}

test("a committed client navigation cancels document recovery", (t) => {
  const h = setup(t);
  h.navigation.select("/app/savings/", "/app");
  h.navigation.committed("/app/savings");
  h.tick(TAB_NAVIGATION_TIMEOUT_MS * 2);
  assert.deepEqual(h.clientNavigations, ["/app/savings/"]);
  assert.deepEqual(h.pendingChanges, ["/app/savings/", null]);
  assert.deepEqual(h.documentNavigations, []);
});

test("a hung route recovers once without a background event", (t) => {
  const h = setup(t);
  h.navigation.select("/app/savings/", "/app");
  h.tick(TAB_NAVIGATION_TIMEOUT_MS - 1);
  assert.deepEqual(h.documentNavigations, []);
  h.tick(1);
  h.navigation.resume();
  h.tick(TAB_NAVIGATION_TIMEOUT_MS);
  assert.deepEqual(h.documentNavigations, ["/app/savings/"]);
});

test("repeated taps do not extend the deadline or enqueue duplicate transitions", (t) => {
  const h = setup(t);
  h.navigation.select("/app/savings/", "/app");
  h.tick(TAB_NAVIGATION_TIMEOUT_MS / 2);
  h.navigation.select("/app/savings/", "/app");
  h.tick(TAB_NAVIGATION_TIMEOUT_MS / 2);
  assert.deepEqual(h.clientNavigations, ["/app/savings/"]);
  assert.deepEqual(h.documentNavigations, ["/app/savings/"]);
});

test("only the last selected tab can recover, even if an earlier route commits late", (t) => {
  const h = setup(t);
  h.navigation.select("/app/savings/", "/app");
  h.tick(500);
  h.navigation.select("/app/accounts/", "/app");
  h.navigation.committed("/app/savings/");
  h.tick(TAB_NAVIGATION_TIMEOUT_MS - 500);
  assert.deepEqual(h.documentNavigations, []);
  h.tick(500);
  assert.deepEqual(h.documentNavigations, ["/app/accounts/"]);
});

test("hidden or offline pages recover only after becoming available again", (t) => {
  const h = setup(t);
  h.navigation.select("/app/savings/", "/app");
  h.setRecoverable(false);
  h.navigation.resume();
  h.tick(TAB_NAVIGATION_TIMEOUT_MS * 3);
  h.navigation.resume();
  assert.deepEqual(h.documentNavigations, []);
  h.setRecoverable(true);
  h.navigation.resume();
  assert.deepEqual(h.documentNavigations, ["/app/savings/"]);
});

test("short suspension preserves the original navigation deadline", (t) => {
  const h = setup(t);
  h.navigation.select("/app/savings/", "/app");
  h.setRecoverable(false);
  h.navigation.resume();
  h.tick(500);
  h.setRecoverable(true);
  h.navigation.resume();
  h.tick(TAB_NAVIGATION_TIMEOUT_MS - 501);
  assert.deepEqual(h.documentNavigations, []);
  h.tick(1);
  assert.deepEqual(h.documentNavigations, ["/app/savings/"]);
});

test("returning from background with no pending navigation never reloads a form", (t) => {
  const h = setup(t);
  h.tick(90_000);
  h.navigation.resume();
  assert.deepEqual(h.documentNavigations, []);
  assert.deepEqual(h.clientNavigations, []);
});

test("selecting the active tab is idle unless it must cancel another pending transition", (t) => {
  const h = setup(t);
  h.navigation.select("/app/", "/app");
  assert.deepEqual(h.clientNavigations, []);
  h.navigation.select("/app/savings/", "/app");
  h.navigation.select("/app/", "/app");
  h.tick(TAB_NAVIGATION_TIMEOUT_MS);
  assert.deepEqual(h.documentNavigations, ["/app/"]);
});

test("an unavailable router recovers immediately", (t) => {
  const h = setup(t);
  h.failRouter();
  h.navigation.select("/app/savings/", "/app");
  assert.deepEqual(h.documentNavigations, ["/app/savings/"]);
  h.tick(TAB_NAVIGATION_TIMEOUT_MS);
  assert.equal(h.documentNavigations.length, 1);
});

test("cancelling a pending transition while offline does not discard the current document", (t) => {
  const h = setup(t);
  h.setRecoverable(false);
  h.navigation.select("/app/savings/", "/app");
  h.navigation.select("/app/", "/app");
  h.tick(TAB_NAVIGATION_TIMEOUT_MS);
  assert.deepEqual(h.documentNavigations, []);
  h.setRecoverable(true);
  h.navigation.resume();
  assert.deepEqual(h.documentNavigations, ["/app/"]);
});

test("unmount cancels recovery and ignores subsequent events", (t) => {
  const h = setup(t);
  h.navigation.select("/app/savings/", "/app");
  h.navigation.dispose();
  h.tick(TAB_NAVIGATION_TIMEOUT_MS);
  h.navigation.resume();
  h.navigation.select("/app/accounts/", "/app");
  assert.deepEqual(h.documentNavigations, []);
  assert.deepEqual(h.clientNavigations, ["/app/savings/"]);
});
