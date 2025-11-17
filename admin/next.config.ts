
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  swcMinify: true,
  productionBrowserSourceMaps: false,
  reactCompilationMode: "concurrent",
  experimental: {
    optimizePackageImports: ["@radix-ui/react-*"],
    scrollRestoration: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "cdn.casio-vietnam.vn",
        port: "",
        pathname: "**",
      },
    ],
  },
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
};

export default nextConfig;