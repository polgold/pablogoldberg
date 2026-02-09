import { createSupabaseServerClient } from "./supabase/server";
import { getPublicImageUrl } from "./supabase/storage";
import { PROJECTS_BUCKET } from "./supabase/storage";

const PORTFOLIO_PREFIX = "portfolio";
const IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i;

/**
 * Lista URLs públicas de las imágenes en el bucket projects, carpeta portfolio/.
 * Sin texto ni metadata; solo URLs para una galería limpia.
 */
export async function getPortfolioGalleryUrls(): Promise<string[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase.storage.from(PROJECTS_BUCKET).list(PORTFOLIO_PREFIX);
    if (error || !data?.length) return [];
    const urls = data
      .filter((f) => f.name && IMAGE_EXT.test(f.name))
      .map((f) => getPublicImageUrl(`${PORTFOLIO_PREFIX}/${f.name}`, PROJECTS_BUCKET));
    return urls;
  } catch {
    return [];
  }
}
