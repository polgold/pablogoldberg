import { NextRequest, NextResponse } from "next/server";

const SUPABASE_BASE = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
const STORAGE_PREFIX = `${SUPABASE_BASE}/storage/v1/object/public/`;

/**
 * Proxy de imágenes de Supabase: el navegador pide a nuestro dominio y nosotros
 * descargamos desde Supabase y devolvemos el bytes. Evita 403 por referrer/CORS.
 * Solo se aceptan URLs de nuestro Supabase Storage.
 */
export async function GET(request: NextRequest) {
  const urlParam = request.nextUrl.searchParams.get("url");
  if (!urlParam) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }
  let targetUrl: string;
  try {
    targetUrl = decodeURIComponent(urlParam);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }
  if (!SUPABASE_BASE || !targetUrl.startsWith(STORAGE_PREFIX)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const res = await fetch(targetUrl, {
      method: "GET",
      headers: { Accept: "image/*" },
      cache: "force-cache",
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream ${res.status}` },
        { status: res.status === 404 ? 404 : 502 }
      );
    }
    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    const body = await res.arrayBuffer();
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (e) {
    console.error("[proxy-image]", e);
    return NextResponse.json({ error: "Proxy error" }, { status: 502 });
  }
}
