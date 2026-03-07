/**
 * API para rescan manual de galerías desde /public/uploads/work/.
 * GET: devuelve el resultado del scan (photography + film).
 * Requiere autenticación admin.
 */
import { NextResponse } from "next/server";
import { createAdminServerClient } from "@/lib/supabase/admin-server";
import { scanPhotographyGalleries, scanFilmGalleries } from "@/lib/work-galleries";

export async function GET() {
  const supabase = await createAdminServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Auth no configurado" }, { status: 500 });
  }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { isAllowedAdminEmail } = await import("@/lib/supabase/admin-server");
  if (!isAllowedAdminEmail(user.email)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const photography = scanPhotographyGalleries();
    const film = scanFilmGalleries();
    return NextResponse.json({
      photography: photography.map((g) => ({ slug: g.slug, title: g.title, photoCount: g.photos.length })),
      film: film.map((g) => ({ slug: g.slug, title: g.title, photoCount: g.photos.length })),
      message: "Rescan completado. Las galerías se cargan desde /public/uploads/work/.",
    });
  } catch (e) {
    console.error("[rescan-galleries]", e);
    return NextResponse.json({ error: "Error al escanear" }, { status: 500 });
  }
}
