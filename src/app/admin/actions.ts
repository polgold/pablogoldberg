"use server";

import { redirect } from "next/navigation";
import { createAdminServerClient, isAllowedAdminEmail } from "@/lib/supabase/admin-server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SUPABASE_STORAGE_BUCKET } from "@/lib/supabase/storage";

type ProjectRow = {
  id: string;
  slug: string;
  locale: string;
  title: string;
  summary: string | null;
  description: string | null;
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
  gallery_video_paths: string[] | null;
  tags: string[] | null;
  is_featured: boolean;
  published: boolean;
  created_at: string;
};

async function ensureAdmin() {
  const supabase = await createAdminServerClient();
  if (!supabase) throw new Error("Auth no configurado");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAllowedAdminEmail(user.email ?? undefined)) {
    redirect("/admin/login");
  }
  return { user, supabase };
}

export async function logout() {
  const supabase = await createAdminServerClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function listProjects(): Promise<ProjectRow[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];
  await ensureAdmin();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[admin] listProjects:", error.message);
    return [];
  }
  return (data ?? []) as ProjectRow[];
}

export async function getProject(id: string): Promise<ProjectRow | null> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;
  await ensureAdmin();
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return data as ProjectRow;
}

const IMAGE_EXTS = new Set(["jpg", "jpeg", "png", "gif", "webp", "avif"]);
const VIDEO_EXTS = new Set(["mp4", "webm", "mov", "avi", "mkv"]);

function getExt(filename: string): string {
  const i = filename.lastIndexOf(".");
  return i >= 0 ? filename.slice(i + 1).toLowerCase() : "";
}

function isVideo(filename: string): boolean {
  return VIDEO_EXTS.has(getExt(filename));
}

/** Genera nombre único para evitar colisiones en Storage. */
function uniqueStorageName(filename: string): string {
  const ext = getExt(filename) || "";
  const base = filename.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9.-]/g, "_") || "file";
  const uid = crypto.randomUUID().slice(0, 8);
  return ext ? `${base}-${uid}.${ext}` : `${base}-${uid}`;
}

export async function createProject(formData: FormData): Promise<{ id?: string; error?: string }> {
  await ensureAdmin();
  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: "Supabase no configurado" };

  const slug = String(formData.get("slug") ?? "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const locale = String(formData.get("locale") ?? "es").trim() || "es";
  const title = String(formData.get("title") ?? "").trim();
  if (!title || !slug) return { error: "Título y slug requeridos" };

  const { data, error } = await supabase
    .from("projects")
    .insert({
      slug,
      locale,
      title,
      summary: String(formData.get("summary") ?? "").trim() || null,
      description: String(formData.get("description") ?? "").trim() || null,
      credits: String(formData.get("credits") ?? "").trim() || null,
      year: formData.get("year") ? parseInt(String(formData.get("year")), 10) : null,
      order: formData.get("order") ? parseInt(String(formData.get("order")), 10) : null,
      client: String(formData.get("client") ?? "").trim() || null,
      piece_type: String(formData.get("piece_type") ?? "").trim() || null,
      duration: String(formData.get("duration") ?? "").trim() || null,
      video_url: String(formData.get("video_url") ?? "").trim() || null,
      external_link: String(formData.get("external_link") ?? "").trim() || null,
      tags: parseTags(formData.get("tags")),
      is_featured: formData.get("is_featured") === "on",
      published: false,
      cover_image_path: null,
      gallery_image_paths: [],
      gallery_video_paths: [],
    })
    .select("id")
    .single();

  if (error) {
    console.error("[admin] createProject:", error.message);
    return { error: error.message };
  }
  return { id: data?.id };
}

function parseTags(v: FormDataEntryValue | null): string[] {
  if (v == null) return [];
  const s = String(v).trim();
  if (!s) return [];
  return s.split(/[\s,]+/).map((t) => t.trim()).filter(Boolean);
}

