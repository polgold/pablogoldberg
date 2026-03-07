/**
 * Sirve archivos estáticos desde MEDIA_ROOT.
 * URL: /uploads/photography/people/large/archivo.webp → MEDIA_ROOT/photography/people/large/archivo.webp
 * Cache headers para imágenes.
 */
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { getMediaRoot } from "@/lib/galleries/config";

const CACHE_MAX_AGE = "31536000"; // 1 año para thumbs/large inmutables

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  const { path: pathSegments } = await context.params;
  if (!pathSegments?.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const relativePath = pathSegments.join("/");
  if (relativePath.includes("..") || path.isAbsolute(relativePath)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const root = getMediaRoot();
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mime: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".avif": "image/avif",
    ".gif": "image/gif",
  };
  const contentType = mime[ext] ?? "application/octet-stream";
  const headers = new Headers();
  headers.set("Content-Type", contentType);
  headers.set("Cache-Control", `public, max-age=${CACHE_MAX_AGE}, immutable`);
  return new NextResponse(buffer, { status: 200, headers });
}
