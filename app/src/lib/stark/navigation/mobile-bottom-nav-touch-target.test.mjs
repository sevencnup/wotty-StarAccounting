import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const globalStyles = readFileSync(new URL("../../../app/globals.css", import.meta.url), "utf8");

function ruleBody(selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return globalStyles.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`))?.[1] ?? "";
}

test("bottom navigation has no untappable vertical gutter", () => {
  const containerRule = ruleBody(".mobile-bottom-nav-inner");
  const itemRule = ruleBody(".mobile-bottom-nav-item");
  const minimumHeight = Number(itemRule.match(/min-height:\s*(\d+)px/)?.[1] ?? 0);

  assert.match(containerRule, /padding:\s*0\s+6px\s*;/);
  assert.ok(minimumHeight >= 48, `expected a touch target of at least 48px, received ${minimumHeight}px`);
});
