"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminServerClient, isAllowedAdminEmail } from "@/lib/supabase/admin-server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { getProjectsUploadDir } from "@/lib/persistent-storage";
import { parseVideoUrl } from "@/lib/parseVideoUrl";
import path from "path";
import fs from "fs";
import sharp from "sharp";

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

function slugFromTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function uniqueFilename(original: string): string {
  const ext = path.extname(original).toLowerCase() || ".jpg";
  const base = original.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9.-]/g, "_") || "img";
  return `${base}-${crypto.randomUUID().slice(0, 8)}${ext}`;
}

// ——— Projects ———

export async function listAdminProjects() {
  await ensureAdmin();
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("admin_projects")
    .select("*")
    .order("sort_order", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function getAdminProject(id: string) {
  await ensureAdmin();
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase.from("admin_projects").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return data;
}

/** Creates project record only. Cover/gallery/videos are added on the edit page. */
export async function createAdminProject(formData: FormData): Promise<{ id?: string; error?: string }> {
  try {
    await ensureAdmin();
    const supabase = createAdminSupabaseClient();

    const titleEs = String(formData.get("title_es") ?? "").trim();
    if (!titleEs) return { error: "Título (ES) requerido" };

    let slug = String(formData.get("slug") ?? "").trim();
    if (!slug) slug = slugFromTitle(titleEs);
    slug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/^-|-$/g, "") || "proyecto";

    const titleEn = String(formData.get("title_en") ?? "").trim();
    const descriptionEs = String(formData.get("description_es") ?? "").trim() || null;
    const descriptionEn = String(formData.get("description_en") ?? "").trim() || null;
    const heroVideoUrl = String(formData.get("hero_video_url") ?? "").trim() || null;
    const website = String(formData.get("website") ?? "").trim() || null;
    const instagram = String(formData.get("instagram") ?? "").trim() || null;
    const published = formData.get("published") === "on" || formData.get("published") === "true";
    const sortOrder = parseInt(String(formData.get("sort_order") ?? "0"), 10) || 0;

    const parsed = heroVideoUrl ? parseVideoUrl(heroVideoUrl) : null;
    const heroPlatform = parsed?.provider ?? null;
    const heroVideoId = parsed?.id ?? null;
    const heroVideoUrlStored = heroVideoUrl ?? null;

    const { data: inserted, error: insertErr } = await supabase
      .from("admin_projects")
      .insert({
        slug,
        title_es: titleEs,
        title_en: titleEn || titleEs,
        description_es: descriptionEs,
        description_en: descriptionEn || descriptionEs,
        hero_video_platform: heroPlatform,
        hero_video_id: heroVideoId,
        hero_video_url: heroVideoUrlStored,
        website,
        instagram,
        published,
        sort_order: sortOrder,
      })
      .select("id")
      .single();

    if (insertErr) {
      if (insertErr.code === "23505") return { error: "Ya existe un proyecto con ese slug" };
      return { error: insertErr.message };
    }

    revalidatePath("/admin");
    revalidatePath("/es/work");
    revalidatePath("/en/work");
    revalidatePath("/es/work/archive");
    revalidatePath("/en/work/archive");
    return { id: inserted?.id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al crear" };
  }
}

export async function updateAdminProject(id: string, formData: FormData): Promise<{ error?: string }> {
  try {
    await ensureAdmin();
    const supabase = createAdminSupabaseClient();

    const titleEs = String(formData.get("title_es") ?? "").trim();
    if (!titleEs) return { error: "Título (ES) requerido" };

    let slug = String(formData.get("slug") ?? "").trim();
    if (!slug) slug = slugFromTitle(titleEs);
    slug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/^-|-$/g, "") || "proyecto";

    const titleEn = String(formData.get("title_en") ?? "").trim();
    const descriptionEs = String(formData.get("description_es") ?? "").trim() || null;
    const descriptionEn = String(formData.get("description_en") ?? "").trim() || null;
    const heroVideoUrl = String(formData.get("hero_video_url") ?? "").trim() || null;
    const website = String(formData.get("website") ?? "").trim() || null;
    const instagram = String(formData.get("instagram") ?? "").trim() || null;
    const published = formData.get("published") === "on" || formData.get("published") === "true";
    const sortOrder = parseInt(String(formData.get("sort_order") ?? "0"), 10) || 0;

    const parsed = heroVideoUrl ? parseVideoUrl(heroVideoUrl) : null;
    const heroPlatform = parsed?.provider ?? null;
    const heroVideoId = parsed?.id ?? null;
    const heroVideoUrlStored = heroVideoUrl ?? null;

    const updates: Record<string, unknown> = {
      slug,
      title_es: titleEs,
      title_en: titleEn || titleEs,
      description_es: descriptionEs,
      description_en: descriptionEn || descriptionEs,
      hero_video_platform: heroPlatform,
      hero_video_id: heroVideoId,
      hero_video_url: heroVideoUrlStored,
      website,
      instagram,
      published,
      sort_order: sortOrder,
      updated_at: new Date().toISOString(),
    };

    const coverFile = formData.get("cover_file") as File | null;
    if (coverFile?.size) {
      const ext = path.extname(coverFile.name).toLowerCase() || ".jpg";
      const safeName = `cover${ext}`;
      const relPath = `${slug}/large/${safeName}`;
      const fullPath = path.join(getProjectsUploadDir(), relPath);
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, Buffer.from(await coverFile.arrayBuffer()));
      updates.cover_image_path = `projects/${relPath}`;
    }

    const { error } = await supabase.from("admin_projects").update(updates).eq("id", id);

    if (error) return { error: error.message };
    revalidatePath("/admin");
    revalidatePath(`/admin/projects/${id}`);
    revalidatePath("/es/work");
    revalidatePath("/en/work");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al actualizar" };
  }
}

