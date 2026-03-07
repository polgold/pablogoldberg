/**
 * Utilidades para admin (sin server-only, usables en cliente).
 * URLs de imágenes y thumbnails de video.
 *
 * Imágenes: directas desde /uploads/ cuando UPLOAD_DIR no está definido (dev).
 * Proxy solo cuando NEXT_PUBLIC_USE_IMAGE_PROXY=true (Hostinger con UPLOAD_DIR externo).
 */

const USE_PROXY = typeof process !== "undefined" && process.env.NEXT_PUBLIC_USE_IMAGE_PROXY === "true";

/** URL para imagen en almacenamiento persistente */
export function getProjectImageUrl(relativePath: string): string {
  if (!relativePath?.trim()) return "";
  const clean = relativePath.replace(/^\//, "").replace(/\\/g, "/").replace(/\/+/g, "/").trim();
  if (USE_PROXY) {
    return `/api/proxy-image?path=${encodeURIComponent(clean)}`;
  }
  const path = clean.startsWith("uploads/") ? clean : `uploads/${clean}`;
  return `/${path}`;
}

/** Thumbnail de video: custom_thumbnail si existe, sino plataforma (Vimeo/YouTube) */
export function getVideoThumbnailUrl(
  platform: string,
  videoId: string,
  customThumbnail?: string | null
): string {
  if (customThumbnail?.trim()) return customThumbnail.trim();
  if (platform === "youtube") {
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  }
  if (platform === "vimeo") {
    return `https://vumbnail.com/${videoId}.jpg`;
  }
  return "";
}
