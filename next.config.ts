import type { NextConfig } from "next";

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
      { protocol: "https", hostname: "**.supabase.co", pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname: "**.supabase.co", pathname: "/storage/v1/render/image/public/**" },
      { protocol: "https", hostname: "**.supabase.in", pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname: "**.supabase.in", pathname: "/storage/v1/render/image/public/**" },
      { protocol: "https", hostname: "i.vimeocdn.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
