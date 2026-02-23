import Link from "next/link";
import { getProjectsFromJson, getFeaturedWorkProjects, getProjects } from "@/lib/content";
import { getProjectPosterUrl } from "@/lib/poster";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import { PROJECTS_BUCKET } from "@/lib/supabase/storage";
import { toLargePathOrOriginal } from "@/lib/imageVariantPath";
import { getLocaleFromParam, COPY } from "@/lib/i18n";
import { getHreflangUrls } from "@/lib/site";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { FeaturedWork } from "@/components/projects/FeaturedWork";

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

  // Destacados (igual que home): JSON + Supabase, máx 6
  const [jsonProjects, supabaseFeatured, supabaseProjects] = await Promise.all([
    getProjectsFromJson(loc),
    getFeaturedWorkProjects(6, loc),
    getProjects(loc),
  ]);
  const fromJson = jsonProjects
    .filter((p) => p.featured)
    .slice(0, 6)
    .map((p) => ({
      project: { slug: p.slug, title: p.title, description: p.description },
      coverUrl: p.coverImagePath
        ? getPublicImageUrl(toLargePathOrOriginal(p.coverImagePath), PROJECTS_BUCKET)
        : null,
    }));
  const seenFeatured = new Set(fromJson.map((x) => x.project.slug));
  const fromSupabaseFeatured = await Promise.all(
    supabaseFeatured
      .filter((p) => !seenFeatured.has(p.slug))
      .slice(0, 6 - fromJson.length)
      .map(async (p) => {
        seenFeatured.add(p.slug);
        return {
          project: { slug: p.slug, title: p.title, description: p.excerpt || p.summary || "" },
          coverUrl: await getProjectPosterUrl(p),
        };
      })
  );
  const featuredWithCover = [...fromJson, ...fromSupabaseFeatured].slice(0, 6);

  // Listado completo: JSON primero, luego Supabase (dedupe por slug)
  const allFromJson = jsonProjects.map((p) => ({
    project: { slug: p.slug, title: p.title, description: p.description },
    coverUrl: p.coverImagePath
      ? getPublicImageUrl(toLargePathOrOriginal(p.coverImagePath), PROJECTS_BUCKET)
      : null,
  }));
  const seenAll = new Set(allFromJson.map((x) => x.project.slug));
  const allFromSupabase = await Promise.all(
    supabaseProjects
      .filter((p) => !seenAll.has(p.slug))
      .map(async (p) => {
        seenAll.add(p.slug);
        return {
          project: { slug: p.slug, title: p.title, description: p.excerpt || p.summary || "" },
          coverUrl: await getProjectPosterUrl(p),
        };
      })
  );
  const allProjectsWithCover = [...allFromJson, ...allFromSupabase];
  const featuredSlugs = new Set(featuredWithCover.map((x) => x.project.slug));
  const restProjectsWithCover = allProjectsWithCover.filter((x) => !featuredSlugs.has(x.project.slug));

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

        {/* 2) Resto de proyectos (Vimeo feed / listado, sin repetir destacados) */}
        <section className="mt-12 border-t border-white/5 pt-10" aria-labelledby="work-all-heading">
          <h2 id="work-all-heading" className="text-xl font-semibold text-white md:text-2xl">
            {tWork.title}
          </h2>
          <ul className="mt-8 grid grid-cols-2 gap-px bg-white/5 sm:grid-cols-3 lg:grid-cols-4">
            {restProjectsWithCover.map(({ project, coverUrl }) => (
              <ProjectCard
                key={project.slug}
                project={project}
                coverUrl={coverUrl}
                locale={locale}
              />
            ))}
          </ul>
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
