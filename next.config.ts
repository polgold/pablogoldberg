import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: false,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "pablogoldberg.com", pathname: "/**" },
      { protocol: "http", hostname: "pablogoldberg.com", pathname: "/**" },
      { protocol: "https", hostname: "localhost", pathname: "/**" },
      { protocol: "http", hostname: "localhost", pathname: "/**" },
    ],
  },
};

export default withPayload(nextConfig);
