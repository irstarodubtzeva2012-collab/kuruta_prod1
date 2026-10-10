import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@kuruta/shared"],
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3001"],
    },
  },
};

export default nextConfig;
