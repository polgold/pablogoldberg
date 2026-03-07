import { getProjects, getProjectsFromJson } from "@/lib/content";
import { getVimeoPortfolioVideos } from "@/lib/vimeo";
import { getWorkImageUrl } from "@/lib/work-images";
import { getFilmCoverPath } from "@/lib/work-galleries";
import { getLocaleFromParam, COPY } from "@/lib/i18n";
import { getHreflangUrls, toAbsoluteImageUrl } from "@/lib/site";
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

function getYouTubeUrl(project: ProjectItem): string | null {
  if (project.primaryVideo?.type === "youtube" && project.primaryVideo.id) {
    return `https://www.youtube.com/watch?v=${project.primaryVideo.id}`;
  }
  const fromExternal = String(project.externalLink ?? "").trim();
  if (/youtu\.?be|youtube\.com/i.test(fromExternal)) return fromExternal;
  const contentMatch = project.content.match(/https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[^\s"'<]+/i);
  return contentMatch ? contentMatch[0] : null;
}

function projectToWorkItem(project: ProjectItem, locale: string): WorkItem {
  const workCover = getFilmCoverPath(project.slug);
  const rawThumb = workCover
    ? getWorkImageUrl(workCover)
    : project.featuredImage?.startsWith("http")
      ? project.featuredImage
      : project.featuredImage
        ? `${project.featuredImage}`
        : undefined;
  const cardThumb = rawThumb ? (rawThumb.startsWith("/") ? rawThumb : rawThumb.startsWith("http") ? rawThumb : toAbsoluteImageUrl(rawThumb)) : undefined;
  const youtubeUrl = getYouTubeUrl(project);
  if (youtubeUrl) {
    return {
      slug: `youtube-${project.slug}`,
      title: project.title,
      year: project.year || undefined,
      featuredImage: cardThumb,
      href: youtubeUrl,
      external: true,
      source: "youtube",
    };
  }
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
  const urls = getHreflangUrls("/work/archive");
  const loc = getLocaleFromParam(locale);
  return {
    title: COPY[loc].metadata.archive,
    alternates: {
      canonical: urls[loc],
      languages: { es: urls.es, en: urls.en, "x-default": urls.es },
    },
  };
}

export default async function WorkArchivePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = getLocaleFromParam(locale);

  const [vimeoVideos, supabaseArchive, jsonProjects] = await Promise.all([
    getVimeoPortfolioVideos(),
    getProjects(loc),
    getProjectsFromJson(loc),
  ]);
  const vimeoItems: WorkItem[] = vimeoVideos.map(vimeoToWorkItem);
  const supabaseItems: WorkItem[] = supabaseArchive.map((p) => projectToWorkItem(p, locale));
  const jsonItems: WorkItem[] = jsonProjects.map((p) => {
    const cover = getFilmCoverPath(p.slug);
    return {
      slug: p.slug,
      title: p.title,
      year: undefined,
      featuredImage: cover ? getWorkImageUrl(cover) : undefined,
      href: `/${locale}/work/${p.slug}`,
      external: false,
      source: "project" as const,
    };
  });
  const seenSlugs = new Set<string>();
  const items: WorkItem[] = [
    ...vimeoItems,
    ...jsonItems.filter((i) => {
      if (seenSlugs.has(i.slug)) return false;
      seenSlugs.add(i.slug);
      return true;
    }),
    ...supabaseItems.filter((i) => {
      if (seenSlugs.has(i.slug)) return false;
      seenSlugs.add(i.slug);
      return true;
    }),
  ];

  return (
    <div className="min-h-screen border-t border-white/5 bg-black pt-14">
      <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 md:px-8">
        <h1 className="text-xl font-semibold text-white md:text-2xl">
          {COPY[loc].work.archive}
        </h1>
        <p className="mt-2 text-sm text-white/60">
          {COPY[loc].work.archiveSubtitle}
        </p>
        <WorkPageClient items={items} locale={locale} />
      </div>
    </div>
  );
}
