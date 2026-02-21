import { createSupabaseServerClient } from "./supabase/server";
import { getPublicImageUrl } from "./supabase/storage";
import { PROJECTS_BUCKET } from "./supabase/storage";
import { toThumbPathPrefix } from "./imageVariantPath";

const IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i;

function getBucket(): string {
  return process.env.PORTFOLIO_GALLERY_BUCKET?.trim() || PROJECTS_BUCKET;
}

/** Carpeta: env PORTFOLIO_GALLERY_FOLDER o por defecto portfolio, Portfolio, uploads */
function getFolderToTry(): string[] {
  const env = process.env.PORTFOLIO_GALLERY_FOLDER?.trim();
  if (env) return [env];
  return ["portfolio", "Portfolio", "uploads/portfolio", "uploads"];
}

function getFilesFromList(data: unknown): { name: string }[] {
  const raw = Array.isArray(data) ? data : [];
  return raw
    .filter((f) => typeof (f as { name?: string }).name === "string" && IMAGE_EXT.test((f as { name: string }).name))
    .map((f) => ({ name: (f as { name: string }).name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Lista URLs públicas de las imágenes en el bucket projects.
 * Prueba carpetas portfolio/Portfolio/uploads; o lista la raíz y busca carpetas con imágenes.
 */
export async function getPortfolioGalleryUrls(): Promise<string[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];

  const bucket = getBucket();
  const folders = getFolderToTry();

  for (const folder of folders) {
    try {
      const { data, error } = await supabase.storage.from(bucket).list(folder, { limit: 500 });
      if (error) continue;
      const files = getFilesFromList(data);
      if (files.length === 0) continue;
      return files.map((f) =>
        getPublicImageUrl(toThumbPathPrefix(`${folder}/${f.name}`.replace(/\/+/g, "/")), bucket)
      );
    } catch {
      continue;
    }
  }

  // Fallback: listar raíz y entrar en cada carpeta hasta encontrar imágenes
  try {
    const { data: rootData, error: rootError } = await supabase.storage.from(bucket).list("", { limit: 50 });
    if (rootError || !Array.isArray(rootData)) return [];
    for (const item of rootData) {
      const dirName = (item as { name?: string }).name;
      if (!dirName || dirName.includes(".")) continue;
      const { data: dirData, error: dirError } = await supabase.storage.from(bucket).list(dirName, { limit: 500 });
      if (dirError) continue;
      const files = getFilesFromList(dirData);
      if (files.length > 0) {
        return files.map((f) =>
          getPublicImageUrl(toThumbPathPrefix(`${dirName}/${f.name}`.replace(/\/+/g, "/")), bucket)
        );
      }
    }
  } catch {
    // ignore
  }
  return [];
}
