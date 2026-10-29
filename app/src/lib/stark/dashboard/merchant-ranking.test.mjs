import assert from "node:assert/strict";
import test from "node:test";
import { buildMerchantRanking } from "./merchant-ranking.ts";

const base = {
  userId: "user",
  accountId: "default",
  category: "购物",
  platform: "支付宝",
  date: "2026-01-01 12:00:00",
  description: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

test("merges merchants and sorts by total expense", () => {
  const result = buildMerchantRanking([
    { ...base, id: "a1", type: "EXPENSE", merchant: "便利店", amount: 30 },
    { ...base, id: "a2", type: "EXPENSE", merchant: "便利店", amount: 70 },
    { ...base, id: "b1", type: "EXPENSE", merchant: "餐厅", amount: 80 },
    { ...base, id: "income", type: "INCOME", merchant: "公司", amount: 10000 },
  ]);

  assert.deepEqual(result.map(({ merchant, amount, count }) => ({ merchant, amount, count })), [
    { merchant: "便利店", amount: 100, count: 2 },
    { merchant: "餐厅", amount: 80, count: 1 },
  ]);
});

test("groups blank merchants and respects the top limit", () => {
  const transactions = Array.from({ length: 11 }, (_, index) => ({
    ...base,
    id: `merchant-${index}`,
    type: "EXPENSE",
    merchant: index === 0 ? " " : `商家${index}`,
    amount: 100 - index,
  }));

  const result = buildMerchantRanking(transactions, 10);

  assert.equal(result.length, 10);
  assert.equal(result[0].merchant, "其他商家");
  assert.equal(result[0].amount, 100);
});
