import assert from "node:assert/strict";
import test from "node:test";
import { clearNewEntryDraft, newEntryDraftKey, parseNewEntryDraft } from "./new-entry-drafts.ts";

test("new entry drafts use independent keys", () => {
  assert.notEqual(newEntryDraftKey("journal"), newEntryDraftKey("salary"));
  assert.notEqual(newEntryDraftKey("savings"), newEntryDraftKey("loan"));
});

test("new entry drafts parse invalid storage values safely", () => {
  assert.deepEqual(parseNewEntryDraft('{"amount":"1200"}'), { amount: "1200" });
  assert.equal(parseNewEntryDraft("not-json"), null);
  assert.equal(parseNewEntryDraft(null), null);
});

test("clearing a draft is safe outside the browser", () => {
  assert.doesNotThrow(() => clearNewEntryDraft("journal"));
});
