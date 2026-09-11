import { networkInterfaces } from "node:os";
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
  reactStrictMode: true,
  devIndicators: false,
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
