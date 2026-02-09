import { createSupabaseServerClient } from "./supabase/server";
import { getPublicImageUrl } from "./supabase/storage";
import { PROJECTS_BUCKET } from "./supabase/storage";

const IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i;
const PORTFOLIO_FOLDER = "portfolio";

export type PortfolioPhoto = {
  id: string;
  storage_path: string;
  public_url: string;
  is_visible: boolean;
  order: number;
  created_at: string;
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

/**
 * Ensures all Storage files exist in portfolio_photos. Inserts new ones as visible at end.
 */
async function syncStorageToDb(supabase: ReturnType<typeof createSupabaseServerClient>): Promise<void> {
  if (!supabase) return;

  const storageFiles = await listStorageFiles();
  const { data: existing } = await supabase
    .from("portfolio_photos")
    .select("storage_path");

  const existingPaths = new Set((existing ?? []).map((r) => r.storage_path));
  const maxOrder = await supabase
    .from("portfolio_photos")
    .select("order")
    .order("order", { ascending: false })
    .limit(1)
    .maybeSingle();

  let nextOrder = ((maxOrder?.data?.order ?? -1) as number) + 1;

  for (const { path, url } of storageFiles) {
    if (existingPaths.has(path)) continue;
    await supabase.from("portfolio_photos").insert({
      storage_path: path,
      public_url: url,
      is_visible: true,
      order: nextOrder++,
    });
  }
}

/**
 * Public: returns only is_visible=true, ordered by order.
 * Auto-inserts new Storage files into DB.
 */
export async function getPublicPortfolioPhotos(): Promise<PortfolioPhoto[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];

  await syncStorageToDb(supabase);

  const { data, error } = await supabase
    .from("portfolio_photos")
    .select("*")
    .eq("is_visible", true)
    .order("order", { ascending: true });

  if (error) return [];
  return (data ?? []) as PortfolioPhoto[];
}

/**
 * Admin: returns all photos (visible + hidden), ordered.
 * Auto-inserts new Storage files into DB.
 */
export async function getAdminPortfolioPhotos(): Promise<PortfolioPhoto[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];

  await syncStorageToDb(supabase);

  const { data, error } = await supabase
    .from("portfolio_photos")
    .select("*")
    .order("order", { ascending: true });

  if (error) return [];
  return (data ?? []) as PortfolioPhoto[];
}
