import type { NextConfig } from "next";
import createMDX from "@ducanh2912/next-pwa";

const withPWA = createMDX({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  experimental: {
    turbo: false
  }
};

export default withPWA(nextConfig);
