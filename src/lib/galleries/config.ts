/**
 * Configuración para galerías locales (MEDIA_ROOT fuera del build).
 * En local: data/uploads. En Hostinger: ej. /data/pablogoldberg/uploads
 */
import path from "path";

const DEFAULT_MEDIA_ROOT = path.join(process.cwd(), "data", "uploads");

/** Raíz persistente de medios. No usar public/uploads para no perder en deploy. */
export function getMediaRoot(): string {
  const root = process.env.MEDIA_ROOT?.trim() || DEFAULT_MEDIA_ROOT;
  return path.isAbsolute(root) ? root : path.join(process.cwd(), root);
}

/** Base URL pública para las imágenes (ej. /uploads). */
export const UPLOADS_BASE_URL = "/uploads";

/** Secciones de galerías (photography, work, aerial, etc.). */
export const GALLERY_SECTIONS = ["photography", "work", "beasts", "aerial"] as const;
export type GallerySection = (typeof GALLERY_SECTIONS)[number];

/** Ruta relativa dentro de uploads: section/slug/large|thumb/filename */
export function getGalleryRelativePath(
  section: string,
  slug: string,
  size: "large" | "thumb",
  filename: string
): string {
  return [section, slug, size, filename].filter(Boolean).join("/");
}

/** Path absoluto en disco para una galería (carpeta base section/slug). */
export function getGalleryDir(mediaRoot: string, section: string, slug: string): string {
  return path.join(mediaRoot, section, slug);
}

export function getLargeDir(mediaRoot: string, section: string, slug: string): string {
  return path.join(mediaRoot, section, slug, "large");
}

export function getThumbDir(mediaRoot: string, section: string, slug: string): string {
  return path.join(mediaRoot, section, slug, "thumb");
}
