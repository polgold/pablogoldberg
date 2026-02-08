import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "pablogoldberg.com", pathname: "/**" },
      { protocol: "http", hostname: "pablogoldberg.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
