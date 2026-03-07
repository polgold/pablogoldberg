/**
 * URLs de imágenes para /public/uploads/work/.
 * Todas las imágenes se sirven directamente desde el repo (sin proxy, sin Supabase).
 * Base: /uploads/work/
 */

export const WORK_UPLOADS_BASE = "uploads/work";

/** Devuelve la URL pública para un path relativo bajo uploads/work. */
export function getWorkImageUrl(relativePath: string): string {
  if (!relativePath?.trim()) return "";
  const clean = relativePath.replace(/^\//, "").replace(/\\/g, "/").replace(/\/+/g, "/");
  return `/${WORK_UPLOADS_BASE}/${clean}`;
}

/** Path thumb → large (reemplaza /thumb/ o /thumbs/ por /large/). */
export function toLargeFromThumb(thumbPath: string): string {
  return thumbPath.replace(/\/thumbs?\//, "/large/");
}
