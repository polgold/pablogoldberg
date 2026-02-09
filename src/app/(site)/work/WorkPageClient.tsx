"use client";

import Link from "next/link";
import Image from "next/image";
import type { ProjectItem } from "@/types/content";

interface WorkPageClientProps {
  projects: ProjectItem[];
  locale: string;
}

export function WorkPageClient({ projects, locale }: WorkPageClientProps) {
  if (projects.length === 0) {
    return (
      <p className="font-body text-sm uppercase tracking-widest text-white/40">
        {locale === "es" ? "No hay proyectos." : "No projects."}
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <li key={project.slug} className="group border-b border-white/5">
          <Link
            href={`/${locale}/work/${project.slug}`}
            className="relative block aspect-[4/3] overflow-hidden focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-inset"
          >
            {project.featuredImage ? (
              <Image
                src={project.featuredImage}
                alt=""
                fill
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-white/5 font-body text-xs uppercase tracking-widest text-white/30">
                {locale === "es" ? "Sin imagen" : "No image"}
              </div>
            )}
            <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/80 via-transparent to-transparent p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="font-body text-sm uppercase tracking-widest text-white">
                {project.title}
              </span>
              {project.year && (
                <span className="font-body text-xs uppercase tracking-widest text-white/70">
                  {project.year}
                </span>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
