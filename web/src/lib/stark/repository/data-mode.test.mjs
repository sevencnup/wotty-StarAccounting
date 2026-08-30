import assert from "node:assert/strict";
import test from "node:test";
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
