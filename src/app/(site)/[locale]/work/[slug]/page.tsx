import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getProjectBySlug, getAdjacentProjects } from "@/lib/content";
import { getLocaleFromParam } from "@/lib/i18n";
import { COPY } from "@/lib/i18n";
import { SafeHtml } from "@/components/SafeHtml";
import { VideoEmbed } from "@/components/VideoEmbed";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export const revalidate = 60;
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps) {
  const { locale, slug } = await params;
  const loc = getLocaleFromParam(locale);
  const project = await getProjectBySlug(slug, loc);
  if (!project) return { title: loc === "es" ? "Proyecto" : "Project" };
  const desc =
    (project.summary || project.excerpt)?.slice(0, 160) ||
    `${project.title}${project.year ? ` (${project.year})` : ""}. Director.`;
  return {
    title: project.title,
    description: desc,
    openGraph: {
      title: project.title,
      description: desc,
      type: "article",
      images: project.featuredImage ? [{ url: project.featuredImage }] : undefined,
    },
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const loc = getLocaleFromParam(locale);
  const project = await getProjectBySlug(slug, loc);
  if (!project) notFound();

  const { prev, next } = await getAdjacentProjects(slug, loc);
  const primaryVideo = project.primaryVideo;
  const gallery =
    project.galleryImages?.length > 0
      ? project.galleryImages
      : project.featuredImage
        ? [project.featuredImage]
        : [];
  const t = COPY[loc].workDetail;

  return (
    <article className="min-h-screen border-t border-white/5 bg-black pt-14">
      {/* Hero media first */}
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
        ) : project.featuredImage ? (
          <div className="relative aspect-video w-full bg-black">
            <Image
              src={project.featuredImage}
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          </div>
        ) : null}
      </div>

      <div className="mx-auto max-w-[900px] px-5 pt-12 pb-16 md:px-8">
        {/* Title, year, short description only */}
        <header className="mb-12">
          <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            {project.title}
          </h1>
          {project.year && (
            <p className="mt-2 text-sm text-white/60">
              {project.year}
            </p>
          )}
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

        {/* Gallery — clean, cinematic spacing */}
        {gallery.length > 0 ? (
          <section className="space-y-8 md:space-y-12">
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
              {locale === "es" ? "Ver proyecto" : "View project"} →
            </a>
          </p>
        ) : null}

        {/* Minimal project nav */}
        <nav
          className="mt-16 flex flex-wrap items-center justify-between gap-6 border-t border-white/5 pt-10"
          aria-label={locale === "es" ? "Navegación entre proyectos" : "Project navigation"}
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
