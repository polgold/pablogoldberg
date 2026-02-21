import { createSupabaseServerClient } from "./supabase/server";
import { getPublicImageUrl, getSignedImageUrlWithBucket } from "./supabase/storage";
import { PROJECTS_BUCKET } from "./supabase/storage";
import { toLargePathOrOriginal } from "./imageVariantPath";
import type { PageItem, ProjectItem } from "@/types/content";

export type Locale = "es" | "en";

const DEFAULT_LOCALE: Locale = "es";

function parseVideoUrl(
  url: string | null | undefined
): { type: "vimeo" | "youtube"; id: string } | undefined {
  if (!url || typeof url !== "string") return undefined;
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return { type: "vimeo", id: vimeo[1] };
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (yt) return { type: "youtube", id: yt[1] };
  return undefined;
}

function rowToPageItem(row: {
  slug: string;
  title: string;
  content: string | null;
}): PageItem {
  return {
    slug: String(row.slug ?? ""),
    title: String(row.title ?? ""),
    content: String(row.content ?? ""),
    date: "",
    modified: "",
    excerpt: "",
  };
}

type ProjectRow = {
  slug: string;
  title: string;
  description?: string | null;
  summary?: string | null;
  credits?: string | null;
  year?: number | null;
  order?: number | null;
  client?: string | null;
  piece_type?: string | null;
  is_featured?: boolean | null;
  duration?: string | null;
  video_url?: string | null;
  reel_urls?: string[] | null;
  external_link?: string | null;
  project_links?: unknown;
  cover_image?: string | null;
  cover_image_path?: string | null;
  created_at?: string | null;
  gallery?: Array<{ path: string; url?: string; order?: number }>;
  gallery_image_paths?: string[] | null;
};

/** Returns true if piece_type is photography/photo/gallery (excluded from work listing). */
export function isPhotography(type: string | null | undefined): boolean {
  if (!type || typeof type !== "string") return false;
  return ["photo", "photography", "fotografia", "gallery"].includes(type.toLowerCase().trim());
}

/** Path en Storage del bucket projects: si no tiene "/", se asume dentro de la carpeta del slug.
 * Si el path empieza con la variante con guiones del slug (ej. home-sick) y el slug es sin guiones (homesick), se usa el slug para no 404. */
function projectStoragePath(slug: string, path: string | null | undefined): string {
  if (!path || !slug) return path ?? "";
  const trimmed = String(path).replace(/^\//, "").trim();
  if (!trimmed) return "";
  if (!trimmed.includes("/")) return `${slug}/${trimmed}`;
  const [first, ...rest] = trimmed.split("/");
  const firstNoHyphens = (first ?? "").replace(/-/g, "");
  const slugNoHyphens = slug.replace(/-/g, "");
  if (firstNoHyphens === slugNoHyphens && rest.length > 0 && (first ?? "").includes("-") && !slug.includes("-")) {
    return [slug, ...rest].join("/");
  }
  return trimmed;
}

function rowToProjectItem(row: ProjectRow): ProjectItem {
  const content = String(row.description ?? "").trim();
  const summaryRaw = String(row.summary ?? "").trim();
  const excerpt = summaryRaw || content.slice(0, 300);
  const slug = String(row.slug);

  let galleryImages: string[] = [];
  const g = row.gallery;
  if (Array.isArray(g) && g.length > 0) {
    galleryImages = g
      .filter((it) => it.path)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((it) => getPublicImageUrl(toLargePathOrOriginal(projectStoragePath(slug, it.path)), PROJECTS_BUCKET));
  } else {
    const paths = Array.isArray(row.gallery_image_paths) ? row.gallery_image_paths : [];
    galleryImages = paths
      .filter((p): p is string => Boolean(p))
      .map((p) => getPublicImageUrl(toLargePathOrOriginal(projectStoragePath(slug, p)), PROJECTS_BUCKET));
  }

  const rawCoverPath = row.cover_image ?? row.cover_image_path ?? null;
  const coverPath = rawCoverPath ? projectStoragePath(slug, rawCoverPath) : null;
  const coverUrl = coverPath ? getPublicImageUrl(toLargePathOrOriginal(coverPath), PROJECTS_BUCKET) : undefined;

  return {
    slug: String(row.slug),
    title: String(row.title),
    content,
    excerpt,
    date: "",
    modified: "",
    year: row.year != null ? String(row.year) : "",
    roles: row.piece_type ? [row.piece_type] : [],
    client: row.client != null ? row.client : undefined,
    pieceType: row.piece_type ?? undefined,
    duration: row.duration ?? undefined,
    summary: summaryRaw || undefined,
    credits: row.credits?.trim() ? String(row.credits) : undefined,
    externalLink: row.external_link ?? undefined,
    projectLinks: parseProjectLinks(row.project_links),
    order: row.order ?? undefined,
    isFeatured: Boolean(row.is_featured),
    featuredImage: coverUrl,
    coverImagePath: coverPath ?? undefined,
    videoUrls: { vimeo: undefined, youtube: undefined },
    primaryVideo: parseVideoUrl(row.video_url),
    reelVideos: parseReelUrls(row.reel_urls),
    galleryImages,
  };
}

function parseProjectLinks(raw: unknown): { url: string; label?: string }[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (item && typeof item === "object" && "url" in item && typeof (item as { url: unknown }).url === "string") {
        const url = (item as { url: string }).url.trim();
        if (!url) return null;
        const label =
          "label" in item && typeof (item as { label: unknown }).label === "string"
            ? (item as { label: string }).label.trim() || undefined
            : undefined;
        return { url, label };
      }
      return null;
    })
    .filter((v): v is { url: string; label?: string } => v != null);
}

