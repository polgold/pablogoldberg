/**
 * Helper para URLs de imágenes en Supabase Storage.
 * Si el bucket es público: getPublicUrl.
 * Si el bucket es privado: usar createSignedUrl desde server (service role).
 */

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "public";

/** Bucket específico para proyectos (cover + gallery). */
export const PROJECTS_BUCKET = "projects";

/**
 * Devuelve la URL pública de un objeto en el bucket.
 * Usar cuando el bucket está configurado como público.
 */
export function getPublicImageUrl(path: string, bucket?: string): string {
  if (!path) return "";
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
      createSignedUrl: (path: string, expiresIn: number) => Promise<{ data: { signedUrl: string } }>;
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
  if (!path) return "";
  try {
    const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path.replace(/^\//, ""), expiresInSeconds);
    return data?.signedUrl ?? getPublicImageUrl(path);
  } catch {
    return getPublicImageUrl(path);
  }
}

export { BUCKET as SUPABASE_STORAGE_BUCKET };
