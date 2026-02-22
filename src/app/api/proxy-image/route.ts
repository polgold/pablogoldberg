import { NextRequest, NextResponse } from "next/server";

const SUPABASE_BASE = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
const BUCKET = "projects";

/** Path seguro: solo slug, thumbs/large, y nombres de archivo. Sin ".." */
function safePath(p: string): boolean {
  const decoded = decodeURIComponent(p).trim();
  if (!decoded || decoded.includes("..")) return false;
  const parts = decoded.split("/").filter(Boolean);
  if (parts.length < 2) return false;
  const slug = parts[0];
  if (!/^[a-z0-9-]+$/.test(slug)) return false;
  return true;
}

/**
 * Proxy de imágenes: ?path=bestefar/thumbs/photo.jpg
 * Descargamos desde Supabase Storage (bucket projects) y devolvemos la imagen.
 */
export async function GET(request: NextRequest) {
  const pathParam = request.nextUrl.searchParams.get("path");
  const urlParam = request.nextUrl.searchParams.get("url");

  let targetUrl: string;

  if (pathParam) {
    if (!safePath(pathParam)) return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    const path = pathParam.replace(/^\//, "").split("/").map((s) => encodeURIComponent(decodeURIComponent(s))).join("/");
    targetUrl = `${SUPABASE_BASE}/storage/v1/object/public/${BUCKET}/${path}`;
  } else if (urlParam) {
    try {
      targetUrl = decodeURIComponent(urlParam);
    } catch {
      return NextResponse.json({ error: "Invalid url" }, { status: 400 });
    }
    const prefix = `${SUPABASE_BASE}/storage/v1/object/public/`;
    if (!SUPABASE_BASE || !targetUrl.startsWith(prefix)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } else {
    return NextResponse.json({ error: "Missing path or url" }, { status: 400 });
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
