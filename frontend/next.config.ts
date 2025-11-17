// next.config.js
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: ["@radix-ui/react-*"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https", 
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;