/**
 * Obtiene la URL del poster/thumbnail para un proyecto.
 * Orden: work cover → coverImagePath → video thumbnail (YT/Vimeo) → primera imagen galería work → null
 */
import { getWorkImageUrl } from "./work-images";
import { getFilmCoverPath, getFilmGalleryBySlug } from "./work-galleries";
import type { ProjectItem } from "@/types/content";

/** YouTube thumbnail oficial hqdefault.jpg */
function youtubeThumbUrl(id: string): string {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

/** Cache simple para Vimeo oEmbed (evitar re-fetch en mismo request). */
const vimeoThumbCache = new Map<string, string>();

/** Obtiene thumbnail de Vimeo vía oEmbed. Cache por request. */
async function fetchVimeoThumbnail(videoId: string): Promise<string | null> {
  const cached = vimeoThumbCache.get(videoId);
  if (cached) return cached;
  try {
    const url = `https://vimeo.com/api/oembed.json?url=https%3A%2F%2Fvimeo.com%2Fvideo%2F${encodeURIComponent(videoId)}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const json = (await res.json()) as { thumbnail_url?: string };
    const thumb = json?.thumbnail_url ? String(json.thumbnail_url).trim() : null;
    if (thumb) vimeoThumbCache.set(videoId, thumb);
    return thumb;
  } catch {
    return null;
  }
}

/**
 * Devuelve la URL del poster para la card del proyecto.
 * Async porque Vimeo requiere fetch oEmbed.
 */
export async function getProjectPosterUrl(project: ProjectItem): Promise<string | null> {
  // 1) work cover (film/{slug}/)
  const workCover = getFilmCoverPath(project.slug);
  if (workCover) return getWorkImageUrl(workCover);

  // 2) featuredImage (URL externa, ej. Vimeo thumbnail)
  if (project.featuredImage?.startsWith("http")) return project.featuredImage;

  // 3) video thumbnail (YouTube o Vimeo)
  const pv = project.primaryVideo;
  if (pv) {
    if (pv.type === "youtube") return youtubeThumbUrl(pv.id);
    if (pv.type === "vimeo") {
      const thumb = await fetchVimeoThumbnail(pv.id);
      if (thumb) return thumb;
    }
  }

  // 4) primera imagen de galería work
  const filmGallery = getFilmGalleryBySlug(project.slug);
  if (filmGallery?.photos?.length) return filmGallery.photos[0].thumbUrl;

  return null;
}
