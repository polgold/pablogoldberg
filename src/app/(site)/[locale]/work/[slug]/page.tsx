import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getProjectBySlug, getProjectBySlugFromJson, getProjectsFromJson, getAdjacentArchiveProjects, parseVideoUrl } from "@/lib/content";
import { getProjectPosterUrl } from "@/lib/poster";
import { getBackstageImages } from "@/lib/projects-backstage";
import { getWorkImageUrl } from "@/lib/work-images";
import { getFilmCoverPath, getFilmGalleryBySlug } from "@/lib/work-galleries";
import { getLocaleFromParam } from "@/lib/i18n";
import { COPY } from "@/lib/i18n";
import { SITE_URL, getCanonicalUrl, getHreflangUrls, SUN_FACTORY_URL } from "@/lib/site";
import { SafeHtml } from "@/components/SafeHtml";
import { VideoEmbed } from "@/components/VideoEmbed";
import { GalleryWithLightbox } from "@/components/GalleryWithLightbox";
import { ProjectPage as ProjectPageLayout } from "@/components/projects/ProjectPage";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}


/** Asegura que el link sea absoluto (https://) para que no se interprete como ruta relativa. */
function normalizeExternalUrl(url: string): string {
  const u = url.trim();
  if (!u) return u;
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  return `https://${u}`;
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

const DEFAULT_OG_IMAGE = "/opengraph-image";
const FALLBACK_DESC_ES = "Proyecto de Pablo Goldberg. Director.";
const FALLBACK_DESC_EN = "Project by Pablo Goldberg. Director.";

/** Sinopsis por idioma para Bestefar (solo este proyecto tiene copy bilingüe fijo). */
const BESTEFAR_SYNOPSIS: Record<"es" | "en", string> = {
  en: `<p>As Christmas approaches, Karen decorates her tree in Argentina when an unexpected message arrives from a woman in Norway. The woman reveals a surprising connection: her grandmother was once romantically involved with Karen's grandfather, nearly a century ago. Intrigued, Karen sifts through old family photographs, hoping to uncover traces of this long-lost relationship. But the deeper she delves, the more questions arise.</p>
<p>Determined to uncover the truth, Karen embarks on a journey to Norway to reunite with her family and trace her grandfather's past. Her trip unfolds into a rich exploration of childhood memories, her "Bestefar's" immigration story, lost love, and the scars of war—leading her closer to the answers she's been searching for.</p>`,
  es: `<p>Se acerca la Navidad, y Karen está decorando su árbol en Argentina cuando llega un mensaje inesperado. Una mujer de Noruega le revela una sorprendente conexión, su abuela había estado de novia con el abuelo de Karen, hace casi 100 años. Intrigada, Karen busca en viejos álbumes familiares esperando encontrar algún rastro de esta relación perdida. Cuanto más busca, más preguntas surgen.</p>
<p>Determinada a descubrir la verdad, Karen se embarca en un viaje a Noruega para reunirse con su familia y rastrear el pasado de su abuelo. Su viaje se vuelve una profunda exploración de sus recuerdos de infancia, la historia de inmigración de su "Bestefar", amores perdidos y las cicatrices de la guerra, acercándola a las respuestas que estaba buscando.</p>`,
};

function getProjectSummary(project: { slug: string; summary?: string; excerpt?: string }, locale: "es" | "en"): string {
  if (project.slug === "bestefar") return BESTEFAR_SYNOPSIS[locale];
  return (project.summary || project.excerpt || "").trim();
}

/** Versión plana para meta description (primeros 160 caracteres). */
function getProjectSummaryPlain(project: { slug: string; summary?: string; excerpt?: string }, locale: "es" | "en"): string {
  const html = getProjectSummary(project, locale);
  const plain = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return plain.slice(0, 160);
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, slug } = await params;
  const loc = getLocaleFromParam(locale);
  // Admin-driven primero, luego JSON, luego Supabase legacy
  const adminProject = await import("@/lib/admin-content").then((m) => m.getAdminProjectBySlug(slug));
  const jsonProject = adminProject ? null : await getProjectBySlugFromJson(loc, slug);
  const project = adminProject
    ? { title: loc === "en" && adminProject.title_en ? adminProject.title_en : adminProject.title_es, slug: adminProject.slug, description: loc === "en" && adminProject.description_en ? adminProject.description_en : adminProject.description_es, featuredImage: adminProject.cover_image_path ? `/api/proxy-image?path=${encodeURIComponent(adminProject.cover_image_path)}` : undefined, primaryVideo: adminProject.hero_video_platform && adminProject.hero_video_id ? { type: adminProject.hero_video_platform, id: adminProject.hero_video_id } : undefined }
    : jsonProject ?? (await getProjectBySlug(slug, loc));
  const meta = COPY[loc].metadata;
  if (!project) return { title: meta.project };
  const rawDesc =
    "excerpt" in project
      ? getProjectSummaryPlain(project, loc)
      : ("description" in project ? String((project as { description?: string }).description ?? "") : "") ||
        (loc === "es" ? FALLBACK_DESC_ES : FALLBACK_DESC_EN);
  const desc = rawDesc.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160);
  const pageUrl = getCanonicalUrl(`/${locale}/work/${slug}`);
  const projectSlug = "slug" in project ? project.slug : "";
  const workCoverPath = projectSlug ? getFilmCoverPath(projectSlug) : null;
  const featuredImage = "featuredImage" in project ? project.featuredImage : undefined;
  const ogImage =
    featuredImage && String(featuredImage).startsWith("http")
      ? featuredImage
      : workCoverPath
        ? `${SITE_URL}${getWorkImageUrl(workCoverPath)}`
        : featuredImage
          ? `${SITE_URL}${String(featuredImage).replace(/^\//, "")}`
          : `${SITE_URL}${DEFAULT_OG_IMAGE}`;
  const primaryVideo =
    "primaryVideo" in project && project.primaryVideo
      ? (project as { primaryVideo: { type: "vimeo" | "youtube"; id: string; embedUrl?: string } }).primaryVideo
      : "videoUrl" in project
        ? parseVideoUrl((project as { videoUrl?: string }).videoUrl)
        : undefined;
  const videos = primaryVideo
    ? getOgVideos({ type: "type" in primaryVideo ? primaryVideo.type : primaryVideo.provider, id: primaryVideo.id })
    : undefined;
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

