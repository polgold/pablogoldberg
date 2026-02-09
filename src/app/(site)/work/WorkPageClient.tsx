"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import type { ProjectItem } from "@/types/content";

interface WorkPageClientProps {
  projects: ProjectItem[];
  locale: string;
}

export function WorkPageClient({ projects, locale }: WorkPageClientProps) {
  const [yearFilter, setYearFilter] = useState<string>("");
  const years = useMemo(() => {
    const set = new Set(projects.map((p) => p.year).filter(Boolean));
    return Array.from(set).sort((a, b) => (b ?? "").localeCompare(a ?? ""));
  }, [projects]);
  const filtered = useMemo(() => {
    if (!yearFilter) return projects;
    return projects.filter((p) => p.year === yearFilter);
  }, [projects, yearFilter]);

  if (projects.length === 0) {
    return (
      <p className="mt-8 text-sm text-white/40">
        {locale === "es" ? "No hay proyectos." : "No projects."}
      </p>
    );
  }

  return (
    <>
      {years.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setYearFilter("")}
            className={`rounded border px-3 py-1.5 text-xs transition-colors ${
              !yearFilter ? "border-white/40 text-white" : "border-white/20 text-white/60 hover:text-white"
            }`}
          >
            {locale === "es" ? "Todos" : "All"}
          </button>
          {years.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => setYearFilter(y ?? "")}
              className={`rounded border px-3 py-1.5 text-xs transition-colors ${
                yearFilter === y ? "border-white/40 text-white" : "border-white/20 text-white/60 hover:text-white"
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      )}
      <ul className="mt-8 grid grid-cols-2 gap-px bg-white/5 sm:grid-cols-3 lg:grid-cols-4">
      {filtered.map((project) => (
        <li key={project.slug} className="group bg-black">
          <Link
            href={`/${locale}/work/${project.slug}`}
            className="relative block aspect-[4/3] overflow-hidden focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-inset"
          >
            {project.featuredImage ? (
              <Image
                src={project.featuredImage}
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
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/85 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <span className="text-sm font-medium text-white">{project.title}</span>
              {project.year && <span className="ml-2 text-xs text-white/80">{project.year}</span>}
            </div>
          </Link>
        </li>
      ))}
    </ul>
    </>
  );
}
