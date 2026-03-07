/**
 * URLs públicas para imágenes de galerías (sin "use server").
 */
import { UPLOADS_BASE_URL } from "./config";
import type { GalleryItemRow } from "./db";

export function getUploadUrl(relativePath: string): string {
  const clean = relativePath.replace(/^\//, "").replace(/\\/g, "/");
  return `${UPLOADS_BASE_URL}/${clean}`;
}

export type GalleryItemWithUrl = GalleryItemRow & {
  thumbUrl: string;
  largeUrl: string;
};

export function withItemUrls(items: GalleryItemRow[]): GalleryItemWithUrl[] {
  return items.map((p) => ({
    ...p,
    thumbUrl: getUploadUrl(p.thumb_path),
    largeUrl: getUploadUrl(p.large_path),
  }));
}
