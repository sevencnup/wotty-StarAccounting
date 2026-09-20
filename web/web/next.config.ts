import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(currentDir, "../..");
const isExportBuild = process.env.NEXT_EXPORT === "1";

const nextConfig: NextConfig = {
  turbopack: {
    root: workspaceRoot,
  },
  allowedDevOrigins: ["127.0.0.1"],
  devIndicators: false,
  ...(isExportBuild
    ? {
        output: "export",
        trailingSlash: true,
        images: {
          unoptimized: true,
        },
      }
    : {}),
};

export default nextConfig;
