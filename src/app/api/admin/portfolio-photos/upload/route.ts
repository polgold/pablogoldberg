import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminServerClient, isAllowedAdminEmail } from "@/lib/supabase/admin-server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PROJECTS_BUCKET, getProjectsImageUrl } from "@/lib/supabase/storage";

function getExt(filename: string): string {
  const i = filename.lastIndexOf(".");
  return i >= 0 ? filename.slice(i + 1).toLowerCase() : "";
}

function uniqueStorageName(filename: string): string {
  const ext = getExt(filename) || "";
  const base = filename.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9.-]/g, "_") || "file";
  const uid = crypto.randomUUID().slice(0, 8);
  return ext ? `${base}-${uid}.${ext}` : `${base}-${uid}`;
}

export async function POST(request: Request) {
  const supabaseAdmin = await createAdminServerClient();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Auth no configurado" }, { status: 500 });
  }
  const {
    data: { user },
  } = await supabaseAdmin.auth.getUser();
  if (!user || !isAllowedAdminEmail(user.email ?? undefined)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase no configurado" }, { status: 500 });
  }

  const formData = await request.formData();
  const galleryId = String(formData.get("galleryId") ?? "").trim();
  if (!galleryId) {
    return NextResponse.json({ error: "galleryId requerido" }, { status: 400 });
  }

  const { data: gallery, error: galleryErr } = await supabase
    .from("portfolio_galleries")
    .select("id, slug")
    .eq("id", galleryId)
    .maybeSingle();
  if (galleryErr || !gallery?.slug) {
    return NextResponse.json({ error: "Galería no encontrada o sin slug" }, { status: 400 });
  }
  const slug = gallery.slug;

  const files = Array.from(formData.entries())
    .filter(([, v]) => v instanceof File && (v as File).size > 0)
    .map(([, v]) => v as File);
  const imageExt = /\.(jpe?g|png|webp|gif|avif)$/i;
  const images = files.filter((f) => imageExt.test(f.name));
  if (images.length === 0) {
    return NextResponse.json(
      { error: "No hay imágenes válidas (jpg, png, webp, gif, avif)" },
      { status: 400 }
    );
  }

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
    const { error: uploadErr } = await supabase.storage
      .from(PROJECTS_BUCKET)
      .upload(path, file, { upsert: true, cacheControl: "31536000" });
    if (uploadErr) {
      revalidatePath("/admin/portfolio-photos");
      const msg = `${uploadErr.message}${(uploadErr as { statusCode?: number }).statusCode ? ` (${(uploadErr as { statusCode?: number }).statusCode})` : ""}`;
      return NextResponse.json({ error: msg, uploaded }, { status: 500 });
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
  return NextResponse.json({ uploaded });
}
