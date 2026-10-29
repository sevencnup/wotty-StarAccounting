import assert from "node:assert/strict";
import test from "node:test";
import { clearNewEntryDraft, newEntryDraftKey, parseNewEntryDraft } from "./new-entry-drafts.ts";

test("new entry drafts use independent keys", () => {
  assert.notEqual(newEntryDraftKey("journal"), newEntryDraftKey("salary"));
  assert.notEqual(newEntryDraftKey("savings"), newEntryDraftKey("loan"));
});

test("scoped savings drafts stay isolated per goal and preserve the new-entry key", () => {
  assert.equal(newEntryDraftKey("savings"), "wotty-stark:new-entry-draft:savings");
  assert.equal(newEntryDraftKey("savings", "goal-a"), "wotty-stark:new-entry-draft:savings:goal-a");
  assert.notEqual(newEntryDraftKey("savings", "goal-a"), newEntryDraftKey("savings", "goal-b"));
});

test("new entry drafts parse invalid storage values safely", () => {
  assert.deepEqual(parseNewEntryDraft('{"amount":"1200"}'), { amount: "1200" });
  assert.equal(parseNewEntryDraft("not-json"), null);
  assert.equal(parseNewEntryDraft(null), null);
});

test("clearing a draft is safe outside the browser", () => {
  assert.doesNotThrow(() => clearNewEntryDraft("journal"));
});
