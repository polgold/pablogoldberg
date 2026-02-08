/**
 * LEGACY: No usado por la aplicación.
 * La web usa únicamente src/lib/content.ts, que obtiene datos de Payload CMS.
 * Este archivo leía proyectos desde content/generated/projects.json (export WordPress).
 * Se mantiene por referencia; no importar en el proyecto.
 */
import fs from "node:fs";
import path from "node:path";

export type Project = {
  slug: string;
  title?: string;
  year?: number | string;
  roles?: string[];
  excerpt?: string;
  html?: string;
  coverImage?: string;
  videoUrl?: string;
  gallery?: string[];
};

const GENERATED_DIR = path.join(process.cwd(), "content", "generated");
const PROJECTS_JSON = path.join(GENERATED_DIR, "projects.json");

export function readProjects(): Project[] {
  try {
    if (!fs.existsSync(PROJECTS_JSON)) return [];
    const raw = fs.readFileSync(PROJECTS_JSON, "utf-8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Project[];
  } catch {
    return [];
  }
}

export function readProjectBySlug(slug: string): Project | null {
  const projects = readProjects();
  return projects.find((p) => p.slug === slug) ?? null;
}
