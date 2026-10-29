import { execFileSync } from "node:child_process";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

function readPort(value, fallback) {
  const port = Number.parseInt(value ?? "", 10);
  return Number.isInteger(port) && port >= 1 && port <= 65535 ? port : fallback;
}

export function getWindowsExcludedPortRanges() {
  if (process.platform !== "win32") return [];

  try {
    const output = execFileSync(
      "netsh.exe",
      ["interface", "ipv4", "show", "excludedportrange", "protocol=tcp"],
      { encoding: "utf8", windowsHide: true },
    );
    return [...output.matchAll(/^\s*(\d+)\s+(\d+)/gm)]
      .map((match) => ({ start: Number(match[1]), end: Number(match[2]) }))
      .filter(({ start, end }) => start >= 1 && end >= start && end <= 65535);
  } catch {
    // Port probing below remains the fallback when netsh is unavailable.
    return [];
  }
}

function isExcludedPort(port, ranges) {
  return ranges.some(({ start, end }) => port >= start && port <= end);
}

export function canListen(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", (error) => {
      server.close(() => {});
      if (error.code === "EADDRINUSE" || error.code === "EACCES") {
        resolve(false);
        return;
      }
      reject(error);
    });
    server.listen({ host: "0.0.0.0", port }, () => {
      server.close(() => resolve(true));
    });
  });
}

export async function findAvailablePort(startPort, excludedRanges = []) {
  for (let port = startPort; port <= 65535; port += 1) {
    if (isExcludedPort(port, excludedRanges)) continue;
    if (await canListen(port)) return port;
  }
  throw new Error(`No available development port found from ${startPort}.`);
}

export async function findDevelopmentPorts({ webStartPort, apiStartPort } = {}) {
  const requestedWebPort = readPort(webStartPort ?? process.env.WEB_PORT, 12366);
  const requestedApiPort = readPort(apiStartPort ?? process.env.API_PORT, 12367);
  const excludedRanges = getWindowsExcludedPortRanges();
  const webPort = await findAvailablePort(requestedWebPort, excludedRanges);
  const apiPort = await findAvailablePort(
    Math.max(requestedApiPort, webPort + 1),
    excludedRanges,
  );
  return { requestedWebPort, requestedApiPort, webPort, apiPort, excludedRanges };
}

const currentFile = path.resolve(fileURLToPath(import.meta.url));
const invokedFile = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (currentFile === invokedFile) {
  try {
    const ports = await findDevelopmentPorts();
    process.stdout.write(`${ports.webPort} ${ports.apiPort}\n`);
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
