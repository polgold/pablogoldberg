import Link from "next/link";
import { getProjectsFromJson, getProjects } from "@/lib/content";
import { getProjectPosterUrl } from "@/lib/poster";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import { PROJECTS_BUCKET } from "@/lib/supabase/storage";
import { toLargePathOrOriginal } from "@/lib/imageVariantPath";
import { getLocaleFromParam, COPY } from "@/lib/i18n";
import { getHreflangUrls } from "@/lib/site";
import { ProjectCard } from "@/components/projects/ProjectCard";

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

  // JSON + Supabase (proyectos del admin publicados), dedupe por slug (prioridad JSON)
  const [jsonProjects, supabaseProjects] = await Promise.all([
    getProjectsFromJson(loc),
    getProjects(loc),
  ]);
  const fromJson = jsonProjects.map((p) => ({
    project: { slug: p.slug, title: p.title, description: p.description },
    coverUrl: p.coverImagePath
      ? getPublicImageUrl(toLargePathOrOriginal(p.coverImagePath), PROJECTS_BUCKET)
      : null,
  }));
  const seen = new Set(fromJson.map((x) => x.project.slug));
  const fromSupabase = await Promise.all(
    supabaseProjects
      .filter((p) => !seen.has(p.slug))
      .map(async (p) => {
        seen.add(p.slug);
        return {
          project: { slug: p.slug, title: p.title, description: p.excerpt || p.summary || "" },
          coverUrl: await getProjectPosterUrl(p),
        };
      })
  );
  const projectsWithCover = [...fromJson, ...fromSupabase];

  return (
    <div className="min-h-screen border-t border-white/5 bg-black pt-14">
      <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 md:px-8">
        <h1 className="text-xl font-semibold text-white md:text-2xl">{COPY[loc].work.title}</h1>
        <ul className="mt-8 grid grid-cols-2 gap-px bg-white/5 sm:grid-cols-3 lg:grid-cols-4">
          {projectsWithCover.map(({ project, coverUrl }) => (
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
            {COPY[loc].work.viewAllWork}
          </Link>
        </div>
      </div>
    </div>
  );
}
