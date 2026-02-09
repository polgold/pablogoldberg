import { getProjects } from "@/lib/content";
import { getVimeoPortfolioVideos } from "@/lib/vimeo";
import { getLocaleFromParam } from "@/lib/i18n";
import { getHreflangUrls } from "@/lib/site";
import { WorkPageClient } from "@/app/(site)/work/WorkPageClient";
import type { WorkItem } from "@/types/work";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const urls = getHreflangUrls("/work");
  const loc = getLocaleFromParam(locale);
  return {
    alternates: {
      canonical: urls[loc],
      languages: { es: urls.es, en: urls.en, "x-default": urls.es },
    },
  };
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = getLocaleFromParam(locale);

  const [vimeoVideos, dbProjects] = await Promise.all([
    getVimeoPortfolioVideos(),
    getProjects(loc),
  ]);

  const items: WorkItem[] =
    vimeoVideos.length > 0
      ? vimeoVideos.map((v) => ({
          slug: `vimeo-${v.id}`,
          title: v.name,
          year: "",
          featuredImage: v.thumbnail || undefined,
          href: v.link,
          external: true,
        }))
      : dbProjects.length > 0
        ? dbProjects.map((p) => ({
            slug: p.slug,
            title: p.title,
            year: p.year || undefined,
            featuredImage: p.featuredImage ?? undefined,
            href: `/${locale}/work/${p.slug}`,
            external: false,
          }))
        : [
            {
              slug: "coming-soon",
              title: loc === "es" ? "Próximamente" : "Coming soon",
              featuredImage: null,
              href: "#",
              external: false,
            } as WorkItem,
          ];

  return (
    <div className="min-h-screen border-t border-white/5 bg-black pt-14">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 md:px-8">
        <h1 className="text-xl font-semibold text-white">
          {locale === "es" ? "Trabajo" : "Work"}
        </h1>
        <WorkPageClient items={items} locale={locale} />
      </div>
    </div>
  );
}
