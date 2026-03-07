import Link from "next/link";
import { getProjectsFromJson, getFeaturedWorkProjects } from "@/lib/content";
import { getProjectPosterUrl } from "@/lib/poster";
import { getVimeoPortfolioVideos } from "@/lib/vimeo";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import { PROJECTS_BUCKET } from "@/lib/supabase/storage";
import { toLargePathOrOriginal } from "@/lib/imageVariantPath";
import { getLocaleFromParam, COPY } from "@/lib/i18n";
import { isLocalStorageEnabled } from "@/lib/local-storage";
import { getHreflangUrls, toAbsoluteImageUrl } from "@/lib/site";
import { FeaturedWork } from "@/components/projects/FeaturedWork";
import { WorkPageClient } from "@/app/(site)/work/WorkPageClient";
import type { WorkItem } from "@/types/work";
import type { VimeoVideo } from "@/lib/vimeo";

function yearFromReleaseTime(releaseTime: string): string {
  if (!releaseTime || releaseTime.length < 4) return "";
  return releaseTime.slice(0, 4);
}

function vimeoToWorkItem(v: VimeoVideo): WorkItem {
  return {
    slug: `vimeo-${v.id}`,
    title: v.name,
    year: yearFromReleaseTime(v.releaseTime) || undefined,
    featuredImage: v.thumbnail || undefined,
    href: v.link,
    external: true,
    source: "vimeo",
    vimeoId: v.id,
  };
}

// Featured + full list from JSON + Supabase; avoid stale
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const urls = getHreflangUrls("/work");
  const loc = getLocaleFromParam(locale);
  return {
    title: COPY[loc].metadata.work,
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

  // Destacados + feed Vimeo
  const [jsonProjects, supabaseFeatured, vimeoVideos] = await Promise.all([
    getProjectsFromJson(loc),
    getFeaturedWorkProjects(8, loc),
    getVimeoPortfolioVideos(),
  ]);
  const vimeoItems: WorkItem[] = vimeoVideos.map(vimeoToWorkItem);
  const useLocalStorage = isLocalStorageEnabled();
  const fromJson = jsonProjects
    .filter((p) => p.featured)
    .slice(0, 8)
    .map((p) => {
      const rawUrl = p.coverImagePath
        ? getPublicImageUrl(toLargePathOrOriginal(p.coverImagePath), PROJECTS_BUCKET)
        : null;
      return {
        project: { slug: p.slug, title: p.title, description: p.description },
        coverUrl: rawUrl ? (useLocalStorage ? rawUrl : toAbsoluteImageUrl(rawUrl)) : null,
      };
    });
  const seenFeatured = new Set(fromJson.map((x) => x.project.slug));
  const fromSupabaseFeatured = await Promise.all(
    supabaseFeatured
      .filter((p) => !seenFeatured.has(p.slug))
      .slice(0, 8 - fromJson.length)
      .map(async (p) => {
        seenFeatured.add(p.slug);
        const url = await getProjectPosterUrl(p);
        return {
          project: { slug: p.slug, title: p.title, description: p.excerpt || p.summary || "" },
          coverUrl: url ? (useLocalStorage ? url : toAbsoluteImageUrl(url)) : null,
        };
      })
  );
  const featuredWithCover = [...fromJson, ...fromSupabaseFeatured].slice(0, 8);

  const tWork = COPY[loc].work;

  return (
    <div className="min-h-screen border-t border-white/5 bg-black pt-14">
      <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 md:px-8">
        {/* 1) Trabajos destacados (solo los 6 destacados) */}
        <FeaturedWork
          projects={featuredWithCover}
          locale={locale}
          title={tWork.featuredTitle}
          viewAllLabel={tWork.viewAllWork}
        />

        {/* 2) Feed de Vimeo (videos del portfolio) */}
        <section className="mt-12 border-t border-white/5 pt-10" aria-labelledby="work-vimeo-heading">
          <h2 id="work-vimeo-heading" className="text-xl font-semibold text-white md:text-2xl">
            {tWork.title}
          </h2>
          <WorkPageClient items={vimeoItems} locale={locale} />
          <div className="mt-12 flex justify-center">
            <Link
              href={`/${locale}/work/archive`}
              className="inline-flex items-center justify-center rounded-sm border border-white/30 px-6 py-3 text-sm font-medium text-white transition-colors hover:border-brand hover:text-brand focus:outline-none focus:ring-2 focus:ring-brand/50 focus:ring-offset-2 focus:ring-offset-black"
            >
              {tWork.viewAllWork}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
