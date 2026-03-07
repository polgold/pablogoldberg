/**
 * Proxy de imágenes: sirve desde almacenamiento persistente (UPLOAD_DIR).
 * Path: ?path=projects/slug/large/file.jpg o projects/slug/thumb/file.jpg
 * UPLOAD_DIR debe estar FUERA del path de deploy en Hostinger.
 */
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { getPersistentUploadDir } from "@/lib/persistent-storage";

function safePath(p: string): boolean {
  const decoded = decodeURIComponent(p).trim();
  if (!decoded || decoded.includes("..")) return false;
  const parts = decoded.split("/").filter(Boolean);
  if (parts.length < 2) return false;
  return parts.every((seg) => /^[a-z0-9_.-]+$/i.test(seg));
}

export async function GET(request: NextRequest) {
  const pathParam = request.nextUrl.searchParams.get("path");
  if (!pathParam || !safePath(pathParam)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const cleanPath = decodeURIComponent(pathParam).replace(/^\//, "").trim();

  // Persistent storage: path is relative to UPLOAD_DIR (e.g. projects/slug/large/file.jpg)
  const baseDir = getPersistentUploadDir();
  let fullPath = path.join(baseDir, cleanPath);

  if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
    const largePath = cleanPath.replace(/\/thumb\//, "/large/").replace(/\/thumbs\//, "/large/");
    const altPath = path.join(baseDir, largePath);
    if (fs.existsSync(altPath) && fs.statSync(altPath).isFile()) fullPath = altPath;
    else return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ext = path.extname(fullPath).toLowerCase();
  const contentType =
    ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : ext === ".gif" ? "image/gif" : "image/jpeg";
  const body = fs.readFileSync(fullPath);
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
