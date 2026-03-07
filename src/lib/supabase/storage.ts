/**
 * Helper para URLs de imágenes en Supabase Storage o almacenamiento local (Hostinger).
 * Si USE_LOCAL_STORAGE=true, las imágenes se sirven por /api/proxy-image (lee de public/uploads/projects).
 */

import { isLocalStorageEnabled } from "@/lib/local-storage";

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "public";

/** Bucket específico para proyectos (cover + gallery). */
export const PROJECTS_BUCKET = "projects";

/**
 * Devuelve la URL pública de un objeto en el bucket.
 * Si USE_LOCAL_STORAGE=true y bucket es projects, devuelve URL del proxy (sirve desde disco).
 */
export function getPublicImageUrl(path: string, bucket?: string): string {
  if (!path) return "";
  if (isLocalStorageEnabled() && (bucket === PROJECTS_BUCKET || !bucket)) {
    const clean = path.replace(/^\//, "").replace(/\\/g, "/").replace(/\/+/g, "/");
    return `/api/proxy-image?path=${encodeURIComponent(clean)}`;
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  if (!url) return path;
  const base = url.replace(/\/$/, "");
  const b = (bucket ?? BUCKET).replace(/\/$/, "");
  const cleanPath = path.replace(/^\//, "");
  const encodedPath = cleanPath.split("/").map((seg) => encodeURIComponent(seg)).join("/");
  return `${base}/storage/v1/object/public/${b}/${encodedPath}`;
}

/** URL pública para assets en bucket projects: <slug>/cover.*, <slug>/gallery/* */
export function getProjectsImageUrl(path: string): string {
  return getPublicImageUrl(path, PROJECTS_BUCKET);
}

/** URL para cover/gallery: usa projects bucket si path es <slug>/... sino public bucket (legacy). */
export function getProjectAssetUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("covers/") || path.startsWith("gallery/") || path.startsWith("videos/")) {
    return getPublicImageUrl(path, BUCKET);
  }
  return getProjectsImageUrl(path);
}

/** Tipo mínimo para crear signed URL desde server. */
type SupabaseStorageClient = {
  storage: {
    from: (b: string) => {
      createSignedUrl: (path: string, expiresIn: number) => Promise<{ data: { signedUrl: string } | null }>;
      upload: (path: string, body: Blob | ArrayBuffer | ArrayBufferView | File, options?: { upsert?: boolean }) => Promise<{ data: { path: string } | null; error: unknown }>;
      remove: (paths: string[]) => Promise<{ data: unknown; error: unknown }>;
    };
  };
};

/**
 * Desde server: genera una URL firmada (útil si el bucket no es público).
 * Pasar el cliente de createSupabaseServerClient().
 */
export async function getSignedImageUrl(
  supabase: SupabaseStorageClient,
  path: string,
  expiresInSeconds = 60 * 60
): Promise<string> {
  return getSignedImageUrlWithBucket(supabase, path, expiresInSeconds, BUCKET);
}

/** URL firmada para un bucket concreto (ej. projects). */
export async function getSignedImageUrlWithBucket(
  supabase: SupabaseStorageClient,
  path: string,
  expiresInSeconds = 60 * 60,
  bucket = PROJECTS_BUCKET
): Promise<string> {
  if (!path) return "";
  try {
    const clean = path.replace(/^\//, "");
    const { data } = await supabase.storage.from(bucket).createSignedUrl(clean, expiresInSeconds);
    return data?.signedUrl ?? getPublicImageUrl(path, bucket);
  } catch {
    return getPublicImageUrl(path, bucket);
  }
}

export { BUCKET as SUPABASE_STORAGE_BUCKET };
