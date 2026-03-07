import Link from "next/link";
import Image from "next/image";
import { getAdminProjectBySlug, getProjectGalleryImages, getProjectVideos, getProjectImageUrl } from "@/lib/admin-content";
import { getLocaleFromParam } from "@/lib/i18n";
import { COPY } from "@/lib/i18n";
import { SafeHtml } from "@/components/SafeHtml";
import { VideoEmbed } from "@/components/VideoEmbed";
import { GalleryWithLightbox } from "@/components/GalleryWithLightbox";

function normalizeExternalUrl(url: string): string {
  const u = url.trim();
  if (!u) return u;
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  return `https://${u}`;
}

export async function AdminProjectPage({
  slug,
  locale,
}: {
  slug: string;
  locale: string;
}) {
  const project = await getAdminProjectBySlug(slug);
  if (!project) return null;

  const loc = getLocaleFromParam(locale) as "es" | "en";
  const title = loc === "en" && project.title_en ? project.title_en : project.title_es;
  const description = loc === "en" && project.description_en ? project.description_en : project.description_es;

  const [galleryImages, projectVideos] = await Promise.all([
    getProjectGalleryImages(project.id),
    getProjectVideos(project.id),
  ]);

  const galleryPaths = galleryImages.map((g) => ({
    thumb: getProjectImageUrl(g.thumb_path),
    large: getProjectImageUrl(g.path),
  }));
  const coverUrl = project.cover_image_path ? getProjectImageUrl(project.cover_image_path) : null;
  const t = COPY[loc].workDetail;

  const heroVideo =
    project.hero_video_platform && project.hero_video_id
      ? {
          type: project.hero_video_platform as "vimeo" | "youtube",
          id: project.hero_video_id,
          embedUrl:
            project.hero_video_platform === "vimeo"
              ? `https://player.vimeo.com/video/${project.hero_video_id}`
              : `https://www.youtube.com/embed/${project.hero_video_id}`,
        }
      : null;

  const links: { url: string; label?: string }[] = [];
  if (project.website) links.push({ url: project.website, label: t.viewProject });
  if (project.instagram) links.push({ url: project.instagram, label: "Instagram" });

  const allProjects = await import("@/lib/admin-content").then((m) => m.getAdminProjects());
  const currentIdx = allProjects.findIndex((p) => p.slug === slug);
  const prev = currentIdx > 0 ? allProjects[currentIdx - 1] : null;
  const next = currentIdx >= 0 && currentIdx < allProjects.length - 1 ? allProjects[currentIdx + 1] ?? null : null;

  return (
    <article className="min-h-screen border-t border-white/5 bg-black pt-14">
      {(heroVideo || coverUrl) && (
        <div className="relative w-full">
          {heroVideo ? (
            <div className="aspect-video w-full bg-black">
              <VideoEmbed
                type={heroVideo.type}
                id={heroVideo.id}
                embedUrl={heroVideo.embedUrl}
                title={title}
                className="h-full w-full"
              />
            </div>
          ) : coverUrl ? (
            <div className="relative aspect-video w-full bg-black">
              <Image
                src={coverUrl}
                alt=""
                fill
                className="object-cover"
                sizes="100vw"
                priority
                unoptimized
              />
            </div>
          ) : null}
        </div>
      )}

      <div className="mx-auto max-w-[900px] px-5 pt-12 pb-16 md:px-8">
        <header className="mb-12">
          <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">{title}</h1>
          {description && (
            <div className="prose-safe mt-6 max-w-[65ch] text-base leading-relaxed text-white/85">
              <SafeHtml html={description} />
            </div>
          )}
        </header>

        {projectVideos.length > 0 && (
          <section className="mb-14 space-y-6" aria-labelledby="reels-heading">
            <h2 id="reels-heading" className="text-[10px] uppercase tracking-wider text-white/40">
              {t.reelsTrailers}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {projectVideos.map((v) => (
                <div key={v.id} className="aspect-video w-full overflow-hidden rounded bg-white/5">
                  <VideoEmbed
                    type={v.platform}
                    id={v.video_id}
                    title={`${title} — ${t.reelsTrailers}`}
                    className="h-full w-full"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {galleryPaths.length > 0 && (
          <section className="mt-14" aria-labelledby="gallery-heading">
            <h2 id="gallery-heading" className="mb-4 text-[10px] uppercase tracking-wider text-white/40">
              {t.galleryStills}
            </h2>
            <GalleryWithLightbox paths={galleryPaths} />
          </section>
        )}

        {links.length > 0 && (
          <section className="mt-10 space-y-2" aria-labelledby="links-heading">
            <h2 id="links-heading" className="text-[10px] uppercase tracking-wider text-white/40">
              {t.links}
            </h2>
            <ul className="flex flex-wrap gap-x-6 gap-y-1">
              {links.map((link, i) => (
                <li key={i}>
                  <a
                    href={normalizeExternalUrl(link.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/70 underline decoration-white/30 underline-offset-2 hover:text-white hover:decoration-white/50"
                  >
                    {link.label?.trim() || link.url} →
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <nav
          className="mt-16 flex flex-wrap items-center justify-between gap-6 border-t border-white/5 pt-10"
          aria-label={t.navLabel}
        >
          <div className="min-w-0 flex-1">
            {prev ? (
              <Link
                href={`/${locale}/work/${prev.slug}`}
                className="text-xs text-white/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-black"
              >
                ← {loc === "en" && prev.title_en ? prev.title_en : prev.title_es}
              </Link>
            ) : (
              <span />
            )}
          </div>
          <Link
            href={`/${locale}/work`}
            className="text-xs text-white/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-black"
          >
            {t.viewAll}
          </Link>
          <div className="min-w-0 flex-1 text-right">
            {next ? (
              <Link
                href={`/${locale}/work/${next.slug}`}
                className="text-xs text-white/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-black"
              >
                {loc === "en" && next.title_en ? next.title_en : next.title_es} →
              </Link>
            ) : (
              <span />
            )}
          </div>
        </nav>
      </div>
    </article>
  );
}
