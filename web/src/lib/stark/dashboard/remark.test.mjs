import assert from "node:assert/strict";
import test from "node:test";
import { applyCategoryRule, applyCategoryRules, matchesCategoryKeyword, matchesCategoryRule } from "./remark.ts";

const base = {
  userId: "local-user",
  accountId: "default",
  amount: 3200,
  type: "TRANSFER",
  category: "转账",
  platform: "微信支付",
  merchant: "房东张三",
  date: "2026-08-16 10:00:00",
  description: "八月房租",
  paymentMethod: "零钱",
};

test("matches a keyword against WeChat or Alipay bill text", () => {
  assert.equal(matchesCategoryKeyword(base, "房东"), true);
  assert.equal(matchesCategoryKeyword({ ...base, platform: "支付宝", merchant: "李四", description: "房东水电" }, "房东"), true);
  assert.equal(matchesCategoryKeyword({ ...base, merchant: "便利店", description: "日用品" }, "房东"), false);
});

test("does not classify income even if the keyword matches", () => {
  assert.equal(matchesCategoryKeyword({ ...base, type: "INCOME" }, "房东"), false);
});

test("category rules are inactive until enabled", () => {
  const rule = { merchant: "房东", merchantKey: "房东", category: "房租水电", isActive: false };
  assert.equal(matchesCategoryRule(base, rule), false);
  assert.equal(matchesCategoryRule({ ...base, type: "EXPENSE" }, { ...rule, isActive: true }), true);
});

test("applies a rule while keeping unmatched transactions unchanged", () => {
  const rule = { merchant: "房东", merchantKey: "房东", category: "房租水电", isActive: true };
  const other = { ...base, id: "other", merchant: "便利店", description: "日用品" };
  const result = applyCategoryRule([base, other], rule);
  assert.equal(result[0].remarkCategory, "房租水电");
  assert.equal(result[1].remarkCategory, undefined);
});

test("later active rules can refine an earlier rule", () => {
  const first = { merchant: "房东", merchantKey: "房东", category: "住房", isActive: true };
  const second = { merchant: "张三", merchantKey: "张三", category: "房租水电", isActive: true };
  assert.equal(applyCategoryRules([base], [first, second])[0].remarkCategory, "房租水电");
});
