import Link from "next/link";
import { getCuratedWork } from "@/lib/content";
import { getLocaleFromParam, COPY } from "@/lib/i18n";
import { getHreflangUrls } from "@/lib/site";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import { PROJECTS_BUCKET } from "@/lib/supabase/storage";
import { toThumbPath } from "@/lib/imageVariantPath";
import { WorkGrid } from "@/components/WorkGrid";
import type { WorkItem } from "@/types/work";
import type { ProjectItem } from "@/types/content";

export const revalidate = 300;

function hasVisual(project: ProjectItem): boolean {
  return Boolean(
    project.coverImagePath ||
    project.featuredImage ||
    project.primaryVideo
  );
}

function projectToWorkItem(project: ProjectItem, locale: string): WorkItem {
  const cardThumb = project.coverImagePath
    ? getPublicImageUrl(toThumbPath(project.coverImagePath), PROJECTS_BUCKET)
    : project.featuredImage ?? undefined;
  return {
    slug: project.slug,
    title: project.title,
    year: project.year || undefined,
    featuredImage: cardThumb,
    href: `/${locale}/work/${project.slug}`,
    external: false,
    source: "project",
  };
}

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

  const curated = await getCuratedWork(6, loc);
  const items: WorkItem[] = curated
    .filter(hasVisual)
    .map((p) => projectToWorkItem(p, locale));

  return (
    <div className="min-h-screen border-t border-white/5 bg-black pt-14">
      <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 md:px-8">
        <h1 className="text-xl font-semibold text-white md:text-2xl">Work</h1>
        <WorkGrid
          items={items}
          locale={locale}
          linkCards
          showFilters={false}
        />
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
