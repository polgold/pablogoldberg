import { MetadataRoute } from "next";
import { getProjectSlugs } from "@/lib/content";

const BASE = "https://pablogoldberg.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const slugs = getProjectSlugs();
  const workEntries = slugs.map((slug) => ({
    url: `${BASE}/work/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    { url: BASE, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/work`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    ...workEntries,
  ];
}
