/**
 * Lectura pública de galerías desde el índice (DB). No escanear disco en cada request.
 */
import "server-only";
import { listGalleries, listGalleryItems, getFeaturedItemsForHome, getGalleryById } from "./db";
import { UPLOADS_BASE_URL } from "./config";
import type { GalleryWithPhotos } from "@/lib/portfolio-photos-shared";
import type { GallerySection } from "./config";

function toPublicUrl(relativePath: string): string {
  const clean = relativePath.replace(/^\//, "").replace(/\\/g, "/");
  return `${UPLOADS_BASE_URL}/${clean}`;
}

/**
 * Galerías listas para el front (solo visibles, orden por sort_order).
 * section opcional: solo photography, work, etc.
 */
export function getGalleriesForPublic(section?: GallerySection): GalleryWithPhotos[] {
  const galleries = section
    ? listGalleries().filter((g) => g.section === section)
    : listGalleries();
  return galleries.map((g, i) => {
    const items = listGalleryItems(g.id, true);
    return {
      id: String(g.id),
      title: g.title,
      slug: g.slug,
      sort_order: i,
      photos: items.map((p) => ({
        thumbUrl: toPublicUrl(p.thumb_path),
        largeUrl: toPublicUrl(p.large_path),
        fallbackThumbUrl: toPublicUrl(p.thumb_path),
        fallbackLargeUrl: toPublicUrl(p.large_path),
      })),
    };
  });
}

/**
 * Items destacados para la mini galería de home (is_featured_home o visibles recientes).
 */
export function getFeaturedForHome(limit = 12): Array<{
  thumbUrl: string;
  largeUrl: string;
  gallerySlug: string;
  section: string;
  itemId: number;
}> {
  const items = getFeaturedItemsForHome(limit);
  return items.map((p) => {
    const g = getGalleryById(p.gallery_id);
    return {
      thumbUrl: toPublicUrl(p.thumb_path),
      largeUrl: toPublicUrl(p.large_path),
      gallerySlug: g?.slug ?? "",
      section: g?.section ?? "",
      itemId: p.id,
    };
  });
}
