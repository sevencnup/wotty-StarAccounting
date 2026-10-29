import { spawn } from "node:child_process";

function launchFailure(message) {
  process.stderr.write(`[launcher] ${message}\n`);
  process.exitCode = 1;
}

function waitForSuccessfulResponse(url, timeoutMs = 180_000) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve) => {
    const attempt = async () => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          resolve(true);
          return;
        }
      } catch {
        // The development server is still starting.
      }

      if (Date.now() >= deadline) {
        resolve(false);
        return;
      }
      setTimeout(attempt, 500);
    };
    void attempt();
  });
}

const webPort = Number.parseInt(process.argv[2] ?? "", 10);
const apiPort = Number.parseInt(process.argv[3] ?? "", 10);
if (!Number.isInteger(webPort) || webPort < 1 || webPort > 65535
  || !Number.isInteger(apiPort) || apiPort < 1 || apiPort > 65535) {
  launchFailure("Missing or invalid development ports.");
} else {
  const url = `http://127.0.0.1:${webPort}`;
  const healthUrl = `http://127.0.0.1:${apiPort}/api/health`;
  process.stdout.write(`Waiting for ${url} ...\n`);
  if (!(await waitForSuccessfulResponse(url))) {
    launchFailure("The web server did not start within 3 minutes. Check the Wotty Stark Dev window.");
  } else if (!(await waitForSuccessfulResponse(healthUrl))) {
    launchFailure("The API server did not start within 3 minutes. Check the Wotty Stark Dev window.");
  } else {
    process.stdout.write(`Wotty Stark is ready: ${url}\n`);
    if (process.platform === "win32" && process.env.WOTTY_SKIP_BROWSER !== "true") {
      spawn("cmd.exe", ["/d", "/c", "start", "", url], {
        detached: true,
        stdio: "ignore",
        windowsHide: true,
      }).unref();
    }
  }
}
