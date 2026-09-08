import test from "node:test";
import assert from "node:assert/strict";
import { defaultUiSettings, parseUiSettings } from "./ui-settings.ts";

test("ui settings fall back safely for invalid persisted values", () => {
  assert.deepEqual(parseUiSettings("not-json"), defaultUiSettings);
  assert.deepEqual(parseUiSettings(JSON.stringify({ font: "HUGE" })), defaultUiSettings);
});

test("ui settings preserve valid theme, language, and font choices", () => {
  assert.deepEqual(parseUiSettings(JSON.stringify({ theme: "GREEN", language: "ZH_CN", font: "LARGE" })), {
    theme: "GREEN",
    language: "ZH_CN",
    font: "LARGE",
  });
});
