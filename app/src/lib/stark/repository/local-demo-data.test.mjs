import assert from "node:assert/strict";
import test from "node:test";
import { isLocalDemoRecord, isLocalDemoSavingsGoal } from "./local-demo-data.ts";

test("recognizes only fixed local demo record IDs", () => {
  assert.equal(isLocalDemoRecord("transactions", "txn-demo-food"), true);
  assert.equal(isLocalDemoRecord("assets", "asset-demo-bank"), true);
  assert.equal(isLocalDemoRecord("transactions", "account-user-imported"), false);
  assert.equal(isLocalDemoRecord("savingsPlans", "plan-user-created"), false);
});

test("recognizes legacy demo savings goals for related plan cleanup", () => {
  assert.equal(isLocalDemoSavingsGoal("goal-demo-travel"), true);
  assert.equal(isLocalDemoSavingsGoal("goal-user-created"), false);
});
