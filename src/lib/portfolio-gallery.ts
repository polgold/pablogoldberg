import { createSupabaseServerClient } from "./supabase/server";
import { getPublicImageUrl } from "./supabase/storage";
import { PROJECTS_BUCKET } from "./supabase/storage";

const IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i;

function getBucket(): string {
  return process.env.PORTFOLIO_GALLERY_BUCKET?.trim() || PROJECTS_BUCKET;
}

/** Carpeta: env PORTFOLIO_GALLERY_FOLDER o por defecto probamos portfolio, uploads/portfolio, uploads */
function getFolderToTry(): string[] {
  const env = process.env.PORTFOLIO_GALLERY_FOLDER?.trim();
  if (env) return [env];
  return ["portfolio", "uploads/portfolio", "uploads"];
}

/**
 * Lista URLs públicas de las imágenes en el bucket projects.
 * Carpeta configurable: PORTFOLIO_GALLERY_FOLDER (ej. "portfolio" o "uploads").
 * Sin texto ni metadata; solo URLs para una galería limpia.
 */
export async function getPortfolioGalleryUrls(): Promise<string[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];

  const bucket = getBucket();
  const folders = getFolderToTry();

  for (const folder of folders) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(folder, { limit: 500 });
      if (error) continue;
      const raw = Array.isArray(data) ? data : [];
      const files = raw
        .filter((f): f is { name: string } => typeof (f as { name?: unknown }).name === "string" && IMAGE_EXT.test((f as { name: string }).name))
        .sort((a, b) => a.name.localeCompare(b.name));
      if (files.length === 0) continue;
      return files.map((f) =>
        getPublicImageUrl(`${folder}/${f.name}`.replace(/\/+/g, "/"), bucket)
      );
    } catch {
      continue;
    }
  }
  return [];
}
