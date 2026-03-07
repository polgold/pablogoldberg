/**
 * Admin-driven content: projects, gallery, videos, films.
 * Reads from admin_projects, project_gallery_images, project_videos, films.
 * Images served from persistent storage via /api/proxy-image.
 */
import "server-only";
import { createSupabaseServerClient } from "./supabase/server";
import { getProjectImageUrl, getVideoThumbnailUrl } from "./admin-utils";

export type Locale = "es" | "en";
export { getProjectImageUrl, getVideoThumbnailUrl };

export type AdminProject = {
  id: string;
  slug: string;
  title_es: string;
  title_en: string;
  description_es: string;
  description_en: string;
  hero_video_platform: "vimeo" | "youtube" | null;
  hero_video_id: string | null;
  hero_video_url: string | null;
  website: string | null;
  instagram: string | null;
  published: boolean;
  sort_order: number;
  cover_image_path: string | null;
  created_at: string;
};

export type ProjectGalleryImage = {
  id: string;
  project_id: string;
  path: string;
  thumb_path: string;
  is_cover: boolean;
  sort_order: number;
  hidden: boolean;
};

export type ProjectVideo = {
  id: string;
  project_id: string;
  platform: "vimeo" | "youtube";
  video_id: string;
  url: string | null;
  custom_thumbnail: string | null;
  sort_order: number;
};

export type Film = {
  id: string;
  title: string;
  platform: "vimeo" | "youtube";
  video_id: string;
  url: string | null;
  custom_thumbnail: string | null;
  description: string | null;
  published: boolean;
  sort_order: number;
};

/** Projects for frontend (published, ordered) */
export async function getAdminProjects(): Promise<AdminProject[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("admin_projects")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[admin-content] getAdminProjects:", error.message);
    return [];
  }
  return (data ?? []) as AdminProject[];
}

/** Single project by slug */
export async function getAdminProjectBySlug(slug: string): Promise<AdminProject | null> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("admin_projects")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error || !data) return null;
  return data as AdminProject;
}

/** Gallery images for a project (visible, ordered) */
export async function getProjectGalleryImages(projectId: string): Promise<ProjectGalleryImage[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("project_gallery_images")
    .select("*")
    .eq("project_id", projectId)
    .eq("hidden", false)
    .order("sort_order", { ascending: true });
  if (error) return [];
  return (data ?? []) as ProjectGalleryImage[];
}

/** Project videos for a project */
export async function getProjectVideos(projectId: string): Promise<ProjectVideo[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("project_videos")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });
  if (error) return [];
  return (data ?? []) as ProjectVideo[];
}

/** Films for frontend (published, ordered) */
export async function getFilms(): Promise<Film[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("films")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as Film[];
}
