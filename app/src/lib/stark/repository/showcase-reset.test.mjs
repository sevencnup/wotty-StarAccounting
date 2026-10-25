import assert from "node:assert/strict";
import test from "node:test";
import { clearShowcaseStorage } from "./showcase-storage-keys.ts";

function storageWith(entries) {
  const data = new Map(entries);
  return {
    get length() { return data.size; },
    key(index) { return [...data.keys()][index] ?? null; },
    getItem(key) { return data.get(key) ?? null; },
    removeItem(key) { data.delete(key); },
    data,
  };
}

test("showcase refresh clears only temporary demo keys", () => {
  const storage = storageWith([
    ["wotty-stark:showcase:reporting-month", "2026-08"],
    ["wotty-stark:showcase:new-entry-draft:journal", "draft"],
    ["wotty:showcase:auto-month-v1:2026-10", "2026-10-25"],
    ["showcase:stark:journal-variant", "savings"],
    ["wotty-stark:reporting-month", "2025-02"],
    ["site:theme", "dark"],
  ]);

  clearShowcaseStorage(storage);

  assert.deepEqual([...storage.data], [
    ["wotty-stark:reporting-month", "2025-02"],
    ["site:theme", "dark"],
  ]);
});
