/**
 * Lista imágenes de una galería desde Supabase Storage (bucket projects).
 * Estructura: <gallerySlug>/thumb/* y <gallerySlug>/large/*
 * Para Admin Portfolio Photos: mostrar fotos existentes en Storage sin depender solo de DB.
 */
import { createSupabaseServerClient } from "./supabase/server";
import { getPublicImageUrl } from "./supabase/storage";
import { PROJECTS_BUCKET } from "./supabase/storage";
import { isLocalStorageEnabled, listLocalImageFiles } from "./local-storage";

const IMAGE_EXT = /\.(jpe?g|png|webp|avif|gif)$/i;

export type StorageGalleryImage = {
  thumbPath: string;
  largePath: string;
  thumbUrl: string;
  largeUrl: string;
};

/**
 * Lista archivos de imagen en <gallerySlug>/thumb/, construye URLs para thumb y large.
 * Filtra por extensión, ordena por nombre ASC, dedupe por nombre.
 */
export async function listGalleryFromStorage(
  gallerySlug: string
): Promise<StorageGalleryImage[]> {
  if (!gallerySlug?.trim()) return [];
  const slug = gallerySlug.trim();

  if (isLocalStorageEnabled()) {
    const out: StorageGalleryImage[] = [];
    const seen = new Set<string>();
    for (const folder of [`${slug}/thumb`, `${slug}/Thumb`]) {
      const names = listLocalImageFiles(folder).sort((a, b) => a.localeCompare(b));
      for (const name of names) {
        const key = name.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        const thumbPath = `${slug}/thumb/${name}`;
        const largePath = `${slug}/large/${name}`;
        out.push({
          thumbPath,
          largePath,
          thumbUrl: getPublicImageUrl(thumbPath, PROJECTS_BUCKET),
          largeUrl: getPublicImageUrl(largePath, PROJECTS_BUCKET),
        });
      }
    }
    return out;
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) return [];

  const thumbFolder = `${slug}/thumb`;
  const thumbFolderAlt = `${slug}/Thumb`;
  const out: StorageGalleryImage[] = [];
  const seen = new Set<string>();

  for (const folder of [thumbFolder, thumbFolderAlt]) {
    const { data: files, error } = await supabase.storage
      .from(PROJECTS_BUCKET)
      .list(folder, { limit: 1000 });

    if (error || !files?.length) continue;

    const names = files
      .filter(
        (f) =>
          typeof f.name === "string" &&
          !f.name.startsWith(".") &&
          IMAGE_EXT.test(f.name)
      )
      .map((f) => f.name as string)
      .sort((a, b) => a.localeCompare(b));

    for (const name of names) {
      const key = name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      const thumbPath = `${slug}/thumb/${name}`;
      const largePath = `${slug}/large/${name}`;
      out.push({
        thumbPath,
        largePath,
        thumbUrl: getPublicImageUrl(thumbPath, PROJECTS_BUCKET),
        largeUrl: getPublicImageUrl(largePath, PROJECTS_BUCKET),
      });
    }
  }

  return out;
}
