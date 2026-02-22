/**
 * Backstage: hasta 12 imágenes desde Storage en ${storageFolder}/backstage.
 * Dedupe por nombre, orden por name ASC, determinístico.
 */
import { createSupabaseServerClient } from "./supabase/server";
import { getPublicImageUrl } from "./supabase/storage";
import { PROJECTS_BUCKET } from "./supabase/storage";
import { toThumbPath, toLargePath } from "./imageVariantPath";

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function isImageName(name: string): boolean {
  const i = name.lastIndexOf(".");
  return i >= 0 && IMAGE_EXT.has(name.slice(i).toLowerCase());
}

export type BackstageImage = { thumbUrl: string; largeUrl: string; originalUrl: string; alt: string };

/**
 * Lista imágenes en ${storageFolder}/backstage, orden por name ASC, dedupe por name, máx 12.
 * thumbUrl/largeUrl usan toThumbPath/toLargePath; originalUrl como fallback si no existen thumbs.
 */
export async function getBackstageImages(
  storageFolder: string,
  limit = 12
): Promise<BackstageImage[]> {
  if (!storageFolder?.trim()) return [];
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];

  const folder = `${storageFolder.replace(/\/$/, "")}/backstage`;
  const { data: files, error } = await supabase.storage
    .from(PROJECTS_BUCKET)
    .list(folder, { limit: 200 });

  if (error || !files?.length) return [];

  const byName = new Map<string, string>();
  for (const f of files) {
    if (!f.name || f.name.startsWith(".") || !isImageName(f.name)) continue;
    const path = `${folder}/${f.name}`;
    const key = f.name.toLowerCase();
    if (!byName.has(key)) byName.set(key, path);
  }
  const paths = Array.from(byName.values()).sort((a, b) => a.localeCompare(b)).slice(0, limit);

  return paths.map((path) => {
    const thumbPath = toThumbPath(path);
    const largePath = toLargePath(path);
    return {
      thumbUrl: getPublicImageUrl(thumbPath, PROJECTS_BUCKET),
      largeUrl: getPublicImageUrl(largePath, PROJECTS_BUCKET),
      originalUrl: getPublicImageUrl(path, PROJECTS_BUCKET),
      alt: path.split("/").pop()?.replace(/\.[^/.]+$/, "") || "Backstage",
    };
  });
}
