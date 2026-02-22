"use client";

import Link from "next/link";
import { ProjectCard } from "./ProjectCard";
import type { Project } from "@/types/content";

/** Featured Work: grid de ProjectCards debajo del hero. Determinístico. */
export function FeaturedWork({
  projects,
  locale,
  title,
  viewAllLabel,
}: {
  projects: Array<{ project: Project; coverUrl: string | null }>;
  locale: string;
  title: string;
  viewAllLabel: string;
}) {
  if (projects.length === 0) return null;

  return (
    <section
      className="border-b border-white/5 bg-black px-4 py-14 sm:px-6 md:px-8"
      aria-labelledby="featured-work-heading"
    >
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h2
            id="featured-work-heading"
            className="text-xl font-semibold text-white md:text-2xl"
          >
            {title}
          </h2>
          <Link
            href={`/${locale}/work`}
            className="text-sm font-medium text-white/80 underline decoration-brand/50 underline-offset-2 transition-colors hover:text-brand hover:decoration-brand focus:outline-none focus:ring-2 focus:ring-brand/50 focus:ring-offset-2 focus:ring-offset-black"
          >
            {viewAllLabel}
          </Link>
        </div>
        <ul className="grid grid-cols-2 gap-px bg-white/5 sm:grid-cols-3 lg:grid-cols-4">
          {projects.map(({ project, coverUrl }) => (
            <ProjectCard
              key={project.slug}
              project={project}
              coverUrl={coverUrl}
              locale={locale}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
