import { readFileSync } from "fs";
import { join } from "path";
import type { PageItem, ProjectItem, Taxonomy } from "@/types/content";

const GENERATED = join(process.cwd(), "content/generated");

export function getPages(): PageItem[] {
  const json = readFileSync(join(GENERATED, "pages.json"), "utf-8");
  return JSON.parse(json);
}

export function getProjects(): ProjectItem[] {
  const json = readFileSync(join(GENERATED, "projects.json"), "utf-8");
  return JSON.parse(json);
}

export function getTaxonomy(): Taxonomy {
  const json = readFileSync(join(GENERATED, "taxonomy.json"), "utf-8");
  return JSON.parse(json);
}

export function getPageBySlug(slug: string): PageItem | undefined {
  return getPages().find((p) => p.slug === slug);
}

export function getProjectBySlug(slug: string): ProjectItem | undefined {
  return getProjects().find((p) => p.slug === slug);
}

export function getFeaturedProjects(limit = 6): ProjectItem[] {
  return getProjects()
    .slice(0, limit)
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}

export function getProjectSlugs(): string[] {
  return getProjects().map((p) => p.slug);
}

export function getAdjacentProjects(slug: string): { prev: ProjectItem | null; next: ProjectItem | null } {
  const list = getProjects().sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const i = list.findIndex((p) => p.slug === slug);
  if (i < 0) return { prev: null, next: null };
  return {
    prev: i > 0 ? list[i - 1] ?? null : null,
    next: i < list.length - 1 ? list[i + 1] ?? null : null,
  };
}
