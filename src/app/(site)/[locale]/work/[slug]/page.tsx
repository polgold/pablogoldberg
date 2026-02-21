import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getProjectBySlug, getAdjacentArchiveProjects } from "@/lib/content";
import { getProjectPosterUrl } from "@/lib/poster";
import { getLocaleFromParam } from "@/lib/i18n";
import { COPY } from "@/lib/i18n";
import { SITE_URL, getCanonicalUrl, getHreflangUrls } from "@/lib/site";
import { SafeHtml } from "@/components/SafeHtml";
import { VideoEmbed } from "@/components/VideoEmbed";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

function absoluteImageUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${SITE_URL}${url.startsWith("/") ? url : `/${url}`}`;
}

function getVideoUrl(primary: { type: "vimeo" | "youtube"; id: string }): string {
  if (primary.type === "vimeo") return `https://vimeo.com/video/${primary.id}`;
  return `https://www.youtube.com/watch?v=${primary.id}`;
}

/** OG video: secure_url (HTTPS) + type for Vimeo; url + type for YouTube. */
function getOgVideos(primary: { type: "vimeo" | "youtube"; id: string }): Array<{ url: string; type: string; width?: number; height?: number }> {
  if (primary.type === "vimeo") {
    const secureUrl = `https://player.vimeo.com/video/${primary.id}`;
    return [{ url: secureUrl, type: "text/html", width: 1920, height: 1080 }];
  }
  return [
    {
      url: `https://www.youtube.com/watch?v=${primary.id}`,
      type: "text/html",
      width: 1280,
      height: 720,
    },
  ];
}

export const revalidate = 60;
export const dynamic = "force-dynamic";

const DEFAULT_OG_IMAGE = "/og-default.png";
const FALLBACK_DESC_ES = "Proyecto de Pablo Goldberg. Director.";
const FALLBACK_DESC_EN = "Project by Pablo Goldberg. Director.";

export async function generateMetadata({ params }: PageProps) {
  const { locale, slug } = await params;
  const loc = getLocaleFromParam(locale);
  const project = await getProjectBySlug(slug, loc);
  const meta = COPY[loc].metadata;
  if (!project) return { title: meta.project };
  const desc =
    (project.summary || project.excerpt)?.trim()?.slice(0, 160) ||
    (loc === "es" ? FALLBACK_DESC_ES : FALLBACK_DESC_EN);
  const pageUrl = getCanonicalUrl(`/${locale}/work/${slug}`);
  const ogImage = project.featuredImage
    ? absoluteImageUrl(project.featuredImage)
    : `${SITE_URL}${DEFAULT_OG_IMAGE}`;
  const videos = project.primaryVideo ? getOgVideos(project.primaryVideo) : undefined;
  const hreflang = getHreflangUrls(`/work/${slug}`);
  return {
    title: project.title,
    description: desc,
    alternates: {
      canonical: pageUrl,
      languages: { es: hreflang.es, en: hreflang.en, "x-default": hreflang.es },
    },
    openGraph: {
      title: project.title,
      description: desc,
      type: "article",
      url: pageUrl,
      siteName: "Pablo Goldberg",
      images: [{ url: ogImage, width: 1200, height: 630, alt: project.title }],
      videos,
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: desc,
      images: [ogImage],
    },
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const loc = getLocaleFromParam(locale);
  const project = await getProjectBySlug(slug, loc);
  if (!project) notFound();

  const { prev, next } = await getAdjacentArchiveProjects(slug, loc);
  const primaryVideo = project.primaryVideo;
  const pageUrl = getCanonicalUrl(`/${locale}/work/${slug}`);
  const desc =
    (project.summary || project.excerpt)?.slice(0, 160) ||
    `${project.title}${project.year ? ` (${project.year})` : ""}. Director.`;

  const projectJsonLd =
    primaryVideo ?
      {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: project.title,
        description: desc,
        url: pageUrl,
        thumbnailUrl: project.featuredImage ? absoluteImageUrl(project.featuredImage) : undefined,
        embedUrl:
          primaryVideo.type === "vimeo"
            ? `https://player.vimeo.com/video/${primaryVideo.id}`
            : `https://www.youtube.com/embed/${primaryVideo.id}`,
        uploadDate: project.year ? `${project.year}-01-01` : undefined,
      }
    : {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: project.title,
        description: desc,
        url: pageUrl,
        image: project.featuredImage ? absoluteImageUrl(project.featuredImage) : undefined,
      };

  const gallery =
    project.galleryImages?.length > 0
      ? project.galleryImages
      : project.featuredImage
        ? [project.featuredImage]
        : [];
  const heroPoster =
    project.featuredImage ??
    (primaryVideo ? null : (await getProjectPosterUrl(project)));
  const t = COPY[loc].workDetail;

  return (
    <article className="min-h-screen border-t border-white/5 bg-black pt-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd) }}
      />
      {(primaryVideo || heroPoster) && (
        <div className="relative w-full">
          {primaryVideo ? (
            <div className="aspect-video w-full bg-black">
              <VideoEmbed
                type={primaryVideo.type}
                id={primaryVideo.id}
                title={project.title}
                className="h-full w-full"
              />
            </div>
          ) : heroPoster ? (
            <div className="relative aspect-video w-full bg-black">
              <Image
                src={heroPoster}
                alt=""
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
            </div>
          ) : null}
        </div>
      )}

      <div className="mx-auto max-w-[900px] px-5 pt-12 pb-16 md:px-8">
        {/* Title, year, short description only */}
        <header className="mb-12">
          <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            {project.title}
          </h1>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/60">
            {project.roles?.[0] && <span>{project.roles[0]}</span>}
            {project.year && <span>{project.year}</span>}
          </div>
          {(project.summary || project.excerpt) && (
            <div className="prose-safe mt-6 max-w-[65ch] text-base leading-relaxed text-white/85">
              <SafeHtml html={(project.summary || project.excerpt) ?? ""} />
            </div>
          )}
        </header>

        {project.content?.trim() ? (
          <div className="prose-safe mb-14 text-sm text-white/80">
            <SafeHtml html={project.content} />
          </div>
        ) : null}

        {/* Gallery / Stills — clean, cinematic spacing */}
        {gallery.length > 0 ? (
          <section className="space-y-8 md:space-y-12" aria-labelledby="gallery-heading">
            <h2 id="gallery-heading" className="text-[10px] uppercase tracking-wider text-white/40">
              {t.galleryStills}
            </h2>
            <div className="space-y-8 md:space-y-12">
            {gallery.map((src, i) => (
              <div
                key={i}
                className="relative aspect-[16/10] w-full overflow-hidden bg-white/5"
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 900px) 100vw, 900px"
                />
              </div>
            ))}
            </div>
          </section>
        ) : null}

        {project.credits?.trim() ? (
          <section className="mt-14 border-t border-white/5 pt-10">
            <h2 className="text-[10px] uppercase tracking-wider text-white/40">
              {t.credits}
            </h2>
            <div className="prose-safe mt-4 text-sm text-white/60">
              <SafeHtml html={project.credits} />
            </div>
          </section>
        ) : null}

        {project.externalLink?.trim() ? (
          <p className="mt-10">
            <a
              href={project.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white/60 hover:text-white"
            >
              {t.viewProject} →
            </a>
          </p>
        ) : null}

        {/* Minimal project nav */}
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
                ← {prev.title}
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
                {next.title} →
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
