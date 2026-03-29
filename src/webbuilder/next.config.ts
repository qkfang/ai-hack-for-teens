import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@github/copilot-sdk", "@github/copilot"],
};

export default nextConfig;
