import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const appDir = resolve(scriptDir, "..");
const settingsFile = resolve(appDir, "android", "capacitor.settings.gradle");
const installedCapacitorAndroid = resolve(appDir, "node_modules", "@capacitor", "android", "capacitor");
const appPath = "../node_modules/@capacitor/android/capacitor";

execFileSync(process.platform === "win32" ? "pnpm.cmd" : "pnpm", ["exec", "cap", "sync", "android"], {
  cwd: appDir,
  stdio: "inherit",
});

if (!existsSync(installedCapacitorAndroid)) {
  throw new Error(`找不到 Capacitor Android 依赖：${installedCapacitorAndroid}`);
}

const settings = readFileSync(settingsFile, "utf8");
const generatedPathMatch = settings.match(/project\(':capacitor-android'\)\.projectDir = new File\('([^']+)'\)/);
if (!generatedPathMatch) {
  throw new Error(`无法识别 ${settingsFile} 中的 Capacitor Android 路径。`);
}

const generatedPath = generatedPathMatch[1];
if (existsSync(resolve(dirname(settingsFile), generatedPath))) {
  console.log("[android] Capacitor Android 路径已正确。");
} else if (existsSync(installedCapacitorAndroid)) {
  writeFileSync(settingsFile, settings.replace(generatedPath, appPath));
  console.log("[android] 已修正 pnpm workspace 下的 Capacitor Android 路径。");
} else {
  throw new Error(`找不到 Capacitor Android 依赖：${installedCapacitorAndroid}`);
}
