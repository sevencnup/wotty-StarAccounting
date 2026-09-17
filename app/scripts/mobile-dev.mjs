import { spawn, spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const webDirectory = path.resolve(scriptDirectory, "..");
const port = Number.parseInt(getOption("--port") ?? process.env.CAP_LIVE_RELOAD_PORT ?? "12366", 10);
const target = getOption("--target") ?? process.env.CAP_LIVE_RELOAD_TARGET ?? detectAdbTarget();
const host = getOption("--host") ?? process.env.CAP_LIVE_RELOAD_HOST ?? detectHost(target);
const pnpmCommand = process.platform === "win32" ? (process.env.ComSpec || "cmd.exe") : "pnpm";
const pnpmPrefixArgs = process.platform === "win32" ? ["/d", "/c", "pnpm.cmd"] : [];

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error(`Invalid live reload port: ${port}`);
}
if (!target) {
  throw new Error("No ADB device found. Connect a phone first, then run this command again.");
}
if (!host) {
  throw new Error("Could not determine the computer LAN address. Pass --host <电脑IP> explicitly.");
}

let webProcess;
let capacitorProcess;
let shuttingDown = false;

function getOption(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function detectAdbTarget() {
  const result = spawnSync("adb", ["devices"], { encoding: "utf8", windowsHide: true });
  if (result.status !== 0) return "";
  const line = result.stdout
    .split(/\r?\n/)
    .map((value) => value.trim())
    .find((value) => value && !value.startsWith("List of devices") && /\sdevice$/.test(value));
  return line?.split(/\s+/)[0] ?? "";
}

function detectHost(deviceTarget) {
  const targetHost = deviceTarget.split(":")[0];
  const addresses = Object.values(os.networkInterfaces())
    .flatMap((items) => items ?? [])
    .filter((item) => item.family === "IPv4" && !item.internal && !item.address.startsWith("169.254."))
    .map((item) => item.address);

  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(targetHost)) {
    const targetPrefix = targetHost.split(".").slice(0, 3).join(".");
    const sameSubnet = addresses.find((address) => address.split(".").slice(0, 3).join(".") === targetPrefix);
    if (sameSubnet) return sameSubnet;
  }

  return addresses[0] ?? "";
}

function waitForPort(portNumber, timeoutMs = 60000) {
  const startedAt = Date.now();
  return new Promise((resolve, reject) => {
    const probe = () => {
      const socket = net.createConnection({ host: "127.0.0.1", port: portNumber });
      socket.once("connect", () => {
        socket.destroy();
        resolve();
      });
      socket.once("error", () => {
        socket.destroy();
        if (Date.now() - startedAt >= timeoutMs) {
          reject(new Error(`Web dev server did not start on port ${portNumber}.`));
          return;
        }
        setTimeout(probe, 250);
      });
    };
    probe();
  });
}

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: webDirectory,
      stdio: "inherit",
      windowsHide: false,
    });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`${command} exited with signal ${signal}`));
        return;
      }
      if (code !== 0) {
        reject(new Error(`${command} exited with code ${code}`));
        return;
      }
      resolve();
    });
  });
}

function killWindowsProcess(pid) {
  return new Promise((resolve) => {
    const killer = spawn(
      "taskkill.exe",
      ["/PID", String(pid), "/T", "/F"],
      { stdio: "ignore", windowsHide: true },
    );
    killer.once("error", resolve);
    killer.once("close", resolve);
  });
}

function killWindowsProcessSync(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return;
  spawnSync("taskkill.exe", ["/PID", String(pid), "/T", "/F"], {
    stdio: "ignore",
    windowsHide: true,
  });
}

function stopProcessTree(child) {
  if (!child?.pid) return Promise.resolve();

  if (process.platform === "win32") {
    return killWindowsProcess(child.pid);
  }

  if (child.exitCode !== null || child.signalCode !== null) return Promise.resolve();

  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    const timer = setTimeout(finish, 5000);
    child.once("close", () => {
      clearTimeout(timer);
      finish();
    });
    child.kill("SIGTERM");
  });
}

async function shutdown(code) {
  if (shuttingDown) return;
  shuttingDown = true;
  await stopProcessTree(capacitorProcess);
  await stopProcessTree(webProcess);
  process.exitCode = code;
}

process.once("exit", () => {
  if (process.platform !== "win32") return;
  killWindowsProcessSync(capacitorProcess?.pid);
  killWindowsProcessSync(webProcess?.pid);
});

function handleChildExit(name, code, signal) {
  if (shuttingDown) return;
  const result = signal ? 1 : code ?? 1;
  process.stderr.write(`[${name}] exited with ${signal ? `signal ${signal}` : `code ${code}`}\n`);
  void shutdown(result);
}

process.once("SIGINT", () => void shutdown(0));
process.once("SIGTERM", () => void shutdown(0));
process.once("SIGBREAK", () => void shutdown(0));

process.stdout.write(`Live Reload target: ${target}\n`);
process.stdout.write(`Live Reload URL: http://${host}:${port}\n`);
process.stdout.write("Preparing the initial Web build for Capacitor sync...\n");
rmSync(path.join(webDirectory, ".next", "dev"), { recursive: true, force: true });
try {
  await runCommand(pnpmCommand, [...pnpmPrefixArgs, "build"]);
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
  process.exit();
}

process.stdout.write("Starting Web and API development servers...\n");
webProcess = spawn(process.execPath, [path.join(webDirectory, "scripts", "dev.mjs")], {
  cwd: webDirectory,
  stdio: "inherit",
  windowsHide: false,
});
webProcess.once("error", (error) => {
  process.stderr.write(`[web] ${error.message}\n`);
  void shutdown(1);
});
webProcess.once("exit", (code, signal) => handleChildExit("web", code, signal));

try {
  await waitForPort(port);
  if (shuttingDown) process.exit(0);
  process.stdout.write("Starting Capacitor Android Live Reload...\n");
  capacitorProcess = spawn(pnpmCommand, [...pnpmPrefixArgs, "exec", "cap", "run", "android", "--live-reload", "--host", host, "--port", String(port), "--target", target], {
    cwd: webDirectory,
    stdio: "inherit",
    windowsHide: false,
  });
  capacitorProcess.once("error", (error) => {
    process.stderr.write(`[capacitor] ${error.message}\n`);
    void shutdown(1);
  });
  capacitorProcess.once("exit", (code, signal) => handleChildExit("capacitor", code, signal));
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  await shutdown(1);
}
