import { createSupabaseServerClient } from "./supabase/server";
import { getPublicImageUrl } from "./supabase/storage";
import { PROJECTS_BUCKET } from "./supabase/storage";

const IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i;
const PORTFOLIO_FOLDER = "portfolio";

export type PortfolioGallery = {
  id: string;
  name: string;
  slug: string;
  order: number;
  created_at: string;
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
 * Lists image files in projects/portfolio/ from Storage.
 */
async function listStorageFiles(): Promise<{ path: string; url: string }[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase.storage
    .from(PROJECTS_BUCKET)
    .list(PORTFOLIO_FOLDER, { limit: 500 });
  if (error) return [];

  const files = getFilesFromList(data);
  return files.map((f) => {
    const path = `${PORTFOLIO_FOLDER}/${f.name}`.replace(/\/+/g, "/");
    return { path, url: getPublicImageUrl(path, PROJECTS_BUCKET) };
  });
}

/** Default gallery ID for legacy photos (slug portfolio). */
const DEFAULT_GALLERY_ID = "00000000-0000-0000-0000-000000000001";

/**
 * Ensures all Storage files in portfolio/ exist in portfolio_photos. Inserts new ones as visible at end, default gallery.
 */
async function syncStorageToDb(supabase: ReturnType<typeof createSupabaseServerClient>, defaultGalleryId?: string | null): Promise<void> {
  if (!supabase) return;

  const storageFiles = await listStorageFiles();
  const { data: existing } = await supabase
    .from("portfolio_photos")
    .select("storage_path");

  const existingPaths = new Set((existing ?? []).map((r) => r.storage_path));
  const galleryId = defaultGalleryId ?? DEFAULT_GALLERY_ID;

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
 * Lists all portfolio galleries, ordered.
 */
export async function listPortfolioGalleries(): Promise<PortfolioGallery[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("portfolio_galleries")
    .select("*")
    .order("order", { ascending: true });
  if (error) return [];
  return (data ?? []) as PortfolioGallery[];
}

/**
 * Public: returns only is_visible=true, ordered by order (all galleries merged, or pass galleryId).
 * Auto-inserts new Storage files into DB for default gallery.
 */
export async function getPublicPortfolioPhotos(galleryId?: string | null): Promise<PortfolioPhoto[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];

  await syncStorageToDb(supabase, DEFAULT_GALLERY_ID);

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
 * Admin: returns all photos (visible + hidden), optionally filtered by gallery. Ordered.
 * Auto-inserts new Storage files into DB for default gallery.
 */
export async function getAdminPortfolioPhotos(galleryId?: string | null): Promise<PortfolioPhoto[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];

  await syncStorageToDb(supabase, DEFAULT_GALLERY_ID);

  let q = supabase.from("portfolio_photos").select("*").order("order", { ascending: true });
  if (galleryId != null) q = q.eq("gallery_id", galleryId);
  const { data, error } = await q;
  if (error) return [];
  return (data ?? []) as PortfolioPhoto[];
}
