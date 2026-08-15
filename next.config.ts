import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "chat",
    "@chat-adapter/web",
    "@chat-adapter/state-memory",
  ],
};

export default nextConfig;