export default async function ProjectPageRoute({ params }: PageProps) {
  const { locale, slug } = await params;
  const loc = getLocaleFromParam(locale);

  // Admin-driven: proyecto desde admin_projects (prioridad)
  const adminProject = await import("@/lib/admin-content").then((m) => m.getAdminProjectBySlug(slug));
  if (adminProject) {
    const { AdminProjectPage } = await import("./AdminProjectPage");
    return <AdminProjectPage slug={slug} locale={locale} />;
  }

  // Legacy: proyecto desde JSON → imágenes desde /public/uploads/work/film/
  const jsonProject = await getProjectBySlugFromJson(loc, slug);
  if (jsonProject) {
    const [allJsonProjects, backstageImages] = await Promise.all([
      getProjectsFromJson(loc),
      getBackstageImages(jsonProject.storageFolder, 12),
    ]);
    const workCoverPath = getFilmCoverPath(jsonProject.slug);
    const coverUrl = workCoverPath ? getWorkImageUrl(workCoverPath) : null;
    const primaryVideo = parseVideoUrl(jsonProject.videoUrl) ?? null;
    const allProjects = allJsonProjects.map((p) => {
      const pCover = getFilmCoverPath(p.slug);
      return {
        slug: p.slug,
        title: p.title,
        coverUrl: pCover ? getWorkImageUrl(pCover) : null,
      };
    });
    const t = COPY[loc].workDetail;
    const jsonPageUrl = getCanonicalUrl(`/${locale}/work/${slug}`);
    const jsonDesc = jsonProject.description?.slice(0, 160) || (loc === "es" ? FALLBACK_DESC_ES : FALLBACK_DESC_EN);
    const jsonPrimaryVideo = parseVideoUrl(jsonProject.videoUrl) ?? null;
    const jsonProjectJsonLd = jsonPrimaryVideo
      ? {
          "@context": "https://schema.org",
          "@type": "VideoObject",
          name: jsonProject.title,
          description: jsonDesc,
          url: jsonPageUrl,
          thumbnailUrl: coverUrl ? (coverUrl.startsWith("/") ? `${SITE_URL}${coverUrl}` : coverUrl) : undefined,
          embedUrl:
            jsonPrimaryVideo.provider === "vimeo"
              ? `https://player.vimeo.com/video/${jsonPrimaryVideo.id}`
              : `https://www.youtube.com/embed/${jsonPrimaryVideo.id}`,
          productionCompany: { "@type": "Organization", name: "Sun Factory", url: SUN_FACTORY_URL },
        }
      : {
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: jsonProject.title,
          description: jsonDesc,
          url: jsonPageUrl,
          image: coverUrl ? (coverUrl.startsWith("/") ? `${SITE_URL}${coverUrl}` : coverUrl) : undefined,
          productionCompany: { "@type": "Organization", name: "Sun Factory", url: SUN_FACTORY_URL },
        };
    return (
      <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonProjectJsonLd) }}
      />
      <ProjectPageLayout
        project={jsonProject}
        coverUrl={coverUrl}
        backstageImages={backstageImages}
        primaryVideo={primaryVideo}
        allProjects={allProjects}
        currentSlug={jsonProject.slug}
        moreProjectsLabel={t.moreProjects}
        linksLabel={t.links}
        viewProjectLabel={t.viewProject}
        viewAllLabel={t.viewAll}
        locale={locale}
      />
      </>
    );
  }

  // Fallback: proyecto desde Supabase (metadata; imágenes desde work si existe)
  const project = await getProjectBySlug(slug, loc);
  if (!project) notFound();

  const { prev, next } = await getAdjacentArchiveProjects(project.slug, loc);
  const primaryVideo = project.primaryVideo;
  const pageUrl = getCanonicalUrl(`/${locale}/work/${slug}`);
  const desc =
    getProjectSummaryPlain(project, loc) ||
    `${project.title}${project.year ? ` (${project.year})` : ""}. Director.`;

  const workCoverForSupabase = getFilmCoverPath(project.slug);
  const projectOgImage = workCoverForSupabase
    ? `${SITE_URL}${getWorkImageUrl(workCoverForSupabase)}`
    : project.featuredImage?.startsWith("http")
      ? project.featuredImage
      : project.featuredImage
        ? `${SITE_URL}${project.featuredImage.replace(/^\//, "")}`
        : undefined;
  const projectJsonLd =
    primaryVideo ?
      {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: project.title,
        description: desc,
        url: pageUrl,
        thumbnailUrl: projectOgImage,
        embedUrl:
          (primaryVideo as { embedUrl?: string }).embedUrl ??
          ("type" in primaryVideo && primaryVideo.type === "vimeo"
            ? `https://player.vimeo.com/video/${primaryVideo.id}`
            : `https://www.youtube.com/embed/${primaryVideo.id}`),
        uploadDate: project.year ? `${project.year}-01-01` : undefined,
      }
    : {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: project.title,
        description: desc,
        url: pageUrl,
        image: projectOgImage,
      };

  const filmGallery = getFilmGalleryBySlug(project.slug);
  const gallery: string[] = filmGallery
    ? filmGallery.photos.map((p) => p.thumbPath)
    : (project.galleryImages ?? []).filter(Boolean);
  const workCover = getFilmCoverPath(project.slug);
  const heroPosterRaw = workCover
    ? getWorkImageUrl(workCover)
    : project.featuredImage?.startsWith("http")
      ? project.featuredImage
      : primaryVideo
        ? null
        : (await getProjectPosterUrl(project));
  const heroPoster = heroPosterRaw ?? null;
  const t = COPY[loc].workDetail;

  return (
    <article className="min-h-screen border-t border-white/5 bg-black pt-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd) }}
      />
      {(primaryVideo?.id || heroPoster) && (
        <div className="relative w-full">
          {primaryVideo ? (
            <div className="aspect-video w-full bg-black">
              <VideoEmbed
                type={primaryVideo.type}
                id={primaryVideo.id}
                embedUrl={primaryVideo.embedUrl}
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
                unoptimized={heroPoster.startsWith("/api/") || heroPoster.includes("/api/proxy-image") || heroPoster.includes("/uploads/")}
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
          {getProjectSummary(project, loc) && (
            <div className="prose-safe mt-6 max-w-[65ch] text-base leading-relaxed text-white/85">
              <SafeHtml html={getProjectSummary(project, loc)} />
            </div>
          )}
        </header>

        {project.content?.trim() ? (
          <div className="prose-safe mb-14 text-sm text-white/80">
            <SafeHtml html={project.content} />
          </div>
        ) : null}

        {/* Reels / Trailers — YouTube o Vimeo */}
        {project.reelVideos && project.reelVideos.length > 0 ? (
          <section className="mb-14 space-y-6" aria-labelledby="reels-heading">
            <h2 id="reels-heading" className="text-[10px] uppercase tracking-wider text-white/40">
              {t.reelsTrailers}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {project.reelVideos.map((v, i) => (
                <div key={`${v.type}-${v.id}-${i}`} className="aspect-video w-full overflow-hidden rounded bg-white/5">
                  <VideoEmbed type={v.type} id={v.id} title={`${project.title} — ${t.reelsTrailers}`} className="h-full w-full" />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* Gallery — 4x4 desktop, 2 cols mobile; thumbs para grid, large para lightbox */}
        {gallery.length > 0 ? (
          <section className="mt-14" aria-labelledby="gallery-heading">
            <h2 id="gallery-heading" className="mb-4 text-[10px] uppercase tracking-wider text-white/40">
              {t.galleryStills}
            </h2>
            <GalleryWithLightbox paths={gallery} />
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

        {(() => {
          const hasMain = Boolean(project.externalLink?.trim());
          const links = project.projectLinks ?? [];
          const hasLinks = hasMain || links.length > 0;
          if (!hasLinks) return null;
          const restLinks = hasMain ? links : links.slice(1);
          return (
            <section className="mt-10 space-y-2" aria-labelledby="links-heading">
              <h2 id="links-heading" className="text-[10px] uppercase tracking-wider text-white/40">
                {t.links}
              </h2>
              <ul className="flex flex-wrap gap-x-6 gap-y-1">
                {hasMain && (
                  <li>
                    <a
                      href={normalizeExternalUrl(project.externalLink!)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-white/70 underline decoration-white/30 underline-offset-2 hover:text-white hover:decoration-white/50"
                    >
                      {t.viewProject} →
                    </a>
                  </li>
                )}
                {!hasMain && links.length > 0 && (
                  <li>
                    <a
                      href={normalizeExternalUrl(links[0].url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-white/70 underline decoration-white/30 underline-offset-2 hover:text-white hover:decoration-white/50"
                    >
                      {t.viewProject} →
                    </a>
                  </li>
                )}
                {restLinks.map((link, i) => (
                  <li key={i}>
                    <a
                      href={normalizeExternalUrl(link.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-white/70 underline decoration-white/30 underline-offset-2 hover:text-white hover:decoration-white/50"
                    >
                      {link.label?.trim() || link.url}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          );
        })()}

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
