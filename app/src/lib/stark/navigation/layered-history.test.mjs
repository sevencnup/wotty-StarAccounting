import assert from "node:assert/strict";
import test from "node:test";
import {
  createLayerHistoryState,
  createLayerMarkerUrl,
  releaseLayerHistoryEntry,
  shouldDismissLayerFromHistory,
} from "./layered-history.ts";

test("opening a child layer preserves its parent history state", () => {
  assert.deepEqual(
    createLayerHistoryState({ starkJournal: "parent", next: { tree: true } }, "starkDatePicker", "child"),
    { starkJournal: "parent", next: { tree: true }, starkDatePicker: "child" },
  );
});

test("history back dismisses only the top layer", () => {
  const parentUrl = createLayerMarkerUrl("https://example.test/app/savings", "starkJournal", "parent", 100);
  const childUrl = createLayerMarkerUrl(parentUrl, "starkDatePicker", "child", 200);

  assert.equal(shouldDismissLayerFromHistory({ markerUrl: parentUrl }, parentUrl), false);
  assert.equal(shouldDismissLayerFromHistory({ markerUrl: childUrl }, parentUrl), true);
});

test("manual close consumes only an owned layer history entry", () => {
  assert.deepEqual(releaseLayerHistoryEntry(null), { entry: null, shouldGoBack: false });
  assert.deepEqual(
    releaseLayerHistoryEntry({ markerUrl: "https://example.test/app#stark-layer" }),
    { entry: null, shouldGoBack: true },
  );
});
