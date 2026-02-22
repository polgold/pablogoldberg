import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/types/content";
import type { BackstageImage } from "@/lib/projects-backstage";
import { VideoEmbed } from "@/components/VideoEmbed";
import { BackstageGrid } from "./BackstageGrid";

/** Normaliza URL externa (https://). */
function normalizeUrl(url: string): string {
  const u = url.trim();
  if (!u) return u;
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  return `https://${u}`;
}

/** Layout proyecto: título, portada, descripción, video, 12 backstage, links. Secciones vacías no se muestran. */
export function ProjectPage({
  project,
  coverUrl,
  backstageImages,
  primaryVideo,
  linksLabel,
  viewProjectLabel,
  viewAllLabel,
  locale,
}: {
  project: Project;
  coverUrl: string | null;
  backstageImages: BackstageImage[];
  primaryVideo: { type: "vimeo" | "youtube"; id: string } | null;
  linksLabel: string;
  viewProjectLabel: string;
  viewAllLabel: string;
  locale: string;
}) {
  const hasLinks = Boolean(project.websiteUrl?.trim() || (project.socials?.length ?? 0) > 0);

  return (
    <article className="min-h-screen border-t border-white/5 bg-black pt-14">
      <div className="mx-auto max-w-[900px] px-5 pt-8 pb-16 md:px-8">
        <header className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            {project.title}
          </h1>
        </header>

        {/* Cover */}
        {coverUrl && (
          <div className="relative aspect-video w-full overflow-hidden rounded bg-white/5 mb-10">
            <Image
              src={coverUrl}
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          </div>
        )}

        {/* Description */}
        {project.description?.trim() && (
          <div className="prose-safe mb-10 max-w-[65ch] text-base leading-relaxed text-white/85">
            {project.description.split(/\n+/).filter(Boolean).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        )}

        {/* Video */}
        {primaryVideo?.id && (
          <div className="mb-12 aspect-video w-full overflow-hidden rounded bg-black">
            <VideoEmbed
              type={primaryVideo.type}
              id={primaryVideo.id}
              title={project.title}
              className="h-full w-full"
            />
          </div>
        )}

        {/* Backstage — exactamente hasta 12 */}
        {backstageImages.length > 0 && (
          <section className="mb-12" aria-labelledby="backstage-heading">
            <h2 id="backstage-heading" className="mb-4 text-[10px] uppercase tracking-wider text-white/40">
              Backstage
            </h2>
            <BackstageGrid images={backstageImages} />
          </section>
        )}

        {/* Links: website + socials */}
        {hasLinks && (
          <section className="border-t border-white/5 pt-10" aria-labelledby="links-heading">
            <h2 id="links-heading" className="text-[10px] uppercase tracking-wider text-white/40">
              {linksLabel}
            </h2>
            <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-1">
              {project.websiteUrl?.trim() && (
                <li>
                  <a
                    href={normalizeUrl(project.websiteUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/70 underline decoration-white/30 underline-offset-2 hover:text-white hover:decoration-white/50"
                  >
                    {viewProjectLabel} →
                  </a>
                </li>
              )}
              {project.socials?.map((s, i) => (
                <li key={i}>
                  <a
                    href={normalizeUrl(s.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/70 underline decoration-white/30 underline-offset-2 hover:text-white hover:decoration-white/50"
                  >
                    {s.label?.trim() || s.url}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <nav className="mt-16 flex justify-center border-t border-white/5 pt-10">
          <Link
            href={`/${locale}/work`}
            className="text-xs text-white/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-black"
          >
            ← {viewAllLabel}
          </Link>
        </nav>
      </div>
    </article>
  );
}