export async function updateProject(
  id: string,
  formData: FormData
): Promise<{ error?: string }> {
  await ensureAdmin();
  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: "Supabase no configurado" };

  const slug = String(formData.get("slug") ?? "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const locale = String(formData.get("locale") ?? "es").trim() || "es";
  const title = String(formData.get("title") ?? "").trim();
  if (!title || !slug) return { error: "Título y slug requeridos" };

  const { error } = await supabase
    .from("projects")
    .update({
      slug,
      locale,
      title,
      summary: String(formData.get("summary") ?? "").trim() || null,
      description: String(formData.get("description") ?? "").trim() || null,
      credits: String(formData.get("credits") ?? "").trim() || null,
      year: formData.get("year") ? parseInt(String(formData.get("year")), 10) : null,
      order: formData.get("order") ? parseInt(String(formData.get("order")), 10) : null,
      client: String(formData.get("client") ?? "").trim() || null,
      piece_type: String(formData.get("piece_type") ?? "").trim() || null,
      duration: String(formData.get("duration") ?? "").trim() || null,
      video_url: String(formData.get("video_url") ?? "").trim() || null,
      external_link: String(formData.get("external_link") ?? "").trim() || null,
      tags: parseTags(formData.get("tags")),
      is_featured: formData.get("is_featured") === "on",
      published: formData.get("published") === "on",
    })
    .eq("id", id);

  if (error) {
    console.error("[admin] updateProject:", error.message);
    return { error: error.message };
  }
  return {};
}

export async function publishProject(id: string): Promise<{ error?: string }> {
  await ensureAdmin();
  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: "Supabase no configurado" };
  const { error } = await supabase.from("projects").update({ published: true }).eq("id", id);
  if (error) return { error: error.message };
  return {};
}

export async function uploadCover(projectId: string, slug: string, formData: FormData): Promise<{ path?: string; error?: string }> {
  await ensureAdmin();
  const file = formData.get("file") as File | null;
  if (!file?.size) return { error: "No se envió archivo" };

  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: "Supabase no configurado" };

  const ext = getExt(file.name) || "jpg";
  const path = `covers/${slug}/cover.${ext}`;
  const { error } = await supabase.storage.from(SUPABASE_STORAGE_BUCKET).upload(path, file, { upsert: true });
  if (error) return { error: error.message };

  const { error: updateErr } = await supabase.from("projects").update({ cover_image_path: path }).eq("id", projectId);
  if (updateErr) return { error: updateErr.message };
  return { path };
}

/** Sube un solo archivo a la galería; usado para progreso incremental desde el cliente. */
export async function uploadGalleryFile(
  projectId: string,
  slug: string,
  file: File
): Promise<{ imagePaths?: string[]; videoPaths?: string[]; error?: string }> {
  const formData = new FormData();
  formData.append("files", file);
  return uploadGallery(projectId, slug, formData);
}

export async function uploadGallery(
  projectId: string,
  slug: string,
  formData: FormData
): Promise<{ imagePaths?: string[]; videoPaths?: string[]; error?: string }> {
  await ensureAdmin();
  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: "Supabase no configurado" };

  const files = formData.getAll("files") as File[];
  const imagePaths: string[] = [];
  const videoPaths: string[] = [];

  for (const file of files) {
    if (!file?.size) continue;
    const safeName = uniqueStorageName(file.name);
    const path = isVideo(file.name)
      ? `videos/${slug}/${safeName}`
      : `gallery/${slug}/${safeName}`;
    const { error } = await supabase.storage.from(SUPABASE_STORAGE_BUCKET).upload(path, file, { upsert: true });
    if (error) return { error: error.message };
    if (isVideo(file.name)) videoPaths.push(path);
    else imagePaths.push(path);
  }

  const project = await getProject(projectId);
  const prevImages = project?.gallery_image_paths ?? [];
  const prevVideos = project?.gallery_video_paths ?? [];
  const newImages = [...prevImages, ...imagePaths].sort();
  const newVideos = [...prevVideos, ...videoPaths].sort();

  const { error: updateErr } = await supabase
    .from("projects")
    .update({ gallery_image_paths: newImages, gallery_video_paths: newVideos })
    .eq("id", projectId);
  if (updateErr) return { error: updateErr.message };
  return { imagePaths: newImages, videoPaths: newVideos };
}

/**
 * Bulk: múltiples archivos a gallery/{slug}/ y videos/{slug}/.
 * No toca cover (usar CoverUpload). Actualiza gallery_image_paths y gallery_video_paths.
 */
export async function bulkUpload(
  projectId: string,
  slug: string,
  formData: FormData
): Promise<{ imagePaths?: string[]; videoPaths?: string[]; error?: string }> {
  return uploadGallery(projectId, slug, formData);
}
