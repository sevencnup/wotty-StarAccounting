import assert from "node:assert/strict";
import test from "node:test";
import { appVersionEndpoint, APP_UPDATE_BASE_URL, hasNewerAppVersion } from "./app-version.ts";

test("compares APK versions by version code instead of version name text", () => {
  assert.equal(hasNewerAppVersion(84, { versionCode: 85, versionName: "0.0.85" }), true);
  assert.equal(hasNewerAppVersion(84, { versionCode: 84, versionName: "9.9.9" }), false);
  assert.equal(hasNewerAppVersion(84, { versionCode: 83, versionName: "0.0.83" }), false);
});

test("builds the version endpoint without a duplicate slash", () => {
  assert.equal(appVersionEndpoint("http://localhost:12367/"), "http://localhost:12367/api/app/version");
});

test("uses the fixed StarAccounting update service", () => {
  assert.equal(appVersionEndpoint(APP_UPDATE_BASE_URL), "https://StarAccounting.wotty.app/api/app/version");
});
