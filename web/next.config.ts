import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  output: "export",
  outputFileTracingRoot: path.resolve(__dirname, ".."),
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
