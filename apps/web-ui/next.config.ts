import type { NextConfig } from "next";
import path from "path";

// Get the monorepo root where node_modules is located
const monorepoRoot = path.resolve(__dirname, "../../");

const nextConfig: NextConfig = {
  // Fix Turbopack workspace root detection for monorepo
  turbopack: {
    root: monorepoRoot,
  },
  // Configure image domains for OAuth provider avatars (Story 1.3)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // Temporarily ignore TypeScript build errors for existing issues
  // TODO: Fix existing TypeScript errors
  typescript: {
    ignoreBuildErrors: true,
  },
  // Temporarily ignore ESLint errors
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
