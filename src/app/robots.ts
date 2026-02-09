import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/login", "/wp-admin", "/wp-login.php"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
