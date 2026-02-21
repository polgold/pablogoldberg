"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminServerClient, isAllowedAdminEmail } from "@/lib/supabase/admin-server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PROJECTS_BUCKET, getProjectsImageUrl, getProjectAssetUrl } from "@/lib/supabase/storage";
import {
  getAdminPortfolioPhotos,
  listPortfolioGalleries,
  type PortfolioPhoto,
  type PortfolioGallery,
} from "@/lib/portfolio-photos";

export type GalleryItem = { path: string; url: string; order: number };

type ProjectRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  video_url: string | null;
  cover_image: string | null;
  gallery: GalleryItem[];
  is_featured: boolean;
  published: boolean;
  piece_type: string | null;
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
  redirect("/");
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
  return (data ?? []).map(normalizeProjectRow) as ProjectRow[];
}

export async function getProject(id: string): Promise<ProjectRow | null> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;
  await ensureAdmin();
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return normalizeProjectRow(data) as ProjectRow;
}

function normalizeProjectRow(row: Record<string, unknown>): Record<string, unknown> {
  const coverImage = (row.cover_image ?? row.cover_image_path ?? null) as string | null;
  let gallery: GalleryItem[] = [];
  const g = row.gallery;
  if (Array.isArray(g) && g.length > 0) {
    gallery = g.map((it: { path?: string; url?: string; order?: number }, i: number) => ({
      path: it.path ?? "",
      url: it.url ?? getProjectAssetUrl(it.path ?? ""),
      order: it.order ?? i,
    }));
  } else {
    const paths = (row.gallery_image_paths ?? []) as string[];
    gallery = paths
      .filter((p): p is string => Boolean(p))
      .map((path, order) => ({ path, url: getProjectAssetUrl(path), order }));
  }
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? null,
    video_url: row.video_url ?? null,
    cover_image: coverImage,
    gallery,
    is_featured: Boolean(row.is_featured),
    published: Boolean(row.published),
    piece_type: (row.piece_type as string | null) ?? null,
  };
}

function getExt(filename: string): string {
  const i = filename.lastIndexOf(".");
  return i >= 0 ? filename.slice(i + 1).toLowerCase() : "";
}

function slugFromTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

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

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Título requerido" };

  let slug = String(formData.get("slug") ?? "").trim();
  if (!slug) slug = slugFromTitle(title);
  slug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/^-|-$/g, "") || "proyecto";

  const description = String(formData.get("description") ?? "").trim() || null;
  const videoUrl = String(formData.get("video_url") ?? "").trim() || null;

  const isFeatured = formData.get("is_featured") === "on" || formData.get("is_featured") === "true";
  const published = formData.get("published") === "on" || formData.get("published") === "true";
  const pieceType = String(formData.get("piece_type") ?? "").trim() || null;

  const { data: inserted, error: insertErr } = await supabase
    .from("projects")
    .insert({
      slug,
      locale: "es",
      title,
      description,
      video_url: videoUrl,
      cover_image: null,
      gallery: [],
      is_featured: isFeatured,
      published,
      piece_type: pieceType,
    })
    .select("id")
    .single();

  if (insertErr) {
    console.error("[admin] createProject:", insertErr.message);
    return { error: insertErr.message };
  }
  const projectId = inserted?.id;
  if (!projectId) return { error: "No se obtuvo ID del proyecto" };

  const coverFile = formData.get("cover_file") as File | null;
  if (coverFile?.size) {
    const ext = getExt(coverFile.name) || "jpg";
    const path = `${slug}/cover.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from(PROJECTS_BUCKET)
      .upload(path, coverFile, { upsert: true, cacheControl: "31536000" });
    if (!uploadErr) {
      await supabase.from("projects").update({ cover_image: path }).eq("id", projectId);
    }
  }

  const galleryFiles = formData.getAll("gallery_files") as File[];
  const gallery: GalleryItem[] = [];
  let order = 0;
  for (const file of galleryFiles) {
    if (!file?.size) continue;
    const safeName = uniqueStorageName(file.name);
    const path = `${slug}/gallery/${safeName}`;
    const { error: uploadErr } = await supabase.storage
      .from(PROJECTS_BUCKET)
      .upload(path, file, { upsert: true, cacheControl: "31536000" });
    if (!uploadErr) {
      gallery.push({ path, url: getProjectsImageUrl(path), order: order++ });
    }
  }
  if (gallery.length > 0) {
    await supabase.from("projects").update({ gallery }).eq("id", projectId);
  }

  return { id: projectId };
}

export async function updateProject(
  id: string,
  formData: FormData
): Promise<{ error?: string }> {
  await ensureAdmin();
  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: "Supabase no configurado" };

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Título requerido" };

  let slug = String(formData.get("slug") ?? "").trim();
  if (!slug) slug = slugFromTitle(title);
  slug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/^-|-$/g, "") || "proyecto";

  const description = String(formData.get("description") ?? "").trim() || null;
  const videoUrl = String(formData.get("video_url") ?? "").trim() || null;
  const coverImage = String(formData.get("cover_image") ?? "").trim() || null;
  const isFeatured = formData.get("is_featured") === "on" || formData.get("is_featured") === "true";
  const published = formData.get("published") === "on" || formData.get("published") === "true";
  const pieceType = String(formData.get("piece_type") ?? "").trim() || null;
  const galleryJson = formData.get("gallery_json");
  let gallery: GalleryItem[] = [];
  if (galleryJson && typeof galleryJson === "string") {
    try {
      gallery = JSON.parse(galleryJson) as GalleryItem[];
    } catch {}
  }

  const { error } = await supabase
    .from("projects")
    .update({
      slug,
      title,
      description,
      video_url: videoUrl,
      cover_image: coverImage || null,
      gallery,
      is_featured: isFeatured,
      published,
      piece_type: pieceType,
    })
    .eq("id", id);

  if (error) {
    console.error("[admin] updateProject:", error.message);
    return { error: error.message };
  }
  return {};
}

export async function uploadProjectCover(
  projectId: string,
  slug: string,
  formData: FormData
): Promise<{ path?: string; error?: string }> {
  await ensureAdmin();
  const file = formData.get("file") as File | null;
  if (!file?.size) return { error: "No se envió archivo" };

  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: "Supabase no configurado" };

  const ext = getExt(file.name) || "jpg";
  const path = `${slug}/cover.${ext}`;
  const { error } = await supabase.storage
    .from(PROJECTS_BUCKET)
    .upload(path, file, { upsert: true, cacheControl: "31536000" });
  if (error) return { error: error.message };

  await supabase.from("projects").update({ cover_image: path }).eq("id", projectId);
  return { path };
}

export async function uploadProjectGalleryFile(
  projectId: string,
  slug: string,
  file: File
): Promise<{ gallery?: GalleryItem[]; error?: string }> {
  await ensureAdmin();
  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: "Supabase no configurado" };

  const project = await getProject(projectId);
  const prevGallery = (project?.gallery ?? []) as GalleryItem[];
  const order = prevGallery.length;
  const safeName = uniqueStorageName(file.name);
  const path = `${slug}/gallery/${safeName}`;

  const { error } = await supabase.storage
    .from(PROJECTS_BUCKET)
    .upload(path, file, { upsert: true, cacheControl: "31536000" });
  if (error) return { error: error.message };

  const item: GalleryItem = { path, url: getProjectsImageUrl(path), order };
  const gallery = [...prevGallery, item];

  const { error: updateErr } = await supabase
    .from("projects")
    .update({ gallery })
    .eq("id", projectId);
  if (updateErr) return { error: updateErr.message };
  return { gallery };
}

export async function updateProjectGallery(
  projectId: string,
  gallery: GalleryItem[]
): Promise<{ error?: string }> {
  await ensureAdmin();
  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: "Supabase no configurado" };

  const { error } = await supabase
    .from("projects")
    .update({ gallery })
    .eq("id", projectId);
  if (error) return { error: error.message };
  return {};
}

export async function setProjectCover(projectId: string, path: string): Promise<{ error?: string }> {
  await ensureAdmin();
  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: "Supabase no configurado" };
  const { error } = await supabase.from("projects").update({ cover_image: path }).eq("id", projectId);
  if (error) return { error: error.message };
  return {};
}

export async function listProjectStorageFiles(slug: string): Promise<{ path: string; url: string }[]> {
  await ensureAdmin();
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];

  const { data: files, error } = await supabase.storage
    .from(PROJECTS_BUCKET)
    .list(`${slug}/gallery`, { limit: 200 });
  if (error || !files?.length) return [];

  return files
    .filter((f) => f.name && !f.name.startsWith(".") && f.id != null)
    .map((f) => {
      const path = `${slug}/gallery/${f.name}`;
      return { path, url: getProjectsImageUrl(path) };
    });
}

// ——— Hidden Vimeo IDs (no se muestran en portfolio público) ———
export async function listHiddenVimeoIds(): Promise<string[]> {
  await ensureAdmin();
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];
  const { data } = await supabase.from("hidden_vimeo_ids").select("vimeo_id").order("created_at", { ascending: false });
  return (data ?? []).map((r) => String(r.vimeo_id ?? "")).filter(Boolean);
}

export async function addHiddenVimeoId(vimeoId: string): Promise<{ error?: string }> {
  await ensureAdmin();
  const id = String(vimeoId).trim().replace(/\D/g, "");
  if (!id) return { error: "ID inválido" };
  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: "DB no disponible" };
  const { error } = await supabase.from("hidden_vimeo_ids").upsert({ vimeo_id: id }, { onConflict: "vimeo_id" });
  if (!error) {
    revalidatePath("/es/work");
    revalidatePath("/en/work");
  }
  return error ? { error: error.message } : {};
}

export async function removeHiddenVimeoId(vimeoId: string): Promise<{ error?: string }> {
  await ensureAdmin();
  const id = String(vimeoId).trim().replace(/\D/g, "");
  if (!id) return { error: "ID inválido" };
  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: "DB no disponible" };
  const { error } = await supabase.from("hidden_vimeo_ids").delete().eq("vimeo_id", id);
  if (!error) {
    revalidatePath("/es/work");
    revalidatePath("/en/work");
  }
  return error ? { error: error.message } : {};
}

// ——— Custom Vimeo IDs (agregar por ID para que aparezca en /work) ———
export async function listCustomVimeoIds(): Promise<string[]> {
  await ensureAdmin();
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase.from("custom_vimeo_ids").select("vimeo_id").order("created_at", { ascending: false });
    if (error) return [];
    return (data ?? []).map((r) => String(r.vimeo_id ?? "")).filter(Boolean);
  } catch {
    return [];
  }
}

export async function addCustomVimeoId(vimeoId: string): Promise<{ error?: string }> {
  await ensureAdmin();
  const id = String(vimeoId).trim().replace(/\D/g, "");
  if (!id) return { error: "ID inválido" };
  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: "DB no disponible" };
  const { error } = await supabase.from("custom_vimeo_ids").upsert({ vimeo_id: id }, { onConflict: "vimeo_id" });
  if (!error) {
    revalidatePath("/es/work");
    revalidatePath("/en/work");
    revalidatePath("/admin/vimeo-hidden");
  }
  return error ? { error: error.message } : {};
}

export async function removeCustomVimeoId(vimeoId: string): Promise<{ error?: string }> {
  await ensureAdmin();
  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: "DB no disponible" };
  const { error } = await supabase.from("custom_vimeo_ids").delete().eq("vimeo_id", String(vimeoId).trim());
  if (!error) {
    revalidatePath("/es/work");
    revalidatePath("/en/work");
    revalidatePath("/admin/vimeo-hidden");
  }
  return error ? { error: error.message } : {};
}

// ——— Portfolio Photos (visibility + order) ———

export type { PortfolioPhoto, PortfolioGallery };

export async function listAdminPortfolioGalleries(): Promise<PortfolioGallery[]> {
  await ensureAdmin();
  return listPortfolioGalleries();
}

export async function listAdminPortfolioPhotos(galleryId?: string | null): Promise<PortfolioPhoto[]> {
  await ensureAdmin();
  return getAdminPortfolioPhotos(galleryId);
}

export async function createPortfolioGallery(name: string): Promise<{ gallery?: PortfolioGallery; error?: string }> {
  await ensureAdmin();
  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: "DB no disponible" };
  const slug = name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "gallery";
  const { data: existing } = await supabase.from("portfolio_galleries").select("id").eq("slug", slug).maybeSingle();
  if (existing) return { error: "Ya existe una galería con ese nombre/slug" };
  const { data: maxOrder } = await supabase
    .from("portfolio_galleries")
    .select("order")
    .order("order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const order = ((maxOrder?.order ?? -1) as number) + 1;
  const { data: gallery, error } = await supabase
    .from("portfolio_galleries")
    .insert({ name: name.trim(), slug, order })
    .select()
    .single();
  if (error) return { error: error.message };
  revalidatePath("/admin/portfolio-photos");
  return { gallery: gallery as PortfolioGallery };
}

export async function uploadPortfolioPhotos(
  formData: FormData,
  galleryId: string
): Promise<{ uploaded?: number; error?: string }> {
  try {
    await ensureAdmin();
  } catch (e) {
    const err = e as { digest?: string };
    if (err?.digest?.startsWith?.("NEXT_REDIRECT")) throw e;
    return { error: "Sesión expirada. Volvé a iniciar sesión en /admin/login." };
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: "Supabase no configurado" };

  try {
    const { data: gallery, error: galleryErr } = await supabase
      .from("portfolio_galleries")
      .select("id, slug")
      .eq("id", galleryId)
      .maybeSingle();
    if (galleryErr || !gallery?.slug) {
      return { error: "Galería no encontrada o sin slug" };
    }
    const slug = gallery.slug;

    const files = Array.from(formData.entries())
      .filter(([, v]) => v instanceof File && (v as File).size > 0)
      .map(([, v]) => v as File);
    const imageExt = /\.(jpe?g|png|webp|gif|avif)$/i;
    const images = files.filter((f) => imageExt.test(f.name));
    if (images.length === 0) return { error: "No hay imágenes válidas (jpg, png, webp, gif, avif)" };

    const { data: maxOrderRow } = await supabase
      .from("portfolio_photos")
      .select("order")
      .eq("gallery_id", galleryId)
      .order("order", { ascending: false })
      .limit(1)
      .maybeSingle();
    let nextOrder = ((maxOrderRow?.order ?? -1) as number) + 1;
    let uploaded = 0;

    for (const file of images) {
      const safeName = uniqueStorageName(file.name);
      const path = `${slug}/${safeName}`;
      const { error: uploadErr } = await supabase.storage.from(PROJECTS_BUCKET).upload(path, file, { upsert: true, cacheControl: "31536000" });
      if (uploadErr) {
        const msg = `Subida fallida: ${uploadErr.message}${(uploadErr as { statusCode?: number }).statusCode ? ` (${(uploadErr as { statusCode?: number }).statusCode})` : ""}`;
        return { error: msg, uploaded };
      }
      const publicUrl = getProjectsImageUrl(path);
      const { error: insertErr } = await supabase.from("portfolio_photos").insert({
        storage_path: path,
        public_url: publicUrl,
        is_visible: true,
        order: nextOrder++,
        gallery_id: galleryId,
      });
      if (!insertErr) uploaded++;
    }

    revalidatePath("/es/photography");
    revalidatePath("/en/photography");
    revalidatePath("/admin/portfolio-photos");
    return { uploaded };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error inesperado al subir";
    return { error: message };
  }
}

export async function togglePortfolioPhotoVisibility(id: string): Promise<{ error?: string }> {
  await ensureAdmin();
  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: "DB no disponible" };
  const { data } = await supabase.from("portfolio_photos").select("is_visible").eq("id", id).maybeSingle();
  if (!data) return { error: "Foto no encontrada" };
  const { error } = await supabase
    .from("portfolio_photos")
    .update({ is_visible: !data.is_visible })
    .eq("id", id);
  if (!error) {
    revalidatePath("/es/photography");
    revalidatePath("/en/photography");
    revalidatePath("/admin/portfolio-photos");
  }
  return error ? { error: error.message } : {};
}

export async function reorderPortfolioPhotos(updates: { id: string; order: number }[]): Promise<{ error?: string }> {
  await ensureAdmin();
  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: "DB no disponible" };
  for (const { id, order } of updates) {
    const { error } = await supabase.from("portfolio_photos").update({ order }).eq("id", id);
    if (error) return { error: error.message };
  }
  revalidatePath("/es/photography");
  revalidatePath("/en/photography");
  revalidatePath("/admin/portfolio-photos");
  return {};
}

// ——— Páginas (About, etc.) ———

export type PageContentByLocale = {
  es: { title: string; content: string } | null;
  en: { title: string; content: string } | null;
};

export async function getPageContentForAdmin(slug: string): Promise<PageContentByLocale> {
  await ensureAdmin();
  const supabase = createSupabaseServerClient();
  if (!supabase) return { es: null, en: null };
  const { data, error } = await supabase
    .from("pages")
    .select("locale, title, content")
    .eq("slug", slug)
    .in("locale", ["es", "en"]);
  if (error) {
    console.error("[admin] getPageContentForAdmin:", error.message);
    return { es: null, en: null };
  }
  const rows = data ?? [];
  const es = rows.find((r) => r.locale === "es");
  const en = rows.find((r) => r.locale === "en");
  return {
    es: es ? { title: String(es.title ?? ""), content: String(es.content ?? "") } : null,
    en: en ? { title: String(en.title ?? ""), content: String(en.content ?? "") } : null,
  };
}

export async function updatePageContent(
  slug: string,
  updates: {
    es?: { title: string; content: string };
    en?: { title: string; content: string };
  }
): Promise<{ error?: string }> {
  await ensureAdmin();
  const supabase = createSupabaseServerClient();
  if (!supabase) return { error: "DB no disponible" };
  const toUpsert: { slug: string; locale: string; title: string; content: string }[] = [];
  if (updates.es) toUpsert.push({ slug, locale: "es", title: updates.es.title, content: updates.es.content });
  if (updates.en) toUpsert.push({ slug, locale: "en", title: updates.en.title, content: updates.en.content });
  for (const row of toUpsert) {
    const { error } = await supabase.from("pages").upsert(row, { onConflict: "slug,locale" });
    if (error) return { error: error.message };
  }
  revalidatePath("/es/about");
  revalidatePath("/en/about");
  revalidatePath("/admin/pages");
  revalidatePath("/admin/pages/about");
  return {};
}
