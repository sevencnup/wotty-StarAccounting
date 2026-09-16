import { networkInterfaces } from "node:os";
import { resolve } from "node:path";
import type { NextConfig } from "next";

const lanDevOrigins = Object.values(networkInterfaces())
  .flatMap((interfaces) => interfaces ?? [])
  .filter(({ family, internal }) => family === "IPv4" && !internal)
  .map(({ address }) => address);

const nextConfig: NextConfig = {
  // Next.js 16 rejects HMR connections from a LAN address unless it is
  // explicitly trusted. Discover active local IPv4 addresses so a phone can
  // safely use the current development server without hard-coding one IP.
  allowedDevOrigins: lanDevOrigins,
  turbopack: {
    // The Web package links dependencies from the project-level pnpm store.
    // Keep that directory inside Turbopack's filesystem boundary so both dev
    // and production builds can resolve Next and its peer dependencies.
    root: resolve(process.cwd(), ".."),
  },
  reactStrictMode: true,
  devIndicators: false,
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
