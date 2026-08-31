import assert from "node:assert/strict";
import test from "node:test";
import { buildDailyPlatformData, buildPlatformCategoryFlow, normalizeConsumptionPlatform } from "./consumption-platforms.ts";

const july = new Date(2026, 6, 31);

test("normalizes WeChat payment aliases to the WeChat platform", () => {
  assert.equal(normalizeConsumptionPlatform("微信支付"), "微信");
  assert.equal(normalizeConsumptionPlatform("微信钱包"), "微信");
  assert.equal(normalizeConsumptionPlatform("支付宝余额"), "支付宝");
});

test("keeps aliased WeChat transactions in the Sankey flow", () => {
  const result = buildPlatformCategoryFlow([
    { amount: 2120, category: "房租", platform: "微信支付", type: "EXPENSE" },
    { amount: 88, category: "餐饮", platform: "支付宝", type: "EXPENSE" },
  ]);

  assert.deepEqual(result.activePlatforms, ["微信", "支付宝"]);
  assert.equal(result.flow["微信"]["房租"], 2120);
  assert.equal(result.flow["支付宝"]["餐饮"], 88);
});

test("groups an unknown expense platform under other", () => {
  const result = buildDailyPlatformData([
    { amount: 1268, date: "2026-07-20 21:16:00", platform: "京东", type: "EXPENSE" },
  ], july);

  assert.deepEqual(result.activePlatforms, ["其他"]);
  assert.equal(result.platformDaily["其他"][19], 1268);
});

test("keeps other alongside known active platforms", () => {
  const result = buildDailyPlatformData([
    { amount: 88, date: "2026-07-16 12:20:00", platform: "支付宝", type: "EXPENSE" },
    { amount: 1268, date: "2026-07-20 21:16:00", platform: "京东", type: "EXPENSE" },
  ], july);

  assert.deepEqual(result.activePlatforms, ["支付宝", "其他"]);
  assert.equal(result.platformDaily["支付宝"][15], 88);
  assert.equal(result.platformDaily["其他"][19], 1268);
});

test("uses the selected leap month and excludes other months", () => {
  const result = buildDailyPlatformData([
    { amount: 29, date: "2024-02-29 12:00:00", platform: "微信", type: "EXPENSE" },
    { amount: 31, date: "2024-03-01 12:00:00", platform: "微信", type: "EXPENSE" },
  ], new Date(2024, 1, 1));

  assert.equal(result.days.length, 29);
  assert.equal(result.platformDaily["微信"][28], 29);
  assert.equal(result.platformDaily["微信"].reduce((sum, amount) => sum + amount, 0), 29);
});
