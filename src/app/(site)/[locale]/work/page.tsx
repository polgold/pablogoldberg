import Link from "next/link";
import { getFeaturedProjects, getProjects } from "@/lib/content";
import { getVimeoPortfolioVideos } from "@/lib/vimeo";
import { getLocaleFromParam, COPY } from "@/lib/i18n";
import { getHreflangUrls } from "@/lib/site";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import { PROJECTS_BUCKET } from "@/lib/supabase/storage";
import { toThumbPathOrOriginal } from "@/lib/imageVariantPath";
import { WorkPageClient } from "@/app/(site)/work/WorkPageClient";
import type { WorkItem } from "@/types/work";
import type { ProjectItem } from "@/types/content";
import type { VimeoVideo } from "@/lib/vimeo";

export const revalidate = 300;

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

function projectToWorkItem(project: ProjectItem, locale: string): WorkItem {
  const cardThumb = project.coverImagePath
    ? getPublicImageUrl(toThumbPathOrOriginal(project.coverImagePath), PROJECTS_BUCKET)
    : project.featuredImage ?? undefined;
  const isVimeo = project.primaryVideo?.type === "vimeo";
  return {
    slug: project.slug,
    title: project.title,
    year: project.year || undefined,
    featuredImage: cardThumb,
    href: `/${locale}/work/${project.slug}`,
    external: false,
    source: isVimeo ? "vimeo" : "project",
    vimeoId: isVimeo ? project.primaryVideo?.id : undefined,
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

  const [vimeoVideos, featuredProjects] = await Promise.all([
    getVimeoPortfolioVideos(),
    getFeaturedProjects(6, loc),
  ]);
  let workProjects = featuredProjects;
  if (workProjects.length === 0) {
    workProjects = (await getProjects(loc)).slice(0, 6);
  }

  const vimeoItems: WorkItem[] = vimeoVideos.map(vimeoToWorkItem);
  const projectItems: WorkItem[] = workProjects.map((p) => projectToWorkItem(p, locale));
  const items: WorkItem[] = [...vimeoItems, ...projectItems];

  return (
    <div className="min-h-screen border-t border-white/5 bg-black pt-14">
      <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 md:px-8">
        <h1 className="text-xl font-semibold text-white md:text-2xl">{COPY[loc].work.title}</h1>
        <WorkPageClient
          items={items}
          locale={locale}
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
