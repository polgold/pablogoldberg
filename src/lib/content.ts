import { createSupabaseServerClient } from "./supabase/server";
import { getPublicImageUrl } from "./supabase/storage";
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

function rowToProjectItem(row: {
  slug: string;
  title: string;
  description: string | null;
  summary: string | null;
  credits: string | null;
  year: number | null;
  order: number | null;
  client: string | null;
  piece_type: string | null;
  duration: string | null;
  video_url: string | null;
  external_link: string | null;
  cover_image_path: string | null;
  gallery_image_paths: string[] | null;
}): ProjectItem {
  const content = String(row.description ?? "");
  const summaryRaw = String(row.summary ?? "");
  const excerpt = summaryRaw.trim() ? summaryRaw : content.slice(0, 300);
  const galleryPaths = Array.isArray(row.gallery_image_paths) ? row.gallery_image_paths : [];
  const galleryImages = galleryPaths
    .filter((p): p is string => Boolean(p))
    .map((p) => getPublicImageUrl(p));
  const coverUrl = row.cover_image_path ? getPublicImageUrl(row.cover_image_path) : undefined;

  return {
    slug: String(row.slug),
    title: String(row.title),
    content,
    excerpt,
    date: "",
    modified: "",
    year: row.year != null ? String(row.year) : "",
    roles: [],
    client: row.client != null ? row.client : undefined,
    pieceType: row.piece_type ?? undefined,
    duration: row.duration ?? undefined,
    summary: summaryRaw.trim() || undefined,
    credits: row.credits?.trim() ? String(row.credits) : undefined,
    externalLink: row.external_link ?? undefined,
    order: row.order ?? undefined,
    featuredImage: coverUrl,
    videoUrls: { vimeo: undefined, youtube: undefined },
    primaryVideo: parseVideoUrl(row.video_url),
    galleryImages,
  };
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

export async function getProjectBySlug(
  slug: string,
  locale: Locale = DEFAULT_LOCALE
): Promise<ProjectItem | undefined> {
  try {
    const supabase = createSupabaseServerClient();
    if (!supabase) return undefined;
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .eq("locale", locale)
      .eq("published", true)
      .maybeSingle();

    if (error) {
      console.error("[content] getProjectBySlug error:", error.message);
      return undefined;
    }
    if (!data) return undefined;
    return rowToProjectItem(data);
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
    return (data ?? []).map((row) => rowToProjectItem(row));
  } catch (e) {
    console.error("[content] getFeaturedProjects:", e);
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
