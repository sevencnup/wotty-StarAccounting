import assert from "node:assert/strict";
import test from "node:test";
import { loadAvailableTransactionMonths } from "./transaction-months.ts";

test("loads available months without reading every transaction page", async () => {
  let calls = 0;
  const repository = {
    async getTransactionMonths(accountId) {
      calls += 1;
      assert.equal(accountId, "account-1");
      return ["2026-03", "invalid", "2026-01", "2026-03"];
    },
  };

  const months = await loadAvailableTransactionMonths(repository, "account-1");

  assert.deepEqual([...months].sort(), ["2026-01", "2026-03"]);
  assert.equal(calls, 1);
});
