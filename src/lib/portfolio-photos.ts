import { createSupabaseServerClient } from "./supabase/server";
import { getPublicImageUrl } from "./supabase/storage";
import { PROJECTS_BUCKET } from "./supabase/storage";
import { toThumbPathPrefix, toLargePathPrefix } from "./imageVariantPath";
import { listGalleryFromStorage } from "./admin-storage-gallery";

/** Bucket único para fotos de portfolio: projects. Path = slug/filename (ej. retratos/IMG_x.png). */
export const PHOTOS_BUCKET = PROJECTS_BUCKET;

const IMAGE_EXT = /\.(jpe?g|png|webp|avif|gif)$/i;

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
 * Lista archivos de imagen en Storage: slug/thumb/* (y slug/Thumb/* por mayúsculas).
 * Convención: path = slug/thumb/filename → public_url para thumb; large = slug/large/filename.
 */
async function listStorageFilesBySlug(slug: string): Promise<{ path: string; url: string }[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];

  const out: { path: string; url: string }[] = [];
  const seen = new Set<string>();

  for (const sub of ["thumb", "Thumb"]) {
    const folder = `${slug}/${sub}`;
    const { data, error } = await supabase.storage
      .from(PHOTOS_BUCKET)
      .list(folder, { limit: 1000 });
    if (error || !data?.length) continue;

    const files = getFilesFromList(data);
    for (const f of files) {
      const path = `${slug}/${sub}/${f.name}`.replace(/\/+/g, "/");
      const key = path.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ path, url: getPublicImageUrl(path, PHOTOS_BUCKET) });
    }
  }

  return out.sort((a, b) => a.path.localeCompare(b.path));
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

/** Public: random photos for home mini grid. Slice 4–6, lazy-load ready. Incluye fallback por si thumb/large 404. */
export async function getRandomPhotosForHome(limit = 6): Promise<{ thumbUrl: string; largeUrl: string; fallbackThumbUrl?: string; fallbackLargeUrl?: string }[]> {
  const galleries = await getPublicGalleriesWithPhotos();
  const allPhotos = galleries.flatMap((g) => g.photos);
  const shuffled = [...allPhotos].sort(() => Math.random() - 0.5);
  const slice = shuffled.slice(0, Math.min(limit, Math.max(4, shuffled.length)));
  return slice.map((p) => {
    const path = p.storage_path;
    const thumbUrl = getPublicImageUrl(toThumbPathPrefix(path), PHOTOS_BUCKET);
    const largeUrl = getPublicImageUrl(toLargePathPrefix(path), PHOTOS_BUCKET);
    const fallback = getPublicImageUrl(path, PHOTOS_BUCKET);
    return { thumbUrl, largeUrl, fallbackThumbUrl: fallback, fallbackLargeUrl: fallback };
  });
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
 * Sincroniza Storage → DB; si la DB sigue vacía, devuelve fotos listadas desde Storage como fallback.
 */
export async function getAdminPortfolioPhotos(galleryId?: string | null): Promise<PortfolioPhoto[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];

  let slug: string | null = null;
  if (galleryId) {
    const { data: gallery } = await supabase
      .from("portfolio_galleries")
      .select("id, slug")
      .eq("id", galleryId)
      .maybeSingle();
    if (gallery?.slug) {
      slug = gallery.slug;
      await syncStorageToDbForGallery(supabase, galleryId, gallery.slug);
    }
  }

  let q = supabase.from("portfolio_photos").select("*").order("order", { ascending: true });
  if (galleryId != null) q = q.eq("gallery_id", galleryId);
  const { data, error } = await q;
  if (error) return [];

  const dbPhotos = (data ?? []) as PortfolioPhoto[];
  if (dbPhotos.length > 0) return dbPhotos;

  // Fallback: mostrar fotos que están en Storage pero aún no en DB
  if (galleryId && slug) {
    const fromStorage = await listGalleryFromStorage(slug);
    return fromStorage.map((img, i) => ({
      id: `storage-${encodeURIComponent(img.thumbPath)}`,
      storage_path: img.thumbPath,
      public_url: img.thumbUrl,
      is_visible: true,
      order: i,
      created_at: "",
      gallery_id: galleryId,
    })) as PortfolioPhoto[];
  }

  return dbPhotos;
}