export async function deleteAdminProject(id: string): Promise<{ error?: string; fileErrors?: string[] }> {
  try {
    await ensureAdmin();
    const supabase = createAdminSupabaseClient();

    const { data: project } = await supabase.from("admin_projects").select("id, slug, cover_image_path").eq("id", id).maybeSingle();
    if (!project) return { error: "Proyecto no encontrado" };

    const { data: galleryRows } = await supabase.from("project_gallery_images").select("path, thumb_path").eq("project_id", id);

    const { error: deleteErr } = await supabase.from("admin_projects").delete().eq("id", id);
    if (deleteErr) {
      if (deleteErr.code === "23503") return { error: "No se puede eliminar: hay referencias en otras tablas (foreign key)" };
      return { error: `Error al eliminar en base de datos: ${deleteErr.message}` };
    }

    revalidatePath("/admin");
    revalidatePath("/es/work");
    revalidatePath("/en/work");
    revalidatePath("/es/work/archive");
    revalidatePath("/en/work/archive");

    const fileErrors: string[] = [];
    const baseDir = getProjectsUploadDir();

    if (project.cover_image_path) {
      const rel = project.cover_image_path.replace(/^projects\//, "");
      const fullPath = path.join(baseDir, rel);
      try {
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      } catch (e) {
        fileErrors.push(`Portada: ${e instanceof Error ? e.message : "Error al eliminar archivo"}`);
      }
    }

    for (const row of galleryRows ?? []) {
      for (const p of [row.path, row.thumb_path].filter(Boolean)) {
        const rel = String(p).replace(/^projects\//, "");
        const fullPath = path.join(baseDir, rel);
        try {
          if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        } catch (e) {
          fileErrors.push(`Galería ${rel}: ${e instanceof Error ? e.message : "Error al eliminar"}`);
        }
      }
    }

    if (fileErrors.length > 0) return { error: "Proyecto eliminado de la base de datos, pero algunos archivos no se pudieron borrar", fileErrors };
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al eliminar" };
  }
}

// ——— Gallery ———

async function generateThumbnail(
  largePath: string,
  thumbPath: string,
  buffer: Buffer
): Promise<void> {
  const thumbDir = path.dirname(thumbPath);
  fs.mkdirSync(thumbDir, { recursive: true });
  await sharp(buffer)
    .resize(400, 400, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toFile(thumbPath);
}

export async function uploadProjectGalleryImages(
  projectId: string,
  slug: string,
  formData: FormData
): Promise<{ uploaded?: number; error?: string }> {
  try {
    await ensureAdmin();
    const supabase = createAdminSupabaseClient();

    const files = Array.from(formData.entries())
      .filter(([, v]) => v instanceof File && (v as File).size > 0)
      .map(([, v]) => v as File);
    const imageExt = /\.(jpe?g|png|webp|gif|avif)$/i;
    const images = files.filter((f) => imageExt.test(f.name));
    if (images.length === 0) return { error: "No hay imágenes válidas" };

    const { data: maxRow } = await supabase
      .from("project_gallery_images")
      .select("sort_order")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    let nextOrder = ((maxRow?.sort_order ?? -1) as number) + 1;
    let uploaded = 0;

    const baseDir = getProjectsUploadDir();
    const projectDir = path.join(baseDir, slug);
    fs.mkdirSync(path.join(projectDir, "large"), { recursive: true });
    fs.mkdirSync(path.join(projectDir, "thumb"), { recursive: true });

    for (const file of images) {
      const safeName = uniqueFilename(file.name);
      const relLarge = `${slug}/large/${safeName}`;
      const relThumb = `${slug}/thumb/${safeName}`;
      const fullLarge = path.join(baseDir, relLarge);
      const fullThumb = path.join(baseDir, relThumb);

      const buf = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(fullLarge, buf);
      await generateThumbnail(fullLarge, fullThumb, buf);

      const dbPath = `projects/${relLarge}`;
      const dbThumbPath = `projects/${relThumb}`;

      const { error: insertErr } = await supabase.from("project_gallery_images").insert({
        project_id: projectId,
        path: dbPath,
        thumb_path: dbThumbPath,
        is_cover: false,
        sort_order: nextOrder++,
        hidden: false,
      });
      if (!insertErr) uploaded++;
    }

    revalidatePath(`/admin/projects/${projectId}`);
    return { uploaded };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al subir" };
  }
}

export async function setGalleryCover(projectId: string, imageId: string): Promise<{ error?: string }> {
  await ensureAdmin();
  const supabase = createAdminSupabaseClient();
  await supabase.from("project_gallery_images").update({ is_cover: false }).eq("project_id", projectId);
  const { data: img } = await supabase
    .from("project_gallery_images")
    .select("path")
    .eq("id", imageId)
    .maybeSingle();
  const { error } = await supabase.from("project_gallery_images").update({ is_cover: true }).eq("id", imageId);
  if (error) return { error: error.message };
  if (img?.path) {
    await supabase.from("admin_projects").update({ cover_image_path: img.path }).eq("id", projectId);
  }
  revalidatePath(`/admin/projects/${projectId}`);
  return {};
}

export async function reorderGalleryImages(updates: { id: string; order: number }[]): Promise<{ error?: string }> {
  await ensureAdmin();
  const supabase = createAdminSupabaseClient();
  for (const { id, order } of updates) {
    await supabase.from("project_gallery_images").update({ sort_order: order }).eq("id", id);
  }
  return {};
}

export async function toggleGalleryImageHidden(id: string): Promise<{ error?: string }> {
  await ensureAdmin();
  const supabase = createAdminSupabaseClient();
  const { data } = await supabase.from("project_gallery_images").select("hidden").eq("id", id).maybeSingle();
  if (!data) return { error: "Imagen no encontrada" };
  const { error } = await supabase
    .from("project_gallery_images")
    .update({ hidden: !data.hidden })
    .eq("id", id);
  if (error) return { error: error.message };
  return {};
}

export async function deleteGalleryImage(id: string): Promise<{ error?: string }> {
  await ensureAdmin();
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("project_gallery_images").delete().eq("id", id);
  if (error) return { error: error.message };
  return {};
}

// ——— Project Videos ———

export async function addProjectVideo(
  projectId: string,
  url: string,
  customThumbnail?: string | null
): Promise<{ error?: string }> {
  await ensureAdmin();
  const parsed = parseVideoUrl(url);
  if (!parsed) return { error: "URL de Vimeo o YouTube inválida" };
  const supabase = createAdminSupabaseClient();
  const { data: maxRow } = await supabase
    .from("project_videos")
    .select("sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const order = ((maxRow?.sort_order ?? -1) as number) + 1;
  const thumb = customThumbnail?.trim() || null;
  const { error } = await supabase.from("project_videos").insert({
    project_id: projectId,
    platform: parsed.provider,
    video_id: parsed.id,
    url,
    custom_thumbnail: thumb,
    sort_order: order,
  });
  if (error) return { error: error.message };
  return {};
}

export async function removeProjectVideo(id: string): Promise<{ error?: string }> {
  await ensureAdmin();
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("project_videos").delete().eq("id", id);
  if (error) return { error: error.message };
  return {};
}

// ——— Films ———

export async function listFilms() {
  await ensureAdmin();
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("films")
    .select("*")
    .order("sort_order", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function getFilm(id: string) {
  await ensureAdmin();
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase.from("films").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return data;
}

export async function createFilm(formData: FormData): Promise<{ id?: string; error?: string }> {
  try {
    await ensureAdmin();
    const supabase = createAdminSupabaseClient();

    const title = String(formData.get("title") ?? "").trim();
    if (!title) return { error: "Título requerido" };
    const url = String(formData.get("url") ?? "").trim();
    const parsed = parseVideoUrl(url);
    if (!parsed) return { error: "URL de Vimeo o YouTube inválida" };
    const description = String(formData.get("description") ?? "").trim() || null;
    const customThumbnail = String(formData.get("custom_thumbnail") ?? "").trim() || null;
    const published = formData.get("published") === "on" || formData.get("published") === "true";
    const sortOrder = parseInt(String(formData.get("sort_order") ?? "0"), 10) || 0;

    const { data: inserted, error } = await supabase
      .from("films")
      .insert({
        title,
        platform: parsed.provider,
        video_id: parsed.id,
        url,
        custom_thumbnail: customThumbnail,
        description,
        published,
        sort_order: sortOrder,
      })
      .select("id")
      .single();

    if (error) return { error: error.message };
    revalidatePath("/admin/films");
    revalidatePath("/es/work");
    revalidatePath("/en/work");
    return { id: inserted?.id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al crear" };
  }
}

export async function updateFilm(id: string, formData: FormData): Promise<{ error?: string }> {
  try {
    await ensureAdmin();
    const supabase = createAdminSupabaseClient();

    const title = String(formData.get("title") ?? "").trim();
    if (!title) return { error: "Título requerido" };
    const url = String(formData.get("url") ?? "").trim();
    const parsed = parseVideoUrl(url);
    if (!parsed) return { error: "URL de Vimeo o YouTube inválida" };
    const description = String(formData.get("description") ?? "").trim() || null;
    const customThumbnail = String(formData.get("custom_thumbnail") ?? "").trim() || null;
    const published = formData.get("published") === "on" || formData.get("published") === "true";
    const sortOrder = parseInt(String(formData.get("sort_order") ?? "0"), 10) || 0;

    const { error } = await supabase
      .from("films")
      .update({
        title,
        platform: parsed.provider,
        video_id: parsed.id,
        url,
        custom_thumbnail: customThumbnail,
        description,
        published,
        sort_order: sortOrder,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return { error: error.message };
    revalidatePath("/admin/films");
    revalidatePath("/es/work");
    revalidatePath("/en/work");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al actualizar" };
  }
}

export async function deleteFilm(id: string): Promise<{ error?: string }> {
  await ensureAdmin();
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("films").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/films");
  revalidatePath("/es/work");
  revalidatePath("/en/work");
  return {};
}
