"use client";

import Link from "next/link";
import Image from "next/image";

/** Item mínimo para card (JSON Project o proyecto desde Supabase/admin). */
export type ProjectCardItem = { slug: string; title: string; description?: string };

const isLocalOrProxy = (url: string) =>
  url.includes("/api/proxy-image") || url.includes("/uploads/");

/** Card para grid: cover, título, descripción corta, link a /work/[slug]. */
export function ProjectCard({
  project,
  coverUrl,
  locale,
}: {
  project: ProjectCardItem;
  coverUrl: string | null;
  locale: string;
}) {
  const shortDesc = (project.description ?? "").slice(0, 160).trim();
  const href = `/${locale}/work/${project.slug}`;
  const useNativeImg = coverUrl ? isLocalOrProxy(coverUrl) : false;

  return (
    <li className="group bg-black">
      <Link
        href={href}
        className="relative block aspect-[3/2] overflow-hidden bg-black focus:outline-none focus:ring-2 focus:ring-brand/50 focus:ring-inset"
      >
        {coverUrl ? (
          <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-black/60">
            {useNativeImg ? (
              <>
                <img
                  src={coverUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-30 blur-xl scale-110"
                  aria-hidden
                  loading="lazy"
                />
                <img
                  src={coverUrl}
                  alt=""
                  className="absolute inset-0 z-10 h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                  loading="lazy"
                />
              </>
            ) : (
              <>
                <Image
                  src={coverUrl}
                  alt=""
                  fill
                  className="object-cover opacity-30 blur-xl scale-110"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  aria-hidden
                />
                <Image
                  src={coverUrl}
                  alt=""
                  fill
                  className="relative z-10 object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </>
            )}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center bg-white/5 text-xs text-white/30">
            {project.title}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/85 to-transparent p-4">
          <span className="text-sm font-medium text-white">{project.title}</span>
          {shortDesc && (
            <p className="mt-1 line-clamp-2 text-xs text-white/70">{shortDesc}</p>
          )}
        </div>
      </Link>
    </li>
  );
}
