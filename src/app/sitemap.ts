import { MetadataRoute } from "next";
import { getProjectSlugs, getProjectsFromJson } from "@/lib/content";
import { LOCALES } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let dbSlugs: string[] = [];
  try {
    dbSlugs = await getProjectSlugs();
  } catch {
    dbSlugs = [];
  }
  let jsonSlugs: string[] = [];
  try {
    const jsonProjects = await getProjectsFromJson("es");
    jsonSlugs = jsonProjects.map((p) => p.slug);
  } catch {
    jsonSlugs = [];
  }
  const slugs = [...new Set([...dbSlugs, ...jsonSlugs])];
  const entries: MetadataRoute.Sitemap = [];

  // Root (redirects to default locale)
  entries.push({
    url: SITE_URL,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.95,
  });

  for (const locale of LOCALES) {
    const prefix = `${SITE_URL}/${locale}`;
    entries.push(
      { url: prefix, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
      { url: `${prefix}/work`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
      { url: `${prefix}/work/archive`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.85 },
      { url: `${prefix}/photography`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.85 },
      { url: `${prefix}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
      { url: `${prefix}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 }
    );
    for (const slug of slugs) {
      entries.push({
        url: `${prefix}/work/${slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.75,
      });
    }
  }

  return entries;
}
