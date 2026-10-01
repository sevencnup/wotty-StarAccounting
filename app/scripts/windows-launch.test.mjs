import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptsDirectory, "..", "..");

test("Windows launcher keeps cmd parsing separate from service startup", () => {
  const launcher = readFileSync(path.join(projectDirectory, "一键启动.bat"), "utf8");

  assert.match(launcher, /dev-ports\.mjs/);
  assert.match(launcher, /dev-window\.bat %WEB_PORT% %API_PORT%/);
  assert.match(launcher, /windows-launch\.mjs\" %WEB_PORT% %API_PORT%/);
  assert.doesNotMatch(launcher, /powershell -NoProfile -Command/);
  assert.doesNotMatch(launcher, /&&/);
});
