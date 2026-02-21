import { createSupabaseServerClient } from "./supabase/server";
import { getPublicImageUrl } from "./supabase/storage";
import { PROJECTS_BUCKET } from "./supabase/storage";
import { toThumbPath, toLargePath } from "./imageVariantPath";

/** Bucket único para fotos de portfolio: projects. Path = slug/filename (ej. retratos/IMG_x.png). */
export const PHOTOS_BUCKET = PROJECTS_BUCKET;

const IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i;

export type PortfolioGallery = {
  id: string;
  name: string;
  slug: string;
  order: number;
  created_at: string;
  is_visible?: boolean;
};

export type PortfolioPhoto = {
  id: string;
  storage_path: string;
  public_url: string;
  is_visible: boolean;
  order: number;
  created_at: string;
  gallery_id: string | null;
};

function getFilesFromList(data: unknown): { name: string }[] {
  const raw = Array.isArray(data) ? data : [];
  return raw
    .filter(
      (f) =>
        typeof (f as { name?: string }).name === "string" &&
        IMAGE_EXT.test((f as { name: string }).name)
    )
    .map((f) => ({ name: (f as { name: string }).name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Lista archivos de imagen en Storage en bucket projects, prefijo slug/ (ej. retratos/).
 * Convención: path = slug/filename.
 */
async function listStorageFilesBySlug(slug: string): Promise<{ path: string; url: string }[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .list(slug, { limit: 1000 });
  if (error) return [];

  const files = getFilesFromList(data);
  return files.map((f) => {
    const path = `${slug}/${f.name}`.replace(/\/+/g, "/");
    return { path, url: getPublicImageUrl(path, PHOTOS_BUCKET) };
  });
}

/** Default gallery ID for legacy (slug portfolio). */
const DEFAULT_GALLERY_ID = "00000000-0000-0000-0000-000000000001";

/**
 * Sincroniza archivos de Storage en slug/ a portfolio_photos para la galería dada.
 * Inserta los que no existan como visibles al final.
 */
async function syncStorageToDbForGallery(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  galleryId: string,
  slug: string
): Promise<void> {
  if (!supabase) return;

  const storageFiles = await listStorageFilesBySlug(slug);
  const { data: existing } = await supabase
    .from("portfolio_photos")
    .select("storage_path")
    .eq("gallery_id", galleryId);
  const existingPaths = new Set((existing ?? []).map((r) => r.storage_path));

  const { data: maxOrderRow } = await supabase
    .from("portfolio_photos")
    .select("order")
    .eq("gallery_id", galleryId)
    .order("order", { ascending: false })
    .limit(1)
    .maybeSingle();
  let nextOrder = ((maxOrderRow?.order ?? -1) as number) + 1;

  for (const { path, url } of storageFiles) {
    if (existingPaths.has(path)) continue;
    await supabase.from("portfolio_photos").insert({
      storage_path: path,
      public_url: url,
      is_visible: true,
      order: nextOrder++,
      gallery_id: galleryId,
    });
  }
}

/**
 * Lists all portfolio galleries, ordered (admin: todas; público usa getPublicGalleriesWithPhotos).
 */
export async function listPortfolioGalleries(): Promise<PortfolioGallery[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("portfolio_galleries")
    .select("id, name, slug, order, created_at, is_visible")
    .order("order", { ascending: true });
  if (error) return [];
  return (data ?? []) as PortfolioGallery[];
}

/**
 * Public: returns only is_visible=true photos, ordered. Optional filter by galleryId.
 */
export async function getPublicPortfolioPhotos(galleryId?: string | null): Promise<PortfolioPhoto[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];

  let q = supabase
    .from("portfolio_photos")
    .select("*")
    .eq("is_visible", true)
    .order("order", { ascending: true });
  if (galleryId != null) q = q.eq("gallery_id", galleryId);
  const { data, error } = await q;
  if (error) return [];
  return (data ?? []) as PortfolioPhoto[];
}

/**
 * Public: galerías visibles con sus fotos, para /gallery. Orden por sort_order, título = name (no slug).
 */
export type GalleryWithPhotos = {
  id: string;
  title: string;
  slug: string;
  sort_order: number;
  photos: PortfolioPhoto[];
};

/** Public: random photos for home mini grid. Slice 4–6, lazy-load ready. */
export async function getRandomPhotosForHome(limit = 6): Promise<{ thumbUrl: string; largeUrl: string }[]> {
  const galleries = await getPublicGalleriesWithPhotos();
  const allPhotos = galleries.flatMap((g) => g.photos);
  const shuffled = [...allPhotos].sort(() => Math.random() - 0.5);
  const slice = shuffled.slice(0, Math.min(limit, Math.max(4, shuffled.length)));
  return slice.map((p) => ({
    thumbUrl: getPublicImageUrl(toThumbPath(p.storage_path), PHOTOS_BUCKET),
    largeUrl: getPublicImageUrl(toLargePath(p.storage_path), PHOTOS_BUCKET),
  }));
}

export async function getPublicGalleriesWithPhotos(): Promise<GalleryWithPhotos[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];

  const { data: galleries, error: ge } = await supabase
    .from("portfolio_galleries")
    .select("id, name, slug, order")
    .eq("is_visible", true)
    .order("order", { ascending: true });
  if (ge || !galleries?.length) return [];

  const out: GalleryWithPhotos[] = [];
  for (const g of galleries) {
    const { data: photos, error: pe } = await supabase
      .from("portfolio_photos")
      .select("*")
      .eq("gallery_id", g.id)
      .eq("is_visible", true)
      .order("order", { ascending: true });
    out.push({
      id: g.id,
      title: g.name,
      slug: g.slug,
      sort_order: g.order ?? 0,
      photos: (photos ?? []) as PortfolioPhoto[],
    });
  }
  return out;
}

/**
 * Admin: returns all photos for the given gallery (visible + hidden), ordered.
 * Lista desde Storage con slug de la galería y sincroniza a DB; luego devuelve filas de DB.
 */
export async function getAdminPortfolioPhotos(galleryId?: string | null): Promise<PortfolioPhoto[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];

  if (galleryId) {
    const { data: gallery } = await supabase
      .from("portfolio_galleries")
      .select("id, slug")
      .eq("id", galleryId)
      .maybeSingle();
    if (gallery?.slug) {
      await syncStorageToDbForGallery(supabase, galleryId, gallery.slug);
    }
  }

  let q = supabase.from("portfolio_photos").select("*").order("order", { ascending: true });
  if (galleryId != null) q = q.eq("gallery_id", galleryId);
  const { data, error } = await q;
  if (error) return [];
  return (data ?? []) as PortfolioPhoto[];
}
