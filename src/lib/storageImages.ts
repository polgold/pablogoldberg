/**
 * URLs optimizadas para Supabase Storage (Image Transformations).
 * Reduce egress: thumb para grilla, large para lightbox. Nunca original.
 * Memo por bucket+path+size para evitar recalcular en cada render.
 */

const baseUrl = (): string => (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");

const cache = new Map<string, string>();

function cacheKey(bucket: string, path: string, size: "thumb" | "large"): string {
  return `${bucket}:${path}:${size}`;
}

/**
 * URL transformada: width 600, quality 60. WebP automático por Supabase.
 * Uso: grilla / listado de fotos.
 */
export function getThumbUrl(bucket: string, path: string): string {
  if (!path) return "";
  const key = cacheKey(bucket, path, "thumb");
  let url = cache.get(key);
  if (url) return url;
  const base = baseUrl();
  if (!base) return "";
  const cleanPath = path.replace(/^\//, "");
  url = `${base}/storage/v1/render/image/public/${bucket}/${cleanPath}?width=600&quality=60`;
  cache.set(key, url);
  return url;
}

/**
 * URL transformada: width 1600, quality 70. Para lightbox / vista completa.
 */
export function getLargeUrl(bucket: string, path: string): string {
  if (!path) return "";
  const key = cacheKey(bucket, path, "large");
  let url = cache.get(key);
  if (url) return url;
  const base = baseUrl();
  if (!base) return "";
  const cleanPath = path.replace(/^\//, "");
  url = `${base}/storage/v1/render/image/public/${bucket}/${cleanPath}?width=1600&quality=70`;
  cache.set(key, url);
  return url;
}