function parseReelUrls(urls: string[] | null | undefined): { type: "vimeo" | "youtube"; id: string }[] {
  if (!Array.isArray(urls)) return [];
  return urls
    .filter((u): u is string => typeof u === "string" && u.trim().length > 0)
    .map((u) => parseVideoUrl(u.trim()))
    .filter((v): v is { type: "vimeo" | "youtube"; id: string } => v != null);
}

export async function getPages(locale: Locale = DEFAULT_LOCALE): Promise<PageItem[]> {
  try {
    const supabase = createSupabaseServerClient();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("pages")
      .select("slug, title, content")
      .eq("locale", locale);

    if (error) {
      console.error("[content] getPages error:", error.message);
      return [];
    }
    return (data ?? []).map((row) => rowToPageItem(row));
  } catch (e) {
    console.error("[content] getPages:", e);
    return [];
  }
}

export async function getPageBySlug(
  slug: string,
  locale: Locale = DEFAULT_LOCALE
): Promise<PageItem | undefined> {
  try {
    const supabase = createSupabaseServerClient();
    if (!supabase) return undefined;
    const { data, error } = await supabase
      .from("pages")
      .select("slug, title, content")
      .eq("slug", slug)
      .eq("locale", locale)
      .maybeSingle();

    if (error) {
      console.error("[content] getPageBySlug error:", error.message);
      return undefined;
    }
    if (!data) return undefined;
    return rowToPageItem(data);
  } catch (e) {
    console.error("[content] getPageBySlug:", e);
    return undefined;
  }
}

export async function getProjects(locale: Locale = DEFAULT_LOCALE): Promise<ProjectItem[]> {
  try {
    const supabase = createSupabaseServerClient();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("locale", locale)
      .eq("published", true)
      .order("order", { ascending: false, nullsFirst: false })
      .order("year", { ascending: false, nullsFirst: false });

    if (error) {
      console.error("[content] getProjects error:", error.message);
      return [];
    }
    return (data ?? []).map((row) => rowToProjectItem(row));
  } catch (e) {
    console.error("[content] getProjects:", e);
    return [];
  }
}

/** Try exact slug, then slug with hyphens removed (e.g. home-sick → homesick). */
async function getProjectBySlugOne(
  supabase: NonNullable<ReturnType<typeof createSupabaseServerClient>>,
  slug: string,
  locale: Locale
): Promise<ProjectRow | null> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .eq("locale", locale)
    .eq("published", true)
    .maybeSingle();
  if (error) {
    console.error("[content] getProjectBySlug error:", error.message);
    return null;
  }
  if (data) return data as ProjectRow;
  const noHyphens = slug.replace(/-/g, "");
  if (noHyphens === slug) return null;
  const { data: alt } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", noHyphens)
    .eq("locale", locale)
    .eq("published", true)
    .maybeSingle();
  return alt ? (alt as ProjectRow) : null;
}

