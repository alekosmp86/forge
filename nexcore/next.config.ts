import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@forge/shared-types"],
};

export default nextConfig;
