import assert from "node:assert/strict";
import test from "node:test";

test("normal app mode keeps the established ledger database", async () => {
  const previousShowcaseMode = process.env.NEXT_PUBLIC_SHOWCASE_DEMO;
  delete process.env.NEXT_PUBLIC_SHOWCASE_DEMO;
  try {
    const { DB_NAME } = await import(`./indexeddb.ts?normal=${Date.now()}`);
    assert.equal(DB_NAME, "wotty-stark-web");
  } finally {
    if (previousShowcaseMode !== undefined) process.env.NEXT_PUBLIC_SHOWCASE_DEMO = previousShowcaseMode;
  }
});

test("showcase mode uses a separate ledger database", async () => {
  const previousShowcaseMode = process.env.NEXT_PUBLIC_SHOWCASE_DEMO;
  process.env.NEXT_PUBLIC_SHOWCASE_DEMO = "1";
  try {
    const { DB_NAME, showcaseDatabaseName } = await import(`./indexeddb.ts?showcase=${Date.now()}`);
    assert.equal(DB_NAME, "wotty-stark-showcase-web");
    assert.equal(showcaseDatabaseName("/phone-demo"), "wotty-stark-showcase-web-phone-demo");
    assert.equal(showcaseDatabaseName("/web-demo"), "wotty-stark-showcase-web-web-demo");
  } finally {
    if (previousShowcaseMode === undefined) delete process.env.NEXT_PUBLIC_SHOWCASE_DEMO;
    else process.env.NEXT_PUBLIC_SHOWCASE_DEMO = previousShowcaseMode;
  }
});
