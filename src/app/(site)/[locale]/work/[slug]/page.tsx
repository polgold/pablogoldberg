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
    `${project.title}${project.year ? ` (${project.year})` : ""}. Director, DP, Producer.`;
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
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {project.title}
        </h1>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/70">
          {project.client ? <span>{project.client}</span> : null}
          {project.pieceType ? <span>{project.pieceType}</span> : null}
          {project.duration ? <span>{project.duration}</span> : null}
          {project.roles?.length ? (
            <span>{project.roles.join(" · ")}</span>
          ) : null}
          {project.year ? <span>{project.year}</span> : null}
        </div>
      </header>

      {(project.summary || project.excerpt) ? (
        <div className="prose-safe mb-10 text-white/90">
          <SafeHtml html={(project.summary || project.excerpt) ?? ""} />
        </div>
      ) : null}

      {primaryVideo ? (
        <div className="mb-12">
          <VideoEmbed
            type={primaryVideo.type}
            id={primaryVideo.id}
            title={project.title}
            className="rounded-lg"
          />
        </div>
      ) : null}

      {project.content?.trim() ? (
        <div className="prose-safe mb-12 text-white/80">
          <SafeHtml html={project.content} />
        </div>
      ) : null}

      {gallery.length > 0 ? (
        <section className="mb-12">
          <h2 className="mb-6 text-sm font-medium uppercase tracking-widest text-white/60">
            {t.gallery}
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {gallery.map((src, i) => (
              <li
                key={i}
                className="relative aspect-video overflow-hidden rounded-lg bg-white/5"
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {project.credits?.trim() ? (
        <section className="mb-12 border-t border-white/10 pt-8">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-widest text-white/60">
            {t.credits}
          </h2>
          <div className="prose-safe text-sm text-white/70">
            <SafeHtml html={project.credits} />
          </div>
        </section>
      ) : null}

      {project.externalLink?.trim() ? (
        <p className="mb-12">
          <a
            href={project.externalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand hover:underline focus:outline-none focus:ring-2 focus:ring-brand"
          >
            {locale === "es" ? "Ver proyecto" : "View project"} →
          </a>
        </p>
      ) : null}

      <nav
        className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-8"
        aria-label={locale === "es" ? "Navegación entre proyectos" : "Project navigation"}
      >
        <div className="min-w-0 flex-1">
          {prev ? (
            <Link
              href={`/${locale}/work/${prev.slug}`}
              className="group inline-flex items-center gap-2 text-brand hover:underline focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <span aria-hidden>←</span>
              <span className="truncate">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
        </div>
        <Link
          href={`/${locale}/work`}
          className="text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-brand"
        >
          {t.viewAll}
        </Link>
        <div className="min-w-0 flex-1 text-right">
          {next ? (
            <Link
              href={`/${locale}/work/${next.slug}`}
              className="group inline-flex items-center gap-2 text-brand hover:underline focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <span className="truncate">{next.title}</span>
              <span aria-hidden>→</span>
            </Link>
          ) : (
            <span />
          )}
        </div>
      </nav>
    </article>
  );
}