export async function getProjectBySlug(
  slug: string,
  locale: Locale = DEFAULT_LOCALE
): Promise<ProjectItem | undefined> {
  try {
    const supabase = createSupabaseServerClient();
    if (!supabase) return undefined;
    let data = await getProjectBySlugOne(supabase, slug, locale);
    if (data) return rowToProjectItem(data);
    if (locale !== DEFAULT_LOCALE) {
      data = await getProjectBySlugOne(supabase, slug, DEFAULT_LOCALE);
      if (data) return rowToProjectItem(data);
    }
    return undefined;
  } catch (e) {
    console.error("[content] getProjectBySlug:", e);
    return undefined;
  }
}

export async function getFeaturedProjects(
  limit = 6,
  locale: Locale = DEFAULT_LOCALE
): Promise<ProjectItem[]> {
  try {
    const supabase = createSupabaseServerClient();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("locale", locale)
      .eq("published", true)
      .eq("is_featured", true)
      .order("order", { ascending: false, nullsFirst: false })
      .order("year", { ascending: false, nullsFirst: false })
      .limit(limit);

    if (error) {
      console.error("[content] getFeaturedProjects error:", error.message);
      return [];
    }
    let rows = data ?? [];
    if (rows.length === 0 && locale !== DEFAULT_LOCALE) {
      const { data: fallback } = await supabase
        .from("projects")
        .select("*")
        .eq("locale", DEFAULT_LOCALE)
        .eq("published", true)
        .eq("is_featured", true)
        .order("order", { ascending: false, nullsFirst: false })
        .order("year", { ascending: false, nullsFirst: false })
        .limit(limit);
      rows = fallback ?? [];
    }
    return rows.map((row) => rowToProjectItem(row));
  } catch (e) {
    console.error("[content] getFeaturedProjects:", e);
    return [];
  }
}

/** Featured video projects only (type=video inferred by primaryVideo). Max 4. */
export async function getFeaturedVideoProjects(
  limit = 4,
  locale: Locale = DEFAULT_LOCALE
): Promise<ProjectItem[]> {
  const featured = await getFeaturedProjects(limit * 2, locale);
  return featured.filter((p) => p.primaryVideo).slice(0, limit);
}

/**
 * Featured Work: solo proyectos (NO fotografía).
 * Filtra pieceType en ['photo','photography','fotografia','gallery'] (case-insensitive).
 * pieceType NULL se incluye como proyecto.
 */
export async function getFeaturedWorkProjects(
  limit = 4,
  locale: Locale = DEFAULT_LOCALE
): Promise<ProjectItem[]> {
  const featured = await getFeaturedProjects(limit * 2, locale);
  return featured.filter((p) => !isPhotography(p.pieceType)).slice(0, limit);
}

/** Projects with video only, for /work listing. */
export async function getVideoProjects(locale: Locale = DEFAULT_LOCALE): Promise<ProjectItem[]> {
  const all = await getProjects(locale);
  return all.filter((p) => p.primaryVideo);
}

/** Fetch all published projects (no piece_type filter). Filter photography in code. */
async function getPublishedProjects(locale: Locale = DEFAULT_LOCALE): Promise<ProjectItem[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("locale", locale)
    .eq("published", true)
    .order("year", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false, nullsFirst: false });

  if (error) {
    console.error("[content] getPublishedProjects error:", error.message);
    return [];
  }
  let rows = data ?? [];
  if (rows.length === 0 && locale !== DEFAULT_LOCALE) {
    const { data: fallback } = await supabase
      .from("projects")
      .select("*")
      .eq("locale", DEFAULT_LOCALE)
      .eq("published", true)
      .order("year", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false, nullsFirst: false });
    rows = fallback ?? [];
  }
  return rows.map((row) => rowToProjectItem(row));
}

/** Curated work: featured, published, not photography. Max 6, newest first. */
export async function getCuratedWork(
  limit = 6,
  locale: Locale = DEFAULT_LOCALE
): Promise<ProjectItem[]> {
  try {
    const workItems = await getPublishedProjects(locale);
    return workItems
      .filter((p) => p.isFeatured === true)
      .slice(0, limit);
  } catch (e) {
    console.error("[content] getCuratedWork:", e);
    return [];
  }
}

/** Archive work: all published, not photography. Ordered by year desc, created_at desc. */
export async function getArchiveWork(locale: Locale = DEFAULT_LOCALE): Promise<ProjectItem[]> {
  try {
    return getPublishedProjects(locale);
  } catch (e) {
    console.error("[content] getArchiveWork:", e);
    return [];
  }
}

