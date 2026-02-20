import { getProjects } from "@/lib/content";
import { getVimeoPortfolioVideos } from "@/lib/vimeo";
import { getLocaleFromParam } from "@/lib/i18n";
import { getHreflangUrls } from "@/lib/site";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import { PROJECTS_BUCKET } from "@/lib/supabase/storage";
import { toThumbPath } from "@/lib/imageVariantPath";
import { WorkPageClient } from "@/app/(site)/work/WorkPageClient";
import type { WorkItem } from "@/types/work";
import type { ProjectItem } from "@/types/content";

export const revalidate = 300;

function getYouTubeUrl(project: ProjectItem): string | null {
  if (project.primaryVideo?.type === "youtube" && project.primaryVideo.id) {
    return `https://www.youtube.com/watch?v=${project.primaryVideo.id}`;
  }
  const fromExternal = String(project.externalLink ?? "").trim();
  if (/youtu\.?be|youtube\.com/i.test(fromExternal)) return fromExternal;
  const contentMatch = project.content.match(/https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[^\s"'<]+/i);
  return contentMatch ? contentMatch[0] : null;
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

  const [vimeoVideos, dbProjects] = await Promise.all([
    getVimeoPortfolioVideos(),
    getProjects(loc),
  ]);

  const vimeoItems: WorkItem[] = vimeoVideos.map((v) => ({
    slug: `vimeo-${v.id}`,
    title: v.name,
    year: "",
    featuredImage: v.thumbnail || undefined,
    href: "#",
    external: false,
    source: "vimeo",
    vimeoId: v.id,
  }));

  const projectItems: WorkItem[] = dbProjects.map((p) => {
    const cardThumb = p.coverImagePath
      ? getPublicImageUrl(toThumbPath(p.coverImagePath), PROJECTS_BUCKET)
      : p.featuredImage ?? undefined;
    const youtubeUrl = getYouTubeUrl(p);
    if (youtubeUrl) {
      return {
        slug: `youtube-${p.slug}`,
        title: p.title,
        year: p.year || undefined,
        featuredImage: cardThumb,
        href: youtubeUrl,
        external: true,
        source: "youtube",
      };
    }
    return {
      slug: p.slug,
      title: p.title,
      year: p.year || undefined,
      featuredImage: cardThumb,
      href: `/${locale}/work/${p.slug}`,
      external: false,
      source: "project",
    };
  });

  const items: WorkItem[] =
    vimeoItems.length > 0 || projectItems.length > 0
      ? [...vimeoItems, ...projectItems]
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
          {locale === "es" ? "Proyectos" : "Projects"}
        </h1>
        <WorkPageClient items={items} locale={locale} />
      </div>
    </div>
  );
}
