import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
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

function loadDotEnv(filePath) {
  if (!existsSync(filePath)) return;

  for (const rawLine of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const match = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    if (Object.prototype.hasOwnProperty.call(process.env, key)) continue;

    let value = rawValue.trim();
    if (
      value.length >= 2 &&
      ((value.startsWith("\"") && value.endsWith("\"")) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadDotEnv(path.join(repositoryDirectory, ".env"));

const webPort = 12366;
const tabRoutes = ["/", "/consumption/", "/savings/", "/loans/", "/assets/", "/accounts/"];

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

  return spawn(process.execPath, [nextCli, "dev", "--turbopack", "-H", "0.0.0.0", "-p", String(webPort)], {
    cwd: webDirectory,
    stdio: ["inherit", "pipe", "pipe"],
  });
}

async function prewarmTabRoutes() {
  const baseUrl = `http://127.0.0.1:${webPort}`;
  const warmRoute = async (route) => {
    const response = await fetch(`${baseUrl}${route}`);
    // Fetch resolves when the headers arrive. Consume the full response so the
    // completion message cannot precede Turbopack's route compilation.
    await response.arrayBuffer();
    if (!response.ok) throw new Error(`${route} returned HTTP ${response.status}`);
  };

  process.stdout.write("[web] Prewarming tab routes in the background...\n");
  for (let attempt = 0; attempt < 40 && !shuttingDown; attempt += 1) {
    try {
      await warmRoute("/");
      break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }

  if (shuttingDown) return;
  let failedRoutes = 0;
  for (const [index, route] of tabRoutes.entries()) {
    if (shuttingDown) return;
    process.stdout.write(`[web] Prewarming ${index + 1}/${tabRoutes.length}: ${route}\n`);
    try {
      // Turbopack serializes some route-compilation work internally. Warming in
      // order prevents later tabs from being left in its background queue when a
      // user clicks a navigation item during startup.
      await warmRoute(route);
    } catch {
      failedRoutes += 1;
      process.stdout.write(`[web] Failed to prewarm: ${route}\n`);
    }
  }

  if (shuttingDown) return;
  process.stdout.write(
    failedRoutes
      ? `[web] Tab route prewarming finished with ${failedRoutes} failed route(s).\n`
      : "[web] Tab routes prewarmed.\n",
  );
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
      ["/d", "/c", gradleWrapper, "-p", "api-server", "run", "--no-daemon", "--configuration-cache"],
      {
        cwd: repositoryDirectory,
        stdio: ["inherit", "pipe", "pipe"],
        windowsHide: false,
      },
    );
  }

  const gradleWrappers = [path.join(webDirectory, "android", "gradlew")];
  const gradleWrapper = gradleWrappers.find((candidate) => existsSync(candidate));
  if (!gradleWrapper) {
    throw new Error(`Gradle wrapper not found: ${gradleWrappers.join(", ")}`);
  }

  return spawn("sh", [gradleWrapper, "-p", "api-server", "run", "--no-daemon", "--configuration-cache"], {
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
  void prewarmTabRoutes();
  process.stdout.write("Web and API development servers are starting.\n");
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  void shutdown(1);
}