export async function getProjectSlugs(): Promise<string[]> {
  try {
    const supabase = createSupabaseServerClient();
    if (!supabase) return [];
    const { data, error } = await supabase.from("projects").select("slug").eq("locale", "es").eq("published", true);

    if (error) {
      console.error("[content] getProjectSlugs error:", error.message);
      return [];
    }
    const slugs = (data ?? []).map((r) => String(r.slug ?? "")).filter(Boolean);
    return [...new Set(slugs)];
  } catch (e) {
    console.error("[content] getProjectSlugs:", e);
    return [];
  }
}

export async function getAdjacentProjects(
  slug: string,
  locale: Locale = DEFAULT_LOCALE
): Promise<{ prev: ProjectItem | null; next: ProjectItem | null }> {
  const projects = await getProjects(locale);
  const i = projects.findIndex((p) => p.slug === slug);
  if (i < 0) return { prev: null, next: null };
  return {
    prev: i > 0 ? projects[i - 1] ?? null : null,
    next: i < projects.length - 1 ? projects[i + 1] ?? null : null,
  };
}

/**
 * Imágenes para la grilla Photography en home: solo de projects con pieceType foto.
 * pieceType IN ['photo','photography','fotografia','gallery'] (case-insensitive).
 * Si hay menos de limit, completa con portfolio_photos.
 */
export async function getPhotographyImagesForHome(
  limit = 8,
  locale: Locale = DEFAULT_LOCALE
): Promise<{ thumbUrl: string; largeUrl: string }[]> {
  const all = await getPublishedProjects(locale);
  const photoProjects = all.filter((p) => isPhotography(p.pieceType));
  const urls: string[] = [];
  for (const p of photoProjects) {
    if (p.featuredImage) urls.push(p.featuredImage);
    if (p.galleryImages?.length) urls.push(...p.galleryImages);
  }
  if (urls.length === 0) {
    const { getRandomPhotosForHome } = await import("./portfolio-photos");
    return getRandomPhotosForHome(limit);
  }
  const shuffled = [...urls].sort(() => Math.random() - 0.5);
  const slice = shuffled.slice(0, limit);
  return slice.map((u) => ({ thumbUrl: u, largeUrl: u }));
}

/** Adjacent projects within archive work list (for /work/[slug]). */
export async function getAdjacentArchiveProjects(
  slug: string,
  locale: Locale = DEFAULT_LOCALE
): Promise<{ prev: ProjectItem | null; next: ProjectItem | null }> {
  const projects = await getProjects(locale);
  const i = projects.findIndex((p) => p.slug === slug);
  if (i < 0) return { prev: null, next: null };
  return {
    prev: i > 0 ? projects[i - 1] ?? null : null,
    next: i < projects.length - 1 ? projects[i + 1] ?? null : null,
  };
}

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);

function isImagePath(name: string): boolean {
  const i = name.lastIndexOf(".");
  return i >= 0 && IMAGE_EXT.has(name.slice(i).toLowerCase());
}

/**
 * Cuando la galería en DB está vacía, lista imágenes en Storage en slug/ y slug/gallery/
 * y devuelve URLs firmadas (funcionan con bucket público o privado).
 */
export async function getProjectGalleryFromStorage(slug: string): Promise<string[]> {
  const supabase = createSupabaseServerClient();
  if (!slug || !supabase) return [];
  const paths: string[] = [];
  try {
    const folders = [slug, `${slug}/gallery`];
    for (const folder of folders) {
      const { data: files, error } = await supabase.storage
        .from(PROJECTS_BUCKET)
        .list(folder, { limit: 200 });
      if (error || !files?.length) continue;
      for (const f of files) {
        if (!f.name || f.name.startsWith(".")) continue;
        if (f.id != null && isImagePath(f.name)) {
          const path = folder === slug ? `${slug}/${f.name}` : `${folder}/${f.name}`;
          paths.push(toLargePathOrOriginal(path));
        }
      }
    }
    const out: string[] = [];
    const expiresIn = 60 * 60 * 24;
    for (const p of paths) {
      const url = await getSignedImageUrlWithBucket(supabase, p, expiresIn, PROJECTS_BUCKET);
      if (url) out.push(url);
    }
    return out;
  } catch (e) {
    console.error("[content] getProjectGalleryFromStorage:", e);
    return [];
  }
}
