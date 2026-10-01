import assert from "node:assert/strict";
import test from "node:test";

function installBrowser(url, savedApiUrl) {
  const storage = new Map();
  if (savedApiUrl) storage.set("wotty-stark:cloud-api-url", savedApiUrl);
  globalThis.window = {
    location: new URL(url),
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    },
  };
  return storage;
}

test("keeps the local API port when the Web dev server uses port 12366", async () => {
  const storage = installBrowser("http://localhost:12366", "http://localhost:12367");
  const { getCloudApiUrl } = await import(`./local-config.ts?dev-port=${Date.now()}`);

  assert.equal(getCloudApiUrl(), "http://localhost:12367");
  assert.equal(storage.get("wotty-stark:cloud-api-url"), "http://localhost:12367");
});

test("repairs a development Web port mistakenly stored as the API address", async () => {
  const storage = installBrowser("http://localhost:12366", "http://localhost:12366");
  const { getCloudApiUrl } = await import(`./local-config.ts?repair-port=${Date.now()}`);

  assert.equal(getCloudApiUrl(), "http://localhost:12367");
  assert.equal(storage.get("wotty-stark:cloud-api-url"), "http://localhost:12367");
});

test("keeps a standard-port deployment on its same-origin API", async () => {
  const storage = installBrowser("https://star-accounting.example", "https://star-accounting.example:12367");
  const { getCloudApiUrl } = await import(`./local-config.ts?standard-origin=${Date.now()}`);

  assert.equal(getCloudApiUrl(), "https://star-accounting.example");
  assert.equal(storage.get("wotty-stark:cloud-api-url"), "https://star-accounting.example");
});

test("repairs a stale adjacent localhost API port after the Web port changes", async () => {
  const previousApiPort = process.env.NEXT_PUBLIC_API_PORT;
  process.env.NEXT_PUBLIC_API_PORT = "12462";
  const storage = installBrowser("http://localhost:12461", "http://localhost:12367");
  try {
    const { getCloudApiUrl } = await import(`./local-config.ts?stale-dev-port=${Date.now()}`);

    assert.equal(getCloudApiUrl(), "http://localhost:12462");
    assert.equal(storage.get("wotty-stark:cloud-api-url"), "http://localhost:12462");
  } finally {
    if (previousApiPort === undefined) delete process.env.NEXT_PUBLIC_API_PORT;
    else process.env.NEXT_PUBLIC_API_PORT = previousApiPort;
  }
});
