import Link from "next/link";
import { getAdminProjects, getFilms, getProjectImageUrl, getVideoThumbnailUrl } from "@/lib/admin-content";
import { getVimeoPortfolioVideos } from "@/lib/vimeo";
import { getLocaleFromParam, COPY } from "@/lib/i18n";
import { getHreflangUrls } from "@/lib/site";
import { WorkPageClient } from "@/app/(site)/work/WorkPageClient";
import type { WorkItem } from "@/types/work";
import type { AdminProject, Film } from "@/lib/admin-content";

function projectToWorkItem(p: AdminProject, _locale: string): WorkItem {
  const loc = _locale === "en" ? "en" : "es";
  const title = loc === "en" && p.title_en ? p.title_en : p.title_es;
  const coverUrl = p.cover_image_path ? getProjectImageUrl(p.cover_image_path) : null;
  return {
    slug: p.slug,
    title,
    featuredImage: coverUrl,
    href: `/${_locale}/work/${p.slug}`,
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

function vimeoToWorkItem(v: { id: string; name: string; thumbnail: string; link: string; releaseTime?: string }): WorkItem {
  const year = v.releaseTime?.slice(0, 4) ?? undefined;
  return {
    slug: `vimeo-${v.id}`,
    title: v.name || `Video ${v.id}`,
    year,
    featuredImage: v.thumbnail || undefined,
    href: v.link || `https://vimeo.com/${v.id}`,
    external: true,
    source: "vimeo",
    vimeoId: v.id,
  };
}

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

  const [projects, films, vimeoVideos] = await Promise.all([
    getAdminProjects(),
    getFilms(),
    getVimeoPortfolioVideos().catch(() => []),
  ]);

  const projectItems: WorkItem[] = projects.map((p) => projectToWorkItem(p, locale));
  const filmItems: WorkItem[] = films.map((f) => filmToWorkItem(f));
  const vimeoItems: WorkItem[] = vimeoVideos.map((v) => vimeoToWorkItem(v));
  const items = [...projectItems, ...filmItems, ...vimeoItems];

  const tWork = COPY[loc].work;

  return (
    <div className="min-h-screen border-t border-white/5 bg-black pt-14">
      <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 md:px-8">
        <section className="mb-12" aria-labelledby="work-heading">
          <h2 id="work-heading" className="text-xl font-semibold text-white md:text-2xl">
            {tWork.title}
          </h2>
          {items.length === 0 ? (
            <p className="mt-4 text-sm text-white/60">
              {locale === "es"
                ? "Agregá proyectos y films desde el panel de administración."
                : "Add projects and films from the admin panel."}
            </p>
          ) : (
            <>
              <WorkPageClient items={items} locale={locale} />
              <div className="mt-12 flex justify-center">
                <Link
                  href={`/${locale}/work/archive`}
                  className="inline-flex items-center justify-center rounded-sm border border-white/30 px-6 py-3 text-sm font-medium text-white transition-colors hover:border-brand hover:text-brand focus:outline-none focus:ring-2 focus:ring-brand/50 focus:ring-offset-2 focus:ring-offset-black"
                >
                  {tWork.viewAllWork}
                </Link>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
