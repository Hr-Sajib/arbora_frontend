import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["via.placeholder.com"],
  },
  eslint: {
    // Warning: This allows production builds to complete even if there are ESLint errors.
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true, // Ignores TypeScript errors during build
  },
};

export default nextConfig;
