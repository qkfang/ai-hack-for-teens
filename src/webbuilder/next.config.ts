import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["@github/copilot-sdk", "@github/copilot"],
  outputFileTracingIncludes: {
    "/api/chat": [
      "./node_modules/@github/copilot/**/*",
      "./node_modules/@github/copilot-sdk/**/*",
      "./node_modules/vscode-jsonrpc/**/*",
    ],
  },
};

export default nextConfig;
