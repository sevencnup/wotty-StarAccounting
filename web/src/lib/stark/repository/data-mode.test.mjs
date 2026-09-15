import assert from "node:assert/strict";
import test from "node:test";
import { savingsGoalsPath, savingsPlansPath, transactionsImportPath } from "./remote-paths.ts";
import { selectDataRepository } from "./data-mode.ts";

test("cloud mode propagates remote read failures without reading local demo data", async () => {
  let localReads = 0;
  const remote = {
    getTransactions: async () => {
      throw new Error("cloud unavailable");
    },
  };
  const local = {
    getTransactions: async () => {
      localReads += 1;
      return [{ amount: 558 }];
    },
  };

  const repository = selectDataRepository("CLOUD", remote, local);

  await assert.rejects(() => repository.getTransactions("default"), /cloud unavailable/);
  assert.equal(localReads, 0);
});

test("local mode selects the IndexedDB repository", () => {
  const remote = { source: "cloud" };
  const local = { source: "local" };

  assert.equal(selectDataRepository("LOCAL", remote, local), local);
});

test("builds a targeted endpoint for remote savings plans", () => {
  assert.equal(savingsPlansPath("goal/a"), "/api/savings-plans?goalId=goal%2Fa");
});

test("builds a targeted endpoint for remote savings goals", () => {
  assert.equal(savingsGoalsPath("default/a"), "/api/savings-goals?accountId=default%2Fa");
});

test("builds the remote batch import endpoint for the selected account", () => {
  assert.equal(transactionsImportPath("default/a"), "/api/transactions/import?accountId=default%2Fa");
});
