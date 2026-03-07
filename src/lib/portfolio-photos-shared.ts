/**
 * Tipos compartidos para galerías de fotografía.
 * Compatible con carga desde filesystem (work-galleries) o legacy DB.
 */

/** @deprecated Usar work-images para URLs. Mantenido por compatibilidad con imports. */
export const PHOTOS_BUCKET = "projects";

export type GalleryPhotoItem = {
  thumbUrl: string;
  largeUrl: string;
  fallbackThumbUrl?: string;
  fallbackLargeUrl?: string;
};

export type PortfolioGallery = {
  id: string;
  name: string;
  slug: string;
  order: number;
  created_at: string;
  is_visible?: boolean;
};

export type PortfolioPhoto = {
  id: string;
  storage_path: string;
  public_url: string;
  is_visible: boolean;
  order: number;
  created_at: string;
  gallery_id: string | null;
};

export type GalleryWithPhotos = {
  id: string;
  title: string;
  slug: string;
  sort_order: number;
  photos: GalleryPhotoItem[];
};
