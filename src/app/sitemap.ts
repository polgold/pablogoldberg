import { MetadataRoute } from "next";
import { getProjectSlugs } from "@/lib/content";
import { LOCALES } from "@/lib/i18n";

const BASE = "https://pablogoldberg.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getProjectSlugs();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    const prefix = `${BASE}/${locale}`;
    entries.push(
      { url: prefix, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
      { url: `${prefix}/work`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
      { url: `${prefix}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
      { url: `${prefix}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 }
    );
    for (const slug of slugs) {
      entries.push({
        url: `${prefix}/work/${slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  }

  return entries;
}
