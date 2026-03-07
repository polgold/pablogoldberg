import { getAdminProjects, getFilms, getProjectImageUrl, getVideoThumbnailUrl } from "@/lib/admin-content";
import { getLocaleFromParam, COPY } from "@/lib/i18n";
import { getHreflangUrls } from "@/lib/site";
import { WorkPageClient } from "@/app/(site)/work/WorkPageClient";
import type { WorkItem } from "@/types/work";
import type { AdminProject, Film } from "@/lib/admin-content";

function projectToWorkItem(p: AdminProject, locale: string): WorkItem {
  const loc = locale === "en" ? "en" : "es";
  const title = loc === "en" && p.title_en ? p.title_en : p.title_es;
  const coverUrl = p.cover_image_path ? getProjectImageUrl(p.cover_image_path) : null;
  return {
    slug: p.slug,
    title,
    featuredImage: coverUrl,
    href: `/${locale}/work/${p.slug}`,
    external: false,
    source: "project",
  };
}

function filmToWorkItem(f: Film): WorkItem {
  const thumb = getVideoThumbnailUrl(f.platform, f.video_id, f.custom_thumbnail);
  return {
    slug: `film-${f.id}`,
    title: f.title,
    featuredImage: thumb,
    href: f.platform === "vimeo" ? `https://vimeo.com/${f.video_id}` : `https://www.youtube.com/watch?v=${f.video_id}`,
    external: true,
    source: "film",
    vimeoId: f.platform === "vimeo" ? f.video_id : undefined,
    youtubeId: f.platform === "youtube" ? f.video_id : undefined,
  };
}

export const revalidate = 0;

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

  const [projects, films] = await Promise.all([getAdminProjects(), getFilms()]);
  const projectItems = projects.map((p) => projectToWorkItem(p, locale));
  const filmItems = films.map((f) => filmToWorkItem(f));
  const items = [...projectItems, ...filmItems];

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
