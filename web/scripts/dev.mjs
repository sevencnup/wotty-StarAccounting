import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const webDirectory = path.resolve(scriptDirectory, "..");
const repositoryDirectory = path.resolve(webDirectory, "..");
const children = new Map();
let shuttingDown = false;
let shutdownPromise;

function prefixOutput(name, stream) {
  let pending = "";
  stream.on("data", (chunk) => {
    pending += chunk.toString();
    const lines = pending.split(/\r?\n/);
    pending = lines.pop() ?? "";
    for (const line of lines) {
      if (line) process.stdout.write(`[${name}] ${line}\n`);
    }
  });
  stream.on("end", () => {
    if (pending) process.stdout.write(`[${name}] ${pending}\n`);
  });
}

function registerChild(name, child) {
  children.set(name, child);
  if (child.stdout) prefixOutput(name, child.stdout);
  if (child.stderr) prefixOutput(name, child.stderr);
  child.on("error", (error) => {
    process.stderr.write(`[${name}] ${error.message}\n`);
    void shutdown(1);
  });
  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    const result = signal ? 1 : code ?? 1;
    process.stderr.write(`[${name}] exited with ${signal ? `signal ${signal}` : `code ${code}`}\n`);
    void shutdown(result);
  });
}

function startWeb() {
  let nextCli;
  try {
    nextCli = require.resolve("next/dist/bin/next");
  } catch {
    throw new Error("Next.js CLI not found. Run pnpm install from the workspace root.");
  }

  return spawn(process.execPath, [nextCli, "dev", "--turbopack", "-H", "0.0.0.0", "-p", "12366"], {
    cwd: webDirectory,
    stdio: ["inherit", "pipe", "pipe"],
  });
}

function startApi() {
  if (process.platform === "win32") {
    const gradleWrappers = [
      path.join(repositoryDirectory, "gradlew.bat"),
      path.join(webDirectory, "android", "gradlew.bat"),
    ];
    const gradleWrapper = gradleWrappers.find((candidate) => existsSync(candidate));
    if (!gradleWrapper) {
      throw new Error(
        `Windows Gradle wrapper not found: ${gradleWrappers.join(", ")}`,
      );
    }

    return spawn(
      process.env.ComSpec || "cmd.exe",
      ["/d", "/c", gradleWrapper, "-p", "api-server", "run", "--no-daemon"],
      {
        cwd: repositoryDirectory,
        stdio: ["inherit", "pipe", "pipe"],
        windowsHide: false,
      },
    );
  }

  const gradleWrappers = [
    path.join(repositoryDirectory, "gradlew"),
    path.join(webDirectory, "android", "gradlew"),
  ];
  const gradleWrapper = gradleWrappers.find((candidate) => existsSync(candidate));
  if (!gradleWrapper) {
    throw new Error(`Gradle wrapper not found: ${gradleWrappers.join(", ")}`);
  }

  return spawn(gradleWrapper, ["-p", "api-server", "run", "--no-daemon"], {
    cwd: repositoryDirectory,
    stdio: ["inherit", "pipe", "pipe"],
  });
}

function getWindowsProcessTree(rootPid) {
  const script = [
    "$root = "+rootPid,
    "$processes = @(Get-CimInstance Win32_Process | Select-Object ProcessId, ParentProcessId)",
    "$pending = New-Object System.Collections.Generic.Queue[int]",
    "$pending.Enqueue($root)",
    "$ids = New-Object System.Collections.Generic.List[int]",
    "while ($pending.Count -gt 0) {",
    "  $parent = $pending.Dequeue()",
    "  foreach ($process in $processes) {",
    "    if ($process.ParentProcessId -eq $parent -and -not $ids.Contains([int]$process.ProcessId)) {",
    "      $ids.Add([int]$process.ProcessId)",
    "      $pending.Enqueue([int]$process.ProcessId)",
    "    }",
    "  }",
    "}",
    "@($root) + @($ids) | ForEach-Object { $_ }",
  ].join(";");

  return new Promise((resolve) => {
    const probe = spawn(
      "powershell.exe",
      ["-NoProfile", "-NonInteractive", "-Command", script],
      { stdio: ["ignore", "pipe", "ignore"], windowsHide: true },
    );
    let output = "";
    probe.stdout.on("data", (chunk) => {
      output += chunk.toString();
    });
    const finish = () => {
      const pids = output
        .split(/\r?\n/)
        .map((value) => Number.parseInt(value.trim(), 10))
        .filter((value) => Number.isInteger(value) && value > 0);
      resolve([...new Set([rootPid, ...pids])]);
    };
    probe.once("error", () => resolve([rootPid]));
    probe.once("close", finish);
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

function terminateChild(child) {
  if (!child) return Promise.resolve();

  if (process.platform === "win32" && child.pid) {
    return getWindowsProcessTree(child.pid).then((pids) =>
      Promise.all(pids.reverse().map(killWindowsProcess)),
    );
  }

  if (child.exitCode !== null || child.signalCode !== null) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    const timeout = setTimeout(finish, 5000);
    child.once("close", () => {
      clearTimeout(timeout);
      finish();
    });
    child.kill("SIGTERM");
  });
}

async function shutdown(code) {
  if (shutdownPromise) return shutdownPromise;
  shuttingDown = true;
  shutdownPromise = Promise.all([...children.values()].map(terminateChild)).then(() => {
    process.exitCode = code;
  });
  return shutdownPromise;
}

process.once("SIGINT", () => void shutdown(0));
process.once("SIGTERM", () => void shutdown(0));
process.once("SIGBREAK", () => void shutdown(0));

try {
  registerChild("web", startWeb());
  registerChild("api", startApi());
  process.stdout.write("Web and API development servers are starting.\n");
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  void shutdown(1);
}
