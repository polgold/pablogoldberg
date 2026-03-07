/**
 * Tipos y constantes de portfolio/photography. Sin dependencias Node (importable desde cliente).
 */

export const PHOTOS_BUCKET = "projects";

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
  photos: PortfolioPhoto[];
};
