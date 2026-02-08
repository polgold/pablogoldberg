import { MetadataRoute } from "next";

const BASE = "https://pablogoldberg.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: [] },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
