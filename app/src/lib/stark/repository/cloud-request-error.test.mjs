import assert from "node:assert/strict";
import test from "node:test";
import { CloudRequestError, isCloudAuthenticationFailure } from "./cloud-request-error.ts";

test("treats only an explicit 401 response as an invalid cloud login", () => {
  assert.equal(isCloudAuthenticationFailure(new CloudRequestError("unauthorized", 401)), true);
  assert.equal(isCloudAuthenticationFailure(new CloudRequestError("forbidden", 403)), false);
  assert.equal(isCloudAuthenticationFailure(new Error("network unavailable")), false);
});
