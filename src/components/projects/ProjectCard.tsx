"use client";

import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/types/content";

/** Card para grid: cover, título, descripción corta, link a /work/[slug]. */
export function ProjectCard({
  project,
  coverUrl,
  locale,
}: {
  project: Project;
  coverUrl: string | null;
  locale: string;
}) {
  const shortDesc = project.description?.slice(0, 160).trim();
  const href = `/${locale}/work/${project.slug}`;

  return (
    <li className="group bg-black">
      <Link
        href={href}
        className="relative block aspect-[4/3] overflow-hidden bg-black focus:outline-none focus:ring-2 focus:ring-brand/50 focus:ring-inset"
      >
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt=""
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-white/5 text-xs text-white/30">
            {project.title}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-4">
          <span className="text-sm font-medium text-white">{project.title}</span>
          {shortDesc && (
            <p className="mt-1 line-clamp-2 text-xs text-white/70">{shortDesc}</p>
          )}
        </div>
      </Link>
    </li>
  );
}
