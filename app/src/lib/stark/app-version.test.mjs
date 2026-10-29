import assert from "node:assert/strict";
import test from "node:test";
import { APP_UPDATE_URL, hasNewerAppVersion } from "./app-version.ts";

test("compares APK versions by version code instead of version name text", () => {
  assert.equal(hasNewerAppVersion(84, { versionCode: 85, versionName: "0.0.85" }), true);
  assert.equal(hasNewerAppVersion(84, { versionCode: 84, versionName: "9.9.9" }), false);
  assert.equal(hasNewerAppVersion(84, { versionCode: 83, versionName: "0.0.83" }), false);
});

test("uses the exact StarAccounting update manifest URL", () => {
  assert.equal(APP_UPDATE_URL, "https://s.wotty.app/version.json");
});
