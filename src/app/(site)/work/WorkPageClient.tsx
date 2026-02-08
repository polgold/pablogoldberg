"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { ProjectItem } from "@/types/content";

const ROLES = ["Director", "Cinematography/DP", "Producer", "Drone", "Photography"] as const;

interface WorkPageClientProps {
  projects: ProjectItem[];
}

export function WorkPageClient({ projects }: WorkPageClientProps) {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");

  const filtered = useMemo(() => {
    let list = projects;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.excerpt && p.excerpt.toLowerCase().includes(q)) ||
          (p.roles && p.roles.some((r) => r.toLowerCase().includes(q)))
      );
    }
    if (role) {
      list = list.filter((p) => p.roles?.includes(role));
    }
    return list;
  }, [projects, search, role]);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setRole("")}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand ${
            !role ? "border-brand bg-brand/20 text-brand" : "border-white/20 text-white/80 hover:border-white/40"
          }`}
        >
          Todos
        </button>
        {ROLES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand ${
              role === r ? "border-brand bg-brand/20 text-brand" : "border-white/20 text-white/80 hover:border-white/40"
            }`}
          >
            {r}
          </button>
        ))}
      </div>
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          placeholder="Buscar proyectos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded border border-white/20 bg-white/5 px-4 py-2 text-white placeholder-white/40 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand sm:w-64"
          aria-label="Buscar proyectos"
        />
        <p className="text-sm text-white/60">
          {filtered.length} proyecto{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>
      <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((project) => (
          <li key={project.slug}>
            <Link
              href={`/work/${project.slug}`}
              className="group block overflow-hidden rounded-lg border border-white/10 bg-surface-card transition-colors hover:border-white/20"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-white/5">
                {project.featuredImage ? (
                  <Image
                    src={project.featuredImage}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-white/30">Sin imagen</div>
                )}
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="text-sm text-white/90">
                    {project.year && `${project.year} · `}
                    {project.title}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h2 className="font-medium text-white">{project.title}</h2>
                <p className="mt-1 text-sm text-white/60">
                  {project.year && `${project.year}`}
                  {project.roles?.length ? ` · ${project.roles.join(", ")}` : ""}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {filtered.length === 0 && (
        <p className="mt-12 text-center text-white/60">No hay proyectos que coincidan.</p>
      )}
    </>
  );
}
